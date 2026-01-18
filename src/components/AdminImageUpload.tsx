import { useState, useCallback } from "react";
import { Upload, ImageIcon, Loader2, FileCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExtractedQuestion {
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

interface ExtractedData {
  questions: ExtractedQuestion[];
  metadata?: {
    title?: string;
    page?: string;
    year?: string;
  };
}

interface AdminImageUploadProps {
  onQuizExtracted: (data: ExtractedData) => void;
}

const AdminImageUpload = ({ onQuizExtracted }: AdminImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo");
      return;
    }

    setIsUploading(true);
    setExtractionStatus("idle");

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setPreviewUrl(base64);
        setIsUploading(false);

        // Start extraction
        setIsExtracting(true);
        try {
          const { data, error } = await supabase.functions.invoke("extract-quiz-from-image", {
            body: { imageBase64: base64 }
          });

          if (error) {
            throw error;
          }

          if (data.error) {
            throw new Error(data.error);
          }

          if (!data.questions || data.questions.length === 0) {
            throw new Error("Aucune question n'a été détectée dans l'image");
          }

          setExtractionStatus("success");
          toast.success(`${data.questions.length} question(s) extraite(s) avec succès!`);
          onQuizExtracted(data);

        } catch (extractError) {
          console.error("Extraction error:", extractError);
          setExtractionStatus("error");
          toast.error(extractError instanceof Error ? extractError.message : "Erreur lors de l'extraction");
        } finally {
          setIsExtracting(false);
        }
      };

      reader.onerror = () => {
        toast.error("Erreur lors de la lecture du fichier");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors du téléchargement");
      setIsUploading(false);
    }
  }, [onQuizExtracted]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement("input");
      input.type = "file";
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      
      handleFileSelect({ target: input } as any);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const resetUpload = () => {
    setPreviewUrl(null);
    setExtractionStatus("idle");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <ImageIcon className="w-5 h-5 text-primary" />
        <h3>Extraction automatique depuis une image</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Uploadez une image de quiz. Le système détectera automatiquement les questions (texte en gras) 
        et les bonnes réponses (texte en bleu).
      </p>

      {!previewUrl ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="quiz-image-upload"
            disabled={isUploading}
          />
          <label htmlFor="quiz-image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              {isUploading ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {isUploading ? "Chargement..." : "Cliquez ou glissez-déposez une image"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG jusqu'à 10 Mo
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={previewUrl}
              alt="Image uploadée"
              className="w-full max-h-96 object-contain bg-muted/30"
            />
            {isExtracting && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="font-medium text-foreground">Analyse de l'image en cours...</p>
                  <p className="text-sm text-muted-foreground">
                    Extraction des questions et réponses
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {extractionStatus === "success" && (
                <>
                  <FileCheck className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">Extraction réussie</span>
                </>
              )}
              {extractionStatus === "error" && (
                <>
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span className="text-destructive font-medium">Erreur d'extraction</span>
                </>
              )}
            </div>
            
            <button
              onClick={resetUpload}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Changer d'image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImageUpload;
