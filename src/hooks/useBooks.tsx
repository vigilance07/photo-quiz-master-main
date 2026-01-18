import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

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

export interface Book {
  id: string;
  title: string;
  year: number;
  slug: string;
  pages: BookPage[];
  created_at: string;
  updated_at: string;
}

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("year", { ascending: false });

      if (error) throw error;

      const typedBooks: Book[] = (data || []).map((book) => ({
        ...book,
        pages: (book.pages as unknown as BookPage[]) || [],
      }));

      setBooks(typedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Erreur lors du chargement des livres");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBooks();
      setLoading(false);
    };
    loadData();
  }, [fetchBooks]);

  const addBook = async (book: Omit<Book, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("books")
        .insert([{
          title: book.title,
          year: book.year,
          slug: book.slug,
          pages: JSON.parse(JSON.stringify(book.pages)) as Json,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Livre ajouté avec succès!");
      await fetchBooks();
      return data;
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Erreur lors de l'ajout du livre");
      throw error;
    }
  };

  const updateBook = async (slug: string, updates: Partial<Book>) => {
    try {
      const { pages, ...rest } = updates;
      const updateData: Record<string, unknown> = { ...rest };
      
      if (pages) {
        updateData.pages = JSON.parse(JSON.stringify(pages)) as Json;
      }

      const { error } = await supabase
        .from("books")
        .update(updateData)
        .eq("slug", slug);

      if (error) throw error;

      toast.success("Livre mis à jour avec succès!");
      await fetchBooks();
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Erreur lors de la mise à jour du livre");
      throw error;
    }
  };

  const deleteBook = async (slug: string) => {
    try {
      const { error } = await supabase
        .from("books")
        .delete()
        .eq("slug", slug);

      if (error) throw error;

      toast.success("Livre supprimé avec succès!");
      await fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Erreur lors de la suppression du livre");
      throw error;
    }
  };

  const getBooksByYear = useCallback((year: number) => {
    return books.filter(book => book.year === year);
  }, [books]);

  const getYears = useCallback(() => {
    const years = [...new Set(books.map(book => book.year))];
    return years.sort((a, b) => b - a);
  }, [books]);

  return {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    getBooksByYear,
    getYears,
    refetch: fetchBooks,
  };
};
