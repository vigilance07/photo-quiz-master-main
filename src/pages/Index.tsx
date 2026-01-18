import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OptionKey } from "@/data/quizQuestions";
import { Quiz } from "@/data/quizzes";
import { useAuth } from "@/hooks/useAuth";
import { useQuizzes } from "@/hooks/useQuizzes";
import QuizSelection from "@/components/QuizSelection";
import QuizStart from "@/components/QuizStart";
import QuizCard from "@/components/QuizCard";
import QuizProgress from "@/components/QuizProgress";
import QuizResult from "@/components/QuizResult";
import QuizSummary, { UserAnswer } from "@/components/QuizSummary";
import AdminQuizEditor from "@/components/AdminQuizEditor";
import { toast } from "sonner";
import { LogOut, Shield, ArrowLeft, BookOpen } from "lucide-react";

type QuizState = 'selection' | 'start' | 'playing' | 'finished' | 'admin-add' | 'admin-edit';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { 
    quizzes, 
    loading: quizzesLoading, 
    saveScore, 
    isQuizUnlocked, 
    getQuizScore,
    addQuiz,
    updateQuiz
  } = useQuizzes();
  
  const [quizState, setQuizState] = useState<QuizState>('selection');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<OptionKey[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [allUserAnswers, setAllUserAnswers] = useState<UserAnswer[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const currentQuestion = selectedQuiz?.questions[currentQuestionIndex];
  const isLastQuestion = selectedQuiz ? currentQuestionIndex === selectedQuiz.questions.length - 1 : false;

  const handleSelectQuiz = useCallback((quiz: Quiz) => {
    if (!isQuizUnlocked(quiz)) {
      const requiredQuiz = quizzes.find(q => q.id === quiz.requiredQuizId);
      toast.error(`Vous devez obtenir 100% sur "${requiredQuiz?.subtitle || 'le quiz précédent'}" pour débloquer ce quiz.`);
      return;
    }
    setSelectedQuiz(quiz);
    setQuizState('start');
  }, [isQuizUnlocked, quizzes]);

  const handleAddQuiz = useCallback(() => {
    if (!isAdmin) {
      toast.error("Vous devez être administrateur pour ajouter un quiz");
      return;
    }
    setQuizState('admin-add');
  }, [isAdmin]);

  const handleEditQuiz = useCallback((quiz: Quiz) => {
    if (!isAdmin) {
      toast.error("Vous devez être administrateur pour modifier un quiz");
      return;
    }
    setEditingQuiz(quiz);
    setQuizState('admin-edit');
  }, [isAdmin]);

  const handleStart = useCallback(() => {
    setQuizState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setAllUserAnswers([]);
  }, []);

  const handleToggleAnswer = useCallback((answer: OptionKey) => {
    if (showResult) return;
    
    setSelectedAnswers(prev => {
      if (prev.includes(answer)) {
        return prev.filter(a => a !== answer);
      }
      return [...prev, answer];
    });
  }, [showResult]);

  const handleValidate = useCallback(() => {
    if (!currentQuestion) return;
    setShowResult(true);

    const correctAnswers = currentQuestion.correctAnswers;
    const isFullyCorrect = 
      correctAnswers.every(a => selectedAnswers.includes(a)) &&
      selectedAnswers.every(a => correctAnswers.includes(a));

    setAllUserAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswers: [...selectedAnswers],
      isCorrect: isFullyCorrect
    }]);

    if (isFullyCorrect) {
      setScore(prev => prev + 1);
    }
  }, [currentQuestion, selectedAnswers]);

  const handleNext = useCallback(() => {
    if (isLastQuestion && selectedQuiz) {
      // Score is already updated in handleValidate, no need to recalculate
      saveScore(selectedQuiz.id, score, selectedQuiz.questions.length);
      setQuizState('finished');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setShowResult(false);
    }
  }, [isLastQuestion, selectedQuiz, score, saveScore]);

  const handleRestart = useCallback(() => {
    setQuizState('start');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setAllUserAnswers([]);
  }, []);

  const handleBackToSelection = useCallback(() => {
    setQuizState('selection');
    setSelectedQuiz(null);
    setEditingQuiz(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setAllUserAnswers([]);
  }, []);

  const handleSaveQuiz = async (data: {
    slug: string;
    title: string;
    subtitle: string;
    year: number;
    page: number;
    questions: any[];
    required_quiz_slug: string | null;
  }) => {
    if (quizState === 'admin-edit' && editingQuiz) {
      await updateQuiz(editingQuiz.id, {
        title: data.title,
        subtitle: data.subtitle,
        year: data.year,
        page: data.page,
        questions: data.questions,
        required_quiz_slug: data.required_quiz_slug
      });
    } else {
      await addQuiz(data);
    }
    handleBackToSelection();
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Déconnexion réussie');
  };

  if (authLoading || quizzesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBackToSelection}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
              <div>
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  {selectedQuiz ? selectedQuiz.title : 'Quiz Culture Générale'}
                </h1>
                {selectedQuiz && (
                  <p className="text-sm text-muted-foreground">{selectedQuiz.subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/books')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Livres</span>
              </button>
              {isAdmin && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-600 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 flex-1">
        <div className="max-w-2xl mx-auto">
          {quizState === 'selection' && (
            <QuizSelection 
              quizzes={quizzes} 
              onSelectQuiz={handleSelectQuiz}
              onAddQuiz={handleAddQuiz}
              onEditQuiz={isAdmin ? handleEditQuiz : undefined}
              isQuizUnlocked={isQuizUnlocked}
              getQuizScore={getQuizScore}
              isAdmin={isAdmin}
            />
          )}

          {quizState === 'start' && selectedQuiz && (
            <QuizStart 
              onStart={handleStart} 
              totalQuestions={selectedQuiz.questions.length}
              quizTitle={selectedQuiz.title}
              quizSubtitle={selectedQuiz.subtitle}
            />
          )}

          {quizState === 'playing' && selectedQuiz && currentQuestion && (
            <div className="space-y-6">
              <QuizProgress
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={selectedQuiz.questions.length}
                score={score}
              />

              <QuizCard
                key={currentQuestion.id}
                question={currentQuestion}
                selectedAnswers={selectedAnswers}
                showResult={showResult}
                onToggleAnswer={handleToggleAnswer}
                onValidate={handleValidate}
              />

              {showResult && (
                <div className="animate-fade-in">
                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLastQuestion ? 'Voir les résultats' : 'Question suivante'}
                  </button>
                </div>
              )}
            </div>
          )}

          {quizState === 'finished' && selectedQuiz && (
            <div className="space-y-6">
              <QuizResult
                score={score}
                totalQuestions={selectedQuiz.questions.length}
                onRestart={handleRestart}
              />
              
              <QuizSummary
                questions={selectedQuiz.questions}
                userAnswers={allUserAnswers}
              />
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRestart}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Recommencer le quiz
                </button>
                <button
                  onClick={handleBackToSelection}
                  className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Choisir un autre quiz
                </button>
              </div>
            </div>
          )}

          {(quizState === 'admin-add' || quizState === 'admin-edit') && (
            <div>
              <button
                onClick={handleBackToSelection}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la sélection
              </button>
              <AdminQuizEditor
                initialData={editingQuiz ? {
                  slug: editingQuiz.id,
                  title: editingQuiz.title,
                  subtitle: editingQuiz.subtitle,
                  year: editingQuiz.year,
                  page: editingQuiz.page,
                  questions: editingQuiz.questions,
                  required_quiz_slug: editingQuiz.requiredQuizId || null
                } : undefined}
                onSave={handleSaveQuiz}
                onCancel={handleBackToSelection}
                existingQuizSlugs={quizzes.map(q => q.id)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Quiz basé sur le concours de Culture Générale et Actualités du Burkina Faso
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
