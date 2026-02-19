import { useNavigate } from 'react-router-dom';
import { Grid3X3, List, ChevronDown, X, ExternalLink } from 'lucide-react';
import { useSwipeStore } from '../store';
import type { Inspiration } from '../data/inspirations';

const ALL_TAGS = [
  'dark-ui', 'minimal', 'saas', 'editorial', 'gradient', 'bold-type',
  'developer-tools', 'brand-identity', 'luxury', 'typography', 'dashboard',
  'portfolio', 'e-commerce', 'animation', 'systematic',
];

const SORT_OPTIONS = [
  { value: 'date',      label: 'Date Added' },
  { value: 'relevance', label: 'Relevance'  },
  { value: 'color',     label: 'Color'      },
];

function GridCard({ item }: { item: Inspiration }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/swipe-file/${item.id}`)}
      className="masonry-item insp-card bg-[#18181B] border border-[#3F3F46] rounded-xl overflow-hidden cursor-pointer card-hover relative"
    >
      <div className="img-wrap overflow-hidden">
        <img src={item.imageUrl} alt={item.title} className="w-full object-cover" loading="lazy" />
      </div>
      {/* Overlay */}
      <div className="overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3 pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); window.open(item.sourceUrl, '_blank'); }}
          className="self-end bg-[#A78BFA] text-[#09090B] text-xs font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#C4B5FD] transition-colors pointer-events-auto"
        >
          View <ExternalLink size={10} />
        </button>
        <div>
          <p className="text-xs font-medium text-white">{item.title}</p>
          <p className="text-[10px] text-white/60 mt-0.5">{item.sourceDomain}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-[#27272A] text-[#71717A] text-[10px]">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListCard({ item }: { item: Inspiration }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/swipe-file/${item.id}`)}
      className="flex gap-4 bg-[#18181B] border border-[#3F3F46] rounded-xl p-4 cursor-pointer card-hover items-center"
    >
      <img src={item.imageUrl} alt={item.title} className="w-16 h-12 object-cover rounded-lg shrink-0" loading="lazy" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-[#FAFAFA] truncate">{item.title}</h3>
        <p className="text-xs text-[#71717A]">{item.sourceDomain}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        {item.tags.slice(0, 3).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-md bg-[#27272A] text-[#71717A] text-[10px]">{t}</span>
        ))}
      </div>
      <div className="flex gap-1.5 shrink-0 ml-2">
        {item.analysis.dominantColors.slice(0, 3).map((c) => (
          <div key={c.hex} className="w-4 h-4 rounded border border-[#3F3F46]" style={{ background: c.hex }} />
        ))}
      </div>
      <span className="text-xs text-[#52525B] shrink-0 ml-2 whitespace-nowrap">
        {new Date(item.savedAt).toLocaleDateString()}
      </span>
    </div>
  );
}

export function SwipeFile() {
  const inspirations  = useSwipeStore((s) => s.inspirations);
  const selectedTags  = useSwipeStore((s) => s.selectedTags);
  const searchQuery   = useSwipeStore((s) => s.searchQuery);
  const sortBy        = useSwipeStore((s) => s.sortBy);
  const viewMode      = useSwipeStore((s) => s.viewMode);
  const toggleTag     = useSwipeStore((s) => s.toggleTag);
  const clearTags     = useSwipeStore((s) => s.clearTags);
  const setSortBy     = useSwipeStore((s) => s.setSortBy);
  const setViewMode   = useSwipeStore((s) => s.setViewMode);

  const filtered = inspirations.filter((item) => {
    const matchTags   = selectedTags.length === 0 || selectedTags.every((t) => item.tags.includes(t));
    const q           = searchQuery.toLowerCase();
    const matchSearch = !q ||
      item.title.toLowerCase().includes(q) ||
      item.sourceDomain.toLowerCase().includes(q) ||
      item.tags.some((t) => t.includes(q));
    return matchTags && matchSearch;
  });

  return (
    <div className="p-8 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in-up stagger-1">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Swipe File</h1>
          <p className="text-sm text-[#71717A] mt-1">Your curated visual inspiration</p>
        </div>
        <span className="mt-1 px-2.5 py-1 rounded-full bg-[#27272A] text-[#A1A1AA] text-xs font-medium">
          {filtered.length} items
        </span>
      </div>

      {/* Tag filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5 animate-fade-in-up stagger-2">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedTags.includes(tag) ? 'tag-active' : 'border-[#3F3F46] text-[#71717A] hover:text-[#A1A1AA] hover:border-[#52525B]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={clearTags}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-[#71717A] hover:text-[#FAFAFA] border border-[#3F3F46] transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up stagger-3">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'relevance' | 'color')}
            className="appearance-none bg-[#18181B] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-[#A1A1AA] pr-8 focus:border-[#A78BFA]/60 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B] pointer-events-none" />
        </div>

        <div className="ml-auto flex items-center gap-1 bg-[#18181B] border border-[#3F3F46] rounded-lg p-1">
          {(['grid', 'list'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`p-2 rounded-md transition-colors ${viewMode === m ? 'bg-[#27272A] text-[#FAFAFA]' : 'text-[#52525B] hover:text-[#A1A1AA]'}`}
            >
              {m === 'grid' ? <Grid3X3 size={15} /> : <List size={15} />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#52525B] text-sm">No items match your filters</p>
          <button onClick={clearTags} className="mt-3 text-xs text-[#A78BFA] hover:text-[#C4B5FD] transition-colors">
            Clear filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="masonry-grid animate-fade-in-up stagger-4">
          {filtered.map((item) => <GridCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in-up stagger-4">
          {filtered.map((item) => <ListCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
