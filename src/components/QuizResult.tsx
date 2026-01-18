import { cn } from "@/lib/utils";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

const QuizResult = ({ score, totalQuestions, onRestart }: QuizResultProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getResultMessage = () => {
    if (percentage >= 80) return { text: "Excellent ! 🎉", color: "text-primary" };
    if (percentage >= 60) return { text: "Très bien ! 👏", color: "text-primary" };
    if (percentage >= 40) return { text: "Peut mieux faire 📚", color: "text-accent" };
    return { text: "Continuez à réviser ! 💪", color: "text-destructive" };
  };

  const result = getResultMessage();

  return (
    <div className="animate-scale-in">
      <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 border border-border text-center max-w-lg mx-auto">
        {/* Trophy Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <svg className="w-12 h-12 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
        </div>

        {/* Result Message */}
        <h2 className={cn("font-display text-3xl md:text-4xl font-bold mb-4", result.color)}>
          {result.text}
        </h2>

        {/* Score Display */}
        <div className="mb-8">
          <div className="text-6xl md:text-7xl font-display font-bold text-foreground mb-2">
            {score}<span className="text-3xl text-muted-foreground">/{totalQuestions}</span>
          </div>
          <p className="text-lg text-muted-foreground">
            Vous avez obtenu <span className="font-semibold text-foreground">{percentage}%</span> de bonnes réponses
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Réponses correctes</div>
          </div>
          <div className="bg-destructive/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-destructive">{totalQuestions - score}</div>
            <div className="text-sm text-muted-foreground">Réponses incorrectes</div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          Recommencer le quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResult;