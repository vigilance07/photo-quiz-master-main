import { cn } from "@/lib/utils";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
}

const QuizProgress = ({ currentQuestion, totalQuestions, score }: QuizProgressProps) => {
  const progress = ((currentQuestion) / totalQuestions) * 100;

  return (
    <div className="bg-card rounded-xl shadow-md p-4 md:p-6 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Progression</span>
          <span className="text-sm font-bold text-foreground">
            {currentQuestion}/{totalQuestions}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Score</span>
          <span className={cn(
            "text-sm font-bold px-2 py-0.5 rounded-full",
            "bg-primary/10 text-primary"
          )}>
            {score} pts
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default QuizProgress;