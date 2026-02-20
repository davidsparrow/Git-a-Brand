import { useEffect, useState, useCallback } from 'react';
import { Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { BRAND_DNA } from '../data/brandDNA';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { supabase } from '../lib/supabase';
import { useSwipeStore } from '../store';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

interface AggregatedData {
  topColors: { hex: string; name: string; frequency: number }[];
  dominantMood: string | null;
  typographyPattern: string | null;
  archetype: string;
  visualTone: { label: string; weight: number }[];
  summary: string;
}

interface Snapshot {
  inspiration_count: number;
  aggregated_data: AggregatedData;
  generated_at: string;
}

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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function BrandDNA() {
  const d = BRAND_DNA;
  const inspirations = useSwipeStore((s) => s.inspirations);
  const [snapshot,    setSnapshot]    = useState<Snapshot | null>(null);
  const [refreshing,  setRefreshing]  = useState(false);
  const [refreshError, setRefreshError] = useState(false);

  const loadLatestSnapshot = useCallback(async () => {
    const { data } = await supabase
      .from<Snapshot>('brand_dna_snapshots')
      .select('*')
      .order('generated_at', { ascending: false });
    if (data && (data as unknown as Snapshot[]).length > 0) {
      setSnapshot((data as unknown as Snapshot[])[0]);
    }
  }, []);

  useEffect(() => { loadLatestSnapshot(); }, [loadLatestSnapshot]);

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshError(false);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/aggregate-dna`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await loadLatestSnapshot();
      } else {
        setRefreshError(true);
      }
    } catch {
      setRefreshError(true);
    } finally {
      setRefreshing(false);
    }
  }

  const agg = snapshot?.aggregated_data;

  const palette = agg?.topColors
    ? {
        primary: agg.topColors.slice(0, 5).map((c, i) => ({
          hex: c.hex,
          name: c.name,
          percentage: c.frequency,
          role: ['Primary Background', 'Surface', 'Creative Accent', 'Primary Text', 'Deep Anchor'][i] ?? 'Color',
        })),
        accent: d.palette.accent,
        neutral: d.palette.neutral,
        harmonyDescription: d.palette.harmonyDescription,
      }
    : d.palette;

  const visualTone = agg?.visualTone ?? d.visualTone;
  const archetype = agg
    ? { name: d.archetype.name, tagline: d.archetype.tagline, description: agg.archetype, influences: d.archetype.influences, keywords: d.archetype.keywords }
    : d.archetype;
  const analyzedCount = snapshot?.inspiration_count ?? d.analyzedCount;
  const summary = agg?.summary ?? d.summary;
  const lastAnalyzed = snapshot ? timeAgo(snapshot.generated_at) : d.lastAnalyzed;
  const dominantStyle = agg?.dominantMood ?? d.dominantStyle;
  const confidence = agg
    ? Math.min(99, Math.round(50 + (analyzedCount / 40) * 49))
    : d.confidence;

  return (
    <div className="p-8 space-y-8 page-enter max-w-5xl">
      {/* Header */}
      <div className="animate-fade-in-up stagger-1 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} className="text-[#A78BFA]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA]">AI Analysis</span>
          </div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Brand DNA</h1>
          <p className="text-sm text-[#71717A] mt-1">Your visual identity distilled from {analyzedCount} saves</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing || inspirations.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#27272A] text-xs text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#3F3F46] transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-[#3F3F46]"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh DNA'}
          </button>
          {refreshError && <p className="text-[10px] text-[#F87171]">Refresh failed — try again</p>}
          {snapshot && !refreshError && (
            <p className="text-[10px] text-[#52525B]">Last updated {lastAnalyzed}</p>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-4 gap-4 animate-fade-in-up stagger-2">
        {[
          { label: 'Items Analyzed', content: <p className="text-2xl font-bold text-[#FAFAFA]"><AnimatedCounter to={analyzedCount} /></p> },
          { label: 'Last Analyzed',  content: <p className="text-base font-semibold text-[#FAFAFA]">{lastAnalyzed}</p> },
          { label: 'Dominant Style', content: <p className="text-base font-semibold text-[#FAFAFA]">{dominantStyle}</p> },
          {
            label: 'Confidence',
            content: (
              <div className="flex items-center gap-3">
                <CircularProgress value={confidence} />
                <p className="text-sm font-semibold text-[#FAFAFA]">{confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low'}</p>
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
            {palette.primary.map((c, i) => (
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
          {[{ title: 'Accent', items: palette.accent }, { title: 'Neutrals', items: palette.neutral }].map(({ title, items }) => (
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
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{palette.harmonyDescription}</p>
        </div>
      </section>

      {/* Typography */}
      <section className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-6 animate-fade-in-up stagger-4">
        <h2 className="text-base font-semibold text-[#FAFAFA] mb-5">Typography Instincts</h2>

        <div className="space-y-3 mb-5">
          {[
            { name: agg?.typographyPattern ?? d.typography.primaryStyle.name, confidence: d.typography.primaryStyle.confidence },
            { name: d.typography.secondaryStyle.name,                          confidence: d.typography.secondaryStyle.confidence },
          ].map((s, i) => (
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
          {visualTone.map((t) => (
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
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{summary}</p>
        </div>
      </section>

      {/* Aesthetic Signature */}
      <section className="animate-fade-in-up stagger-6">
        <div className="gradient-border rounded-2xl">
          <div className="bg-[#18181B] rounded-2xl p-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA] mb-2 block">Aesthetic Signature</span>
            <h2 className="text-3xl font-bold text-[#FAFAFA] mb-1">{archetype.name}</h2>
            <p className="text-lg text-[#A1A1AA] italic mb-5">{archetype.tagline}</p>
            <p className="text-[#A1A1AA] leading-relaxed mb-6 max-w-2xl">{archetype.description}</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Influences</p>
                <div className="flex flex-wrap gap-2">
                  {archetype.influences.map((inf) => (
                    <span key={inf} className="px-3 py-1.5 rounded-full border border-[#A78BFA]/30 text-[#A78BFA] text-xs">{inf}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Core Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {archetype.keywords.map((k) => (
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
