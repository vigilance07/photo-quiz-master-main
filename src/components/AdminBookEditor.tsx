import { useState } from "react";
import { Book, Plus, Trash2, Edit, X, Save, BookOpen, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooks, Book as BookType } from "@/hooks/useBooks";
import BookImageUpload from "./BookImageUpload";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PageContent {
  id: number;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswers: string[];
}

interface BookPage {
  pageNumber: number;
  content: PageContent[];
}

interface ExtractedBookData {
  pages: BookPage[];
  metadata?: {
    title?: string;
    year?: string;
    pageRange?: string;
  };
}

// Sortable Page Item Component
interface SortablePageItemProps {
  page: BookPage;
  pageIndex: number;
  pageId: string;
  expandedPages: number[];
  expandedQuestions: string[];
  togglePage: (index: number) => void;
  toggleQuestion: (key: string) => void;
  deletePage: (index: number) => void;
  deleteQuestion: (pageIndex: number, questionIndex: number) => void;
  updateQuestion: (pageIndex: number, questionIndex: number, field: keyof PageContent, value: any) => void;
  updateOption: (pageIndex: number, questionIndex: number, optionKey: string, value: string) => void;
  toggleCorrectAnswer: (pageIndex: number, questionIndex: number, optionKey: string) => void;
}

const SortablePageItem = ({
  page,
  pageIndex,
  pageId,
  expandedPages,
  expandedQuestions,
  togglePage,
  toggleQuestion,
  deletePage,
  deleteQuestion,
  updateQuestion,
  updateOption,
  toggleCorrectAnswer,
}: SortablePageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pageId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Collapsible 
        open={expandedPages.includes(pageIndex)}
        onOpenChange={() => togglePage(pageIndex)}
      >
        <Card className={`border-muted ${isDragging ? 'shadow-lg' : ''}`}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {expandedPages.includes(pageIndex) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="font-medium">Page {pageIndex + 1}</span>
                  <span className="text-sm text-muted-foreground">
                    ({page.content.length} question{page.content.length > 1 ? 's' : ''})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(pageIndex);
                  }}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {page.content.map((question, questionIndex) => {
                const questionKey = `${pageIndex}-${questionIndex}`;
                const isExpanded = expandedQuestions.includes(questionKey);
                
                return (
                  <Collapsible
                    key={questionIndex}
                    open={isExpanded}
                    onOpenChange={() => toggleQuestion(questionKey)}
                  >
                    <Card className="bg-muted/30">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2 px-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-3 h-3 flex-shrink-0" />
                              )}
                              <span className="font-medium text-sm">Q{question.id}</span>
                              <span className="text-sm text-muted-foreground truncate">
                                {question.question.substring(0, 50)}...
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteQuestion(pageIndex, questionIndex);
                              }}
                              className="h-6 w-6 text-destructive hover:text-destructive flex-shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 px-3 pb-3 space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Question</Label>
                            <Textarea
                              value={question.question}
                              onChange={(e) => updateQuestion(pageIndex, questionIndex, 'question', e.target.value)}
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Options (cliquez pour marquer comme correcte)</Label>
                            <div className="grid gap-2">
                              {Object.entries(question.options).map(([key, value]) => {
                                const isCorrect = question.correctAnswers.includes(key);
                                return (
                                  <div key={key} className="flex items-center gap-2">
                                    <Button
                                      variant={isCorrect ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => toggleCorrectAnswer(pageIndex, questionIndex, key)}
                                      className={`w-8 h-8 p-0 ${isCorrect ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                    >
                                      {key.toUpperCase()}
                                    </Button>
                                    <Input
                                      value={value}
                                      onChange={(e) => updateOption(pageIndex, questionIndex, key, e.target.value)}
                                      className="flex-1 text-sm"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

const AdminBookEditor = () => {
  const { books, addBook, updateBook, deleteBook, getYears, loading } = useBooks();
  const [isCreating, setIsCreating] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [expandedPages, setExpandedPages] = useState<number[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    year: new Date().getFullYear(),
    pages: [] as BookPage[],
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.pages.findIndex((_, i) => `page-${i}` === active.id);
        const newIndex = prev.pages.findIndex((_, i) => `page-${i}` === over.id);
        
        return {
          ...prev,
          pages: arrayMove(prev.pages, oldIndex, newIndex),
        };
      });
      
      // Update expanded pages indices after reordering
      setExpandedPages([]);
    }
  };

  const togglePage = (pageIndex: number) => {
    setExpandedPages(prev => 
      prev.includes(pageIndex) 
        ? prev.filter(p => p !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  const toggleQuestion = (key: string) => {
    setExpandedQuestions(prev => 
      prev.includes(key) 
        ? prev.filter(q => q !== key)
        : [...prev, key]
    );
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingBook(null);
    setFormData({
      title: "",
      year: new Date().getFullYear(),
      pages: [],
    });
    setShowImageUpload(true);
    setExpandedPages([]);
    setExpandedQuestions([]);
  };

  const handleEdit = (book: BookType) => {
    setEditingBook(book);
    setIsCreating(false);
    setFormData({
      title: book.title,
      year: book.year,
      pages: book.pages,
    });
    setShowImageUpload(false);
    setExpandedPages([]);
    setExpandedQuestions([]);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingBook(null);
    setShowImageUpload(false);
    setExpandedPages([]);
    setExpandedQuestions([]);
    setFormData({
      title: "",
      year: new Date().getFullYear(),
      pages: [],
    });
  };

  const handleBookExtracted = (data: ExtractedBookData) => {
    setFormData(prev => ({
      ...prev,
      title: data.metadata?.title || prev.title,
      year: data.metadata?.year ? parseInt(data.metadata.year) : prev.year,
      pages: [...prev.pages, ...data.pages],
    }));
    setShowImageUpload(false);
  };

  const updateQuestion = (pageIndex: number, questionIndex: number, field: keyof PageContent, value: any) => {
    setFormData(prev => {
      const newPages = [...prev.pages];
      const page = { ...newPages[pageIndex] };
      const content = [...page.content];
      content[questionIndex] = { ...content[questionIndex], [field]: value };
      page.content = content;
      newPages[pageIndex] = page;
      return { ...prev, pages: newPages };
    });
  };

  const updateOption = (pageIndex: number, questionIndex: number, optionKey: string, value: string) => {
    setFormData(prev => {
      const newPages = [...prev.pages];
      const page = { ...newPages[pageIndex] };
      const content = [...page.content];
      const question = { ...content[questionIndex] };
      question.options = { ...question.options, [optionKey]: value };
      content[questionIndex] = question;
      page.content = content;
      newPages[pageIndex] = page;
      return { ...prev, pages: newPages };
    });
  };

  const toggleCorrectAnswer = (pageIndex: number, questionIndex: number, optionKey: string) => {
    setFormData(prev => {
      const newPages = [...prev.pages];
      const page = { ...newPages[pageIndex] };
      const content = [...page.content];
      const question = { ...content[questionIndex] };
      const correctAnswers = question.correctAnswers.includes(optionKey)
        ? question.correctAnswers.filter(a => a !== optionKey)
        : [...question.correctAnswers, optionKey];
      question.correctAnswers = correctAnswers;
      content[questionIndex] = question;
      page.content = content;
      newPages[pageIndex] = page;
      return { ...prev, pages: newPages };
    });
  };

  const deleteQuestion = (pageIndex: number, questionIndex: number) => {
    setFormData(prev => {
      const newPages = [...prev.pages];
      const page = { ...newPages[pageIndex] };
      page.content = page.content.filter((_, idx) => idx !== questionIndex);
      newPages[pageIndex] = page;
      return { ...prev, pages: newPages };
    });
  };

  const deletePage = (pageIndex: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette page ?")) {
      setFormData(prev => ({
        ...prev,
        pages: prev.pages.filter((_, idx) => idx !== pageIndex),
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      return;
    }

    const slug = formData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      if (editingBook) {
        await updateBook(editingBook.slug, {
          title: formData.title,
          year: formData.year,
          pages: formData.pages,
        });
      } else {
        await addBook({
          title: formData.title,
          year: formData.year,
          slug: `${slug}-${formData.year}`,
          pages: formData.pages,
        });
      }
      handleCancel();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (slug: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {
      await deleteBook(slug);
    }
  };

  const years = getYears();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Gestion des Livres</h2>
        </div>
        {!isCreating && !editingBook && (
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau Livre
          </Button>
        )}
      </div>

      {(isCreating || editingBook) && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingBook ? "Modifier le livre" : "Créer un nouveau livre"}</span>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {showImageUpload && (
              <BookImageUpload onBookExtracted={handleBookExtracted} />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du livre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Culture Générale"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  min={2000}
                  max={2100}
                />
              </div>
            </div>

            {formData.pages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Pages ({formData.pages.length})</Label>
                  <span className="text-xs text-muted-foreground">
                    Glissez-déposez pour réorganiser
                  </span>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={formData.pages.map((_, i) => `page-${i}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {formData.pages.map((page, pageIndex) => (
                        <SortablePageItem
                          key={`page-${pageIndex}`}
                          page={page}
                          pageIndex={pageIndex}
                          pageId={`page-${pageIndex}`}
                          expandedPages={expandedPages}
                          expandedQuestions={expandedQuestions}
                          togglePage={togglePage}
                          toggleQuestion={toggleQuestion}
                          deletePage={deletePage}
                          deleteQuestion={deleteQuestion}
                          updateQuestion={updateQuestion}
                          updateOption={updateOption}
                          toggleCorrectAnswer={toggleCorrectAnswer}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {!showImageUpload && (
              <Button variant="outline" onClick={() => setShowImageUpload(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter des pages depuis une image
              </Button>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={!formData.title.trim()} className="gap-2">
                <Save className="w-4 h-4" />
                {editingBook ? "Mettre à jour" : "Créer le livre"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Books list by year */}
      {years.length === 0 && !isCreating && !editingBook ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Aucun livre n'a été ajouté pour le moment.
              <br />
              Cliquez sur "Nouveau Livre" pour commencer.
            </p>
          </CardContent>
        </Card>
      ) : (
        years.map(year => (
          <div key={year} className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {year}
              </span>
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {books
                .filter(book => book.year === year)
                .map(book => (
                  <Card key={book.id} className="group hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {book.pages.length} page(s) • {book.pages.reduce((acc, p) => acc + p.content.length, 0)} question(s)
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(book)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(book.slug)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminBookEditor;
