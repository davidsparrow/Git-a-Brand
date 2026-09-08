export const BRAND_KIT = {
  name: 'Alex Chen Brand Kit',
  version: '1.0',
  generatedAt: '2024-02-19',
  colors: [
    { role: 'Primary Background', hex: '#050505', name: 'Void Black',    usage: 'Primary backgrounds, main surfaces',             textColor: '#FFF8F0' },
    { role: 'Surface',            hex: '#3D2B1F', name: 'FiveUp Brown',     usage: 'Card surfaces, secondary areas',                 textColor: '#FFF8F0' },
    { role: 'Elevated Surface',   hex: '#4A5568', name: 'FiveUp Slate', usage: 'Hover states, elevated cards',                   textColor: '#FFF8F0' },
    { role: 'Accent',             hex: '#6B4226', name: 'Warm Brown',   usage: 'CTAs, highlights, interactive elements',         textColor: '#FFF8F0' },
    { role: 'Accent Secondary',   hex: '#4A5568', name: 'Slate Anchor',   usage: 'Secondary accents, gradients',                   textColor: '#FFF8F0' },
    { role: 'Success',            hex: '#38A169', name: 'Emerald Glow',  usage: 'Success states, positive signals',               textColor: '#050505' },
    { role: 'Text Primary',       hex: '#FFF8F0', name: 'Clean White',   usage: 'Primary text, headings',                         textColor: '#050505' },
    { role: 'Text Secondary',     hex: '#FFE8D6', name: 'Warm Cream',     usage: 'Secondary text, descriptions, metadata',         textColor: '#050505' },
    { role: 'Border',             hex: '#4A5568', name: 'Slate Border', usage: 'Card borders, dividers, outlines',               textColor: '#FFF8F0' },
  ],
  typography: {
    heading: { family: 'DM Sans',           weight: 'Bold (700)',    sample: 'Ship faster with AI-powered brand consistency' },
    body:    { family: 'DM Sans',           weight: 'Regular (400)', sample: 'Build your visual identity with intention. Every design decision matters — from the weight of a headline to the spacing between elements.' },
    mono:    { family: 'JetBrains Mono', weight: 'Regular (400)', sample: 'const brand = { precision: true, warmth: true };' },
    scale: 'Major Third (1.250)',
    sizes: { xs: '12px', sm: '14px', base: '16px', md: '20px', lg: '25px', xl: '31px', '2xl': '39px', '3xl': '49px' },
  },
  voice: {
    descriptors: ['Confident', 'Clear', 'Warm', 'Technical', 'Precise'],
    avoid: ['Corporate jargon', 'Excessive exclamation marks', 'Buzzwords', 'Passive voice'],
    examples: [
      { good: 'Ship faster with AI-powered brand consistency',     bad: 'Leverage our cutting-edge synergistic brand solutions!' },
      { good: 'Built for founders who care about craft',           bad: 'Our revolutionary platform empowers entrepreneurial ecosystems' },
      { good: 'Dark, minimal, and intentional',                    bad: 'Disruptive world-class design innovation' },
    ],
  },
  referenceAssets: ['1', '2', '11', '17', '29', '30'],
};

export const EXPORT_FORMATS = [
  { id: 'claude',  name: 'Claude Code',       ext: '.md',   icon: 'FileText', description: 'Markdown brand guidelines for AI-assisted development sessions' },
  { id: 'lovable', name: 'Lovable',           ext: '.json', icon: 'Heart',    description: 'JSON design tokens for Lovable app generation' },
  { id: 'cursor',  name: 'Cursor',            ext: '.mdc',  icon: 'Code2',    description: 'Cursor rules file with full brand context and constraints' },
  { id: 'figma',   name: 'Figma Variables',   ext: '.json', icon: 'Layers',   description: 'Figma-compatible variable tokens for design files' },
  { id: 'raw',     name: 'Raw JSON',          ext: '.json', icon: 'Database', description: 'Complete structured brand kit as raw JSON' },
];
