import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book as BookIcon, ChevronRight, LogOut, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBooks, Book } from "@/hooks/useBooks";
import AdminBookEditor from "@/components/AdminBookEditor";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PageState = 'selection' | 'book-view' | 'admin';

const Books = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { books, loading: booksLoading, getYears } = useBooks();
  
  const [pageState, setPageState] = useState<PageState>('selection');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const years = getYears();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Déconnexion réussie');
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setSelectedPageIndex(0);
    setPageState('book-view');
  };

  const handleBackToSelection = () => {
    setPageState('selection');
    setSelectedBook(null);
    setSelectedPageIndex(0);
  };

  const handleAdminMode = () => {
    if (!isAdmin) {
      toast.error("Accès réservé aux administrateurs");
      return;
    }
    setPageState('admin');
  };

  if (authLoading || booksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPage = selectedBook?.pages[selectedPageIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <BookIcon className="w-5 h-5 text-primary-foreground" />
              </button>
              <div>
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  {selectedBook ? selectedBook.title : 'Bibliothèque'}
                </h1>
                {selectedBook && (
                  <p className="text-sm text-muted-foreground">Année {selectedBook.year}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-600 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                  {pageState === 'selection' && (
                    <Button variant="outline" size="sm" onClick={handleAdminMode}>
                      Gérer les livres
                    </Button>
                  )}
                </>
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
        <div className="max-w-4xl mx-auto">
          {pageState === 'selection' && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Sélectionnez un livre</h2>
                <p className="text-muted-foreground">Choisissez parmi nos livres classés par année</p>
              </div>

              {years.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookIcon className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Aucun livre n'est disponible pour le moment.
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
                    <div className="grid gap-3 md:grid-cols-2">
                      {books
                        .filter(book => book.year === year)
                        .map(book => (
                          <Card 
                            key={book.id} 
                            className="group hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => handleSelectBook(book)}
                          >
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <BookIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground">{book.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {book.pages.length} page(s) • {book.pages.reduce((acc, p) => acc + p.content.length, 0)} question(s)
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))
              )}

              {/* Link back to quizzes */}
              <div className="pt-4">
                <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Retour aux Quiz
                </Button>
              </div>
            </div>
          )}

          {pageState === 'book-view' && selectedBook && currentPage && (
            <div className="space-y-6">
              <button
                onClick={handleBackToSelection}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la sélection
              </button>

              {/* Page navigation */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedBook.pages.map((_, idx) => (
                  <Button
                    key={idx}
                    variant={idx === selectedPageIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPageIndex(idx)}
                  >
                    Page {idx + 1}
                  </Button>
                ))}
              </div>

              {/* Page content */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">
                  Page {selectedPageIndex + 1}
                </h3>
                
                {currentPage.content.map((item, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <p className="font-bold text-foreground">
                        {item.id}. {item.question}
                      </p>
                      <div className="grid gap-2 pl-4">
                        {Object.entries(item.options).map(([key, value]) => (
                          <div
                            key={key}
                            className="p-2 rounded-lg bg-muted/50"
                          >
                            <span className="font-medium">{key.toUpperCase()}.</span> {value}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Page navigation bottom */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPageIndex(prev => Math.max(0, prev - 1))}
                  disabled={selectedPageIndex === 0}
                >
                  Page précédente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPageIndex(prev => Math.min(selectedBook.pages.length - 1, prev + 1))}
                  disabled={selectedPageIndex === selectedBook.pages.length - 1}
                >
                  Page suivante
                </Button>
              </div>
            </div>
          )}

          {pageState === 'admin' && (
            <div>
              <button
                onClick={handleBackToSelection}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la sélection
              </button>
              <AdminBookEditor />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Bibliothèque de livres - Culture Générale et Actualités du Burkina Faso
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Books;
