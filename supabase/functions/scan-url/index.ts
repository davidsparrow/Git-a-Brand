import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-2.0-flash";

interface ScanResult {
  colors: { hex: string; name: string; percentage: number }[];
  mood: string[];
  visualWeight: string;
  typography: string;
  layout: string;
  screenshotUrl?: string;
  pageTitle?: string;
  favicon?: string;
}

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchPageContent(url: string): Promise<{ html: string; title: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GitaBrand/1.0; +https://gitabrand.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? new URL(url).hostname;
    return { html, title };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

function extractColorsFromCSS(html: string): { hex: string; name: string }[] {
  const hexPattern = /#([0-9A-Fa-f]{6})\b/g;
  const colorCount: Record<string, number> = {};

  let match;
  while ((match = hexPattern.exec(html)) !== null) {
    const hex = `#${match[1].toUpperCase()}`;
    colorCount[hex] = (colorCount[hex] ?? 0) + 1;
  }

  const filtered = Object.entries(colorCount)
    .filter(([hex]) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const isWhite = r > 250 && g > 250 && b > 250;
      const isBlack = r < 5 && g < 5 && b < 5;
      return !isWhite && !isBlack;
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hex]) => ({ hex, name: hex }));

  return filtered;
}

async function analyzeWithGemini(
  pageContent: string,
  extractedColors: { hex: string; name: string }[],
  url: string,
  targetAreas: string[]
): Promise<ScanResult> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const wantsBrandDNA = targetAreas.includes("brand_dna");
  const voicePlatforms = targetAreas
    .filter((t) => t.startsWith("content_voice_"))
    .map((t) => t.replace("content_voice_", ""));

  const snippedContent = pageContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000);

  const prompt = `You are a brand design analyst. Analyze this website content.

URL: ${url}
${extractedColors.length > 0 ? `CSS Colors found: ${extractedColors.map((c) => c.hex).join(", ")}` : ""}

PAGE TEXT CONTENT:
${snippedContent}

Extract brand identity:
${wantsBrandDNA ? `
1. Dominant colors (3-5 max) — use CSS colors if provided, otherwise infer from content:
   - Hex code, color name, approximate percentage (sum to 100%)
2. Mood keywords (2-4): [focused, premium, minimal, bold, playful, professional, warm, technical, luxurious, clean, modern, elegant, energetic, trustworthy]
3. Visual weight: [light, balanced, heavy]
4. Typography style (e.g., "geometric sans-serif", "serif editorial")
5. Layout pattern (e.g., "hero with feature grid", "centered minimal")
` : ""}
${voicePlatforms.length > 0 ? `
Brand voice for: ${voicePlatforms.join(", ")}
- Tone (2-3 adjectives)
- Key vocabulary (3-5 terms)
- Sentence structure: [short-punchy, medium-balanced, long-descriptive]
- One-sentence voice summary
` : ""}

Return ONLY valid JSON:
{
  "colors": [{"hex": string, "name": string, "percentage": number}],
  "mood": string[],
  "visualWeight": string,
  "typography": string,
  "layout": string${voicePlatforms.length > 0 ? `,
  "voiceAnalysis": {
    "tone": string[],
    "vocabulary": string[],
    "sentenceStructure": string,
    "summary": string
  }` : ""}
}

No explanations. No additional text.`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(geminiUrl, {
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
  return JSON.parse(cleaned) as ScanResult;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { url, targetAreas } = body as { url: string; targetAreas: string[] };

    if (!url || !isValidUrl(url)) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    const { html, title } = await fetchPageContent(normalizedUrl);
    const extractedColors = extractColorsFromCSS(html);
    const result = await analyzeWithGemini(html, extractedColors, normalizedUrl, targetAreas);

    const parsedUrl = new URL(normalizedUrl);
    const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;

    return new Response(JSON.stringify({
      ...result,
      pageTitle: title,
      favicon,
      sourceDomain: parsedUrl.hostname,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
