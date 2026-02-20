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

**Gemini Prompt for Content Guidelines:**
```
You are a content strategist. Based on the brand voice analysis below, generate a comprehensive Master Brand Content Voice Guidelines document.

INPUT DATA:
- Brand voice tone: {tone}
- Vocabulary patterns: {vocabulary}
- Sentence structure: {structure}
- Brand archetype: {archetype}
- Target audience: {audience if available}

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
- 2 concrete examples matching the brand voice
- Platform-specific don'ts

Also include:
- Universal brand voice checklist
- Content creation workflow
- Examples library (2-3 per major platform)

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
- Add "Master Content Guide" download button on Brand Kit page
- Preview modal showing full document
- "Regenerate" button when brand voice updates
- Export as PDF or Markdown

**Is This Helpful?**
YES! This is extremely valuable because:

1. **Solves a real problem:** Users often struggle with "how do I write this email/post/ad in my brand voice?"
2. **Platform-specific:** Generic brand guidelines don't account for Twitter's 280 chars vs LinkedIn's conversational format
3. **Reference document:** Users can share this with team members, contractors, or feed it to other LLMs for content generation
4. **Consistency:** Ensures all content (across all platforms) maintains brand voice
5. **Educational:** Teaches users platform best practices while maintaining brand identity

**Use Cases:**
- User writing a blog post → Opens guide → References "Blog Posts" section → Writes on-brand
- User creating LinkedIn content → References "LinkedIn" section → Matches tone + format
- User feeding to ChatGPT → Includes relevant section in prompt → Gets on-brand output
- Agency managing client → Uses as single source of truth for all content creators

**Estimated Time:** 4-5 hours

---

## Total Estimated Timeline (UPDATED)

- **Phase 1:** 2-3 hours (FOUNDATION - do this first)
- **Phase 2:** 3-4 hours
- **Phase 3:** 2 hours (optional if you have Firecrawl API)
- **Phase 4:** 4-5 hours
- **Phase 5:** 3-4 hours (DNA aggregation)
- **Phase 6:** 4-5 hours (LLM-ready brand guidelines - 5 export formats)
- **Phase 7:** 4-5 hours (Master content voice guidelines with platform-specific sections)

**Total:** 22-31 hours of development

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
