import { useState } from 'react';
import { Download, Eye, EyeOff, FileText, Heart, Code2, Layers, Database, Sparkles, AlertCircle } from 'lucide-react';
import { BRAND_KIT, EXPORT_FORMATS } from '../data/brandKit';
import { downloadExport, getExportPreview } from '../utils/exporters';
import { useUIStore, useSwipeStore } from '../store';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const ICON_MAP: Record<string, React.ElementType> = { FileText, Heart, Code2, Layers, Database };

const FORMAT_TO_API: Record<string, string> = {
  claude:   'markdown',
  json:     'json',
  css:      'css',
  tailwind: 'tailwind',
  figma:    'figma-tokens',
};

async function generateGuidelinesFromAPI(formatId: string): Promise<string | null> {
  const apiFormat = FORMAT_TO_API[formatId];
  if (!apiFormat) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-brand-guidelines`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format: apiFormat }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content ?? null;
  } catch {
    return null;
  }
}

function downloadContent(content: string, formatId: string) {
  const ext:  Record<string, string> = { claude: 'md', json: 'json', css: 'css', tailwind: 'js', figma: 'json' };
  const mime: Record<string, string> = { claude: 'text/markdown', json: 'application/json', css: 'text/css', tailwind: 'text/javascript', figma: 'application/json' };
  const blob = new Blob([content], { type: mime[formatId] ?? 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `brand-kit.${ext[formatId] ?? 'txt'}`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BrandKit() {
  const activeFormat    = useUIStore((s) => s.activeExportFormat);
  const setActiveFormat = useUIStore((s) => s.setActiveExportFormat);
  const inspirations    = useSwipeStore((s) => s.inspirations);

  const [previewOpen,    setPreviewOpen]    = useState(false);
  const [downloaded,     setDownloaded]     = useState<string | null>(null);
  const [generating,     setGenerating]     = useState<string | null>(null);
  const [generatedCache, setGeneratedCache] = useState<Record<string, string>>({});
  const [genError,       setGenError]       = useState(false);

  const kit       = BRAND_KIT;
  const refAssets = inspirations.filter((i) => kit.referenceAssets.includes(i.id)).slice(0, 6);
  const hasRealData = inspirations.length > 0;

  async function handleDownload(id: string) {
    if (hasRealData && FORMAT_TO_API[id]) {
      setGenerating(id);
      setGenError(false);
      let content = generatedCache[id];
      if (!content) {
        content = (await generateGuidelinesFromAPI(id)) ?? '';
        if (content) {
          setGeneratedCache((prev) => ({ ...prev, [id]: content }));
        } else {
          setGenError(true);
          setGenerating(null);
          downloadExport(id);
          setDownloaded(id);
          setTimeout(() => setDownloaded(null), 2000);
          return;
        }
      }
      setGenerating(null);
      downloadContent(content, id);
      setDownloaded(id);
      setTimeout(() => setDownloaded(null), 2000);
    } else {
      downloadExport(id);
      setDownloaded(id);
      setTimeout(() => setDownloaded(null), 2000);
    }
  }

  async function handlePreview(id: string) {
    if (previewOpen) { setPreviewOpen(false); return; }
    if (hasRealData && FORMAT_TO_API[id] && !generatedCache[id]) {
      setGenerating(id);
      setGenError(false);
      const content = await generateGuidelinesFromAPI(id);
      setGenerating(null);
      if (content) {
        setGeneratedCache((prev) => ({ ...prev, [id]: content }));
      } else {
        setGenError(true);
        return;
      }
    }
    setPreviewOpen(true);
  }

  return (
    <div className="p-8 page-enter">
      <div className="mb-8 animate-fade-in-up stagger-1">
        <h1 className="text-2xl font-bold text-[#FFF8F0] tracking-tight">Brand Kit</h1>
        <p className="text-sm text-[#A0644A] mt-1">Your portable design identity</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Preview panel */}
        <div className="col-span-2 space-y-6 animate-fade-in-up stagger-2">

          {/* Colors */}
          <section className="bg-[#3D2B1F] border border-[#4A5568] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#FFF8F0] mb-5">Colors</h2>
            <div className="space-y-1.5">
              {kit.colors.map((c) => (
                <div key={c.hex} className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-[#4A5568]/50 transition-colors">
                  <div
                    className="w-10 h-10 rounded-lg border border-[#4A5568] shrink-0 flex items-center justify-center font-mono text-[10px] font-bold"
                    style={{ background: c.hex, color: c.textColor }}
                  >
                    {c.hex.slice(1, 4)}
                  </div>
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-semibold text-[#FFF8F0]">{c.role}</p>
                    <p className="text-[10px] text-[#A0644A]">{c.name}</p>
                  </div>
                  <p className="font-mono text-xs text-[#A0644A]">{c.hex}</p>
                  <p className="text-xs text-[#A0644A] ml-auto text-right max-w-[180px] leading-snug">{c.usage}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="bg-[#3D2B1F] border border-[#4A5568] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#FFF8F0] mb-5">Typography</h2>
            <div className="space-y-4">
              <div className="bg-[#4A5568] rounded-xl p-5">
                <p className="text-xs text-[#A0644A] mb-2 uppercase tracking-wider">Heading — DM Sans Bold</p>
                <p className="text-2xl font-bold text-[#FFF8F0]">{kit.typography.heading.sample}</p>
              </div>
              <div className="bg-[#4A5568] rounded-xl p-5">
                <p className="text-xs text-[#A0644A] mb-2 uppercase tracking-wider">Body — DM Sans Regular</p>
                <p className="text-sm text-[#FFE8D6] leading-relaxed">{kit.typography.body.sample}</p>
              </div>
              <div className="bg-[#4A5568] rounded-xl p-5">
                <p className="text-xs text-[#A0644A] mb-2 uppercase tracking-wider">Mono — JetBrains Mono</p>
                <p className="font-mono text-sm text-[#38A169]">{kit.typography.mono.sample}</p>
              </div>
              <div className="bg-[#4A5568] rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs text-[#A0644A]">Type Scale</span>
                <span className="text-sm font-semibold text-[#FFF8F0]">{kit.typography.scale}</span>
              </div>
            </div>
          </section>

          {/* Voice */}
          <section className="bg-[#3D2B1F] border border-[#4A5568] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#FFF8F0] mb-5">Tone of Voice</h2>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-2">Descriptors</p>
                <div className="flex flex-wrap gap-1.5">
                  {kit.voice.descriptors.map((d) => (
                    <span key={d} className="px-2.5 py-1 rounded-md bg-[#4A5568] text-[#FFE8D6] text-xs border border-[#4A5568]">{d}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-2">Avoid</p>
                <div className="flex flex-wrap gap-1.5">
                  {kit.voice.avoid.map((a) => (
                    <span key={a} className="px-2.5 py-1 rounded-md bg-[#4A5568] text-[#A0644A] text-xs line-through">{a}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {kit.voice.examples.map((ex, i) => (
                <div key={i} className="bg-[#4A5568] rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-[#38A169] font-bold mt-0.5 shrink-0">✓ GOOD</span>
                    <p className="text-xs text-[#FFF8F0]">{ex.good}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-[#E53E3E] font-bold mt-0.5 shrink-0">✗ AVOID</span>
                    <p className="text-xs text-[#A0644A] line-through">{ex.bad}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reference Assets */}
          {refAssets.length > 0 && (
            <section className="bg-[#3D2B1F] border border-[#4A5568] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#FFF8F0] mb-4">Reference Assets</h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {refAssets.map((item) => (
                  <div key={item.id} className="shrink-0 w-28 rounded-xl overflow-hidden border border-[#4A5568]">
                    <img src={item.imageUrl} alt={item.title} className="w-full object-cover" style={{ height: 72 }} />
                    <div className="p-2">
                      <p className="text-[10px] text-[#A0644A] truncate">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Export panel */}
        <div className="space-y-4 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#FFE8D6] uppercase tracking-wider">Export Formats</h2>
            {hasRealData && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-[#A0644A] bg-[#6B4226]/10 px-2 py-0.5 rounded-full border border-[#6B4226]/20">
                <Sparkles size={9} /> AI-Generated
              </span>
            )}
          </div>

          {genError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#4A5568] border border-[#4A5568]">
              <AlertCircle size={12} className="text-[#F4A832] shrink-0" />
              <p className="text-[10px] text-[#FFE8D6]">Generation failed — using template fallback</p>
            </div>
          )}

          <div className="space-y-2">
            {EXPORT_FORMATS.map((fmt) => {
              const Icon      = ICON_MAP[fmt.icon] ?? FileText;
              const isActive  = activeFormat === fmt.id;
              const isLoading = generating === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => { setActiveFormat(fmt.id); setPreviewOpen(false); setGenError(false); }}
                  className={`rounded-xl p-4 cursor-pointer border transition-all ${
                    isActive ? 'border-[#6B4226]/50 bg-[#3D2B1F]' : 'bg-[#3D2B1F] border-[#4A5568] hover:border-[#6B4226]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#6B4226]/20' : 'bg-[#4A5568]'}`}>
                      <Icon size={15} className={isActive ? 'text-[#A0644A]' : 'text-[#A0644A]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#FFF8F0] truncate">{fmt.name}</p>
                      <span className="font-mono text-[10px] text-[#A0644A]">{fmt.ext}</span>
                    </div>
                    {hasRealData && FORMAT_TO_API[fmt.id] && (
                      <span className="text-[9px] font-bold text-[#A0644A] bg-[#6B4226]/10 px-1.5 py-0.5 rounded border border-[#6B4226]/20">AI</span>
                    )}
                  </div>
                  <p className="text-xs text-[#A0644A] leading-relaxed">{fmt.description}</p>

                  {isActive && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreview(fmt.id); }}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#4A5568] text-xs text-[#FFE8D6] hover:text-[#FFF8F0] transition-colors disabled:opacity-40"
                      >
                        {isLoading ? (
                          <><div className="w-3 h-3 rounded-full border border-[#6B4226] border-t-[#6B4226] animate-spin" />Generating...</>
                        ) : previewOpen ? (
                          <><EyeOff size={12} />Hide</>
                        ) : (
                          <><Eye size={12} />Preview</>
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(fmt.id); }}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#6B4226] text-[#FFF8F0] text-xs font-semibold hover:bg-[#A0644A] transition-colors btn-press disabled:opacity-40"
                      >
                        <Download size={12} />
                        {isLoading ? 'Generating...' : downloaded === fmt.id ? 'Done!' : 'Download'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {previewOpen && (
            <div className="bg-[#0D0D0F] border border-[#4A5568] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#4A5568]">
                <span className="font-mono text-xs text-[#A0644A]">preview</span>
                <button
                  onClick={() => handleDownload(activeFormat)}
                  disabled={generating === activeFormat}
                  className="text-xs text-[#A0644A] hover:text-[#FFE8D6] transition-colors disabled:opacity-40"
                >
                  Download
                </button>
              </div>
              <pre className="p-4 text-[10px] text-[#FFE8D6] font-mono overflow-auto max-h-72 leading-relaxed whitespace-pre-wrap break-all">
                {(generatedCache[activeFormat] ?? getExportPreview(activeFormat)).slice(0, 2500)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
