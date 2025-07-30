import { create } from 'zustand';

export const useChartSettingsStore = create((set) => ({
  chartType: 'candlestick', 
  setChartType: (type) => set({ chartType: type }),
}));
