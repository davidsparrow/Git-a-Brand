import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Inspiration } from '../data/inspirations';

interface SwipeState {
  inspirations: Inspiration[];
  selectedTags: string[];
  searchQuery: string;
  sortBy: 'date' | 'relevance' | 'color';
  viewMode: 'grid' | 'list';
  loading: boolean;
  fetchInspirations: () => Promise<void>;
  addInspiration: (item: Inspiration) => Promise<void>;
  removeInspiration: (id: string) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  updateTags: (id: string, tags: string[]) => Promise<void>;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setSearch: (q: string) => void;
  setSortBy: (s: 'date' | 'relevance' | 'color') => void;
  setViewMode: (m: 'grid' | 'list') => void;
}

interface UIState {
  saveModalOpen: boolean;
  sidebarCollapsed: boolean;
  activeExportFormat: string;
  setSaveModalOpen: (v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveExportFormat: (id: string) => void;
}

function rowToInspiration(row: Record<string, unknown>): Inspiration {
  const analysis = row.analysis as {
    dominantColors: { hex: string; name: string; percentage: number }[];
    mood: string[];
    visualWeight: 'light' | 'balanced' | 'heavy';
    typographyStyle: string;
    layoutPattern: string;
  };
  return {
    id: row.id as string,
    title: row.title as string,
    sourceUrl: row.source_url as string,
    sourceDomain: row.source_domain as string,
    sourceType: row.source_type as Inspiration['sourceType'],
    imageUrl: row.image_url as string,
    tags: row.tags as string[],
    savedAt: row.saved_at as string,
    notes: (row.notes as string) || undefined,
    analysis,
  };
}

export const useSwipeStore = create<SwipeState>()((set, get) => ({
  inspirations: [],
  selectedTags: [],
  searchQuery: '',
  sortBy: 'date',
  viewMode: 'grid',
  loading: true,

  fetchInspirations: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('inspirations')
      .select('*')
      .order('saved_at', { ascending: false });
    if (!error && data) {
      set({ inspirations: data.map(rowToInspiration), loading: false });
    } else {
      set({ loading: false });
    }
  },

  addInspiration: async (item) => {
    const { error } = await supabase.from('inspirations').insert({
      id: item.id,
      title: item.title,
      source_url: item.sourceUrl,
      source_domain: item.sourceDomain,
      source_type: item.sourceType,
      image_url: item.imageUrl,
      tags: item.tags,
      saved_at: item.savedAt,
      notes: item.notes || '',
      analysis: item.analysis,
    });
    if (!error) {
      set((s) => ({ inspirations: [item, ...s.inspirations] }));
    }
  },

  removeInspiration: async (id) => {
    const { error } = await supabase.from('inspirations').delete().eq('id', id);
    if (!error) {
      set((s) => ({ inspirations: s.inspirations.filter((i) => i.id !== id) }));
    }
  },

  updateNotes: async (id, notes) => {
    const { error } = await supabase.from('inspirations').update({ notes }).eq('id', id);
    if (!error) {
      set((s) => ({
        inspirations: s.inspirations.map((i) => (i.id === id ? { ...i, notes } : i)),
      }));
    }
  },

  updateTags: async (id, tags) => {
    const { error } = await supabase.from('inspirations').update({ tags }).eq('id', id);
    if (!error) {
      set((s) => ({
        inspirations: s.inspirations.map((i) => (i.id === id ? { ...i, tags } : i)),
      }));
    }
  },

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
}));

export const useUIStore = create<UIState>()((set) => ({
  saveModalOpen: false,
  sidebarCollapsed: false,
  activeExportFormat: 'claude',
  setSaveModalOpen: (v) => set({ saveModalOpen: v }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setActiveExportFormat: (id) => set({ activeExportFormat: id }),
}));
