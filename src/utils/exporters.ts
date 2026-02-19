import { BRAND_KIT } from '../data/brandKit';

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateClaudeExport(): string {
  const kit = BRAND_KIT;
  return `# Brand Guidelines — ${kit.name}
*Generated on ${kit.generatedAt}*

---

## Color Palette

| Role | Hex | Name | Usage |
|------|-----|------|-------|
${kit.colors.map((c) => `| ${c.role} | \`${c.hex}\` | ${c.name} | ${c.usage} |`).join('\n')}

---

## Typography

- **Headings**: ${kit.typography.heading.family} ${kit.typography.heading.weight}
- **Body**: ${kit.typography.body.family} ${kit.typography.body.weight}
- **Monospace**: ${kit.typography.mono.family} ${kit.typography.mono.weight}
- **Scale**: ${kit.typography.scale}

---

## Tone of Voice

**Descriptors**: ${kit.voice.descriptors.join(', ')}

**Avoid**: ${kit.voice.avoid.join(', ')}

### Writing Examples

${kit.voice.examples.map((ex, i) => `**Example ${i + 1}**\n- ✅ "${ex.good}"\n- ❌ "${ex.bad}"`).join('\n\n')}

---

## Aesthetic Signature

**Archetype**: The Refined Technologist
**Tagline**: Precision meets warmth

Your aesthetic blends Swiss design precision with contemporary digital warmth. Dark interfaces with strategic color, generous whitespace, typography that commands without shouting.

**Influences**: Dieter Rams, Swiss Design, Japanese Minimalism, Bauhaus
**Keywords**: precision, clarity, depth, craft, intention, restraint

---

## Implementation Notes for AI Builders

1. Default to dark backgrounds (\`#0A0A0F\` or \`#18181B\`)
2. Use \`#A78BFA\` as primary accent — sparingly and purposefully
3. Typography: Inter for UI, JetBrains Mono for code/technical
4. Minimum \`32px\` card padding, \`24px\` between elements
5. Borders: \`1px solid #3F3F46\`
6. Hover: scale \`1.02\`, border glow \`rgba(167,139,250,0.4)\`
7. Voice: confident and clear, never corporate or buzzword-heavy
`;
}

export function generateLovableExport(): string {
  const kit = BRAND_KIT;
  const tokens: Record<string, unknown> = {
    $schema: 'https://lovable.dev/tokens/v1',
    name: kit.name,
    version: kit.version,
    colors: Object.fromEntries(kit.colors.map((c) => [c.role.toLowerCase().replace(/\s+/g, '-'), c.hex])),
    typography: {
      fontFamilies: { heading: kit.typography.heading.family, body: kit.typography.body.family, mono: kit.typography.mono.family },
      fontSizes: kit.typography.sizes,
      scale: kit.typography.scale,
    },
    spacing: { base: 8, scale: [4, 8, 12, 16, 24, 32, 48, 64, 80, 96] },
    radii: { sm: '6px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
    voice: { tone: kit.voice.descriptors, avoid: kit.voice.avoid },
  };
  return JSON.stringify(tokens, null, 2);
}

export function generateCursorExport(): string {
  const kit = BRAND_KIT;
  return `---
description: Brand context and design rules for ${kit.name}
globs: ["**/*.tsx","**/*.css","**/*.ts"]
alwaysApply: true
---

# Brand: The Refined Technologist

## Design Philosophy
Precision meets warmth. Dark interfaces, strategic color, generous whitespace.

## Color System
\`\`\`
Background:      #0A0A0F  (Void Black)
Surface:         #18181B  (Deep Zinc)
Elevated:        #27272A  (Elevated Zinc)
Border:          #3F3F46  (Subtle Border)
Accent:          #A78BFA  (Soft Violet)
Accent Alt:      #5E6AD2  (Linear Blue)
Success:         #34D399  (Emerald Glow)
Text Primary:    #FAFAFA  (Clean White)
Text Secondary:  #A1A1AA  (Zinc Gray)
\`\`\`

## Typography Rules
- Headings: Inter Bold (700)
- Body: Inter Regular (400)
- Code: JetBrains Mono Regular (400)
- Scale: Major Third (1.250 ratio)
- Max 3 font weights per composition

## Component Patterns
- Cards: bg-[#18181B] border border-[#3F3F46] rounded-xl
- Hover: scale(1.02) + border-[#A78BFA]/40 + shadow
- CTAs: bg-[#A78BFA] text-[#0A0A0F] hover:bg-[#C4B5FD]
- Input focus: border-[#A78BFA]/60
- Badges: bg-[#27272A] text-[#A1A1AA] text-xs

## Voice Rules
- Tone: ${kit.voice.descriptors.join(', ')}
- AVOID: ${kit.voice.avoid.join(', ')}
- ✅ "Ship faster with AI-powered brand consistency"
- ❌ "Leverage our cutting-edge synergistic solutions!"

## Constraints
1. Accent only for interactive elements, never backgrounds
2. Borders: 1px, subtle opacity
3. Animations: ease-out, 200–400ms
4. Always include hover AND active states
`;
}

export function generateFigmaExport(): string {
  const kit = BRAND_KIT;
  const hexToRgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
    a: 1,
  });
  return JSON.stringify({
    version: '1.0',
    collections: [
      {
        name: 'Colors',
        modes: ['Default'],
        variables: kit.colors.map((c) => ({
          name: `color/${c.role.toLowerCase().replace(/\s+/g, '/')}`,
          type: 'COLOR',
          values: { Default: hexToRgb(c.hex) },
          description: `${c.name} — ${c.usage}`,
        })),
      },
      {
        name: 'Typography',
        modes: ['Default'],
        variables: Object.entries(kit.typography.sizes).map(([key, val]) => ({
          name: `fontSize/${key}`,
          type: 'FLOAT',
          values: { Default: parseFloat(val) },
        })),
      },
      {
        name: 'Spacing',
        modes: ['Default'],
        variables: [4, 8, 12, 16, 24, 32, 48, 64, 80, 96].map((v, i) => ({
          name: `spacing/${i + 1}`,
          type: 'FLOAT',
          values: { Default: v },
        })),
      },
    ],
  }, null, 2);
}

export function generateRawExport(): string {
  return JSON.stringify(
    { ...BRAND_KIT, brandDNA: { archetype: 'The Refined Technologist', confidence: 87, style: 'Dark Minimalism' } },
    null,
    2,
  );
}

export function downloadExport(formatId: string) {
  const map: Record<string, { content: () => string; filename: string; mime: string }> = {
    claude:  { content: generateClaudeExport,  filename: 'brand-guidelines.md',   mime: 'text/markdown' },
    lovable: { content: generateLovableExport, filename: 'brand-tokens.json',     mime: 'application/json' },
    cursor:  { content: generateCursorExport,  filename: 'brand-rules.mdc',       mime: 'text/plain' },
    figma:   { content: generateFigmaExport,   filename: 'figma-variables.json',  mime: 'application/json' },
    raw:     { content: generateRawExport,     filename: 'brand-kit.json',        mime: 'application/json' },
  };
  const f = map[formatId];
  if (f) download(f.content(), f.filename, f.mime);
}

export function getExportPreview(formatId: string): string {
  const map: Record<string, () => string> = {
    claude: generateClaudeExport,
    lovable: generateLovableExport,
    cursor: generateCursorExport,
    figma: generateFigmaExport,
    raw: generateRawExport,
  };
  return map[formatId]?.() ?? '';
}
