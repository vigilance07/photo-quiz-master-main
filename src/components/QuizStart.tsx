interface QuizStartProps {
  onStart: () => void;
  totalQuestions: number;
  quizTitle?: string;
  quizSubtitle?: string;
}

const QuizStart = ({ onStart, totalQuestions, quizTitle, quizSubtitle }: QuizStartProps) => {
  return (
    <div className="animate-fade-in">
      <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 border border-border text-center max-w-lg mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
          <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {quizTitle || 'Quiz Culture Générale'}
        </h1>
        
        <p className="text-lg text-muted-foreground mb-2">
          {quizSubtitle || 'Burkina Faso - Actualités'}
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="text-3xl font-bold text-primary">{totalQuestions}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="text-3xl font-bold text-accent">4</div>
            <div className="text-sm text-muted-foreground">Options par question</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-xl p-4 mb-8 text-left">
          <h3 className="font-semibold text-foreground mb-2">Instructions :</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Certaines questions ont plusieurs réponses correctes</li>
            <li>• Sélectionnez toutes les bonnes réponses puis validez</li>
            <li>• Votre score sera calculé à la fin</li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          Commencer le quiz
        </button>
      </div>
    </div>
  );
};

export default QuizStart;