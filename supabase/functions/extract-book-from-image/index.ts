import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image base64 data is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing book image extraction...");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI Gateway for vision analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant spécialisé dans l'extraction de contenu de livres à partir d'images.
            
Ton travail est d'analyser une image de page de livre et d'extraire:
1. Le texte en GRAS représente les QUESTIONS
2. Le texte en minuscule (non gras) représente les différentes RÉPONSES possibles (a, b, c, d)
3. Les réponses correctes sont généralement marquées en bleu ou surlignées

Tu dois retourner un JSON avec cette structure exacte:
{
  "pages": [
    {
      "pageNumber": 1,
      "content": [
        {
          "id": 1,
          "question": "Le texte de la question en gras",
          "options": {
            "a": "Option A",
            "b": "Option B", 
            "c": "Option C",
            "d": "Option D"
          },
          "correctAnswers": ["a", "b"]
        }
      ]
    }
  ],
  "metadata": {
    "title": "Titre du livre si visible",
    "year": "Année si visible",
    "pageRange": "Ex: 1-10"
  }
}

IMPORTANT:
- Chaque question en gras devient un élément "question"
- Le texte en minuscule après chaque question représente les options de réponse
- Si tu détectes du texte en bleu ou surligné, ce sont les réponses correctes
- Numérote les questions de manière séquentielle
- Si tu ne peux pas extraire de contenu valide, retourne un objet avec pages vide`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: "Analyse cette image de livre et extrais toutes les questions (texte en gras) et leurs réponses (texte en minuscule). Identifie les bonnes réponses si elles sont marquées en bleu. Retourne le JSON structuré."
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let extractedData;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      console.log("Raw content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log(`Extracted ${extractedData.pages?.length || 0} pages`);

    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in extract-book-from-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
