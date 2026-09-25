"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActiveBuildSlots } from "@/types/tuning.types";
import type { ApexExportFile, BuildPreset, SavedBuild } from "@/types/garage.types";
import { CURATED_PRESETS } from "@/domain/presets/curatedPresets";

interface GarageState {
  savedBuilds: SavedBuild[];
  activePresetId: string | null;

  // Actions
  saveCurrentBuild: (params: {
    name: string;
    description?: string;
    vehicleId: string;
    slots: Partial<ActiveBuildSlots>;
    tags?: string[];
    telemetrySummary?: {
      powerHp: number;
      torqueNm: number;
      weightKg: number;
    };
  }) => SavedBuild;

  updateBuild: (id: string, updates: Partial<SavedBuild>) => void;
  deleteBuild: (id: string) => void;
  setActivePresetId: (id: string | null) => void;
  getPresetById: (id: string) => BuildPreset | undefined;
  exportBuildToJson: (id: string) => string | null;
  importBuildFromJson: (
    jsonStr: string
  ) => { success: boolean; error?: string; build?: SavedBuild };
}

function getKstTimestamp(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")} KST`;
}

// Initial demo saved project for instant showcase
const initialDemoBuild: SavedBuild = {
  id: "build-garage-starter-elantra",
  name: "Elantra N Stage 2+ Track Day Project",
  description: "Рабочий проект для трек-дней на Inje Speedium (인제 스피디움): гибридный турбонаддув, колодки Brembo HP2000 и подвеска Öhlins DFV.",
  vehicleId: "hyundai-elantra-n-cn7-mt",
  createdAt: "2026-09-26T01:00:00.000Z",
  createdAtKst: "2026.09.26 10:00 KST",
  tags: ["TRACK", "STAGE 2", "KDM"],
  slots: {
    engineId: "eng-g4kh-theta-20t",
    transId: "tr-m6gf2-6mt-n",
    turboId: "turbo-stage2-hybrid",
    intakeId: "intake-fmic-wagner",
    exhaustId: "exhaust-akrapovic-evo",
    brakeId: "brake-sport-pads-brembo",
    suspensionId: "suspension-ohlins-rt",
    ecuId: "ecu-stage2-burble",
  },
  telemetrySummary: {
    powerHp: 362,
    torqueNm: 485,
    weightKg: 1395,
  },
};

export const useGarageStore = create<GarageState>()(
  persist(
    (set, get) => ({
      savedBuilds: [initialDemoBuild],
      activePresetId: null,

      setActivePresetId: (id) => set({ activePresetId: id }),

      getPresetById: (id) => CURATED_PRESETS.find((p) => p.id === id),

      saveCurrentBuild: ({ name, description = "", vehicleId, slots, tags = [], telemetrySummary }) => {
        const now = new Date();
        const id = `build-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newBuild: SavedBuild = {
          id,
          name: name.trim() || "Проект без названия",
          description: description.trim(),
          vehicleId,
          slots: { ...slots },
          createdAt: now.toISOString(),
          createdAtKst: getKstTimestamp(now),
          tags: tags.length ? tags : ["CUSTOM BUILD"],
          telemetrySummary,
        };

        set((state) => ({
          savedBuilds: [newBuild, ...state.savedBuilds],
        }));

        return newBuild;
      },

      updateBuild: (id, updates) => {
        set((state) => ({
          savedBuilds: state.savedBuilds.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      deleteBuild: (id) => {
        set((state) => ({
          savedBuilds: state.savedBuilds.filter((b) => b.id !== id),
        }));
      },

      exportBuildToJson: (id) => {
        const build = get().savedBuilds.find((b) => b.id === id);
        if (!build) return null;

        const exportData: ApexExportFile = {
          format: "apex-forge-build",
          version: "1.0",
          exportedAt: new Date().toISOString(),
          build,
        };

        return JSON.stringify(exportData, null, 2);
      },

      importBuildFromJson: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr) as Partial<ApexExportFile>;
          if (parsed.format !== "apex-forge-build" || !parsed.build || !parsed.build.vehicleId) {
            return {
              success: false,
              error: "Неверный формат файла .apex. Ожидается корректный экспорт Apex Forge.",
            };
          }

          const rawBuild = parsed.build;
          const now = new Date();
          const importedBuild: SavedBuild = {
            id: `build-imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: `${rawBuild.name || "Импортированный проект"} (Копия)`,
            description: rawBuild.description || "",
            vehicleId: rawBuild.vehicleId,
            slots: rawBuild.slots || {},
            createdAt: now.toISOString(),
            createdAtKst: getKstTimestamp(now),
            tags: rawBuild.tags?.length ? rawBuild.tags : ["IMPORTED"],
            telemetrySummary: rawBuild.telemetrySummary,
          };

          set((state) => ({
            savedBuilds: [importedBuild, ...state.savedBuilds],
          }));

          return { success: true, build: importedBuild };
        } catch {
          return {
            success: false,
            error: "Ошибка парсинга JSON. Проверь целостность файла.",
          };
        }
      },
    }),
    {
      name: "apex_forge_garage_v1",
    }
  )
);
