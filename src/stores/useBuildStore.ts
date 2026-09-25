"use client";

import { create } from "zustand";
import type { ActiveBuildSlots, PartSlotKind } from "@/types/tuning.types";

interface BuildState {
  slots: ActiveBuildSlots;

  equipPart: (slot: PartSlotKind, partId: string) => void;
  resetPart: (slot: PartSlotKind) => void;
  resetAllToOem: () => void;
  loadSlots: (slots: Partial<ActiveBuildSlots>) => void;
}

const initialSlots: ActiveBuildSlots = {
  engineId: null,
  transId: null,
  drivelineId: null,
  mountId: null,
  coolingId: null,
  diffId: null,
  turboId: null,
  intakeId: null,
  exhaustId: null,
  brakeId: null,
  suspensionId: null,
  ecuId: null,
};

export const useBuildStore = create<BuildState>((set) => ({
  slots: initialSlots,

  loadSlots: (loaded) =>
    set((state) => ({
      slots: { ...state.slots, ...loaded },
    })),

  equipPart: (slot: PartSlotKind, partId: string) =>
    set((state) => {
      switch (slot) {
        case "engine":
          return { slots: { ...state.slots, engineId: partId } };
        case "transmission":
          return { slots: { ...state.slots, transId: partId } };
        case "driveline":
          return { slots: { ...state.slots, drivelineId: partId } };
        case "mounts":
          return { slots: { ...state.slots, mountId: partId } };
        case "cooling":
          return { slots: { ...state.slots, coolingId: partId } };
        case "differential":
          return { slots: { ...state.slots, diffId: partId } };
        case "turbo":
          return { slots: { ...state.slots, turboId: partId } };
        case "intake":
          return { slots: { ...state.slots, intakeId: partId } };
        case "exhaust":
          return { slots: { ...state.slots, exhaustId: partId } };
        case "brakes":
          return { slots: { ...state.slots, brakeId: partId } };
        case "suspension":
          return { slots: { ...state.slots, suspensionId: partId } };
        case "ecu":
          return { slots: { ...state.slots, ecuId: partId } };
        default:
          return state;
      }
    }),

  resetPart: (slot: PartSlotKind) =>
    set((state) => {
      switch (slot) {
        case "engine":
          return { slots: { ...state.slots, engineId: null } };
        case "transmission":
          return { slots: { ...state.slots, transId: null } };
        case "driveline":
          return { slots: { ...state.slots, drivelineId: null } };
        case "mounts":
          return { slots: { ...state.slots, mountId: null } };
        case "cooling":
          return { slots: { ...state.slots, coolingId: null } };
        case "differential":
          return { slots: { ...state.slots, diffId: null } };
        case "turbo":
          return { slots: { ...state.slots, turboId: null } };
        case "intake":
          return { slots: { ...state.slots, intakeId: null } };
        case "exhaust":
          return { slots: { ...state.slots, exhaustId: null } };
        case "brakes":
          return { slots: { ...state.slots, brakeId: null } };
        case "suspension":
          return { slots: { ...state.slots, suspensionId: null } };
        case "ecu":
          return { slots: { ...state.slots, ecuId: null } };
        default:
          return state;
      }
    }),

  resetAllToOem: () => set({ slots: initialSlots }),
}));
