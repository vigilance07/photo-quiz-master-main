import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Quiz } from "@/data/quizzes";
import { Plus, Lock, CheckCircle, Edit } from "lucide-react";

interface QuizSelectionProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
  onAddQuiz: () => void;
  onEditQuiz?: (quiz: Quiz) => void;
  isQuizUnlocked: (quiz: Quiz) => boolean;
  getQuizScore: (quizId: string) => { score: number; total: number } | null;
  isAdmin?: boolean;
}

const QuizSelection = ({ 
  quizzes, 
  onSelectQuiz, 
  onAddQuiz, 
  onEditQuiz,
  isQuizUnlocked,
  getQuizScore,
  isAdmin 
}: QuizSelectionProps) => {
  const [localQuizzes, setLocalQuizzes] = useState<Quiz[]>(quizzes);

  // Synchroniser l'état local avec les props quand quizzes change
  useEffect(() => {
    setLocalQuizzes(quizzes);
  }, [quizzes]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // Si l'élément n'a pas été déplacé ou déposé en dehors de la zone valide
    if (!destination || destination.index === source.index) {
      return;
    }

    // Réorganiser les quizzes localement
    const newQuizzes = Array.from(localQuizzes);
    const [reorderedQuiz] = newQuizzes.splice(source.index, 1);
    newQuizzes.splice(destination.index, 0, reorderedQuiz);

    setLocalQuizzes(newQuizzes);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Sélectionnez un Quiz
        </h1>
        <p className="text-muted-foreground">
          Choisissez un questionnaire pour commencer
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="quizzes-grid">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-4 md:grid-cols-2"
            >
              {localQuizzes.map((quiz, index) => {
          const unlocked = isQuizUnlocked(quiz);
          const savedScore = getQuizScore(quiz.id);
          const isPerfect = savedScore && savedScore.score === savedScore.total;
          
          return (
            <Draggable key={quiz.id} draggableId={quiz.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`bg-card rounded-2xl shadow-lg p-6 border text-left transition-all duration-300 group relative ${
                    unlocked 
                      ? 'border-border hover:border-primary hover:shadow-xl hover:-translate-y-1 cursor-grab active:cursor-grabbing' 
                      : 'border-border/50 opacity-60'
                  } ${isPerfect ? 'ring-2 ring-green-500/50' : ''} ${
                    snapshot.isDragging 
                      ? 'shadow-2xl rotate-2 scale-105 z-50 opacity-90' 
                      : ''
                  }`}
                  style={provided.draggableProps.style}
                >
              {/* Lock overlay for locked quizzes */}
              {!unlocked && (
                <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              
              <button
                onClick={() => unlocked && onSelectQuiz(quiz)}
                disabled={!unlocked}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                    unlocked ? 'bg-gradient-to-br from-primary to-accent group-hover:scale-110' : 'bg-muted'
                  }`}>
                    <svg className={`w-6 h-6 ${unlocked ? 'text-primary-foreground' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPerfect && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {quiz.year}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {quiz.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {quiz.subtitle}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="bg-secondary px-2 py-1 rounded-md">
                    {quiz.questions.length} questions
                  </span>
                  {savedScore && (
                    <span className={`px-2 py-1 rounded-md ${isPerfect ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'}`}>
                      {savedScore.score}/{savedScore.total}
                    </span>
                  )}
                </div>
              </button>
              
              {/* Edit button for admins */}
              {isAdmin && onEditQuiz && unlocked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditQuiz(quiz);
                  }}
                  className="absolute top-4 right-4 p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors z-20"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
                </div>
              )}
            </Draggable>
          );
        })}
              {provided.placeholder}

              {/* Add Quiz Button */}
              <button
                onClick={onAddQuiz}
                className="bg-card/50 rounded-2xl border-2 border-dashed border-border p-6 text-center hover:border-primary hover:bg-card transition-all duration-300 group min-h-[180px] flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  Ajouter un quiz
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {isAdmin ? 'Créer un nouveau questionnaire' : 'Réservé aux administrateurs'}
                </span>
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default QuizSelection;
