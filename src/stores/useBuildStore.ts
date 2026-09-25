"use client";

import { create } from "zustand";
import type { ActiveBuildSlots, PartSlotKind } from "@/types/tuning.types";

interface BuildState {
  slots: ActiveBuildSlots;

  equipPart: (slot: PartSlotKind, partId: string) => void;
  resetPart: (slot: PartSlotKind) => void;
  resetAllToOem: () => void;
}

const initialSlots: ActiveBuildSlots = {
  engineId: null,
  transId: null,
  drivelineId: null,
  turboId: null,
  intakeId: null,
  exhaustId: null,
  brakeId: null,
  suspensionId: null,
  ecuId: null,
};

export const useBuildStore = create<BuildState>((set) => ({
  slots: initialSlots,

  equipPart: (slot: PartSlotKind, partId: string) =>
    set((state) => {
      switch (slot) {
        case "engine":
          return { slots: { ...state.slots, engineId: partId } };
        case "transmission":
          return { slots: { ...state.slots, transId: partId } };
        case "driveline":
          return { slots: { ...state.slots, drivelineId: partId } };
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
