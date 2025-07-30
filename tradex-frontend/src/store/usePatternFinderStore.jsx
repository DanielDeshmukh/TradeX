import { create } from 'zustand';

export const usePatternFinderStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  

    matchedSegments: [],

  setMatchedSegments: (segments) => set({ matchedSegments: segments }),

  clearMatchedSegments: () => set({ matchedSegments: [] }),
}));