export const BRAND_KIT = {
  name: 'Alex Chen Brand Kit',
  version: '1.0',
  generatedAt: '2024-02-19',
  colors: [
    { role: 'Primary Background', hex: '#0A0A0F', name: 'Void Black',    usage: 'Primary backgrounds, main surfaces',             textColor: '#FAFAFA' },
    { role: 'Surface',            hex: '#18181B', name: 'Deep Zinc',     usage: 'Card surfaces, secondary areas',                 textColor: '#FAFAFA' },
    { role: 'Elevated Surface',   hex: '#27272A', name: 'Elevated Zinc', usage: 'Hover states, elevated cards',                   textColor: '#FAFAFA' },
    { role: 'Accent',             hex: '#A78BFA', name: 'Soft Violet',   usage: 'CTAs, highlights, interactive elements',         textColor: '#0A0A0F' },
    { role: 'Accent Secondary',   hex: '#5E6AD2', name: 'Linear Blue',   usage: 'Secondary accents, gradients',                   textColor: '#FAFAFA' },
    { role: 'Success',            hex: '#34D399', name: 'Emerald Glow',  usage: 'Success states, positive signals',               textColor: '#0A0A0F' },
    { role: 'Text Primary',       hex: '#FAFAFA', name: 'Clean White',   usage: 'Primary text, headings',                         textColor: '#0A0A0F' },
    { role: 'Text Secondary',     hex: '#A1A1AA', name: 'Zinc Gray',     usage: 'Secondary text, descriptions, metadata',         textColor: '#0A0A0F' },
    { role: 'Border',             hex: '#3F3F46', name: 'Subtle Border', usage: 'Card borders, dividers, outlines',               textColor: '#FAFAFA' },
  ],
  typography: {
    heading: { family: 'Inter',           weight: 'Bold (700)',    sample: 'Ship faster with AI-powered brand consistency' },
    body:    { family: 'Inter',           weight: 'Regular (400)', sample: 'Build your visual identity with intention. Every design decision matters — from the weight of a headline to the spacing between elements.' },
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
