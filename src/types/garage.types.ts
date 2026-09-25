import type { ActiveBuildSlots } from "./tuning.types";

export type PresetCategory = "all" | "track" | "drift" | "drag" | "touge" | "time-attack";

export interface PresetSpecsEstimate {
  powerHp: number;
  torqueNm: number;
  weightKg: number;
  zeroToHundredSec: string;
  topSpeedKmh: number;
}

export interface BuildPreset {
  id: string;
  name: string;
  koreanName: string;
  category: "track" | "drift" | "drag" | "touge" | "time-attack";
  badgeTag: string;
  countryCode: "KR" | "JP" | "DE" | "US";
  description: string;
  vehicleId: string;
  slots: Partial<ActiveBuildSlots>;
  highlights: string[];
  specsEstimate: PresetSpecsEstimate;
  targetDiscipline: string;
}

export interface SavedBuild {
  id: string;
  name: string;
  description: string;
  vehicleId: string;
  slots: Partial<ActiveBuildSlots>;
  createdAt: string; // ISO timestamp
  createdAtKst: string; // YYYY.MM.DD HH:mm (Asia/Seoul)
  tags: string[];
  telemetrySummary?: {
    powerHp: number;
    torqueNm: number;
    weightKg: number;
  };
}

export interface ApexExportFile {
  format: "apex-forge-build";
  version: "1.0";
  exportedAt: string;
  build: SavedBuild;
}
