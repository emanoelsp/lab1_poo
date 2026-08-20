import { create } from "zustand";

interface SurpriseState {
  isActive: boolean;
  messages: Record<string, string>;
  requirements: Record<string, string[]>;
  setSurprise: (
    isActive: boolean,
    messages: Record<string, string>,
    requirements: Record<string, string[]>
  ) => void;
  dismiss: () => void;
}

export const useSurpriseStore = create<SurpriseState>((set) => ({
  isActive: false,
  messages: {},
  requirements: {},
  setSurprise: (isActive, messages, requirements) =>
    set({ isActive, messages, requirements }),
  dismiss: () => set({ isActive: false }),
}));
