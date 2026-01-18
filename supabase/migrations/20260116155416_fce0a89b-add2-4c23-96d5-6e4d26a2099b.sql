-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Everyone can view books
CREATE POLICY "Anyone can view books"
ON public.books
FOR SELECT
USING (true);

-- Only admins can insert books
CREATE POLICY "Admins can insert books"
ON public.books
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can update books
CREATE POLICY "Admins can update books"
ON public.books
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can delete books
CREATE POLICY "Admins can delete books"
ON public.books
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();