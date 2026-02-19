import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { BRAND_DNA } from '../data/brandDNA';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

function CircularProgress({ value }: { value: number }) {
  const size = 80;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (value / 100) * circ), 300);
    return () => clearTimeout(t);
  }, [value, circ]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#27272A" strokeWidth={6} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke="#A78BFA" strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-[#FAFAFA]">{value}%</span>
      </div>
    </div>
  );
}

function AnimatedBar({ percentage, color, delay = 0 }: { percentage: number; color?: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(percentage), 400 + delay);
    return () => clearTimeout(t);
  }, [percentage, delay]);
  return (
    <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full"
        style={{ width: `${w}%`, background: color || '#A78BFA', transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}ms` }}
      />
    </div>
  );
}

export function BrandDNA() {
  const d = BRAND_DNA;

  return (
    <div className="p-8 space-y-8 page-enter max-w-5xl">
      {/* Header */}
      <div className="animate-fade-in-up stagger-1">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} className="text-[#A78BFA]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA]">AI Analysis</span>
        </div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Brand DNA</h1>
        <p className="text-sm text-[#71717A] mt-1">Your visual identity distilled from {d.analyzedCount} saves</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-4 gap-4 animate-fade-in-up stagger-2">
        {[
          { label: 'Items Analyzed', content: <p className="text-2xl font-bold text-[#FAFAFA]"><AnimatedCounter to={d.analyzedCount} /></p> },
          { label: 'Last Analyzed',  content: <p className="text-base font-semibold text-[#FAFAFA]">{d.lastAnalyzed}</p> },
          { label: 'Dominant Style', content: <p className="text-base font-semibold text-[#FAFAFA]">{d.dominantStyle}</p> },
          {
            label: 'Confidence',
            content: (
              <div className="flex items-center gap-3">
                <CircularProgress value={d.confidence} />
                <p className="text-sm font-semibold text-[#FAFAFA]">High</p>
              </div>
            ),
          },
        ].map((s) => (
          <div key={s.label} className="bg-[#18181B] border border-[#3F3F46] rounded-xl p-5 card-hover">
            <p className="text-xs text-[#71717A] mb-2">{s.label}</p>
            {s.content}
          </div>
        ))}
      </div>

      {/* Color Palette */}
      <section className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-6 animate-fade-in-up stagger-3">
        <h2 className="text-base font-semibold text-[#FAFAFA] mb-6">Color Palette</h2>

        <div className="mb-6">
          <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Primary</p>
          <div className="space-y-3">
            {d.palette.primary.map((c, i) => (
              <div key={c.hex} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-[#3F3F46] shrink-0" style={{ background: c.hex }} />
                <div className="w-28 shrink-0">
                  <p className="text-xs font-medium text-[#FAFAFA] truncate">{c.name}</p>
                  <p className="font-mono text-[10px] text-[#52525B]">{c.hex}</p>
                </div>
                <AnimatedBar percentage={c.percentage} delay={i * 100} />
                <span className="text-xs text-[#71717A] w-8 text-right shrink-0">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-5">
          {[{ title: 'Accent', items: d.palette.accent }, { title: 'Neutrals', items: d.palette.neutral }].map(({ title, items }) => (
            <div key={title}>
              <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">{title}</p>
              <div className="space-y-2">
                {items.map((c, i) => (
                  <div key={c.hex} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg border border-[#3F3F46] shrink-0" style={{ background: c.hex }} />
                    <div className="w-20 shrink-0">
                      <p className="text-[11px] font-medium text-[#FAFAFA] truncate">{c.name}</p>
                      <p className="font-mono text-[9px] text-[#52525B]">{c.hex}</p>
                    </div>
                    <AnimatedBar percentage={c.percentage} delay={i * 100} color={title === 'Neutrals' ? '#52525B' : undefined} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#27272A] rounded-xl p-4">
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{d.palette.harmonyDescription}</p>
        </div>
      </section>

      {/* Typography */}
      <section className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-6 animate-fade-in-up stagger-4">
        <h2 className="text-base font-semibold text-[#FAFAFA] mb-5">Typography Instincts</h2>

        <div className="space-y-3 mb-5">
          {[d.typography.primaryStyle, d.typography.secondaryStyle].map((s, i) => (
            <div key={s.name} className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: i === 0 ? '#A78BFA' : '#52525B' }} />
              <p className="text-sm text-[#FAFAFA] w-48 shrink-0">{s.name}</p>
              <AnimatedBar percentage={s.confidence} delay={i * 150} />
              <span className="text-xs text-[#71717A] w-8 text-right shrink-0">{s.confidence}%</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-[#27272A] rounded-xl p-4">
            <p className="text-xs text-[#71717A] mb-2">Preferred Weights</p>
            <div className="flex flex-wrap gap-1.5">
              {d.typography.preferredWeights.map((w) => (
                <span key={w} className="px-2 py-0.5 rounded-md bg-[#3F3F46] text-[#A1A1AA] text-[11px]">{w}</span>
              ))}
            </div>
          </div>
          <div className="bg-[#27272A] rounded-xl p-4">
            <p className="text-xs text-[#71717A] mb-2">Size Contrast</p>
            <p className="text-sm font-semibold text-[#FAFAFA]">{d.typography.sizeContrast}</p>
          </div>
          <div className="bg-[#27272A] rounded-xl p-4">
            <p className="text-xs text-[#71717A] mb-2">Scale</p>
            <p className="text-sm font-semibold text-[#FAFAFA]">Major Third</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Recommended Fonts</p>
          <div className="grid grid-cols-2 gap-3">
            {d.typography.recommendedFonts.map((f) => (
              <div key={f.name} className="bg-[#27272A] rounded-xl p-4 border border-[#3F3F46]/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={13} className="text-[#34D399] shrink-0" />
                  <span className="text-sm font-semibold text-[#FAFAFA]">{f.name}</span>
                  <span className="ml-auto text-[10px] text-[#71717A] bg-[#3F3F46] px-1.5 py-0.5 rounded">{f.category}</span>
                </div>
                <p className="font-mono text-sm text-[#A78BFA] mb-2">{f.specimen}</p>
                <p className="text-[11px] text-[#71717A] leading-relaxed">{f.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Tone */}
      <section className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-6 animate-fade-in-up stagger-5">
        <h2 className="text-base font-semibold text-[#FAFAFA] mb-5">Visual Tone</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {d.visualTone.map((t) => (
            <span
              key={t.label}
              className="px-3 py-1.5 rounded-full border border-[#3F3F46] text-[#A1A1AA]"
              style={{
                fontSize: `${Math.max(10, 9 + (t.weight / 100) * 6)}px`,
                opacity: 0.35 + (t.weight / 100) * 0.65,
                fontWeight: t.weight > 80 ? 600 : 400,
              }}
            >
              {t.label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {[{ label: 'Contrast Level', value: d.contrast }, { label: 'Whitespace Preference', value: d.whitespace }].map(({ label, value }) => (
            <div key={label} className="bg-[#27272A] rounded-xl p-4">
              <p className="text-xs text-[#71717A] mb-1">{label}</p>
              <p className="text-sm font-semibold text-[#FAFAFA]">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#27272A] rounded-xl p-4">
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{d.summary}</p>
        </div>
      </section>

      {/* Aesthetic Signature */}
      <section className="animate-fade-in-up stagger-6">
        <div className="gradient-border rounded-2xl">
          <div className="bg-[#18181B] rounded-2xl p-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA] mb-2 block">Aesthetic Signature</span>
            <h2 className="text-3xl font-bold text-[#FAFAFA] mb-1">{d.archetype.name}</h2>
            <p className="text-lg text-[#A1A1AA] italic mb-5">{d.archetype.tagline}</p>
            <p className="text-[#A1A1AA] leading-relaxed mb-6 max-w-2xl">{d.archetype.description}</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Influences</p>
                <div className="flex flex-wrap gap-2">
                  {d.archetype.influences.map((inf) => (
                    <span key={inf} className="px-3 py-1.5 rounded-full border border-[#A78BFA]/30 text-[#A78BFA] text-xs">{inf}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Core Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {d.archetype.keywords.map((k) => (
                    <span key={k} className="px-3 py-1.5 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#A1A1AA] text-xs">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
