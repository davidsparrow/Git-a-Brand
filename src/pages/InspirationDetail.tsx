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
        <p className="text-[#71717A]">Item not found</p>
        <button onClick={() => navigate('/swipe-file')} className="mt-4 text-[#A78BFA] text-sm">
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
          className="flex items-center gap-2 text-sm text-[#71717A] hover:text-[#FAFAFA] group transition-colors"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Swipe File
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#71717A] hover:text-[#EF4444] border border-[#3F3F46] hover:border-[#EF4444]/40 transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>

      <div className="grid grid-cols-5 gap-8 animate-fade-in-up stagger-2">
        <div className="col-span-3">
          <div className="rounded-2xl overflow-hidden border border-[#3F3F46] bg-[#18181B]">
            <img src={item.imageUrl} alt={item.title} className="w-full object-cover" />
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-[#FAFAFA] leading-tight mb-2">{item.title}</h1>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#A78BFA] hover:text-[#C4B5FD] transition-colors"
            >
              {item.sourceDomain} <ExternalLink size={12} />
            </a>
            <p className="text-xs text-[#52525B] mt-1">
              {new Date(item.savedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={3}
              placeholder="What caught your eye?"
              className="w-full bg-[#09090B] border border-[#3F3F46] rounded-xl px-4 py-3 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:border-[#A78BFA]/60 transition-colors resize-none"
            />
            {saving && <p className="text-[10px] text-[#52525B] mt-1">Saving...</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  onClick={() => removeTag(t)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#27272A] text-[#A1A1AA] text-xs cursor-pointer hover:bg-[#3F3F46] transition-colors"
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
                className="flex-1 bg-[#27272A] border border-[#3F3F46] rounded-md px-3 py-1.5 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-[#A78BFA]/60 transition-colors"
              />
              <button onClick={addTag} className="p-1.5 rounded-md bg-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3 block">Extracted Colors</label>
            <div className="space-y-2">
              {item.analysis.dominantColors.map((c, i) => (
                <div key={c.hex} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border border-[#3F3F46] shrink-0" style={{ background: c.hex }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#A1A1AA]">{c.name}</span>
                      <span className="font-mono text-[10px] text-[#52525B]">{c.hex}</span>
                    </div>
                    <div className="h-1 bg-[#27272A] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.percentage}%`,
                          background: ['#FFFFFF','#FAFAFA','#F5F5F5'].includes(c.hex) ? '#A78BFA' : c.hex,
                          transition: `width 1.2s ease ${i * 0.1}s`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#52525B] w-7 text-right">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2 block">Mood</label>
            <div className="flex flex-wrap gap-1.5">
              {item.analysis.mood.map((m) => (
                <span key={m} className="px-2.5 py-1 rounded-full bg-[#27272A] text-[#A1A1AA] text-xs border border-[#3F3F46]">{m}</span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1 block">Typography</label>
              <p className="text-sm text-[#FAFAFA]">{item.analysis.typographyStyle}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1 block">Layout Pattern</label>
              <p className="text-sm text-[#FAFAFA]">{item.analysis.layoutPattern}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1 block">Visual Weight</label>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                item.analysis.visualWeight === 'heavy'    ? 'bg-[#3F3F46] text-[#FAFAFA]' :
                item.analysis.visualWeight === 'balanced' ? 'bg-[#27272A] text-[#A1A1AA]' :
                'bg-[#18181B] text-[#71717A]'
              }`}>
                {item.analysis.visualWeight}
              </span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12 animate-fade-in-up stagger-4">
          <h2 className="text-base font-semibold text-[#FAFAFA] mb-4">Related Inspiration</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {related.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/swipe-file/${rel.id}`)}
                className="shrink-0 w-40 bg-[#18181B] border border-[#3F3F46] rounded-xl overflow-hidden cursor-pointer card-hover"
              >
                <div className="h-24 overflow-hidden">
                  <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover" style={{ transition: 'transform 0.3s ease' }} />
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] font-medium text-[#FAFAFA] truncate">{rel.title}</p>
                  <p className="text-[10px] text-[#71717A] mt-0.5">{rel.sourceDomain}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
