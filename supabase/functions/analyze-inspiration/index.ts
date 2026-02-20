import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

interface AnalysisResult {
  colors: { hex: string; name: string; percentage: number }[];
  mood: string[];
  visualWeight: string;
  typography: string;
  layout: string;
  voiceAnalysis?: {
    tone: string[];
    vocabulary: string[];
    sentenceStructure: string;
    summary: string;
  };
}

async function analyzeImageWithGemini(imageBase64: string, mimeType: string, targetAreas: string[]): Promise<AnalysisResult> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const wantsBrandDNA = targetAreas.includes("brand_dna");
  const wantsVoice = targetAreas.some((t) => t.startsWith("content_voice_"));

  const prompt = wantsBrandDNA
    ? `You are a brand design analyst. Analyze this image and extract ONLY:

1. Dominant colors (3-5 max):
   - Hex code (e.g., #A78BFA)
   - Color name (e.g., "Soft Violet")
   - Approximate percentage (must sum to 100%)

2. Mood keywords (2-4 from this list ONLY):
   [focused, premium, minimal, bold, playful, professional, warm, technical, luxurious, clean, modern, elegant, energetic, trustworthy]

3. Visual weight (choose ONE): [light, balanced, heavy]

4. Typography style (be specific):
   Examples: "geometric sans-serif", "serif editorial", "monospace technical"

5. Layout pattern:
   Examples: "hero with feature grid", "centered minimal", "asymmetric editorial"

Return ONLY valid JSON matching this schema:
{
  "colors": [{"hex": string, "name": string, "percentage": number}],
  "mood": string[],
  "visualWeight": string,
  "typography": string,
  "layout": string
}

No explanations. No additional text.`
    : `You are a design analyst. Analyze this image briefly.
Return ONLY valid JSON:
{
  "colors": [{"hex": "#000000", "name": "Black", "percentage": 100}],
  "mood": ["neutral"],
  "visualWeight": "balanced",
  "typography": "unknown",
  "layout": "unknown"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: imageBase64 } },
      ],
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from Gemini");

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as AnalysisResult;
}

async function analyzeTextWithGemini(textContent: string, platforms: string[]): Promise<AnalysisResult["voiceAnalysis"]> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const prompt = `Analyze this content and extract brand voice characteristics for: ${platforms.join(", ")}.

CONTENT:
${textContent.slice(0, 3000)}

Return ONLY valid JSON:
{
  "tone": string[],
  "vocabulary": string[],
  "sentenceStructure": string,
  "summary": string
}

- tone: 2-3 adjectives (e.g., conversational, authoritative, playful)
- vocabulary: 3-5 recurring words/phrases
- sentenceStructure: one of [short-punchy, medium-balanced, long-descriptive]
- summary: one-sentence brand voice summary

No explanations. No additional text.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from Gemini");

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageBase64, mimeType, textContent, targetAreas } = body as {
      imageBase64?: string;
      mimeType?: string;
      textContent?: string;
      targetAreas: string[];
    };

    if (targetAreas.includes("swipe_file_only") && targetAreas.length === 1) {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: AnalysisResult = {
      colors: [],
      mood: [],
      visualWeight: "balanced",
      typography: "unknown",
      layout: "unknown",
    };

    if (imageBase64 && mimeType) {
      result = await analyzeImageWithGemini(imageBase64, mimeType, targetAreas);
    }

    const voicePlatforms = targetAreas
      .filter((t) => t.startsWith("content_voice_"))
      .map((t) => t.replace("content_voice_", ""));

    if (voicePlatforms.length > 0 && textContent) {
      result.voiceAnalysis = await analyzeTextWithGemini(textContent, voicePlatforms);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
