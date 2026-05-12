import { useState, useRef } from 'react';
import { X, Link2, Upload, Check, Plus, Target, AlertCircle } from 'lucide-react';
import { useUIStore, useSwipeStore } from '../../store';
import type { Inspiration, InspirationAnalysis, TargetArea } from '../../data/inspirations';
import { TARGET_OPTIONS } from '../../data/inspirations';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const STAGES_IMAGE = [
  { label: 'Reading image...',           ms: 400  },
  { label: 'Extracting visual elements...', ms: 600  },
  { label: 'Analyzing patterns...',      ms: 700  },
];

const STAGES_URL = [
  { label: 'Fetching page...',           ms: 600  },
  { label: 'Capturing screenshot...',    ms: 800  },
  { label: 'Analyzing brand elements...', ms: 700  },
];

const FALLBACK_ANALYSIS: InspirationAnalysis = {
  dominantColors: [
    { hex: '#050505', name: 'Void Black',  percentage: 60 },
    { hex: '#6B4226', name: 'Warm Brown',  percentage: 25 },
    { hex: '#FFF8F0', name: 'Near White',  percentage: 15 },
  ],
  mood: ['focused', 'premium', 'minimal'],
  visualWeight: 'heavy',
  typographyStyle: 'geometric sans-serif',
  layoutPattern: 'hero with feature sections',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';

const SOCIAL_PATTERNS: { pattern: RegExp; targets: TargetArea[] }[] = [
  { pattern: /linkedin\.com/i,          targets: ['content_voice_linkedin']          },
  { pattern: /twitter\.com|x\.com/i,    targets: ['content_voice_twitter']           },
  { pattern: /instagram\.com/i,         targets: ['content_voice_instagram']         },
  { pattern: /tiktok\.com/i,            targets: ['content_voice_tiktok']            },
  { pattern: /youtube\.com|youtu\.be/i, targets: ['content_voice_youtube']           },
  { pattern: /medium\.com/i,            targets: ['content_voice_blog']              },
];

function detectDefaults(url: string, tab: 'url' | 'upload'): TargetArea[] {
  if (tab === 'upload') return ['brand_dna'];
  if (!url.trim()) return ['brand_dna'];
  for (const { pattern, targets } of SOCIAL_PATTERNS) {
    if (pattern.test(url)) return targets;
  }
  return ['brand_dna'];
}

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callAnalyzeInspiration(payload: {
  imageBase64?: string;
  mimeType?: string;
  textContent?: string;
  targetAreas: string[];
}): Promise<{ analysis: InspirationAnalysis; voiceAnalysis?: unknown } | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-inspiration`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.skipped) return null;

    const analysis: InspirationAnalysis = {
      dominantColors: data.colors ?? FALLBACK_ANALYSIS.dominantColors,
      mood: data.mood ?? FALLBACK_ANALYSIS.mood,
      visualWeight: (data.visualWeight as InspirationAnalysis['visualWeight']) ?? 'balanced',
      typographyStyle: data.typography ?? FALLBACK_ANALYSIS.typographyStyle,
      layoutPattern: data.layout ?? FALLBACK_ANALYSIS.layoutPattern,
    };
    return { analysis, voiceAnalysis: data.voiceAnalysis };
  } catch {
    return null;
  }
}

async function callScanUrl(url: string, targetAreas: string[]): Promise<{
  analysis: InspirationAnalysis;
  pageTitle?: string;
  favicon?: string;
  sourceDomain?: string;
  voiceAnalysis?: unknown;
} | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/scan-url`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, targetAreas }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;

    const analysis: InspirationAnalysis = {
      dominantColors: data.colors ?? FALLBACK_ANALYSIS.dominantColors,
      mood: data.mood ?? FALLBACK_ANALYSIS.mood,
      visualWeight: (data.visualWeight as InspirationAnalysis['visualWeight']) ?? 'balanced',
      typographyStyle: data.typography ?? FALLBACK_ANALYSIS.typographyStyle,
      layoutPattern: data.layout ?? FALLBACK_ANALYSIS.layoutPattern,
    };
    return { analysis, pageTitle: data.pageTitle, favicon: data.favicon, sourceDomain: data.sourceDomain, voiceAnalysis: data.voiceAnalysis };
  } catch {
    return null;
  }
}

const GROUP_LABELS: Record<string, string> = {
  brand:     'Brand',
  voice:     'Content Voice — by Platform',
  reference: 'Reference',
};

export function SaveModal() {
  const close          = useUIStore((s) => s.setSaveModalOpen);
  const addInspiration = useSwipeStore((s) => s.addInspiration);

  const [tab,          setTab]          = useState<'url' | 'upload'>('url');
  const [url,          setUrl]          = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [phase,        setPhase]        = useState<'idle' | 'loading' | 'result'>('idle');
  const [stageIdx,     setStageIdx]     = useState(0);
  const [tags,         setTags]         = useState<string[]>(['minimal', 'dark-ui']);
  const [newTag,       setNewTag]       = useState('');
  const [notes,        setNotes]        = useState('');
  const [saved,        setSaved]        = useState(false);
  const [targetAreas,  setTargetAreas]  = useState<TargetArea[]>(['brand_dna']);
  const [analysisResult,   setAnalysisResult]   = useState<InspirationAnalysis>(FALLBACK_ANALYSIS);
  const [previewImage,     setPreviewImage]     = useState<string>(FALLBACK_IMAGE);
  const [analysisError,    setAnalysisError]    = useState(false);
  const [analysisMetadata, setAnalysisMetadata] = useState<unknown>(null);
  const [pageTitle,        setPageTitle]        = useState('');
  const [detectedDomain,   setDetectedDomain]   = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function analyze(file?: File) {
    const defaults = detectDefaults(url, tab);
    setTargetAreas(defaults);
    setPhase('loading');
    setAnalysisError(false);

    const stages = file ? STAGES_IMAGE : STAGES_URL;
    for (let i = 0; i < stages.length; i++) {
      setStageIdx(i);
      await new Promise((r) => setTimeout(r, stages[i].ms));
    }

    const swipeOnly = defaults.length === 1 && defaults[0] === 'swipe_file_only';

    if (!swipeOnly) {
      if (file) {
        const { base64, mimeType } = await fileToBase64(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl);
        const result = await callAnalyzeInspiration({ imageBase64: base64, mimeType, targetAreas: defaults });
        if (result) {
          setAnalysisResult(result.analysis);
          setAnalysisMetadata(result.voiceAnalysis ?? null);
        } else {
          setAnalysisError(true);
        }
      } else if (url.trim()) {
        const result = await callScanUrl(url, defaults);
        if (result) {
          setAnalysisResult(result.analysis);
          setAnalysisMetadata(result.voiceAnalysis ?? null);
          if (result.pageTitle) setPageTitle(result.pageTitle);
          if (result.sourceDomain) setDetectedDomain(result.sourceDomain);
        } else {
          setAnalysisError(true);
        }
      }
    }

    setPhase('result');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      analyze(file);
    }
  }

  function toggleTarget(value: TargetArea, checked: boolean) {
    if (checked) {
      setTargetAreas((prev) => [...prev, value]);
    } else {
      setTargetAreas((prev) => prev.filter((t) => t !== value));
    }
  }

  function selectAll()  { setTargetAreas(TARGET_OPTIONS.map((o) => o.value)); }
  function clearAll()   { setTargetAreas([]); }

  function handleSave() {
    let domain = detectedDomain || 'example.com';
    if (!domain || domain === 'example.com') {
      try { domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch {}
    }
    const title = pageTitle || (url ? `Saved from ${domain}` : (selectedFile?.name ?? 'Uploaded Image'));
    const item: Inspiration = {
      id: Date.now().toString(),
      title,
      sourceUrl: url || '#',
      sourceDomain: domain,
      sourceType: tab === 'upload' ? 'upload' : 'website',
      imageUrl: previewImage,
      tags,
      savedAt: new Date().toISOString(),
      notes,
      analysis: analysisResult,
      targetAreas: targetAreas.length > 0 ? targetAreas : ['brand_dna'],
    };
    addInspiration(item);
    setSaved(true);
    setTimeout(() => close(false), 700);
  }

  function addTag() {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setNewTag('');
  }

  const groupedOptions = TARGET_OPTIONS.reduce<Record<string, typeof TARGET_OPTIONS>>((acc, opt) => {
    if (!acc[opt.group]) acc[opt.group] = [];
    acc[opt.group].push(opt);
    return acc;
  }, {});

  const targetSummary = targetAreas.length === 0
    ? 'None selected'
    : targetAreas.length === TARGET_OPTIONS.length
    ? 'All areas'
    : targetAreas.map((v) => TARGET_OPTIONS.find((o) => o.value === v)?.label ?? v).join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => close(false)} />
      <div className="relative bg-[#3D2B1F] border border-[#4A5568] rounded-2xl w-full max-w-lg animate-scale-in shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#4A5568]">
          <h2 className="font-semibold text-[#FFF8F0]">Save Inspiration</h2>
          <button onClick={() => close(false)} className="text-[#A0644A] hover:text-[#FFF8F0] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Idle */}
        {phase === 'idle' && (
          <div className="p-6 space-y-5">
            <div className="flex gap-1 bg-[#4A5568] rounded-lg p-1">
              {(['url', 'upload'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                    tab === t ? 'bg-[#3D2B1F] text-[#FFF8F0] shadow-sm' : 'text-[#A0644A] hover:text-[#FFE8D6]'
                  }`}
                >
                  {t === 'url' ? <Link2 size={14} /> : <Upload size={14} />}
                  {t === 'url' ? 'Paste URL' : 'Upload Image'}
                </button>
              ))}
            </div>

            {tab === 'url' ? (
              <div>
                <label className="text-xs text-[#FFE8D6] font-medium mb-2 block">URL</label>
                <input
                  autoFocus
                  type="url"
                  placeholder="https://linear.app"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && analyze()}
                  className="w-full bg-[#050505] border border-[#4A5568] rounded-lg px-4 py-2.5 text-sm text-[#FFF8F0] placeholder-[#A0644A] focus:border-[#6B4226]/60 transition-colors"
                />
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#4A5568] rounded-xl p-10 text-center cursor-pointer hover:border-[#6B4226]/40 transition-colors group"
              >
                <Upload size={24} className="mx-auto text-[#A0644A] group-hover:text-[#FFE8D6] transition-colors mb-3" />
                <p className="text-sm text-[#A0644A]">Drop image or <span className="text-[#FFE8D6]">browse</span></p>
                <p className="text-xs text-[#A0644A] mt-1">PNG, JPG, WebP up to 10MB</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            )}

            <button
              onClick={() => analyze()}
              disabled={tab === 'url' && !url.trim()}
              className="w-full py-2.5 rounded-lg bg-[#6B4226] text-[#FFF8F0] font-semibold text-sm hover:bg-[#A0644A] transition-colors btn-press disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Analyze
            </button>
          </div>
        )}

        {/* Loading */}
        {phase === 'loading' && (
          <div className="p-10 flex flex-col items-center gap-6">
            <div className="w-11 h-11 rounded-full border-2 border-[#4A5568] border-t-[#6B4226] animate-spin" />
            <div className="space-y-2 text-center">
              {(selectedFile ? STAGES_IMAGE : STAGES_URL).map((s, i) => (
                <p
                  key={i}
                  className={`text-sm transition-all ${
                    i === stageIdx ? 'text-[#FFF8F0]' :
                    i < stageIdx  ? 'text-[#4A5568] line-through' :
                    'text-[#4A5568]'
                  }`}
                >
                  {s.label}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && (
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {analysisError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#4A5568] border border-[#4A5568]">
                <AlertCircle size={13} className="text-[#F4A832] shrink-0" />
                <p className="text-xs text-[#FFE8D6]">Gemini analysis unavailable — using fallback data. Save will still work.</p>
              </div>
            )}

            <div className="flex gap-4 p-3 bg-[#4A5568] rounded-xl">
              <img src={previewImage} alt="Preview" className="w-20 h-14 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#FFF8F0] truncate">
                  {pageTitle || (url ? `Inspiration from ${detectedDomain || url.split('/')[2] || url}` : (selectedFile?.name ?? 'Uploaded Image'))}
                </p>
                <div className="flex gap-1.5 mt-2">
                  {analysisResult.dominantColors.map((c) => (
                    <div key={c.hex} title={`${c.name} ${c.hex}`} className="w-5 h-5 rounded border border-[#4A5568]" style={{ background: c.hex }} />
                  ))}
                </div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {analysisResult.mood.map((m) => (
                    <span key={m} className="text-[10px] text-[#A0644A] bg-[#4A5568] px-1.5 py-0.5 rounded">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Areas */}
            <div className="bg-[#050505] border border-[#4A5568] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#4A5568]">
                <Target size={14} className="text-[#A0644A]" />
                <span className="text-xs font-semibold text-[#FFF8F0]">Where should this be used?</span>
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={selectAll} className="text-[10px] font-medium text-[#A0644A] hover:text-[#FFE8D6] transition-colors">Select all</button>
                  <span className="text-[#4A5568]">·</span>
                  <button onClick={clearAll}  className="text-[10px] font-medium text-[#A0644A] hover:text-[#FFE8D6] transition-colors">Clear</button>
                </div>
              </div>

              <div className="divide-y divide-[#4A5568]">
                {(['brand', 'voice', 'reference'] as const).map((group) => (
                  <div key={group} className="px-4 py-3 space-y-2.5">
                    <p className="text-[10px] font-semibold text-[#A0644A] uppercase tracking-widest">{GROUP_LABELS[group]}</p>
                    {groupedOptions[group]?.map((opt) => {
                      const checked = targetAreas.includes(opt.value);
                      return (
                        <label key={opt.value} className="flex items-start gap-3 cursor-pointer group">
                          <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                            checked ? 'bg-[#6B4226] border-[#6B4226]' : 'bg-transparent border-[#4A5568] group-hover:border-[#A0644A]'
                          }`}>
                            {checked && <Check size={10} strokeWidth={3} className="text-[#FFF8F0]" />}
                          </div>
                          <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => toggleTarget(opt.value, e.target.checked)} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium transition-colors ${checked ? 'text-[#FFF8F0]' : 'text-[#FFE8D6] group-hover:text-[#FFF8F0]'}`}>{opt.label}</p>
                            <p className="text-[10px] text-[#A0644A] mt-0.5 leading-relaxed">{opt.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>

              {targetAreas.length > 0 && (
                <div className="px-4 py-2.5 bg-[#4A5568]/50 border-t border-[#4A5568]">
                  <p className="text-[10px] text-[#A0644A] leading-relaxed">
                    <span className="text-[#A0644A] font-medium">Gemini will update: </span>
                    {targetSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs text-[#FFE8D6] font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span key={t} onClick={() => setTags(tags.filter((x) => x !== t))} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#4A5568] text-[#FFE8D6] text-xs cursor-pointer hover:bg-[#4A5568] transition-colors">
                    {t} <X size={9} />
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text" placeholder="Add tag..." value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 bg-[#050505] border border-[#4A5568] rounded-lg px-3 py-1.5 text-xs text-[#FFF8F0] placeholder-[#A0644A] focus:border-[#6B4226]/60 transition-colors"
                />
                <button onClick={addTag} className="px-2.5 py-1.5 rounded-lg bg-[#4A5568] text-[#FFE8D6] hover:text-[#FFF8F0] transition-colors">
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-[#FFE8D6] font-medium mb-2 block">Notes</label>
              <textarea
                placeholder="What caught your eye?" value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-[#050505] border border-[#4A5568] rounded-lg px-3 py-2 text-xs text-[#FFF8F0] placeholder-[#A0644A] focus:border-[#6B4226]/60 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={targetAreas.length === 0}
              className="w-full py-2.5 rounded-lg bg-[#6B4226] text-[#FFF8F0] font-semibold text-sm hover:bg-[#A0644A] transition-all btn-press flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saved ? <><Check size={15} /> Saved!</> : 'Save to Swipe File'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
