import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DUMMY_INSPIRATIONS, type Inspiration } from '../data/inspirations';

interface SwipeState {
  inspirations: Inspiration[];
  selectedTags: string[];
  searchQuery: string;
  sortBy: 'date' | 'relevance' | 'color';
  viewMode: 'grid' | 'list';
  addInspiration: (item: Inspiration) => void;
  removeInspiration: (id: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setSearch: (q: string) => void;
  setSortBy: (s: 'date' | 'relevance' | 'color') => void;
  setViewMode: (m: 'grid' | 'list') => void;
  resetDemo: () => void;
}

interface UIState {
  saveModalOpen: boolean;
  sidebarCollapsed: boolean;
  activeExportFormat: string;
  setSaveModalOpen: (v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveExportFormat: (id: string) => void;
}

export const useSwipeStore = create<SwipeState>()(
  persist(
    (set) => ({
      inspirations: DUMMY_INSPIRATIONS,
      selectedTags: [],
      searchQuery: '',
      sortBy: 'date',
      viewMode: 'grid',
      addInspiration: (item) => set((s) => ({ inspirations: [item, ...s.inspirations] })),
      removeInspiration: (id) => set((s) => ({ inspirations: s.inspirations.filter((i) => i.id !== id) })),
      toggleTag: (tag) =>
        set((s) => ({
          selectedTags: s.selectedTags.includes(tag)
            ? s.selectedTags.filter((t) => t !== tag)
            : [...s.selectedTags, tag],
        })),
      clearTags: () => set({ selectedTags: [] }),
      setSearch: (searchQuery) => set({ searchQuery }),
      setSortBy: (sortBy) => set({ sortBy }),
      setViewMode: (viewMode) => set({ viewMode }),
      resetDemo: () =>
        set({ inspirations: DUMMY_INSPIRATIONS, selectedTags: [], searchQuery: '', sortBy: 'date', viewMode: 'grid' }),
    }),
    {
      name: 'gitabrand-swipe',
      partialize: (state) => ({
        inspirations: state.inspirations,
        sortBy: state.sortBy,
        viewMode: state.viewMode,
      }),
    },
  ),
);

export const useUIStore = create<UIState>()((set) => ({
  saveModalOpen: false,
  sidebarCollapsed: false,
  activeExportFormat: 'claude',
  setSaveModalOpen: (v) => set({ saveModalOpen: v }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setActiveExportFormat: (id) => set({ activeExportFormat: id }),
}));
