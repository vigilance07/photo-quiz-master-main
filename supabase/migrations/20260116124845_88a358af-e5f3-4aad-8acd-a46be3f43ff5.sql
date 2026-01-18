-- Create storage bucket for admin quiz image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-images', 'quiz-images', false)
ON CONFLICT (id) DO NOTHING;

-- Only admins can upload images
CREATE POLICY "Admins can upload quiz images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'quiz-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can view uploaded images
CREATE POLICY "Admins can view quiz images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'quiz-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete images
CREATE POLICY "Admins can delete quiz images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'quiz-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);