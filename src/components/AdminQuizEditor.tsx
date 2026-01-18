import { useState } from 'react';
import { Question, OptionKey } from '@/data/quizQuestions';
import { Plus, Trash2, Save, X, ImageIcon, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import AdminImageUpload from './AdminImageUpload';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminQuizEditorProps {
  initialData?: {
    slug: string;
    title: string;
    subtitle: string;
    year: number;
    page: number;
    questions: Question[];
    required_quiz_slug: string | null;
  };
  onSave: (data: {
    slug: string;
    title: string;
    subtitle: string;
    year: number;
    page: number;
    questions: Question[];
    required_quiz_slug: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  existingQuizSlugs: string[];
}

interface SortableQuestionProps {
  question: Question;
  qIndex: number;
  onUpdate: (index: number, field: keyof Question, value: string | string[] | Question['options']) => void;
  onUpdateOption: (questionIndex: number, optionKey: OptionKey, value: string) => void;
  onToggleCorrect: (questionIndex: number, optionKey: OptionKey) => void;
  onRemove: (index: number) => void;
}

const SortableQuestion = ({ question, qIndex, onUpdate, onUpdateOption, onToggleCorrect, onRemove }: SortableQuestionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card rounded-xl p-6 border border-border space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-1">
            Question {qIndex + 1} *
          </label>
          <textarea
            value={question.question}
            onChange={(e) => onUpdate(qIndex, 'question', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={2}
            placeholder="Entrez la question..."
          />
        </div>
        <button
          onClick={() => onRemove(qIndex)}
          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(['a', 'b', 'c', 'd'] as OptionKey[]).map(optionKey => (
          <div key={optionKey} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleCorrect(qIndex, optionKey)}
              className={`w-8 h-8 rounded-lg font-semibold text-sm flex-shrink-0 transition-colors ${
                question.correctAnswers.includes(optionKey)
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {optionKey.toUpperCase()}
            </button>
            <input
              type="text"
              value={question.options[optionKey]}
              onChange={(e) => onUpdateOption(qIndex, optionKey, e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder={`Option ${optionKey.toUpperCase()}`}
            />
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Cliquez sur les lettres pour marquer les bonnes réponses (vert = correct)
      </p>
    </div>
  );
}

const AdminQuizEditor = ({ initialData, onSave, onCancel, existingQuizSlugs }: AdminQuizEditorProps) => {
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [page, setPage] = useState(initialData?.page || 1);
  const [requiredQuizSlug, setRequiredQuizSlug] = useState(initialData?.required_quiz_slug || '');
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(!initialData);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id.toString() === active.id);
        const newIndex = items.findIndex((item) => item.id.toString() === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        // Re-number questions after reorder
        return reordered.map((q, idx) => ({ ...q, id: idx + 1 }));
      });
    }
  };

  const handleQuizExtracted = (data: {
    questions: Array<{
      id: number;
      question: string;
      options: { a: string; b: string; c: string; d: string };
      correctAnswers: string[];
    }>;
    metadata?: { title?: string; page?: string; year?: string };
  }) => {
    // Convert extracted questions to our format
    const convertedQuestions: Question[] = data.questions.map((q, index) => ({
      id: index + 1,
      question: q.question,
      options: q.options,
      correctAnswers: q.correctAnswers as OptionKey[]
    }));

    setQuestions(prev => [...prev, ...convertedQuestions]);

    // Auto-fill metadata if available
    if (data.metadata) {
      if (data.metadata.title && !title) setTitle(data.metadata.title);
      if (data.metadata.page && page === 1) setPage(parseInt(data.metadata.page) || 1);
      if (data.metadata.year && year === new Date().getFullYear()) {
        setYear(parseInt(data.metadata.year) || new Date().getFullYear());
      }
    }

    setShowImageUpload(false);
  };

  const addQuestion = () => {
    const newId = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: newId,
        question: '',
        options: {
          a: '',
          b: '',
          c: '',
          d: ''
        },
        correctAnswers: ['a']
      }
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | string[] | Question['options']) => {
    const updated = [...questions];
    if (field === 'correctAnswers') {
      updated[index] = { ...updated[index], correctAnswers: value as OptionKey[] };
    } else if (field === 'options') {
      updated[index] = { ...updated[index], options: value as Question['options'] };
    } else if (field === 'question') {
      updated[index] = { ...updated[index], question: value as string };
    }
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionKey: OptionKey, value: string) => {
    const updated = [...questions];
    updated[questionIndex] = {
      ...updated[questionIndex],
      options: {
        ...updated[questionIndex].options,
        [optionKey]: value
      }
    };
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (questionIndex: number, optionKey: OptionKey) => {
    const updated = [...questions];
    const current = updated[questionIndex].correctAnswers;
    
    if (current.includes(optionKey)) {
      if (current.length > 1) {
        updated[questionIndex] = {
          ...updated[questionIndex],
          correctAnswers: current.filter(a => a !== optionKey)
        };
      }
    } else {
      updated[questionIndex] = {
        ...updated[questionIndex],
        correctAnswers: [...current, optionKey]
      };
    }
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    // Re-number questions
    updated.forEach((q, i) => q.id = i + 1);
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!slug || !title || !subtitle || questions.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validate all questions have content
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options.a || !q.options.b || !q.options.c || !q.options.d) {
        toast.error(`La question ${i + 1} n'est pas complète`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave({
        slug,
        title,
        subtitle,
        year,
        page,
        questions,
        required_quiz_slug: requiredQuizSlug || null
      });
      toast.success('Quiz sauvegardé !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {initialData ? 'Modifier le quiz' : 'Nouveau quiz'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image Upload Section - Only for new quizzes */}
      {!initialData && (
        <div className="bg-card rounded-xl p-6 border border-border">
          {showImageUpload ? (
            <AdminImageUpload onQuizExtracted={handleQuizExtracted} />
          ) : (
            <button
              onClick={() => setShowImageUpload(true)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              Ajouter plus de questions depuis une image
            </button>
          )}
        </div>
      )}

      {/* Quiz Metadata */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold text-foreground">Informations du quiz</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Identifiant unique (slug) *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              disabled={!!initialData}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder="ex: generalites-page-04-2024"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ex: Quiz Généralités"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Sous-titre *
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ex: Page 04 - 2024"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Année
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Numéro de page
            </label>
            <input
              type="number"
              value={page}
              onChange={(e) => setPage(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Quiz requis (optionnel)
            </label>
            <select
              value={requiredQuizSlug}
              onChange={(e) => setRequiredQuizSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Aucun (premier quiz)</option>
              {existingQuizSlugs.filter(s => s !== slug).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            Questions ({questions.length})
            <span className="text-xs text-muted-foreground ml-2">
              (glissez pour réorganiser)
            </span>
          </h3>
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une question
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map(q => q.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question, qIndex) => (
              <SortableQuestion
                key={question.id}
                question={question}
                qIndex={qIndex}
                onUpdate={updateQuestion}
                onUpdateOption={updateOption}
                onToggleCorrect={toggleCorrectAnswer}
                onRemove={removeQuestion}
              />
            ))}
          </SortableContext>
        </DndContext>

        {questions.length === 0 && (
          <div className="bg-card/50 rounded-xl border-2 border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">
              Aucune question. Cliquez sur "Ajouter une question" pour commencer.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default AdminQuizEditor;
