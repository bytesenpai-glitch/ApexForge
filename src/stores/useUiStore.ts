"use client";

import { create } from "zustand";
import type { Fitment, PartSlotKind, ViewMode } from "@/types/tuning.types";

interface UiState {
  viewMode: ViewMode;
  activeDrawerSlot: PartSlotKind | null;
  drawerSearch: string;
  drawerFitment: "all" | Fitment;
  activeTab: PartSlotKind;
  toastMessage: string | null;
  expandedManuals: Record<string, boolean>;
  isGarageModalOpen: boolean;

  setViewMode: (mode: ViewMode) => void;
  openDrawer: (slot: PartSlotKind) => void;
  closeDrawer: () => void;
  setDrawerSearch: (query: string) => void;
  setDrawerFitment: (fitment: "all" | Fitment) => void;
  setActiveTab: (tab: PartSlotKind) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  toggleManual: (id: string) => void;
  openGarageModal: () => void;
  closeGarageModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  viewMode: "garage",
  activeDrawerSlot: null,
  drawerSearch: "",
  drawerFitment: "all",
  activeTab: "engine",
  toastMessage: null,
  expandedManuals: {},
  isGarageModalOpen: false,

  setViewMode: (viewMode) => set({ viewMode }),
  openDrawer: (slot) => set({ activeDrawerSlot: slot, drawerSearch: "", drawerFitment: "all" }),
  closeDrawer: () => set({ activeDrawerSlot: null }),
  setDrawerSearch: (drawerSearch) => set({ drawerSearch }),
  setDrawerFitment: (drawerFitment) => set({ drawerFitment }),
  setActiveTab: (activeTab) => set({ activeTab }),
  showToast: (toastMessage) => set({ toastMessage }),
  clearToast: () => set({ toastMessage: null }),
  openGarageModal: () => set({ isGarageModalOpen: true }),
  closeGarageModal: () => set({ isGarageModalOpen: false }),
  toggleManual: (id) =>
    set((state) => ({
      expandedManuals: {
        ...state.expandedManuals,
        [id]: !state.expandedManuals[id],
      },
    })),
}));
