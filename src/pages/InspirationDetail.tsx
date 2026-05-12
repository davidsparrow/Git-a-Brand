import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Plus, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSwipeStore } from '../store';

export function InspirationDetail() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const inspirations    = useSwipeStore((s) => s.inspirations);
  const updateNotes     = useSwipeStore((s) => s.updateNotes);
  const updateTags      = useSwipeStore((s) => s.updateTags);
  const removeInspiration = useSwipeStore((s) => s.removeInspiration);
  const item            = inspirations.find((i) => i.id === id);

  const [notes,    setNotes]    = useState(item?.notes ?? '');
  const [newTag,   setNewTag]   = useState('');
  const [tags,     setTags]     = useState(item?.tags ?? []);
  const [saving,   setSaving]   = useState(false);

  if (!item) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#A0644A]">Item not found</p>
        <button onClick={() => navigate('/swipe-file')} className="mt-4 text-[#A0644A] text-sm">
          Back to Swipe File
        </button>
      </div>
    );
  }

  const related = inspirations
    .filter((i) => i.id !== item.id && i.tags.some((t) => tags.includes(t)))
    .slice(0, 6);

  const itemId = item.id;

  async function addTag() {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) {
      const next = [...tags, t];
      setTags(next);
      await updateTags(itemId, next);
    }
    setNewTag('');
  }

  async function removeTag(tag: string) {
    const next = tags.filter((x) => x !== tag);
    setTags(next);
    await updateTags(itemId, next);
  }

  async function saveNotes() {
    setSaving(true);
    await updateNotes(itemId, notes);
    setSaving(false);
  }

  async function handleDelete() {
    await removeInspiration(itemId);
    navigate('/swipe-file');
  }

  return (
    <div className="p-8 page-enter max-w-7xl">
      <div className="flex items-center justify-between mb-6 animate-fade-in-up stagger-1">
        <button
          onClick={() => navigate('/swipe-file')}
          className="flex items-center gap-2 text-sm text-[#A0644A] hover:text-[#FFF8F0] group transition-colors"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Swipe File
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#A0644A] hover:text-[#E53E3E] border border-[#4A5568] hover:border-[#E53E3E]/40 transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>

      <div className="grid grid-cols-5 gap-8 animate-fade-in-up stagger-2">
        <div className="col-span-3">
          <div className="rounded-2xl overflow-hidden border border-[#4A5568] bg-[#3D2B1F]">
            <img src={item.imageUrl} alt={item.title} className="w-full object-cover" />
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-[#FFF8F0] leading-tight mb-2">{item.title}</h1>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#A0644A] hover:text-[#FFE8D6] transition-colors"
            >
              {item.sourceDomain} <ExternalLink size={12} />
            </a>
            <p className="text-xs text-[#A0644A] mt-1">
              {new Date(item.savedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-2 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={3}
              placeholder="What caught your eye?"
              className="w-full bg-[#050505] border border-[#4A5568] rounded-xl px-4 py-3 text-sm text-[#FFF8F0] placeholder-[#A0644A] focus:border-[#6B4226]/60 transition-colors resize-none"
            />
            {saving && <p className="text-[10px] text-[#A0644A] mt-1">Saving...</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  onClick={() => removeTag(t)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#4A5568] text-[#FFE8D6] text-xs cursor-pointer hover:bg-[#4A5568] transition-colors"
                >
                  {t} <X size={9} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="+ tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 bg-[#4A5568] border border-[#4A5568] rounded-md px-3 py-1.5 text-xs text-[#FFF8F0] placeholder-[#A0644A] focus:border-[#6B4226]/60 transition-colors"
              />
              <button onClick={addTag} className="p-1.5 rounded-md bg-[#4A5568] text-[#FFE8D6] hover:text-[#FFF8F0] transition-colors">
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-3 block">Extracted Colors</label>
            <div className="space-y-2">
              {item.analysis.dominantColors.map((c, i) => (
                <div key={c.hex} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border border-[#4A5568] shrink-0" style={{ background: c.hex }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#FFE8D6]">{c.name}</span>
                      <span className="font-mono text-[10px] text-[#A0644A]">{c.hex}</span>
                    </div>
                    <div className="h-1 bg-[#4A5568] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.percentage}%`,
                          background: ['#FFF8F0','#FFF8F0','#FFF3E4'].includes(c.hex) ? '#6B4226' : c.hex,
                          transition: `width 1.2s ease ${i * 0.1}s`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#A0644A] w-7 text-right">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-2 block">Mood</label>
            <div className="flex flex-wrap gap-1.5">
              {item.analysis.mood.map((m) => (
                <span key={m} className="px-2.5 py-1 rounded-full bg-[#4A5568] text-[#FFE8D6] text-xs border border-[#4A5568]">{m}</span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-1 block">Typography</label>
              <p className="text-sm text-[#FFF8F0]">{item.analysis.typographyStyle}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-1 block">Layout Pattern</label>
              <p className="text-sm text-[#FFF8F0]">{item.analysis.layoutPattern}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#FFE8D6] uppercase tracking-wider mb-1 block">Visual Weight</label>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                item.analysis.visualWeight === 'heavy'    ? 'bg-[#4A5568] text-[#FFF8F0]' :
                item.analysis.visualWeight === 'balanced' ? 'bg-[#4A5568] text-[#FFE8D6]' :
                'bg-[#3D2B1F] text-[#A0644A]'
              }`}>
                {item.analysis.visualWeight}
              </span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12 animate-fade-in-up stagger-4">
          <h2 className="text-base font-semibold text-[#FFF8F0] mb-4">Related Inspiration</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {related.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/swipe-file/${rel.id}`)}
                className="shrink-0 w-40 bg-[#3D2B1F] border border-[#4A5568] rounded-xl overflow-hidden cursor-pointer card-hover"
              >
                <div className="h-24 overflow-hidden">
                  <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover" style={{ transition: 'transform 0.3s ease' }} />
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] font-medium text-[#FFF8F0] truncate">{rel.title}</p>
                  <p className="text-[10px] text-[#A0644A] mt-0.5">{rel.sourceDomain}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
