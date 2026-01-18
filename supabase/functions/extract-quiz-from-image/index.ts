import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Sending image to Lovable AI for OCR extraction...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant spécialisé dans l'extraction de questions de quiz à partir d'images.

Tu dois analyser l'image et extraire les questions de quiz en suivant ces règles:
1. Le texte en GRAS représente les QUESTIONS
2. Le texte en BLEU représente les RÉPONSES CORRECTES
3. Chaque question a 4 options: a, b, c, d
4. Certaines questions peuvent avoir plusieurs réponses correctes

Tu dois retourner un JSON structuré avec le format suivant:
{
  "questions": [
    {
      "id": 1,
      "question": "Texte de la question en gras",
      "options": {
        "a": "Option A",
        "b": "Option B", 
        "c": "Option C",
        "d": "Option D"
      },
      "correctAnswers": ["b", "c"]
    }
  ],
  "metadata": {
    "title": "Titre du quiz si visible",
    "page": "Numéro de page si visible",
    "year": "Année si visible"
  }
}

Assure-toi de:
- Extraire toutes les questions visibles dans l'image
- Identifier correctement les réponses en bleu comme correctes
- Numéroter les questions séquentiellement
- Retourner UNIQUEMENT le JSON, sans texte supplémentaire`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyse cette image et extrais toutes les questions de quiz. Les textes en gras sont les questions et les textes en bleu sont les bonnes réponses. Retourne uniquement le JSON structuré."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants. Veuillez recharger votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'analyse de l'image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data).substring(0, 500));

    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Aucun contenu extrait de l'image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to parse the JSON from the response
    let extractedData;
    try {
      // Remove potential markdown code blocks
      let jsonContent = content;
      if (jsonContent.includes("```json")) {
        jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonContent.includes("```")) {
        jsonContent = jsonContent.replace(/```\n?/g, "");
      }
      extractedData = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ 
          error: "Erreur lors du parsing du résultat",
          rawContent: content 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully extracted quiz data:", JSON.stringify(extractedData).substring(0, 500));

    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inattendue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
