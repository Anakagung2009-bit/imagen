import { create } from "zustand";

interface CreditStore {
  credits: number | null;
  setCredits: (value: number) => void;
  adjustCredits: (delta: number) => void;
}

export const useCreditStore = create<CreditStore>((set) => ({
  credits: null,
  setCredits: (value) => set({ credits: value }),
  adjustCredits: (delta) =>
    set((state) => ({ credits: (state.credits || 0) + delta })),
}));
