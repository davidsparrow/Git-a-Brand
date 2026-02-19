import { useNavigate } from 'react-router-dom';
import { Layers, Sparkles, Package, ArrowRight, Save, Tag, Palette } from 'lucide-react';
import { useSwipeStore, useUIStore } from '../store';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { BRAND_DNA } from '../data/brandDNA';

export function Dashboard() {
  const navigate      = useNavigate();
  const inspirations  = useSwipeStore((s) => s.inspirations);
  const loading       = useSwipeStore((s) => s.loading);
  const setSaveModal  = useUIStore((s) => s.setSaveModalOpen);
  const recent        = inspirations.slice(0, 8);
  const allTags       = new Set(inspirations.flatMap((i) => i.tags));

  const stats = [
    { label: 'Saves',          value: inspirations.length,              suffix: '',  icon: Save    },
    { label: 'Tags',           value: allTags.size,                     suffix: '',  icon: Tag     },
    { label: 'DNA Confidence', value: BRAND_DNA.confidence,             suffix: '%', icon: Sparkles },
    { label: 'Color Palette',  value: BRAND_DNA.palette.primary.length, suffix: '',  icon: Palette },
  ];

  return (
    <div className="p-8 space-y-10 page-enter max-w-7xl">
      {/* Greeting */}
      <div className="animate-fade-in-up stagger-1">
        <p className="text-[#71717A] text-sm mb-0.5">Good morning</p>
        <h1 className="text-3xl font-bold text-[#FAFAFA] tracking-tight">Alex Chen</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 animate-fade-in-up stagger-2">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#18181B] border border-[#3F3F46] rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">{s.label}</span>
              <div className="w-8 h-8 rounded-lg bg-[#27272A] flex items-center justify-center">
                <s.icon size={15} className="text-[#A78BFA]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#FAFAFA]">
              <AnimatedCounter to={s.value} suffix={s.suffix} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Saves */}
      <div className="animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#FAFAFA]">Recent Saves</h2>
          <button
            onClick={() => navigate('/swipe-file')}
            className="text-xs text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={11} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-44 bg-[#18181B] border border-[#3F3F46] rounded-xl overflow-hidden animate-pulse">
              <div className="h-24 bg-[#27272A]" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 bg-[#27272A] rounded w-3/4" />
                <div className="h-2 bg-[#27272A] rounded w-1/2" />
              </div>
            </div>
          )) : recent.map((item, i) => (
            <div
              key={item.id}
              onClick={() => navigate(`/swipe-file/${item.id}`)}
              className="shrink-0 w-44 bg-[#18181B] border border-[#3F3F46] rounded-xl overflow-hidden cursor-pointer card-hover animate-fade-in-up"
              style={{ animationDelay: `${0.04 * i + 0.2}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="h-24 overflow-hidden">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" style={{ transition: 'transform 0.3s ease' }} />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-[#FAFAFA] truncate leading-tight">{item.title}</p>
                <p className="text-[10px] text-[#71717A] mt-0.5">{item.sourceDomain}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 animate-fade-in-up stagger-4">
        {/* Brand DNA Summary */}
        <div className="gradient-border rounded-xl card-hover cursor-pointer" onClick={() => navigate('/brand-dna')}>
          <div className="bg-[#18181B] rounded-xl p-6 h-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA] mb-1 block">Brand DNA</span>
            <h3 className="text-xl font-bold text-[#FAFAFA] mb-0.5">{BRAND_DNA.archetype.name}</h3>
            <p className="text-sm text-[#A1A1AA] italic mb-4">{BRAND_DNA.archetype.tagline}</p>
            <div className="flex gap-1.5 mb-5">
              {BRAND_DNA.palette.primary.map((c) => (
                <div
                  key={c.hex}
                  title={`${c.name} ${c.hex}`}
                  className="w-6 h-6 rounded-md border border-[#3F3F46]"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
            <span className="text-xs text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 font-medium transition-colors">
              View Full Analysis <ArrowRight size={11} />
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-2 grid grid-cols-3 gap-4">
          {[
            { icon: Layers,   label: 'Save Inspiration', desc: 'Add a URL or upload an image to your swipe file',              cta: 'Save New',      action: () => setSaveModal(true) },
            { icon: Sparkles, label: 'View Brand DNA',   desc: 'See your AI-extracted visual patterns and aesthetic signature', cta: 'View Analysis', action: () => navigate('/brand-dna') },
            { icon: Package,  label: 'Export Brand Kit', desc: 'Download your portable brand kit for Claude, Cursor, Lovable',  cta: 'Export Kit',    action: () => navigate('/brand-kit') },
          ].map(({ icon: Icon, label, desc, cta, action }) => (
            <div
              key={label}
              onClick={action}
              className="bg-[#18181B] border border-[#3F3F46] rounded-xl p-5 cursor-pointer card-hover flex flex-col"
            >
              <div className="w-9 h-9 rounded-lg bg-[#27272A] flex items-center justify-center mb-4">
                <Icon size={17} className="text-[#A78BFA]" />
              </div>
              <h4 className="text-sm font-semibold text-[#FAFAFA] mb-1.5">{label}</h4>
              <p className="text-xs text-[#71717A] leading-relaxed flex-1">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-[#A78BFA] font-medium">
                {cta} <ArrowRight size={11} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Tone teaser */}
      <div className="bg-[#18181B] border border-[#3F3F46] rounded-xl p-6 animate-fade-in-up stagger-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#FAFAFA]">Visual Tone</h2>
            <p className="text-xs text-[#71717A] mt-0.5">Patterns extracted across your saves</p>
          </div>
          <button onClick={() => navigate('/brand-dna')} className="text-xs text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 transition-colors">
            Full report <ArrowRight size={11} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {BRAND_DNA.visualTone.slice(0, 8).map((t) => (
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
      </div>
    </div>
  );
}
