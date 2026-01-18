import { Question, OptionKey } from "@/data/quizQuestions";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  question: Question;
  selectedAnswers: OptionKey[];
  showResult: boolean;
  onToggleAnswer: (answer: OptionKey) => void;
  onValidate: () => void;
}

const QuizCard = ({ question, selectedAnswers, showResult, onToggleAnswer, onValidate }: QuizCardProps) => {
  const optionLabels: OptionKey[] = ['a', 'b', 'c', 'd'];
  const isMultipleChoice = question.correctAnswers.length > 1;

  return (
    <div className="animate-slide-up">
      <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border">
        {/* Question Number & Badge */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">
            Question {question.id}
          </span>
          {isMultipleChoice && (
            <span className="bg-accent text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              Plusieurs réponses possibles
            </span>
          )}
        </div>

        {/* Question Text */}
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 leading-relaxed">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {optionLabels.map((label) => {
            const isSelected = selectedAnswers.includes(label);
            const isCorrect = question.correctAnswers.includes(label);
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;
            const showMissed = showResult && isCorrect && !isSelected;

            return (
              <button
                key={label}
                onClick={() => !showResult && onToggleAnswer(label)}
                disabled={showResult}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex items-start gap-3",
                  "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
                  !showResult && !isSelected && "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary",
                  !showResult && isSelected && "border-primary bg-primary/10",
                  showCorrect && "border-primary bg-primary/20 shadow-md",
                  showIncorrect && "border-destructive bg-destructive/10",
                  showMissed && "border-primary/50 bg-primary/10"
                )}
              >
                {/* Checkbox/Radio indicator */}
                <span
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm transition-colors border-2",
                    !showResult && !isSelected && "bg-muted text-muted-foreground border-muted",
                    !showResult && isSelected && "bg-primary text-primary-foreground border-primary",
                    showCorrect && "bg-primary text-primary-foreground border-primary",
                    showIncorrect && "bg-destructive text-destructive-foreground border-destructive"
                  )}
                >
                  {isSelected || showCorrect ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    label.toUpperCase()
                  )}
                </span>

                {/* Option Text */}
                <span
                  className={cn(
                    "flex-1 pt-1 transition-colors",
                    showCorrect && "text-primary font-semibold",
                    showIncorrect && "text-destructive line-through"
                  )}
                >
                  {question.options[label]}
                </span>

                {/* Result Icon */}
                {showResult && (
                  <span className="flex-shrink-0 pt-1">
                    {isCorrect && (
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {showIncorrect && (
                      <svg className="w-6 h-6 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Validate Button */}
        {!showResult && selectedAnswers.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <button
              onClick={onValidate}
              className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              Valider ma réponse ({selectedAnswers.length} sélectionnée{selectedAnswers.length > 1 ? 's' : ''})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;