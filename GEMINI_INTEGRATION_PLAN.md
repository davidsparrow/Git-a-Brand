# Gemini + Multi-Source Brand Extraction - Integration Plan

## Executive Summary

This plan outlines how Gemini 2.0 Flash will power GitaBrand with intelligent brand analysis across three input methods: manual uploads, public URLs, and GitHub repositories.

---

## What Gemini 2.0 Flash Will Do

### 1. Image Analysis (Primary Strength)
When users upload images/screenshots:
- **Extract dominant colors** with hex codes, names, and percentages
- **Identify visual mood** (minimal, bold, premium, etc.)
- **Detect typography style** (geometric sans-serif, editorial serif, etc.)
- **Analyze layout patterns** (hero with grid, centered minimal, etc.)
- **Generate descriptive tags** for searchability

### 2. Iterative DNA Building (Progressive Intelligence)
- **First upload**: Creates initial baseline
- **Each new upload**: Aggregates patterns, recalculates percentages
- **Updates over time**: Refines archetype, identifies trends
- **Smart insights**: "85% of your saves use dark backgrounds with purple accents"

### 3. Brand Voice Extraction (from text content)
Gemini analyzes text content from:
- Website copy (headlines, CTAs, body text)
- GitHub README files
- Marketing pages
- Extracts: tone, vocabulary patterns, messaging style, sentence structure

---

## Three Extraction Methods

### Method 1: GitHub Repository Scanning ✅

**User Flow:**
1. User clicks "Connect GitHub"
2. OAuth flow with `public_repo` scope (read-only for public repos) or `repo` scope for private
3. User selects a repository from dropdown
4. System scans key files

**What We Scan:**
- **CSS/Style files** → Extract color variables, fonts, spacing tokens
- **README.md** → Extract brand voice, messaging style
- **index.html / landing pages** → Analyze structure
- **package.json / config files** → Identify design system libraries

**What Gemini Extracts:**
- Colors from CSS variables (e.g., `--color-primary: #A78BFA`)
- Typography (font families, weights, sizes)
- Spacing system (if defined as tokens)
- Brand voice from README/documentation (tone, keywords, messaging patterns)

**Technical Notes:**
- GitHub OAuth doesn't have granular "read-only" for private repos
- Public repos: `public_repo` scope (perfect)
- Private repos: Requires full `repo` scope (user controls this via OAuth)
- We'll use GitHub REST API to fetch file contents

---

### Method 2: Public URL Scanning ✅

**User Flow:**
1. User pastes public URL (e.g., https://stripe.com)
2. System validates URL
3. Edge function fetches and analyzes
4. Returns comprehensive brand profile

**Two-Phase Extraction Approach:**

#### Phase A: Firecrawl (Optional - if you have API key)
**Strengths:**
- ✅ Extracts logo URLs automatically
- ✅ Extracts exact color palette with hex codes from CSS
- ✅ Extracts font-family names precisely
- ✅ Extracts spacing system tokens
- ✅ Returns structured JSON (perfect for database)

**Pricing:** API-based (check your Firecrawl plan)
**Speed:** 3-6 seconds

#### Phase B: Gemini 2.0 Flash (Always used)
**Strengths:**
- ✅ Takes screenshot of rendered page
- ✅ Analyzes visual hierarchy and layout patterns
- ✅ Extracts brand mood and visual weight
- ✅ Reads visible text for brand voice analysis
- ✅ Identifies design aesthetic (minimalist, bold, luxury, etc.)
- ✅ Understands context and semantic meaning

**Pricing:** Very cheap (~$0.001 per image)
**Speed:** 2-4 seconds

---

### Method 3: Manual Upload (Current Flow - Enhanced)

**User Flow:**
1. User uploads image (screenshot, design, inspiration)
2. Gemini analyzes image
3. System stores structured data
4. DNA updates progressively

**What Gemini Extracts:**
- Color palette (3-5 dominant colors)
- Visual mood keywords
- Typography style
- Layout patterns
- Design aesthetic

---

## Comparison: Gemini vs Firecrawl

| Feature | Gemini 2.0 Flash | Firecrawl | Recommended |
|---------|------------------|-----------|-------------|
| **Color extraction** | Visual analysis (95% accurate) | Exact hex from CSS (100%) | Firecrawl |
| **Font detection** | Style identification | Exact font-family names | Firecrawl |
| **Brand voice/tone** | Excellent semantic analysis | Not supported | Gemini |
| **Visual mood** | Excellent (understands aesthetic) | Not supported | Gemini |
| **Layout patterns** | Excellent (identifies structure) | Not supported | Gemini |
| **Logo extraction** | Can identify location | Automatic URL extraction | Firecrawl |
| **Spacing system** | Not precise | Exact spacing tokens | Firecrawl |
| **Cost per analysis** | ~$0.001 | Variable API pricing | Gemini |
| **Speed** | 2-4 seconds | 3-6 seconds | Similar |

**Verdict:** Use **BOTH** together for optimal results. Firecrawl for technical precision, Gemini for semantic understanding and brand voice.

---

## Recommended Hybrid Strategy

### For Public URLs (Best Approach):
```
WITH Firecrawl API:
1. Firecrawl extracts → structured design tokens (colors, fonts, spacing, logo)
2. Gemini analyzes screenshot → visual mood, layout patterns, brand voice from copy
3. Merge both results → comprehensive brand DNA with technical + semantic data

WITHOUT Firecrawl API:
1. Fetch page HTML + take screenshot
2. Gemini analyzes both → extracts everything
3. Slightly less precise on technical values (colors are visual estimates, not CSS exact)
```

### For GitHub Repos:
```
1. GitHub API → fetch CSS/config/README files
2. Parse design tokens directly from code (colors, spacing, fonts)
3. Gemini analyzes README → extracts brand voice
4. Store structured data
```

### For Manual Uploads:
```
1. User uploads image
2. Gemini analyzes → colors, mood, typography, layout
3. Store to database
4. DNA updates progressively
```

---

## Guardrails & Structured Prompts

### Image Analysis Prompt (Manual Uploads + URL Screenshots)
```
You are a brand design analyst. Analyze this image and extract ONLY:

1. Dominant colors (3-5 max):
   - Hex code (e.g., #A78BFA)
   - Color name (e.g., "Soft Violet")
   - Approximate percentage (must sum to 100%)

2. Mood keywords (2-4 from this list ONLY):
   [focused, premium, minimal, bold, playful, professional, warm, technical,
    luxurious, clean, modern, elegant, energetic, trustworthy]

3. Visual weight (choose ONE):
   [light, balanced, heavy]

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

No explanations. No additional text.
```

### Brand Voice Prompt (for text content)
```
Analyze this website copy and extract brand voice:

1. Tone (2-3 adjectives):
   Examples: conversational, authoritative, playful, technical, warm, friendly

2. Key vocabulary themes (3-5 recurring words/phrases)

3. Sentence structure:
   [short-punchy, medium-balanced, long-descriptive]

4. One-sentence brand voice summary

Return ONLY JSON:
{
  "tone": string[],
  "vocabulary": string[],
  "sentenceStructure": string,
  "summary": string
}
```

### DNA Aggregation Prompt (after 10+ saves)
```
You have analyzed {count} brand inspirations. Synthesize overall brand DNA:

1. Top 5 colors by frequency (with percentages)
2. Dominant visual mood (minimum 60% occurrence to declare)
3. Typography pattern (minimum 40% occurrence to declare)
4. Brand archetype (2-3 sentences, evidence-based ONLY)

Base conclusions ONLY on data provided. Stay objective.
If patterns unclear, say "emerging pattern" or "needs more data".

Return JSON:
{
  "topColors": [{"hex": string, "name": string, "frequency": number}],
  "dominantMood": string | null,
  "typographyPattern": string | null,
  "archetype": string
}
```

---

## Implementation Phases

### Phase 1: Gemini for Manual Uploads (FOUNDATION)
**Goal:** Replace mock data with real AI analysis

**Tasks:**
1. Create Supabase Edge Function: `analyze-inspiration`
2. Integrate Gemini 2.0 Flash API
3. Implement structured prompt with JSON schema validation
4. Add error handling and retry logic
5. Store results in `inspirations` table
6. Update frontend to call edge function

**Database Changes:**
```sql
ALTER TABLE inspirations
ADD COLUMN IF NOT EXISTS analysis_metadata JSONB,
ADD COLUMN IF NOT EXISTS gemini_model_version TEXT DEFAULT 'gemini-2.0-flash';
```

**Estimated Time:** 2-3 hours
**Deliverables:**
- Working edge function
- Frontend integration
- Real AI analysis replacing mock data

---

### Phase 2: Public URL Scanning with Gemini
**Goal:** Allow users to paste URLs and extract brand DNA

**Tasks:**
1. Create edge function: `scan-url`
2. Implement server-side fetch + screenshot capture
3. Add Gemini analysis for screenshots
4. Optional: Integrate Firecrawl API (if key provided)
5. Create new UI: "Scan Website" modal
6. Store URL source in database

**Database Changes:**
```sql
ALTER TABLE inspirations
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('upload', 'url', 'github')),
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS extraction_method TEXT; -- 'gemini', 'firecrawl', 'hybrid'
```

**UI Components:**
- URL input modal
- Loading state with progress
- Preview before saving

**Estimated Time:** 3-4 hours

---

### Phase 3: Add Firecrawl for Technical Precision
**Goal:** Enhance URL scanning with exact design tokens

**Tasks:**
1. Add Firecrawl API integration to `scan-url` function
2. Merge Firecrawl + Gemini results
3. Prioritize Firecrawl for technical values (colors, fonts)
4. Use Gemini for semantic analysis (mood, voice)
5. Add fallback if Firecrawl fails

**Environment Variables:**
```
FIRECRAWL_API_KEY=your_key_here
```

**Estimated Time:** 2 hours

---

### Phase 4: GitHub OAuth + Repository Scanning
**Goal:** Allow users to connect GitHub and scan repos

**Tasks:**
1. Set up GitHub OAuth app
2. Create edge function: `scan-github-repo`
3. Fetch repository files via GitHub API
4. Parse CSS/config files for design tokens
5. Use Gemini to analyze README for brand voice
6. Create "Connect GitHub" UI flow
7. Repository selector dropdown

**Database Changes:**
```sql
CREATE TABLE IF NOT EXISTS github_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  github_username TEXT NOT NULL,
  access_token TEXT NOT NULL, -- encrypted
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inspirations
ADD COLUMN IF NOT EXISTS github_repo_url TEXT,
ADD COLUMN IF NOT EXISTS github_files_analyzed TEXT[];
```

**Environment Variables:**
```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

**Estimated Time:** 4-5 hours

---

### Phase 5: DNA Aggregation with Iterative Updates
**Goal:** Progressive intelligence that improves over time

**Tasks:**
1. Create edge function: `aggregate-dna`
2. Implement analysis across all user inspirations
3. Calculate color frequency, mood patterns
4. Generate brand archetype
5. Update Brand DNA page with aggregated insights
6. Add "Refresh DNA" button
7. Auto-refresh after every 5 new saves

**Database Changes:**
```sql
CREATE TABLE IF NOT EXISTS brand_dna_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  inspiration_count INT NOT NULL,
  aggregated_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

**Estimated Time:** 3-4 hours

---

## Total Estimated Timeline

- **Phase 1:** 2-3 hours (FOUNDATION - do this first)
- **Phase 2:** 3-4 hours
- **Phase 3:** 2 hours (optional if you have Firecrawl API)
- **Phase 4:** 4-5 hours
- **Phase 5:** 3-4 hours

**Total:** 14-18 hours of development

**Recommended Order:**
1. Phase 1 (must have)
2. Phase 2 (high value)
3. Phase 5 (progressive intelligence)
4. Phase 3 (nice to have if you have Firecrawl API)
5. Phase 4 (advanced feature)

---

## Cost Estimates

### Gemini 2.0 Flash Pricing (as of Feb 2025)
- **Input:** $0.075 per 1M tokens
- **Output:** $0.30 per 1M tokens
- **Average per image analysis:** ~$0.001-0.002

**Example:** 1,000 image analyses = ~$1-2

### Firecrawl Pricing
- Check your specific plan
- Typically ranges from $0.01-0.05 per page scrape

### GitHub API
- Free (no cost, but rate limited to 5,000 requests/hour per OAuth app)

---

## Security Considerations

### API Keys
- Store in Supabase Edge Function secrets
- NEVER expose in frontend code
- Use environment variables

### GitHub OAuth
- Use fine-grained tokens when possible
- Request minimum necessary scopes
- Store access tokens encrypted in database
- Implement token refresh flow

### URL Scanning
- Validate URLs before fetching
- Implement rate limiting (max 10 scans per user per hour)
- Timeout after 30 seconds
- Sanitize fetched content

### Data Privacy
- Only store analysis results, not raw images (unless user explicitly saves)
- Implement user data deletion
- RLS policies on all tables

---

## Success Metrics

### Phase 1 Success:
- Real AI analysis replaces mock data
- 95%+ accuracy on color extraction
- < 5 second analysis time
- Zero API errors

### Phase 2 Success:
- Users can paste any public URL
- Successful extraction rate > 90%
- Combined Gemini + Firecrawl results

### Phase 4 Success:
- GitHub OAuth flow works smoothly
- Successfully parses 80%+ of repos
- Extracts design tokens from popular frameworks (Tailwind, CSS-in-JS, etc.)

### Phase 5 Success:
- Brand DNA updates progressively
- Archetype accuracy validated by users
- Insights feel intelligent and personalized

---

## Next Steps

Ready to begin? Recommended first action:

**START WITH PHASE 1: Gemini for Manual Uploads**

This will:
1. Create the foundation for all other phases
2. Prove the AI integration works
3. Give you real results immediately
4. Allow us to refine prompts and validation

Would you like me to start implementing Phase 1 now?
