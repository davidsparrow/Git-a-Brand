import { Search, Plus } from 'lucide-react';
import { useUIStore, useSwipeStore } from '../../store';

export function Topbar() {
  const setSaveModal  = useUIStore((s) => s.setSaveModalOpen);
  const setSearch     = useSwipeStore((s) => s.setSearch);
  const searchQuery   = useSwipeStore((s) => s.searchQuery);

  return (
    <header className="h-14 border-b border-[#3F3F46] glass sticky top-0 z-10 flex items-center justify-between px-6 gap-4 shrink-0">
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B] pointer-events-none" />
        <input
          type="text"
          placeholder="Search inspiration..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#18181B] border border-[#3F3F46] rounded-lg pl-9 pr-4 py-2 text-sm text-[#FAFAFA] placeholder-[#52525B] focus:border-[#A78BFA]/60 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setSaveModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#A78BFA] text-[#09090B] font-semibold text-sm hover:bg-[#C4B5FD] transition-colors btn-press"
        >
          <Plus size={14} />
          Save
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[#3F3F46]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#5E6AD2] flex items-center justify-center text-white text-xs font-bold shrink-0">
            AC
          </div>
          <span className="text-sm text-[#A1A1AA] font-medium whitespace-nowrap">Alex Chen</span>
        </div>
      </div>
    </header>
  );
}
