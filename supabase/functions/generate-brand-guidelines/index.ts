import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-2.0-flash";

interface GenerateRequest {
  format: "markdown" | "json" | "css" | "tailwind" | "figma-tokens";
}

async function generateWithGemini(
  dnaData: Record<string, unknown>,
  format: string
): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const prompts: Record<string, string> = {
    markdown: `You are a brand strategist. Generate comprehensive brand guidelines in Markdown format based on this Brand DNA data:

${JSON.stringify(dnaData, null, 2)}

Create a complete brand guidelines document with these sections:
# Brand Guidelines

## Brand Identity
- Brief overview of the brand personality and aesthetic

## Color System
- Primary colors with hex codes, names, and usage guidance
- Include specific do's and don'ts

## Typography
- Font recommendations, hierarchy, and usage rules

## Voice & Tone
- Writing style, vocabulary choices, what to avoid

## Visual Principles
- Layout, spacing, imagery, and composition guidelines

## Usage Examples
- Good vs. bad examples for copy and visual choices

Write in a professional, actionable tone. Use markdown formatting. Return ONLY the markdown document, no additional text.`,

    json: `You are a brand design systems engineer. Generate a structured brand token JSON based on this Brand DNA:

${JSON.stringify(dnaData, null, 2)}

Return a design token JSON object with this exact structure:
{
  "brand": {
    "name": string,
    "archetype": string
  },
  "colors": {
    "primary": [{"name": string, "hex": string, "role": string}],
    "accent": [{"name": string, "hex": string, "role": string}],
    "neutral": [{"name": string, "hex": string, "role": string}]
  },
  "typography": {
    "heading": {"family": string, "weight": string, "style": string},
    "body": {"family": string, "weight": string, "size": string},
    "mono": {"family": string}
  },
  "spacing": {
    "scale": string,
    "unit": string
  },
  "tone": {
    "keywords": string[],
    "avoid": string[],
    "summary": string
  }
}

Return ONLY valid JSON. No explanations.`,

    css: `You are a CSS expert. Generate CSS custom properties (variables) for a complete design system based on this Brand DNA:

${JSON.stringify(dnaData, null, 2)}

Create a :root { } block with variables for:
- All brand colors with semantic naming (--color-background, --color-surface, --color-primary, etc.)
- Typography (--font-heading, --font-body, --font-mono, --font-size-base, etc.)
- Spacing scale (--space-1 through --space-16 using 8px base)
- Border radius tokens
- Shadow tokens

Add brief comments for each section. Return ONLY the CSS. No additional text.`,

    tailwind: `You are a Tailwind CSS expert. Generate a tailwind.config.js theme extension based on this Brand DNA:

${JSON.stringify(dnaData, null, 2)}

Return a complete tailwind.config.js file with:
- Custom color palette with all brand colors
- Custom font family configuration
- Custom spacing additions if needed
- Custom border radius tokens

Use descriptive variable names that match the brand (e.g., 'void-black', 'soft-violet').
Return ONLY the JavaScript config file content. No additional text.`,

    "figma-tokens": `You are a Figma design systems expert. Generate a Figma Tokens JSON file based on this Brand DNA:

${JSON.stringify(dnaData, null, 2)}

Return a valid Figma Tokens Studio JSON with:
- global token set with all colors, typography, spacing tokens
- Proper token type annotations ($type: "color", "fontFamilies", "spacing", etc.)
- Descriptive token names in dot notation (e.g., color.primary.background)

Return ONLY the JSON. No explanations.`,
  };

  const prompt = prompts[format];
  if (!prompt) throw new Error(`Unknown format: ${format}`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
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

  return text.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey    = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase   = createClient(supabaseUrl, anonKey);

    const body = await req.json() as GenerateRequest;
    const { format } = body;

    const validFormats = ["markdown", "json", "css", "tailwind", "figma-tokens"];
    if (!validFormats.includes(format)) {
      return new Response(JSON.stringify({ error: "Invalid format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: snapshots } = await supabase
      .from("brand_dna_snapshots")
      .select("aggregated_data, inspiration_count, generated_at")
      .order("generated_at", { ascending: false })
      .limit(1);

    const latestSnapshot = snapshots?.[0];

    const { data: inspirations } = await supabase
      .from("inspirations")
      .select("analysis, tags, target_areas")
      .order("saved_at", { ascending: false });

    const topColors = (inspirations ?? [])
      .flatMap((i: { analysis: { dominantColors?: { hex: string; name: string; percentage: number }[] } }) => i.analysis?.dominantColors ?? [])
      .reduce<Record<string, { name: string; count: number }>>((acc, c) => {
        if (!acc[c.hex]) acc[c.hex] = { name: c.name, count: 0 };
        acc[c.hex].count++;
        return acc;
      }, {});

    const dnaData = {
      snapshot: latestSnapshot?.aggregated_data ?? null,
      inspiration_count: latestSnapshot?.inspiration_count ?? (inspirations?.length ?? 0),
      topColors: Object.entries(topColors)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([hex, v]) => ({ hex, name: v.name, frequency: v.count })),
      tags: [...new Set((inspirations ?? []).flatMap((i: { tags: string[] }) => i.tags ?? []))].slice(0, 20),
    };

    const generated = await generateWithGemini(dnaData, format);

    return new Response(JSON.stringify({ content: generated, format }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
