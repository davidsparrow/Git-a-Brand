export const BRAND_DNA = {
  analyzedCount: 38,
  confidence: 87,
  lastAnalyzed: '2 hours ago',
  dominantStyle: 'Dark Minimalism',
  archetype: {
    name: 'The Refined Technologist',
    tagline: 'Precision meets warmth',
    description:
      "Your aesthetic signature blends Swiss design precision with contemporary digital warmth. You're drawn to tools and brands that feel both powerful and approachable — dark interfaces with strategic color, generous whitespace, and typography that commands attention without shouting. There's an underlying philosophy here: beautiful things work better, and constraints produce creativity.",
    influences: ['Dieter Rams', 'Swiss Design', 'Japanese Minimalism', 'Bauhaus'],
    keywords: ['precision', 'clarity', 'depth', 'craft', 'intention', 'restraint'],
  },
  palette: {
    primary: [
      { hex: '#050505', name: 'Void Black',   percentage: 72, role: 'Primary Background' },
      { hex: '#3D2B1F', name: 'FiveUp Brown',    percentage: 61, role: 'Surface' },
      { hex: '#6B4226', name: 'Warm Brown',  percentage: 54, role: 'Creative Accent' },
      { hex: '#FFF8F0', name: 'Near White',   percentage: 48, role: 'Primary Text' },
      { hex: '#0A2540', name: 'Navy Depth',   percentage: 43, role: 'Deep Anchor' },
    ],
    accent: [
      { hex: '#38A169', name: 'Emerald Glow',  percentage: 38, role: 'Success / Energy' },
      { hex: '#4A5568', name: 'Slate Anchor',   percentage: 35, role: 'Technical Accent' },
      { hex: '#F4A832', name: 'Warm Signal',   percentage: 22, role: 'Alert / Warmth' },
    ],
    neutral: [
      { hex: '#4A5568', name: 'Slate Border',  percentage: 65, role: 'Borders' },
      { hex: '#FFE8D6', name: 'Warm Cream',   percentage: 58, role: 'Secondary Text' },
      { hex: '#4A5568', name: 'FiveUp Slate',     percentage: 52, role: 'Elevated Surface' },
    ],
    harmonyDescription:
      "Your palette gravitates toward deep, warm tones with structured slate accents. The solid black base and FiveUp brown surfaces create authority and focus, while the warm brown interactive accents add craft without breaking the restrained dark theme.",
  },
  typography: {
    primaryStyle:   { name: 'Geometric Sans-Serif', confidence: 84 },
    secondaryStyle: { name: 'Humanist Serif',        confidence: 61 },
    preferredWeights: ['Medium (500)', 'Bold (700)', 'Semibold (600)'],
    sizeContrast: 'High',
    recommendedFonts: [
      { name: 'DM Sans',           category: 'Geometric Sans', reason: 'Matches your preference for geometric clarity with warmth',              specimen: 'Aa Bb Cc 0123' },
      { name: 'JetBrains Mono',  category: 'Monospace',      reason: 'Technical precision signal, strong in developer-focused aesthetics',     specimen: 'const x = 42;' },
      { name: 'Fraunces',        category: 'Display Serif',  reason: 'Provides editorial contrast against the geometric sans',                 specimen: 'The Craft' },
      { name: 'Geist',           category: 'Geometric Sans', reason: 'Modern engineering aesthetic, pairs cleanly with DM Sans',               specimen: 'Build fast.' },
    ],
  },
  visualTone: [
    { label: 'Sophisticated', weight: 95 },
    { label: 'Minimal',       weight: 91 },
    { label: 'Technical',     weight: 86 },
    { label: 'Refined',       weight: 82 },
    { label: 'Warm',          weight: 68 },
    { label: 'Dark',          weight: 66 },
    { label: 'Bold',          weight: 55 },
    { label: 'Editorial',     weight: 48 },
    { label: 'Luxurious',     weight: 44 },
    { label: 'Systematic',    weight: 40 },
  ],
  contrast:   'High',
  whitespace: 'Generous',
  summary:
    "Your visual language speaks to technical sophistication with intentional warmth. You don't choose between beautiful and functional — you demand both. The dark interfaces aren't about being different; they're about focus. The brown and slate accents aren't decorative; they're directional. Your aesthetic tells a story of someone who takes craft seriously.",
};
