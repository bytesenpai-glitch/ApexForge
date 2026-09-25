import type {
  BrakePart,
  CoolingPart,
  CylinderLayout,
  DifferentialPart,
  Driveline,
  EcuPart,
  Engine,
  ExhaustPart,
  Fitment,
  IntakePart,
  Layout,
  MountPart,
  Part,
  SuspensionPart,
  Transmission,
  TurboPart,
} from "@/domain/parts/types";
import type { BuildTelemetryOutput } from "@/domain/parts/telemetry";
import type { Brand, Region, Vehicle } from "@/domain/vehicles/types";

export type ViewMode = "garage" | "blueprint";

export type DriveFilter = "all" | "rwd" | "awd" | "fwd";

export type VehicleSortOption =
  | "default"
  | "power-desc"
  | "power-asc"
  | "year-desc"
  | "year-asc"
  | "alpha";

export type PartSortOption = "default" | "power-desc" | "fitment" | "alpha";

export type PartSlotKind =
  | "engine"
  | "transmission"
  | "driveline"
  | "mounts"
  | "cooling"
  | "differential"
  | "turbo"
  | "intake"
  | "exhaust"
  | "brakes"
  | "suspension"
  | "ecu";

export interface ActiveBuildSlots {
  engineId: string | null;
  transId: string | null;
  drivelineId: string | null;
  mountId: string | null;
  coolingId: string | null;
  diffId: string | null;
  turboId: string | null;
  intakeId: string | null;
  exhaustId: string | null;
  brakeId: string | null;
  suspensionId: string | null;
  ecuId: string | null;
}

export interface ResolvedBuildParts {
  engine: Engine;
  transmission: Transmission;
  driveline: Driveline;
  mounts: MountPart | null;
  cooling: CoolingPart | null;
  differential: DifferentialPart | null;
  turbo: TurboPart | null;
  intake: IntakePart | null;
  exhaust: ExhaustPart | null;
  brakes: BrakePart | null;
  suspension: SuspensionPart | null;
  ecu: EcuPart | null;
  isCustomEngine: boolean;
  isCustomTrans: boolean;
  isCustomDriveline: boolean;
  isCustomMounts: boolean;
  isCustomCooling: boolean;
  isCustomDiff: boolean;
  isCustomTurbo: boolean;
  isCustomIntake: boolean;
  isCustomExhaust: boolean;
  isCustomBrakes: boolean;
  isCustomSuspension: boolean;
  isCustomEcu: boolean;
}

export interface SwapMatchItem<T = Part> {
  part: T;
  fit: Fitment;
  reasons: string[];
}

export interface FormattedTelemetry {
  powerHp: number;
  torqueNm: number;
  weightKg: number;
  ptwRatio: number;
  frontWeightPct: number;
  rearWeightPct: number;
  cgOffsetMm: number;
  zeroTo100: string;
  hundredTo200: string;
  quarterMileEt: string;
  quarterMileTrap: string;
  topSpeed: string;
  brakeDistance: string;
  lateralG: string;
  torqueHeadroomNm: number;
  torqueWarning: boolean;
  thermalEnduranceRating: number;
  raw: BuildTelemetryOutput;
}

export type { Brand, Region, Vehicle, Fitment, Layout, Part, CylinderLayout, MountPart, CoolingPart, DifferentialPart };
