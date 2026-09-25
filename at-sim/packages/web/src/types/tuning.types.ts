import type {
  BrakePart,
  BuildTelemetryOutput,
  Driveline,
  EcuPart,
  Engine,
  ExhaustPart,
  Fitment,
  IntakePart,
  Layout,
  Part,
  SuspensionPart,
  Transmission,
  TurboPart,
} from "@at-sim/parts";
import type { Brand, Region, Vehicle } from "@at-sim/vehicles";

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
  turbo: TurboPart | null;
  intake: IntakePart | null;
  exhaust: ExhaustPart | null;
  brakes: BrakePart | null;
  suspension: SuspensionPart | null;
  ecu: EcuPart | null;
  isCustomEngine: boolean;
  isCustomTrans: boolean;
  isCustomDriveline: boolean;
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
  zeroTo100: string;
  hundredTo200: string;
  quarterMileEt: string;
  quarterMileTrap: string;
  topSpeed: string;
  brakeDistance: string;
  lateralG: string;
  torqueHeadroomNm: number;
  torqueWarning: boolean;
  raw: BuildTelemetryOutput;
}

export type { Brand, Region, Vehicle, Fitment, Layout, Part };
