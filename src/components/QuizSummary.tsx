import { Question, OptionKey } from "@/data/quizQuestions";
import { cn } from "@/lib/utils";

interface UserAnswer {
  questionId: number;
  selectedAnswers: OptionKey[];
  isCorrect: boolean;
}

interface QuizSummaryProps {
  questions: Question[];
  userAnswers: UserAnswer[];
}

const QuizSummary = ({ questions, userAnswers }: QuizSummaryProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-bold text-foreground text-center mb-6">
        Récapitulatif des réponses
      </h3>
      
      {questions.map((question, index) => {
        const userAnswer = userAnswers.find(ua => ua.questionId === question.id);
        const selectedAnswers = userAnswer?.selectedAnswers || [];
        const isCorrect = userAnswer?.isCorrect || false;

        return (
          <div
            key={question.id}
            className={cn(
              "bg-card rounded-xl border p-4 transition-all",
              isCorrect ? "border-primary/50 bg-primary/5" : "border-destructive/50 bg-destructive/5"
            )}
          >
            {/* Question Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                isCorrect ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
              )}>
                {isCorrect ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">
                  Question {index + 1}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {question.question}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid gap-2 ml-11">
              {(Object.keys(question.options) as OptionKey[]).map((key) => {
                const isSelected = selectedAnswers.includes(key);
                const isCorrectAnswer = question.correctAnswers.includes(key);

                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                      isCorrectAnswer && "bg-primary/20 border border-primary/30",
                      isSelected && !isCorrectAnswer && "bg-destructive/20 border border-destructive/30",
                      !isSelected && !isCorrectAnswer && "bg-muted/50"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                      isCorrectAnswer ? "bg-primary text-primary-foreground" : 
                      isSelected ? "bg-destructive text-destructive-foreground" : 
                      "bg-muted-foreground/30 text-foreground"
                    )}>
                      {key}
                    </span>
                    <span className={cn(
                      "flex-1",
                      isCorrectAnswer ? "text-primary font-medium" : 
                      isSelected && !isCorrectAnswer ? "text-destructive line-through" : 
                      "text-muted-foreground"
                    )}>
                      {question.options[key]}
                    </span>
                    {isSelected && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        isCorrectAnswer ? "bg-primary/30 text-primary" : "bg-destructive/30 text-destructive"
                      )}>
                        Votre réponse
                      </span>
                    )}
                    {isCorrectAnswer && !isSelected && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/30 text-primary">
                        Bonne réponse
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export type { UserAnswer };
export default QuizSummary;
