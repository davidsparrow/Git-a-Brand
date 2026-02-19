import { useState } from 'react';
import { Download, Eye, EyeOff, FileText, Heart, Code2, Layers, Database } from 'lucide-react';
import { BRAND_KIT, EXPORT_FORMATS } from '../data/brandKit';
import { downloadExport, getExportPreview } from '../utils/exporters';
import { useUIStore, useSwipeStore } from '../store';

const ICON_MAP: Record<string, React.ElementType> = { FileText, Heart, Code2, Layers, Database };

export function BrandKit() {
  const activeFormat    = useUIStore((s) => s.activeExportFormat);
  const setActiveFormat = useUIStore((s) => s.setActiveExportFormat);
  const inspirations    = useSwipeStore((s) => s.inspirations);
  const [previewOpen,   setPreviewOpen]   = useState(false);
  const [downloaded,    setDownloaded]    = useState<string | null>(null);

  const kit       = BRAND_KIT;
  const refAssets = inspirations.filter((i) => kit.referenceAssets.includes(i.id)).slice(0, 6);

  function handleDownload(id: string) {
    downloadExport(id);
    setDownloaded(id);
    setTimeout(() => setDownloaded(null), 2000);
  }

  return (
    <div className="p-8 page-enter">
      <div className="mb-8 animate-fade-in-up stagger-1">
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Brand Kit</h1>
        <p className="text-sm text-[#71717A] mt-1">Your portable design identity</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Preview panel */}
        <div className="col-span-2 space-y-6 animate-fade-in-up stagger-2">

          {/* Colors */}
          <section className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#FAFAFA] mb-5">Colors</h2>
            <div className="space-y-1.5">
              {kit.colors.map((c) => (
                <div key={c.hex} className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-[#27272A]/50 transition-colors">
                  <div
                    className="w-10 h-10 rounded-lg border border-[#3F3F46] shrink-0 flex items-center justify-center font-mono text-[10px] font-bold"
                    style={{ background: c.hex, color: c.textColor }}
                  >
                    {c.hex.slice(1, 4)}
                  </div>
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-semibold text-[#FAFAFA]">{c.role}</p>
                    <p className="text-[10px] text-[#71717A]">{c.name}</p>
                  </div>
                  <p className="font-mono text-xs text-[#52525B]">{c.hex}</p>
                  <p className="text-xs text-[#71717A] ml-auto text-right max-w-[180px] leading-snug">{c.usage}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#FAFAFA] mb-5">Typography</h2>
            <div className="space-y-4">
              <div className="bg-[#27272A] rounded-xl p-5">
                <p className="text-xs text-[#71717A] mb-2 uppercase tracking-wider">Heading — Inter Bold</p>
                <p className="text-2xl font-bold text-[#FAFAFA]">{kit.typography.heading.sample}</p>
              </div>
              <div className="bg-[#27272A] rounded-xl p-5">
                <p className="text-xs text-[#71717A] mb-2 uppercase tracking-wider">Body — Inter Regular</p>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{kit.typography.body.sample}</p>
              </div>
              <div className="bg-[#27272A] rounded-xl p-5">
                <p className="text-xs text-[#71717A] mb-2 uppercase tracking-wider">Mono — JetBrains Mono</p>
                <p className="font-mono text-sm text-[#34D399]">{kit.typography.mono.sample}</p>
              </div>
              <div className="bg-[#27272A] rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs text-[#71717A]">Type Scale</span>
                <span className="text-sm font-semibold text-[#FAFAFA]">{kit.typography.scale}</span>
              </div>
            </div>
          </section>

          {/* Voice */}
          <section className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#FAFAFA] mb-5">Tone of Voice</h2>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Descriptors</p>
                <div className="flex flex-wrap gap-1.5">
                  {kit.voice.descriptors.map((d) => (
                    <span key={d} className="px-2.5 py-1 rounded-md bg-[#27272A] text-[#A1A1AA] text-xs border border-[#3F3F46]">{d}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Avoid</p>
                <div className="flex flex-wrap gap-1.5">
                  {kit.voice.avoid.map((a) => (
                    <span key={a} className="px-2.5 py-1 rounded-md bg-[#27272A] text-[#71717A] text-xs line-through">{a}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {kit.voice.examples.map((ex, i) => (
                <div key={i} className="bg-[#27272A] rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-[#34D399] font-bold mt-0.5 shrink-0">✓ GOOD</span>
                    <p className="text-xs text-[#FAFAFA]">{ex.good}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-[#F87171] font-bold mt-0.5 shrink-0">✗ AVOID</span>
                    <p className="text-xs text-[#71717A] line-through">{ex.bad}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reference Assets */}
          {refAssets.length > 0 && (
            <section className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#FAFAFA] mb-4">Reference Assets</h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {refAssets.map((item) => (
                  <div key={item.id} className="shrink-0 w-28 rounded-xl overflow-hidden border border-[#3F3F46]">
                    <img src={item.imageUrl} alt={item.title} className="w-full object-cover" style={{ height: 72 }} />
                    <div className="p-2">
                      <p className="text-[10px] text-[#71717A] truncate">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Export panel */}
        <div className="space-y-4 animate-fade-in-up stagger-3">
          <h2 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider">Export Formats</h2>

          <div className="space-y-2">
            {EXPORT_FORMATS.map((fmt) => {
              const Icon     = ICON_MAP[fmt.icon] ?? FileText;
              const isActive = activeFormat === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => { setActiveFormat(fmt.id); setPreviewOpen(false); }}
                  className={`rounded-xl p-4 cursor-pointer border transition-all ${
                    isActive ? 'border-[#A78BFA]/50 bg-[#1F1A2E]' : 'bg-[#18181B] border-[#3F3F46] hover:border-[#52525B]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#A78BFA]/20' : 'bg-[#27272A]'}`}>
                      <Icon size={15} className={isActive ? 'text-[#A78BFA]' : 'text-[#71717A]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#FAFAFA] truncate">{fmt.name}</p>
                      <span className="font-mono text-[10px] text-[#52525B]">{fmt.ext}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#71717A] leading-relaxed">{fmt.description}</p>

                  {isActive && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewOpen(!previewOpen); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#27272A] text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                      >
                        {previewOpen ? <EyeOff size={12} /> : <Eye size={12} />}
                        {previewOpen ? 'Hide' : 'Preview'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(fmt.id); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#A78BFA] text-[#09090B] text-xs font-semibold hover:bg-[#C4B5FD] transition-colors btn-press"
                      >
                        <Download size={12} />
                        {downloaded === fmt.id ? 'Done!' : 'Download'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {previewOpen && (
            <div className="bg-[#0D0D0F] border border-[#3F3F46] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#3F3F46]">
                <span className="font-mono text-xs text-[#71717A]">preview</span>
                <button onClick={() => handleDownload(activeFormat)} className="text-xs text-[#A78BFA] hover:text-[#C4B5FD] transition-colors">
                  Download
                </button>
              </div>
              <pre className="p-4 text-[10px] text-[#A1A1AA] font-mono overflow-auto max-h-72 leading-relaxed whitespace-pre-wrap break-all">
                {getExportPreview(activeFormat).slice(0, 2500)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
