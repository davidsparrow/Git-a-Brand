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

### Method 3: Manual Upload (Current Flow - Enhanced with Smart Targeting)

**NEW: Smart Multi-Target System**

When users save content (images, URLs, text), they can now specify WHERE this content should be used in the brand system. This prevents Gemini from guessing and ensures updates happen to the right places.

**The Problem Without Targeting:**
- User uploads a LinkedIn post screenshot
- System doesn't know if it's for:
  - Brand DNA (general brand identity)?
  - Content Voice Guidelines (specifically for LinkedIn)?
  - Just the Swipe File (reference only)?
- Result: Gemini either guesses wrong OR updates everything unnecessarily

**The Solution: Target Checkboxes**

When saving ANY content (Save Modal), user sees checkboxes:

```
┌─ Where should this be used? ─────────────────────┐
│                                                   │
│ ☑ Brand DNA (updates overall brand identity)     │
│ ☐ Content Voice - LinkedIn                       │
│ ☐ Content Voice - Twitter/X                      │
│ ☐ Content Voice - Instagram                      │
│ ☐ Content Voice - Blog                           │
│ ☐ Content Voice - Email                          │
│ ☐ Content Voice - Ads                            │
│ ☐ Swipe File Only (reference, no analysis)       │
│                                                   │
│ [Select All] [Clear All]                         │
└───────────────────────────────────────────────────┘
```

**Smart Defaults Based on Content Type:**

1. **If URL is detected as social media:**
   - LinkedIn URL → Auto-check "Content Voice - LinkedIn"
   - Twitter URL → Auto-check "Content Voice - Twitter/X"
   - Instagram URL → Auto-check "Content Voice - Instagram"
   - Generic website → Auto-check "Brand DNA"

2. **If manually uploaded image:**
   - Auto-check "Brand DNA" (assume it's visual identity)
   - User can change

3. **If text pasted:**
   - Show platform dropdown first
   - Then auto-check relevant content voice checkbox

**User Can Select Multiple:**
- User saves a blog post → Checks both "Brand DNA" AND "Content Voice - Blog"
- User saves LinkedIn post → Checks "Content Voice - LinkedIn" only
- User saves website screenshot → Checks "Brand DNA", "Content Voice - All" (select all)

**Database Schema Update:**

```sql
-- Add to inspirations table (existing)
ALTER TABLE inspirations
ADD COLUMN IF NOT EXISTS target_areas TEXT[] DEFAULT ARRAY['brand_dna'];

-- Possible values in array:
-- 'brand_dna'
-- 'content_voice_linkedin'
-- 'content_voice_twitter'
-- 'content_voice_instagram'
-- 'content_voice_blog'
-- 'content_voice_email_newsletter'
-- 'content_voice_email_promotional'
-- 'content_voice_facebook_ads'
-- 'content_voice_google_ads'
-- 'content_voice_tiktok'
-- 'content_voice_youtube'
-- 'swipe_file_only'

-- Create index for querying by target area
CREATE INDEX IF NOT EXISTS idx_inspirations_target_areas
  ON inspirations USING GIN (target_areas);
```

**How This Changes Analysis Flow:**

**Before (Guessing):**
```typescript
// Edge function: analyze-inspiration
// Problem: Gemini has to guess what to update
const prompt = `Analyze this content and update brand DNA`;
// Result: Everything gets updated, even if user just wanted content sample
```

**After (Targeted):**
```typescript
// Edge function: analyze-inspiration (enhanced)
const { target_areas } = request.body;

if (target_areas.includes('brand_dna')) {
  // Extract visual identity: colors, fonts, mood
  const visualAnalysis = await gemini.analyzeVisualIdentity(content);
  await updateBrandDNA(visualAnalysis);
}

if (target_areas.includes('content_voice_linkedin')) {
  // Extract voice patterns specifically for LinkedIn
  const voiceAnalysis = await gemini.analyzeContentVoice(content, 'linkedin');
  await updateContentSample('linkedin', voiceAnalysis);
}

if (target_areas.includes('swipe_file_only')) {
  // Skip analysis, just save for reference
  await saveToSwipeFileOnly(content);
}
```

**UI Changes to SaveModal.tsx:**

Add new section between "Tags" and "Notes":

```tsx
{/* Target Selection */}
<div>
  <label className="text-xs text-[#A1A1AA] font-medium mb-2 block">
    Where should this be used?
  </label>

  <div className="space-y-2 max-h-48 overflow-y-auto">
    {TARGET_OPTIONS.map((option) => (
      <label key={option.value} className="flex items-start gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={targetAreas.includes(option.value)}
          onChange={(e) => handleTargetToggle(option.value, e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-[#3F3F46] bg-[#09090B] text-[#A78BFA] focus:ring-[#A78BFA]/40"
        />
        <div className="flex-1">
          <p className="text-sm text-[#FAFAFA] group-hover:text-[#A78BFA] transition-colors">
            {option.label}
          </p>
          {option.description && (
            <p className="text-xs text-[#71717A] mt-0.5">{option.description}</p>
          )}
        </div>
      </label>
    ))}
  </div>

  <div className="flex gap-2 mt-2">
    <button
      onClick={selectAllTargets}
      className="text-xs text-[#A78BFA] hover:text-[#C4B5FD] transition-colors"
    >
      Select All
    </button>
    <button
      onClick={clearAllTargets}
      className="text-xs text-[#71717A] hover:text-[#A1A1AA] transition-colors"
    >
      Clear All
    </button>
  </div>
</div>
```

**Target Options Array:**

```typescript
const TARGET_OPTIONS = [
  {
    value: 'brand_dna',
    label: 'Brand DNA',
    description: 'Updates overall brand identity (colors, fonts, mood)',
  },
  {
    value: 'content_voice_blog',
    label: 'Content Voice - Blog Posts',
    description: 'Improves blog writing guidelines',
  },
  {
    value: 'content_voice_linkedin',
    label: 'Content Voice - LinkedIn',
    description: 'Improves LinkedIn content guidelines',
  },
  {
    value: 'content_voice_twitter',
    label: 'Content Voice - Twitter/X',
    description: 'Improves Twitter content guidelines',
  },
  {
    value: 'content_voice_instagram',
    label: 'Content Voice - Instagram',
    description: 'Improves Instagram content guidelines',
  },
  {
    value: 'content_voice_tiktok',
    label: 'Content Voice - TikTok/Reels',
    description: 'Improves TikTok/Reels guidelines',
  },
  {
    value: 'content_voice_youtube',
    label: 'Content Voice - YouTube',
    description: 'Improves YouTube guidelines',
  },
  {
    value: 'content_voice_email_newsletter',
    label: 'Content Voice - Email Newsletters',
    description: 'Improves newsletter guidelines',
  },
  {
    value: 'content_voice_email_promotional',
    label: 'Content Voice - Promotional Emails',
    description: 'Improves promotional email guidelines',
  },
  {
    value: 'content_voice_facebook_ads',
    label: 'Content Voice - Facebook/IG Ads',
    description: 'Improves social ad guidelines',
  },
  {
    value: 'content_voice_google_ads',
    label: 'Content Voice - Google Search Ads',
    description: 'Improves search ad guidelines',
  },
  {
    value: 'swipe_file_only',
    label: 'Swipe File Only',
    description: 'Save as reference, do not analyze',
  },
];
```

**Benefits of This Approach:**

1. **Precision:** User controls exactly what gets updated
2. **No guessing:** Gemini doesn't waste tokens analyzing wrong things
3. **Flexibility:** Can apply one piece of content to multiple areas
4. **Performance:** Skip analysis entirely for "Swipe File Only"
5. **User clarity:** Clear understanding of how their content is used
6. **Better guidelines:** Content voice samples are platform-specific
7. **Cost savings:** Only analyze what's needed

**Example Scenarios:**

**Scenario 1: User saves a LinkedIn post they wrote**
- Checks: "Content Voice - LinkedIn" only
- Result: Post is analyzed for voice patterns, stored as LinkedIn sample, used when generating LinkedIn guidelines
- Brand DNA: Not affected

**Scenario 2: User saves company website homepage**
- Checks: "Brand DNA" (default auto-selected)
- Result: Colors, fonts, layout analyzed and aggregated into Brand DNA
- Content Voice: Not affected

**Scenario 3: User saves competitor's blog post**
- Checks: "Content Voice - Blog" AND "Swipe File Only"
- Result: Voice analysis for blog guidelines, but also saved for reference
- Can see it in swipe file later for inspiration

**Scenario 4: User saves beautiful landing page**
- Checks: "Brand DNA", "Content Voice - All" (select all button)
- Result: Everything gets analyzed - visual identity AND voice patterns for all platforms
- Most comprehensive update

**Scenario 5: User saves random cool design**
- Checks: "Swipe File Only"
- Result: Saved immediately, no analysis, no tokens spent
- Pure reference library

### Method 3 Continued: Manual Upload Enhancement

**Enhanced User Flow with Smart Targeting:**

1. User clicks "+ Save New" button
2. Choose input method: URL, Upload Image, or Paste Text
3. System auto-detects content type and pre-selects smart defaults:
   - LinkedIn URL → "Content Voice - LinkedIn" checked
   - Image upload → "Brand DNA" checked
   - Generic website → "Brand DNA" checked
4. User reviews/adjusts target checkboxes (can select multiple)
5. User adds tags and notes
6. Click "Save & Analyze"
7. System analyzes content based ONLY on selected targets
8. Updates relevant areas:
   - Brand DNA table (if checked)
   - Content samples table (if any content voice checked)
   - Inspirations table (always, with target_areas metadata)
9. Confirmation: "Saved! Updated: Brand DNA, Content Voice - LinkedIn"

**What Gemini Extracts (based on target areas):**
- **If "Brand DNA" selected:** Color palette, visual mood, typography style, layout patterns, design aesthetic
- **If "Content Voice - [Platform]" selected:** Text content, tone, vocabulary, sentence structure, formatting patterns
- **If "Swipe File Only" selected:** No analysis, just save for reference

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

### Phase 6: LLM-Ready Brand Guidelines Generator
**Goal:** Auto-generate comprehensive brand guidelines formatted for 5 external LLM platforms + internal use

**Overview:**
After aggregating brand DNA, Gemini will synthesize everything into comprehensive brand guideline documents optimized for different platforms. Each export format is tailored to how that specific tool consumes instructions.

**Export Targets:**
1. **Claude Projects** - Markdown format for Claude.ai Project Knowledge
2. **Cursor** - `.cursorrules` format for AI pair programming
3. **Figma** - Design-focused guidelines (colors, typography, spacing, components)
4. **Localable** - Marketing platform guidelines (messaging, voice, content strategy)
5. **Raw JSON** - Structured data for custom integrations

**Tasks:**
1. Create edge function: `generate-brand-guidelines`
2. Implement platform-specific formatters
3. Add download buttons on Brand Kit page
4. Store generated guidelines in database for versioning
5. Allow manual regeneration when DNA updates
6. Add preview modal before download

**Database Changes:**
```sql
CREATE TABLE IF NOT EXISTS brand_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  format TEXT CHECK (format IN ('claude', 'cursor', 'figma', 'localable', 'json')),
  content TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  based_on_snapshot_id UUID REFERENCES brand_dna_snapshots(id),
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

**Gemini Prompt for Guidelines Generation:**
```
You are a brand strategist. Based on the aggregated brand DNA below, generate comprehensive brand guidelines for {PLATFORM}.

INPUT DATA:
- Top colors: {colors}
- Typography patterns: {typography}
- Visual mood: {mood}
- Brand voice: {voice}
- Layout patterns: {layouts}
- Brand archetype: {archetype}

OUTPUT FORMAT: {platform_specific_format}

REQUIREMENTS:
1. Be extremely specific and actionable
2. Include exact values (hex codes, font names, spacing units)
3. Provide do's and don'ts with examples
4. Maintain consistency with the brand DNA
5. Format for optimal LLM consumption

Generate comprehensive guidelines now.
```

**Platform-Specific Formats:**

#### 1. Claude Projects (Markdown)
```markdown
# Brand Guidelines for [Brand Name]

## Visual Identity

### Color Palette
Primary: #A78BFA (Soft Violet) - Use for CTAs, links, primary actions
Secondary: #6366F1 (Deep Indigo) - Use for headings, emphasis
Neutral: #1F2937 (Charcoal) - Use for body text, backgrounds

**Usage Rules:**
- Always maintain 4.5:1 contrast ratio for accessibility
- Use primary color for maximum 20% of page area
- Pair primary with neutral, avoid clashing with secondary

### Typography
Heading Font: Inter (Geometric Sans-Serif)
- H1: 48px, 700 weight, tight leading (1.1)
- H2: 36px, 600 weight, normal leading (1.2)

Body Font: Inter
- Body: 16px, 400 weight, relaxed leading (1.6)
- Small: 14px, 400 weight

**Usage Rules:**
- Never use more than 3 font weights
- Maintain consistent vertical rhythm (8px baseline grid)

### Visual Style
Mood: Premium, Minimal, Technical
Visual Weight: Balanced
Layout Preference: Hero with feature grid

**Do's:**
- Use generous white space (minimum 32px between sections)
- Apply subtle shadows for depth (0 1px 3px rgba(0,0,0,0.1))
- Round corners at 8px or 12px consistently

**Don'ts:**
- Avoid cluttered layouts with <16px spacing
- Never use gradients on text for readability
- Don't mix rounded and sharp corners

## Brand Voice

Tone: Professional, Warm, Trustworthy
Sentence Structure: Medium-balanced
Key Vocabulary: "innovative", "reliable", "seamless", "empower", "transform"

**Writing Guidelines:**
- Write in active voice, present tense
- Use contractions sparingly for warmth (e.g., "we're" but not "shouldn't've")
- Keep sentences under 25 words for clarity
- Address user as "you", brand as "we"

**Example Passages:**
Good: "Transform your workflow with tools that adapt to you."
Bad: "Our innovative solutions facilitate transformational workflows." (too corporate)
```

#### 2. Cursor (.cursorrules)
```
# Brand Code Style Guidelines

## Color System
Define colors as CSS variables:
--color-primary: #A78BFA;
--color-secondary: #6366F1;
--color-neutral: #1F2937;

Always use semantic naming, never hardcode hex values.

## Typography Scale
font-family: 'Inter', system-ui, sans-serif;
--text-h1: 3rem / 700;
--text-h2: 2.25rem / 600;
--text-body: 1rem / 400;

## Spacing System
Use 8px grid system:
--space-1: 0.5rem; (8px)
--space-2: 1rem; (16px)
--space-4: 2rem; (32px)

## Component Patterns
Button: rounded-lg (12px), px-6 py-3, font-semibold
Card: bg-white, shadow-sm, rounded-xl, p-6
Input: border-2, rounded-lg, focus:ring-2 focus:ring-primary

## Code Quality Rules
- Always use TypeScript
- Prefer functional components with hooks
- Use Tailwind for styling, no inline styles
- Follow atomic design principles
- Test all interactive components

## Brand Voice in Code Comments
- Write clear, concise comments
- Use active voice ("Fetches user data" not "User data is fetched")
- Add TODO comments for planned improvements
```

#### 3. Figma (Design Tokens)
```json
{
  "colors": {
    "primary": {
      "value": "#A78BFA",
      "name": "Soft Violet",
      "usage": "CTAs, links, primary actions"
    },
    "secondary": {
      "value": "#6366F1",
      "name": "Deep Indigo",
      "usage": "Headings, emphasis"
    }
  },
  "typography": {
    "heading": {
      "fontFamily": "Inter",
      "h1": {"size": 48, "weight": 700, "lineHeight": 1.1},
      "h2": {"size": 36, "weight": 600, "lineHeight": 1.2}
    },
    "body": {
      "fontFamily": "Inter",
      "regular": {"size": 16, "weight": 400, "lineHeight": 1.6}
    }
  },
  "spacing": {
    "base": 8,
    "scale": [8, 16, 24, 32, 48, 64]
  },
  "effects": {
    "shadow-sm": "0 1px 3px rgba(0,0,0,0.1)",
    "shadow-md": "0 4px 6px rgba(0,0,0,0.1)"
  },
  "radii": {
    "small": 8,
    "medium": 12,
    "large": 16
  }
}
```

#### 4. Localable (Marketing Guidelines)
```markdown
# Marketing Content Guidelines

## Brand Positioning
We are: A premium, innovative tool for modern professionals
We are not: A budget option, overly complex, impersonal

## Target Audience
Primary: Mid-level professionals (25-40) seeking efficiency
Pain Points: Wasted time, disorganized workflows, tool fragmentation

## Messaging Framework

### Value Propositions
1. "Transform your workflow" - Focus on tangible improvement
2. "Built for teams" - Emphasize collaboration
3. "Seamless integration" - Highlight ease of adoption

### Tone Guidelines
- Professional but approachable
- Confident without arrogance
- Warm without being overly casual

### Content Patterns
Headlines: Action-oriented, benefit-focused (8-12 words)
CTAs: Direct, value-clear ("Start your free trial" not "Click here")
Body Copy: Scannable, under 150 words per section

## Platform-Specific Adaptations
Email: Personal, direct, benefit-focused
Social: Conversational, visual, question-driven
Ads: Bold, immediate value, clear CTA
Landing Pages: Hero + 3 benefits + social proof + CTA
```

#### 5. Raw JSON (Structured Data)
```json
{
  "brand": {
    "name": "GitaBrand",
    "archetype": "The Innovator",
    "version": "1.0",
    "generated_at": "2025-02-20T10:30:00Z"
  },
  "visual": {
    "colors": [
      {"hex": "#A78BFA", "name": "Soft Violet", "usage": "primary", "frequency": 45},
      {"hex": "#6366F1", "name": "Deep Indigo", "usage": "secondary", "frequency": 30}
    ],
    "typography": {
      "heading": {"family": "Inter", "style": "geometric sans-serif"},
      "body": {"family": "Inter", "style": "clean readable"}
    },
    "mood": ["premium", "minimal", "technical"],
    "visualWeight": "balanced"
  },
  "voice": {
    "tone": ["professional", "warm", "trustworthy"],
    "vocabulary": ["innovative", "reliable", "seamless", "empower"],
    "sentenceStructure": "medium-balanced",
    "summary": "Professional yet approachable, emphasizing innovation and reliability."
  }
}
```

**UI Components:**
- Add "Export Guidelines" section to Brand Kit page
- 5 download buttons (one per format)
- Preview modal showing formatted output
- Version history dropdown
- "Regenerate" button when DNA updates

**Estimated Time:** 4-5 hours

---

### Phase 7: Master Brand Content Voice Guidelines (NEW FEATURE)
**Goal:** Generate platform-specific content creation guidelines for blogs, social media, videos, ads, and email

**Overview:**
This is a specialized content creation document that helps users (or LLMs) create on-brand written content for specific platforms. Unlike Phase 6 (which focuses on visual/design guidelines), this focuses entirely on written content strategy, tone, and platform-specific best practices.

**Purpose:**
When a user needs to create a blog post, social media caption, ad copy, or email, they reference this master document to ensure the output matches both:
1. Their brand voice (extracted from DNA)
2. The specific platform's best practices (character limits, hashtag usage, etc.)

**Content Structure:**
```markdown
# Master Brand Content Voice Guidelines

## Core Brand Voice
[Synthesized from all brand DNA analysis]
Tone: {adjectives}
Vocabulary: {key terms}
Sentence Style: {structure}
POV: {first/second person}
Personality Traits: {3-5 traits}

---

## Platform-Specific Guidelines

### 1. Blog Posts
**Objective:** Educate, build authority, drive organic traffic

**Format:**
- Word count: 800-1500 words
- Structure: Hook → Problem → Solution → CTA
- Headings: H2 every 200-300 words
- Paragraphs: 2-3 sentences max

**Tone Adaptation:**
- [Brand tone] but more educational
- Use data/examples to support claims
- Include actionable takeaways

**SEO Considerations:**
- Primary keyword in first 100 words
- Meta description: 150-160 characters
- Alt text for all images

**Example Opening:**
"[Example that matches brand voice + blog format]"

**Don'ts:**
- Don't use clickbait headlines
- Avoid walls of text >5 sentences

---

### 2. Social Media

#### LinkedIn
**Objective:** Thought leadership, B2B engagement

**Format:**
- Length: 150-300 words (sweet spot: 200)
- Structure: Hook → Story/Insight → CTA/Question
- Line breaks: Every 1-2 sentences for scannability

**Tone Adaptation:**
- [Brand tone] but more conversational
- Share insights, not sales pitches
- Ask questions to drive comments

**Best Practices:**
- First 2 lines are critical (visible before "see more")
- Use 3-5 relevant hashtags max
- Tag people/companies when relevant
- Post timing: Tue-Thu 8-10am

**Example Post:**
"[Example that matches brand voice + LinkedIn format]"

**Don'ts:**
- Don't use excessive emojis (max 2-3)
- Avoid corporate jargon

---

#### Twitter/X
**Objective:** Quick insights, engagement, brand personality

**Format:**
- Length: 100-280 characters (aim for <200 for retweets)
- Structure: Hook + Value or Question

**Tone Adaptation:**
- [Brand tone] but punchier
- Use contractions
- One idea per tweet

**Best Practices:**
- 1-2 hashtags max
- Use threads for longer narratives (max 5 tweets)
- Reply to comments within 1 hour
- Post timing: Weekdays 9am-12pm

**Example Tweet:**
"[Example that matches brand voice + Twitter format]"

**Don'ts:**
- Don't tweet and delete
- Avoid controversial topics unless brand-relevant

---

#### Instagram
**Objective:** Visual storytelling, community building

**Format (Caption):**
- Length: 125-150 words (optimal engagement)
- Structure: Hook → Story → CTA
- Line breaks for readability

**Tone Adaptation:**
- [Brand tone] but more visual/descriptive
- Use storytelling, not just descriptions
- Emojis: 3-5 per caption (tasteful)

**Best Practices:**
- First line is critical (visible in feed)
- Hashtags: 5-10 relevant tags (put at end or first comment)
- Ask questions to drive comments
- Use Stories for behind-the-scenes content
- Post timing: Daily 10am-2pm

**Example Caption:**
"[Example that matches brand voice + Instagram format]"

**Don'ts:**
- Don't use 30 hashtags (looks spammy)
- Avoid long paragraphs (use line breaks)

---

### 3. Video Content (YouTube, TikTok, Reels)

#### Scripts
**Objective:** Engage, educate, entertain

**Format:**
- Hook: First 3 seconds (grab attention)
- Body: 30-90 seconds (deliver value)
- CTA: Last 5 seconds (next step)

**Tone Adaptation:**
- [Brand tone] but more energetic
- Speak naturally (write how you talk)
- Use pauses for emphasis

**Script Structure:**
```
[HOOK - 3 sec]: "Did you know..."
[PROBLEM - 10 sec]: "Most people struggle with..."
[SOLUTION - 40 sec]: "Here's how to fix it..."
[CTA - 5 sec]: "Try this and let me know..."
```

**Platform Differences:**
- YouTube: Can be 3-10 minutes (value-dense)
- TikTok: 15-60 seconds (fast-paced)
- Reels: 30-60 seconds (trending audio)

**Best Practices:**
- Text on screen for key points
- Captions for accessibility
- Strong thumbnail (YouTube)
- Hook in first 3 seconds (non-negotiable)

**Example Script:**
"[Example that matches brand voice + video format]"

---

### 4. Ad Copy (Paid Social, Google Ads)

#### Facebook/Instagram Ads
**Objective:** Convert, drive action

**Format:**
- Headline: 5-7 words (clear benefit)
- Primary Text: 125 characters (mobile-optimized)
- CTA Button: Clear action verb

**Tone Adaptation:**
- [Brand tone] but benefit-focused
- Lead with value, not features
- Use urgency sparingly (don't be pushy)

**Structure:**
```
[HEADLINE]: Clear benefit
[BODY]: Problem + Solution in 2 sentences
[CTA]: Direct action
```

**Example Ad:**
Headline: "Transform your workflow in 5 minutes"
Body: "Tired of juggling 10 tools? Consolidate everything in one place. Start your free trial today."
CTA: Start Free Trial

**Best Practices:**
- A/B test headlines (3-5 variations)
- Include social proof when possible
- Match ad copy to landing page
- Use numbers/specifics

**Don'ts:**
- Don't use ALL CAPS
- Avoid vague promises ("best ever")

---

#### Google Search Ads
**Format:**
- Headline 1: Primary keyword + benefit (30 chars)
- Headline 2: Secondary benefit (30 chars)
- Headline 3: Unique value prop (30 chars)
- Description: Clear CTA + value (90 chars)

**Example:**
H1: "Workflow Management Tool"
H2: "Free 14-Day Trial"
H3: "No Credit Card Required"
Description: "Consolidate your tools. Save 10 hours per week. Start your free trial now."

---

### 5. Email Content

#### Newsletters
**Objective:** Nurture, provide value, build relationship

**Format:**
- Subject: 40-50 characters (clear + curious)
- Preview text: 90 characters (expand on subject)
- Body: 200-400 words
- CTA: One clear action

**Tone Adaptation:**
- [Brand tone] but more personal
- Write like emailing a colleague
- Use "you" frequently

**Structure:**
```
[SUBJECT]: Benefit or curiosity-driven
[PREVIEW]: Expand on subject
[GREETING]: "Hey [name]," (casual) or "Hi [name]," (professional)
[BODY]:
  - Opening: Personal/relatable hook
  - Value: 2-3 paragraphs of useful content
  - CTA: Clear next step
[SIGNATURE]: Personal sign-off
```

**Example Email:**
```
Subject: Your weekly workflow tip ⚡
Preview: Save 2 hours this week with this simple trick

Hey Sarah,

I noticed most teams waste 10+ hours per week on [problem].

Here's a simple fix: [solution in 2 sentences].

Try it this week and let me know how much time you save.

[CTA Button: Get the Template]

Cheers,
[Name]
```

**Best Practices:**
- Send timing: Tue-Thu 10am (highest open rates)
- Mobile optimization (60% open on mobile)
- One CTA per email (focused action)
- Personalize beyond first name when possible

---

#### Promotional Emails
**Objective:** Drive sales, conversions

**Format:**
- Subject: Benefit + urgency (if genuine)
- Body: 150-250 words
- Multiple CTAs (top, middle, bottom)

**Tone Adaptation:**
- [Brand tone] but more direct
- Lead with value, not price
- Use scarcity ethically

**Structure:**
```
[HEADLINE]: Clear offer
[BODY]:
  - Why this matters (benefit)
  - What's included (features)
  - Why now (urgency if applicable)
[CTA]: Action-oriented
```

**Example:**
Headline: "Your free trial ends tomorrow"
Body: "Don't lose access to [benefit]. Upgrade now and get [bonus]. Your workflow transformation is one click away."
CTA: "Upgrade My Account"

---

## Content Creation Workflow

### Before Writing:
1. Identify platform (reference specific section above)
2. Define objective (educate, convert, engage, etc.)
3. Review core brand voice
4. Check platform character limits/best practices

### During Writing:
1. Write freely first (don't self-edit)
2. Apply brand voice (tone, vocabulary, structure)
3. Adapt for platform (format, length, style)
4. Add platform-specific elements (hashtags, CTAs, etc.)

### After Writing:
1. Read aloud (catch awkward phrasing)
2. Check against brand voice checklist
3. Verify platform requirements met
4. Get feedback if high-stakes content

---

## Brand Voice Checklist

Before publishing, ensure your content:
- [ ] Matches core tone ({adjectives})
- [ ] Uses brand vocabulary naturally
- [ ] Follows sentence structure guidelines
- [ ] Addresses audience correctly ({POV})
- [ ] Reflects brand personality traits
- [ ] Meets platform-specific requirements
- [ ] Has clear CTA (if applicable)
- [ ] Is scannable (headings, bullets, short paragraphs)

---

## Examples Library

[Gemini will populate this with 2-3 examples per platform based on brand DNA]

### Blog Post Example
[Full example matching brand voice]

### LinkedIn Post Example
[Full example matching brand voice]

### Email Example
[Full example matching brand voice]

[etc. for each platform]

---

## Don'ts (Universal)

- Don't use clichés ("think outside the box", "game-changer")
- Don't write in passive voice ("mistakes were made")
- Don't use jargon unless audience-appropriate
- Don't bury the lead (say the important thing first)
- Don't ignore platform constraints (character limits, etc.)
- Don't be overly salesy (value first, sell second)

---

## Glossary

**Brand Voice:** The consistent personality and tone across all content
**Platform Adaptation:** Adjusting format/style while maintaining core voice
**Hook:** Opening line designed to grab attention
**CTA:** Call-to-action (what you want reader to do next)
**Scannable:** Easy to skim (headings, bullets, short paragraphs)
```

**User Content Sample Collection Workflow:**

Before generating the Master Content Voice Guidelines, users can optionally provide sample content for each platform to improve accuracy and personalization. This creates a feedback loop where Gemini learns from actual brand content.

**INTEGRATION WITH SAVE MODAL:**

The Smart Multi-Target System (described in Method 3) is the PRIMARY way users collect content samples. When users click "+ Save New":

1. They can save content via URL, Upload, or Paste
2. They select target checkboxes including "Content Voice - [Platform]"
3. System automatically creates content sample entries
4. Samples are linked to the inspiration in `target_areas` column

This means content sample collection is NOT a separate workflow - it's built into the existing "+ Save New" flow with target checkboxes.

**Additional Dedicated Sample Collection (Optional Enhancement):**

For users who want to add content samples WITHOUT creating swipe file entries, you could add a dedicated "Add Content Sample" flow on the Brand Kit page:

**Sample Collection Methods:**

1. **URL Input** - Paste URLs to existing content:
   - Blog post URLs (e.g., Medium, company blog)
   - LinkedIn post URLs
   - Twitter/X post URLs
   - Instagram post URLs
   - YouTube video URLs
   - Email newsletters (forwarded or HTML)

2. **Direct Text Upload** - Copy/paste content:
   - Email copy
   - Ad copy
   - Social media captions
   - Video scripts

3. **Batch Import** - Upload multiple samples at once:
   - CSV file with platform + content columns
   - Text file with delimited samples

**NOTE:** The Smart Multi-Target System in the Save Modal already handles methods 1 and 2. Batch import would be a unique addition for power users.

**UI Flow:**

```
Brand Kit Page → "Content Samples" Section

For each platform:
[Blog Posts] (2 samples collected) [+ Add Sample]
[LinkedIn] (0 samples) [+ Add Sample]
[Twitter/X] (1 sample) [+ Add Sample]
...

Click "+ Add Sample" →
  Modal opens:
  - Option 1: Paste URL (auto-fetch content)
  - Option 2: Paste text directly
  - Option 3: Upload file
  - Platform: [Auto-detected or manual select]
  - [Save Sample]

Once samples collected:
[Generate Content Guidelines] button
  → Gemini analyzes all samples per platform
  → Generates platform-specific guidelines based on:
      * General brand DNA
      * Actual content samples from that platform
```

**Database Changes:**
```sql
CREATE TABLE IF NOT EXISTS content_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL CHECK (platform IN (
    'blog', 'linkedin', 'twitter', 'instagram',
    'tiktok', 'youtube', 'facebook_ads', 'google_ads',
    'email_newsletter', 'email_promotional'
  )),
  content_text TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('url', 'upload', 'paste')),
  analysis_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  analyzed_at TIMESTAMPTZ
);

CREATE INDEX idx_content_samples_user_platform
  ON content_samples(user_id, platform);

ALTER TABLE content_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content samples"
  ON content_samples FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content samples"
  ON content_samples FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content samples"
  ON content_samples FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

**Edge Function: `analyze-content-sample`**

When user adds a sample (URL or text), this function:
1. Fetches content if URL provided
2. Extracts text content
3. Uses Gemini to analyze:
   - Tone and voice characteristics
   - Sentence structure patterns
   - Vocabulary and word choice
   - Formatting patterns
   - Platform-specific elements (hashtags, emojis, CTAs)
4. Stores analysis in `analysis_metadata` field

**Gemini Prompt for Sample Analysis:**
```
You are a content analyst. Analyze this {PLATFORM} content sample and extract voice characteristics.

CONTENT:
{content_text}

Extract:
1. Tone (2-3 adjectives): professional, casual, playful, authoritative, etc.
2. Sentence structure: short/punchy, medium/balanced, long/descriptive
3. Key vocabulary (5-10 recurring words/phrases)
4. Formatting patterns: use of line breaks, emojis, hashtags, capitalization
5. Engagement tactics: questions, calls-to-action, storytelling, data-driven
6. Platform-specific elements:
   - For LinkedIn: thought leadership angle, industry terms
   - For Twitter: brevity, wit, hashtag usage
   - For Instagram: visual descriptions, emoji density
   - For Email: personalization, subject line style
   - For Ads: benefit focus, urgency, social proof

Return JSON:
{
  "tone": string[],
  "sentenceStructure": string,
  "vocabulary": string[],
  "formattingPatterns": string[],
  "engagementTactics": string[],
  "platformElements": {
    [key]: string
  }
}
```

**Enhanced Gemini Prompt for Content Guidelines (with samples):**
```
You are a content strategist. Based on the brand voice analysis and user-provided content samples, generate a comprehensive Master Brand Content Voice Guidelines document.

INPUT DATA:
- Brand voice tone: {tone}
- Vocabulary patterns: {vocabulary}
- Sentence structure: {structure}
- Brand archetype: {archetype}
- Target audience: {audience if available}

CONTENT SAMPLES ANALYSIS:
{For each platform where samples exist:}
- Platform: {platform_name}
- Sample count: {count}
- Analyzed tone: {analyzed_tone}
- Analyzed vocabulary: {analyzed_vocabulary}
- Analyzed patterns: {analyzed_patterns}
- Sample excerpts: {2-3 actual excerpts}

OUTPUT: A detailed content creation guide with platform-specific sections for:
1. Blog posts
2. LinkedIn
3. Twitter/X
4. Instagram
5. TikTok/Reels
6. YouTube
7. Facebook/Instagram Ads
8. Google Search Ads
9. Email newsletters
10. Promotional emails

For EACH platform, include:
- Objective
- Format specifications (length, structure)
- Tone adaptation (how brand voice adjusts for this platform)
- Best practices (timing, hashtags, etc.)
- CONCRETE EXAMPLES drawn from actual user samples (if available) or generated to match analyzed patterns
- Platform-specific don'ts

IMPORTANT: For platforms WITH content samples:
- Use actual voice patterns from the samples
- Quote or reference actual phrases that work well
- Maintain consistency with observed formatting
- Generate examples that closely match the sample style

For platforms WITHOUT content samples:
- Adapt general brand voice to platform best practices
- Use archetypal examples appropriate for the platform

Also include:
- Universal brand voice checklist
- Content creation workflow
- Examples library (prioritize platforms with samples)

Make it immediately actionable. A user should be able to open this document, find their platform, and know exactly how to write on-brand content for it.

Generate comprehensive guidelines now.
```

**Database Changes:**
```sql
ALTER TABLE brand_guidelines
ADD COLUMN IF NOT EXISTS guideline_type TEXT CHECK (guideline_type IN ('design', 'content'));

-- guideline_type = 'design' for Phase 6 exports
-- guideline_type = 'content' for Phase 7 master document
```

**UI Components:**

1. **Content Samples Section** (Brand Kit page):
   - Grid/list view showing all 10 platforms
   - Each platform shows: sample count, last updated
   - "+ Add Sample" button per platform
   - View/delete existing samples
   - "Analyze All Samples" button (bulk analysis)

2. **Add Sample Modal**:
   - Tab 1: Paste URL (auto-fetch)
   - Tab 2: Paste text directly
   - Tab 3: Upload file (.txt, .csv)
   - Platform dropdown (pre-selected if clicked from specific platform)
   - Save button
   - Loading state while analyzing

3. **Sample Management**:
   - List view of all samples per platform
   - Edit/delete options
   - Re-analyze button (if user updates sample)
   - Visual indicators: "Analyzed" vs "Pending Analysis"

4. **Master Content Guide Generation**:
   - "Generate Content Guidelines" button (prominent)
   - Shows preview: "X platforms with samples, Y without"
   - Generation progress modal
   - Preview modal showing full document
   - Download options: PDF, Markdown, HTML
   - "Regenerate" button when samples or brand voice updates
   - Version history dropdown

**Updated Task List for Phase 7:**

**Part A: Smart Multi-Target System (Foundation)**
1. Add `target_areas` column to `inspirations` table (TEXT[] array)
2. Update SaveModal.tsx with target checkboxes UI
3. Add smart default logic (auto-detect URL type, pre-select targets)
4. Update edge function: `analyze-inspiration` to handle targeted analysis
5. Add conditional analysis: only analyze based on selected targets
6. Update store to track target areas per inspiration

**Part B: Content Sample Collection Integration**
7. Create `content_samples` table with RLS policies (or use target_areas in inspirations)
8. When user selects "Content Voice - [Platform]", create/update content sample entry
9. Link inspiration to content sample via target_areas
10. Build "Content Samples" summary view on Brand Kit page (shows count per platform)

**Part C: Content Guidelines Generation**
11. Create edge function: `analyze-content-sample` (if not using targeted analysis from Part A)
12. Create edge function: `generate-content-guidelines` (enhanced with samples)
13. Aggregate all content samples per platform
14. Generate guidelines using both Brand DNA + platform-specific samples
15. Add "Generate Content Guidelines" button on Brand Kit page
16. Implement preview modal for generated guidelines
17. Add download functionality (PDF, Markdown, HTML)
18. Add regeneration logic when samples or DNA updates

**Optional Enhancement:**
19. Add dedicated "Add Content Sample" modal (separate from Save Modal)
20. Add batch CSV import for power users
21. Add sample management interface (view/edit/delete individual samples)

**Is This Helpful?**
YES! This is extremely valuable because:

1. **Solves a real problem:** Users often struggle with "how do I write this email/post/ad in my brand voice?"
2. **Platform-specific:** Generic brand guidelines don't account for Twitter's 280 chars vs LinkedIn's conversational format
3. **Reference document:** Users can share this with team members, contractors, or feed it to other LLMs for content generation
4. **Consistency:** Ensures all content (across all platforms) maintains brand voice
5. **Educational:** Teaches users platform best practices while maintaining brand identity
6. **Sample-driven accuracy:** By providing actual content samples, guidelines become hyper-personalized to the user's real voice

**Use Cases:**
- User writing a blog post → Opens guide → References "Blog Posts" section → Writes on-brand
- User creating LinkedIn content → References "LinkedIn" section → Matches tone + format
- User feeding to ChatGPT → Includes relevant section in prompt → Gets on-brand output
- Agency managing client → Uses as single source of truth for all content creators
- New team member onboarding → Learns brand voice from real examples + guidelines

**Content Sample Collection Benefits:**
- **Accuracy:** Gemini learns from YOUR actual voice, not generic templates
- **Platform nuance:** Captures how you naturally adapt tone per platform
- **Real examples:** Guidelines include actual phrases/patterns from your content
- **Continuous improvement:** Add more samples over time to refine guidelines
- **No guesswork:** Don't have samples for a platform? Guidelines still generated from brand DNA

**Example Workflow:**
1. User has 5 LinkedIn posts they're proud of → Pastes URLs
2. User has 3 email newsletters → Copy/pastes text
3. User has 10 tweets → Pastes URLs or uses batch CSV upload
4. Clicks "Generate Content Guidelines"
5. Gemini analyzes all samples + brand DNA
6. Generates document where:
   - LinkedIn section uses patterns from actual posts
   - Email section matches newsletter style
   - Twitter section reflects tweet voice
   - Blog section adapts general brand voice (no samples provided)
7. User downloads guide → Shares with team → Everyone writes on-brand

**Estimated Time:** 8-10 hours (increased due to Smart Multi-Target System + content sample collection integration)

---

## Total Estimated Timeline (UPDATED)

- **Phase 1:** 2-3 hours (FOUNDATION - do this first)
- **Phase 2:** 3-4 hours
- **Phase 3:** 2 hours (optional if you have Firecrawl API)
- **Phase 4:** 4-5 hours
- **Phase 5:** 3-4 hours (DNA aggregation)
- **Phase 6:** 4-5 hours (LLM-ready brand guidelines - 5 export formats)
- **Phase 7:** 8-10 hours (Master content voice guidelines + Smart Multi-Target System + content sample collection)

**Total:** 26-36 hours of development

**Recommended Order:**
1. Phase 1 (must have - foundation for everything)
2. Phase 5 (DNA aggregation - needed before guidelines generation)
3. Phase 2 (high value - URL scanning)
4. Phase 6 (LLM-ready brand guidelines exports)
5. Phase 7 (Master content voice guidelines)
6. Phase 3 (nice to have if you have Firecrawl API)
7. Phase 4 (advanced feature - GitHub integration)

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
