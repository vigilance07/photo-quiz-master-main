import { Question, quizQuestions } from './quizQuestions';
import { quizQuestionsPage02 } from './quizQuestionsPage02';
import { quizQuestionsPage03 } from './quizQuestionsPage03';

export interface Quiz {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  page: number;
  questions: Question[];
  requiredQuizId?: string; // ID du quiz qui doit être complété à 100% avant d'accéder à celui-ci
}

// Récupérer les scores sauvegardés
export const getQuizScores = (): Record<string, { score: number; total: number }> => {
  const saved = localStorage.getItem('quizScores');
  return saved ? JSON.parse(saved) : {};
};

// Sauvegarder un score de quiz
export const saveQuizScore = (quizId: string, score: number, total: number) => {
  const scores = getQuizScores();
  // Ne sauvegarder que si c'est un meilleur score
  if (!scores[quizId] || score > scores[quizId].score) {
    scores[quizId] = { score, total };
    localStorage.setItem('quizScores', JSON.stringify(scores));
  }
};

// Vérifier si un quiz est déverrouillé
export const isQuizUnlocked = (quiz: Quiz): boolean => {
  if (!quiz.requiredQuizId) return true; // Premier quiz toujours déverrouillé
  
  const scores = getQuizScores();
  const requiredScore = scores[quiz.requiredQuizId];
  
  if (!requiredScore) return false;
  // Use >= to handle any quiz size - unlocks when score equals or exceeds total
  return requiredScore.score >= requiredScore.total;
};

// Obtenir le score d'un quiz
export const getQuizScore = (quizId: string): { score: number; total: number } | null => {
  const scores = getQuizScores();
  return scores[quizId] || null;
};

export const quizzes: Quiz[] = [
  {
    id: 'generalites-page-01-2024',
    title: 'Quiz Généralités',
    subtitle: 'Page 01 - 2024',
    year: 2024,
    page: 1,
    questions: quizQuestions,
    // Pas de requiredQuizId - premier quiz
  },
  {
    id: 'generalites-page-02-2024',
    title: 'Quiz Généralités',
    subtitle: 'Page 02 - 2024',
    year: 2024,
    page: 2,
    questions: quizQuestionsPage02,
    requiredQuizId: 'generalites-page-01-2024', // Requiert 100% sur Page 01
  },
  {
    id: 'generalites-page-03-2024',
    title: 'Quiz Généralités',
    subtitle: 'Page 03 - 2024',
    year: 2024,
    page: 3,
    questions: quizQuestionsPage03,
    requiredQuizId: 'generalites-page-02-2024', // Requiert 100% sur Page 02
  },
];

export const getQuizById = (id: string): Quiz | undefined => {
  return quizzes.find(quiz => quiz.id === id);
};
