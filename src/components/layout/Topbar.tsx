import { Search, Plus } from 'lucide-react';
import { useUIStore, useSwipeStore } from '../../store';

export function Topbar() {
  const setSaveModal  = useUIStore((s) => s.setSaveModalOpen);
  const setSearch     = useSwipeStore((s) => s.setSearch);
  const searchQuery   = useSwipeStore((s) => s.searchQuery);

  return (
    <header className="h-14 border-b border-[#4A5568] glass sticky top-0 z-10 flex items-center justify-between px-6 gap-4 shrink-0">
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0644A] pointer-events-none" />
        <input
          type="text"
          placeholder="Search inspiration..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#3D2B1F] border border-[#4A5568] rounded-lg pl-9 pr-4 py-2 text-sm text-[#FFF8F0] placeholder-[#A0644A] focus:border-[#6B4226]/60 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setSaveModal(true)}
          className="flex h-8 items-center gap-2 px-3 rounded-lg bg-[#6B4226] text-[#FFF8F0] font-semibold text-sm hover:bg-[#A0644A] transition-colors btn-press"
        >
          <Plus size={14} />
          Save
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[#4A5568]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6B4226] to-[#4A5568] flex items-center justify-center text-[#FFF8F0] text-xs font-bold shrink-0">
            AC
          </div>
          <span className="text-sm text-[#FFE8D6] font-medium whitespace-nowrap">Alex Chen</span>
        </div>
      </div>
    </header>
  );
}
