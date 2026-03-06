import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple hash for cache key
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imagePrompt, questionText, skill } = await req.json();

    if (!imagePrompt) {
      return new Response(
        JSON.stringify({ error: "imagePrompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate cache key from prompt
    const cacheKey = `quiz-img-${simpleHash(imagePrompt + (skill || ""))}`;
    const filePath = `${cacheKey}.png`;

    // Check if cached image already exists
    const { data: existingFile } = await supabase.storage
      .from("quiz-images")
      .getPublicUrl(filePath);

    // Try to check if the file actually exists by listing
    const { data: fileList } = await supabase.storage
      .from("quiz-images")
      .list("", { search: `${cacheKey}.png` });

    if (fileList && fileList.length > 0 && fileList.some(f => f.name === `${cacheKey}.png`)) {
      console.log("Cache hit for:", cacheKey);
      return new Response(
        JSON.stringify({ imageUrl: existingFile.publicUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate image via Lovable AI Gateway
    console.log("Generating image for:", skill, imagePrompt);
    const prompt = `Create a beautiful, high-quality cartoon illustration for a Thai elementary school math quiz.
Topic: ${skill || "math"}.
Scene: ${imagePrompt}.
Style: vibrant colors, detailed kawaii/chibi style, cute characters, soft shading, professional children's book illustration quality. NO text, NO numbers, NO letters, NO words in the image. Clean soft pastel background with subtle gradient.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check for embedded errors (e.g., rate limit error inside SSE stream)
    const choiceError = data.choices?.[0]?.error;
    if (choiceError) {
      const errorCode = choiceError.code || 500;
      const errorType = choiceError.metadata?.error_type || "unknown";
      console.error("AI gateway embedded error:", errorCode, errorType, choiceError.message);
      
      if (errorCode === 429 || errorType === "rate_limit_exceeded") {
        return new Response(
          JSON.stringify({ error: "AI กำลังยุ่ง กรุณาลองใหม่ในอีกสักครู่" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI error: ${choiceError.message || "Unknown"}`);
    }

    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error("No image returned from AI gateway:", JSON.stringify(data).slice(0, 500));
      throw new Error("No image generated");
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image data format");
    }

    const imageBytes = Uint8Array.from(atob(base64Match[2]), (c) => c.charCodeAt(0));

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("quiz-images")
      .upload(filePath, imageBytes, {
        contentType: `image/${base64Match[1]}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Return base64 directly as fallback
      return new Response(
        JSON.stringify({ imageUrl: imageData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("quiz-images")
      .getPublicUrl(filePath);

    console.log("Image generated and cached:", publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({ imageUrl: publicUrlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-quiz-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
