import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Question } from '@/data/quizQuestions';
import { quizzes as staticQuizzes, Quiz } from '@/data/quizzes';
import { Json } from '@/integrations/supabase/types';

interface QuizScore {
  quiz_slug: string;
  score: number;
  total: number;
}

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>(staticQuizzes);
  const [scores, setScores] = useState<Record<string, { score: number; total: number }>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchQuizzes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('page', { ascending: true });

      if (error) {
        console.error('Error fetching quizzes:', error);
        return;
      }

      if (data && data.length > 0) {
        const dbQuizzes: Quiz[] = data.map((q) => ({
          id: q.slug,
          title: q.title,
          subtitle: q.subtitle,
          year: q.year,
          page: q.page,
          questions: q.questions as unknown as Question[],
          requiredQuizId: q.required_quiz_slug || undefined
        }));
        setQuizzes(dbQuizzes);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  }, []);

  const fetchScores = useCallback(async () => {
    if (!user) {
      // Load from localStorage if not logged in
      const saved = localStorage.getItem('quizScores');
      if (saved) {
        setScores(JSON.parse(saved));
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('quiz_slug, score, total')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching scores:', error);
        return;
      }

      const scoresMap: Record<string, { score: number; total: number }> = {};
      data?.forEach((s: QuizScore) => {
        scoresMap[s.quiz_slug] = { score: s.score, total: s.total };
      });
      setScores(scoresMap);
    } catch (err) {
      console.error('Error fetching scores:', err);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchQuizzes();
      await fetchScores();
      setLoading(false);
    };
    loadData();
  }, [fetchQuizzes, fetchScores]);

  const saveScore = useCallback(async (quizId: string, score: number, total: number) => {
    // Check if new score is better
    const existingScore = scores[quizId];
    if (existingScore && score <= existingScore.score) {
      return;
    }

    // Update local state
    setScores(prev => ({
      ...prev,
      [quizId]: { score, total }
    }));

    if (!user) {
      // Save to localStorage if not logged in
      const saved = localStorage.getItem('quizScores');
      const existing = saved ? JSON.parse(saved) : {};
      existing[quizId] = { score, total };
      localStorage.setItem('quizScores', JSON.stringify(existing));
      return;
    }

    try {
      const { error } = await supabase
        .from('quiz_scores')
        .upsert({
          user_id: user.id,
          quiz_slug: quizId,
          score,
          total
        }, {
          onConflict: 'user_id,quiz_slug'
        });

      if (error) {
        console.error('Error saving score:', error);
      }
    } catch (err) {
      console.error('Error saving score:', err);
    }
  }, [user, scores]);

  const isQuizUnlocked = useCallback((quiz: Quiz): boolean => {
    if (!quiz.requiredQuizId) return true;
    
    const requiredScore = scores[quiz.requiredQuizId];
    if (!requiredScore) return false;
    
    // Use >= to handle edge cases where score might exceed total
    return requiredScore.score >= requiredScore.total;
  }, [scores]);

  const getQuizScore = useCallback((quizId: string) => {
    return scores[quizId] || null;
  }, [scores]);

  const addQuiz = useCallback(async (quiz: {
    slug: string;
    title: string;
    subtitle: string;
    year: number;
    page: number;
    questions: Question[];
    required_quiz_slug: string | null;
  }) => {
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        slug: quiz.slug,
        title: quiz.title,
        subtitle: quiz.subtitle,
        year: quiz.year,
        page: quiz.page,
        questions: quiz.questions as unknown as Json,
        required_quiz_slug: quiz.required_quiz_slug
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchQuizzes();
    return data;
  }, [fetchQuizzes]);

  const updateQuiz = useCallback(async (slug: string, updates: {
    title?: string;
    subtitle?: string;
    year?: number;
    page?: number;
    questions?: Question[];
    required_quiz_slug?: string | null;
  }) => {
    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle;
    if (updates.year !== undefined) updateData.year = updates.year;
    if (updates.page !== undefined) updateData.page = updates.page;
    if (updates.questions !== undefined) updateData.questions = updates.questions as unknown as Json;
    if (updates.required_quiz_slug !== undefined) updateData.required_quiz_slug = updates.required_quiz_slug;

    const { data, error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) throw error;
    
    await fetchQuizzes();
    return data;
  }, [fetchQuizzes]);

  const deleteQuiz = useCallback(async (slug: string) => {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('slug', slug);

    if (error) throw error;
    
    await fetchQuizzes();
  }, [fetchQuizzes]);

  return {
    quizzes,
    scores,
    loading,
    saveScore,
    isQuizUnlocked,
    getQuizScore,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    refetch: fetchQuizzes
  };
};
