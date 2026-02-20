import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

interface ColorInfo {
  hex: string;
  name: string;
  percentage: number;
}

interface InspirationRow {
  analysis: {
    dominantColors: ColorInfo[];
    mood: string[];
    visualWeight: string;
    typographyStyle: string;
    layoutPattern: string;
  };
  target_areas: string[];
}

async function aggregateWithGemini(
  colorFrequency: Record<string, { name: string; count: number; totalPct: number }>,
  moodFrequency: Record<string, number>,
  typographyFrequency: Record<string, number>,
  count: number
): Promise<{
  topColors: { hex: string; name: string; frequency: number }[];
  dominantMood: string | null;
  typographyPattern: string | null;
  archetype: string;
  visualTone: { label: string; weight: number }[];
  summary: string;
}> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const colorData = Object.entries(colorFrequency)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([hex, v]) => ({ hex, name: v.name, frequency: Math.round((v.count / count) * 100) }));

  const moodData = Object.entries(moodFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, cnt]) => ({ label, frequency: Math.round((cnt / count) * 100) }));

  const typoData = Object.entries(typographyFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([style, cnt]) => ({ style, frequency: Math.round((cnt / count) * 100) }));

  const prompt = `You are a brand strategist. Based on ${count} analyzed brand inspirations, synthesize a comprehensive Brand DNA report.

INPUT DATA:
Colors (hex: frequency%): ${JSON.stringify(colorData)}
Mood keywords (label: frequency%): ${JSON.stringify(moodData)}
Typography styles (style: frequency%): ${JSON.stringify(typoData)}

REQUIREMENTS:
1. Top colors: Pick 5 most dominant colors
2. Dominant mood: Only declare if any mood appears in 40%+ of saves; otherwise null
3. Typography pattern: Most common style if it appears in 30%+ of saves; otherwise null
4. Archetype: 2-3 sentence brand archetype based ONLY on the data. Use language like "emerging" if patterns are not yet clear.
5. Visual tone tags: 6-10 mood/style descriptors with weight 0-100 based on frequency
6. Summary: One paragraph brand identity summary

Return ONLY valid JSON:
{
  "topColors": [{"hex": string, "name": string, "frequency": number}],
  "dominantMood": string | null,
  "typographyPattern": string | null,
  "archetype": string,
  "visualTone": [{"label": string, "weight": number}],
  "summary": string
}

No explanations. No additional text.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase    = createClient(supabaseUrl, serviceKey);

    const { data: rows, error } = await supabase
      .from("inspirations")
      .select("analysis, target_areas")
      .order("saved_at", { ascending: false });

    if (error) throw new Error(error.message);

    const brandRows = (rows as InspirationRow[]).filter(
      (r) => r.target_areas?.includes("brand_dna")
    );

    if (brandRows.length === 0) {
      return new Response(JSON.stringify({ error: "No brand DNA inspirations found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const colorFreq: Record<string, { name: string; count: number; totalPct: number }> = {};
    const moodFreq: Record<string, number>  = {};
    const typoFreq: Record<string, number>  = {};

    for (const row of brandRows) {
      const a = row.analysis;
      if (!a) continue;

      for (const c of a.dominantColors ?? []) {
        if (!colorFreq[c.hex]) colorFreq[c.hex] = { name: c.name, count: 0, totalPct: 0 };
        colorFreq[c.hex].count++;
        colorFreq[c.hex].totalPct += c.percentage;
      }
      for (const m of a.mood ?? []) {
        moodFreq[m] = (moodFreq[m] ?? 0) + 1;
      }
      if (a.typographyStyle) {
        typoFreq[a.typographyStyle] = (typoFreq[a.typographyStyle] ?? 0) + 1;
      }
    }

    const aggregated = await aggregateWithGemini(colorFreq, moodFreq, typoFreq, brandRows.length);

    const snapshotData = {
      inspiration_count: brandRows.length,
      aggregated_data: aggregated,
      generated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("brand_dna_snapshots")
      .insert(snapshotData);

    if (insertError) throw new Error(insertError.message);

    return new Response(JSON.stringify({ success: true, data: aggregated, count: brandRows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
