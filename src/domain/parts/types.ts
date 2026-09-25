export type BrandGroup =
  | "hyundai-kia"
  | "toyota"
  | "nissan"
  | "honda"
  | "subaru"
  | "mazda"
  | "bmw"
  | "vag"
  | "mercedes"
  | "gm"
  | "ford"
  | "mopar"
  | "universal";

export type Fuel = "petrol" | "diesel" | "hybrid-petrol";

export type Aspiration = "na" | "turbo" | "twin-turbo" | "supercharged";

export type Layout = "transverse-fwd" | "transverse-awd" | "longitudinal-rwd" | "longitudinal-awd";

export type EngineOrientation = "transverse" | "longitudinal";

export type CylinderLayout = "inline" | "v-engine" | "boxer" | "rotary";

export type TransmissionType = "mt" | "at" | "dct" | "ivt" | "sequential";

export type DrivelineKind = "differential" | "transfer-case";

export type Fitment = "bolt-in" | "kit" | "custom";

export type PartKind =
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

/** Physical / platform tags used to decide what can be swapped. */
export type SwapTag =
  | "i4-transverse-compact"
  | "i4-transverse-mid"
  | "i4-n-fwd"
  | "v6-transverse-suv"
  | "i4-longitudinal-rwd"
  | "v6-longitudinal-rwd"
  | "crdi-transverse"
  | "htrac-awd"
  | "fwd-open-diff"
  | "n-el-lsd"
  | "rwd-open-diff"
  | "rwd-el-lsd"
  // JDM tags
  | "i4-jdm-rwd"
  | "i6-jdm-rwd"
  | "v8-jdm-rwd"
  | "i4-honda-fwd"
  | "rotary-rwd"
  | "boxer-awd"
  | "r35-awd"
  | "jdm-rwd-diff"
  | "skyline-attesa-awd"
  // Euro tags
  | "i4-mqb-fwd"
  | "i5-mqb-awd"
  | "i6-bmw-rwd"
  | "v8-euro-rwd"
  | "haldex-awd"
  | "xdrive-awd"
  | "m-diff"
  // USDM tags
  | "v8-ls-rwd"
  | "v8-coyote-rwd"
  | "v8-hemi-rwd"
  | "t56-rwd"
  | "usdm-posi-diff"
  // Universal & Cross-brand swap kits
  | "universal-rwd-swap"
  | "k-swap-kit"
  | "ls-swap-kit"
  | "2jz-swap-kit";

export interface OemManualReference {
  documentTitle: string;
  code: string;
  publisher: string;
  verified: boolean;
  notes?: string;
}

export interface Engine {
  id: string;
  kind: "engine";
  code: string;
  family: string;
  maker: BrandGroup;
  displacementCc: number;
  cylinders: 2 | 3 | 4 | 5 | 6 | 8 | 10;
  aspiration: Aspiration;
  fuel: Fuel;
  powerHp: number;
  torqueNm: number;
  /** Peak torque after a typical conservative tune — used for gearbox matching. */
  tunedTorqueNm: number;
  orientation: EngineOrientation;
  mountFamilies: string[];
  bellhousing: string;
  ecuFamily: string;
  swapTags: SwapTag[];
  boreMm?: number;
  strokeMm?: number;
  compressionRatio?: number;
  redlineRpm?: number;
  valvetrain?: string;
  cylinderLayout?: CylinderLayout;
  weightKg?: number;
  manualReference?: OemManualReference;
}

export interface Transmission {
  id: string;
  kind: "transmission";
  code: string;
  name: string;
  maker: BrandGroup;
  type: TransmissionType;
  gears: number | "ivt";
  torqueCapacityNm: number;
  layouts: Layout[];
  mountFamilies: string[];
  bellhousings: string[];
  swapTags: SwapTag[];
  gearRatios?: number[];
  finalDrive?: number;
  weightKg?: number;
  manualReference?: OemManualReference;
}

export interface Driveline {
  id: string;
  kind: "driveline";
  code: string;
  name: string;
  subtype: DrivelineKind;
  maker: BrandGroup;
  layouts: Layout[];
  swapTags: SwapTag[];
}

export interface TurboPart {
  id: string;
  kind: "turbo";
  code: string;
  name: string;
  subtype: "single-turbo" | "twin-turbo" | "supercharger" | "itb" | "hybrid-turbo" | "oem";
  maker: string;
  boostBar: number;
  powerGainHp: number;
  torqueGainNm: number;
  spoolRpm: number;
  compatibleAspirations: Aspiration[];
  compatibleFamilies?: string[];
  notes?: string;
}

export interface IntakePart {
  id: string;
  kind: "intake";
  code: string;
  name: string;
  subtype: "cold-air" | "carbon-airbox" | "fmic" | "short-ram" | "oem";
  maker: string;
  powerGainHp: number;
  torqueGainNm: number;
  iatDropC: number;
  cfmFlow: number;
  notes?: string;
}

export interface ExhaustPart {
  id: string;
  kind: "exhaust";
  code: string;
  name: string;
  subtype: "catless-downpipe" | "cat-back" | "titanium-catback" | "headers" | "straight-pipe" | "oem";
  maker: string;
  powerGainHp: number;
  torqueGainNm: number;
  pipeDiameterMm: number;
  weightDeltaKg: number;
  soundDb: number;
  hasBurble?: boolean;
  notes?: string;
}

export interface BrakePart {
  id: string;
  kind: "brakes";
  code: string;
  name: string;
  subtype: "oem" | "sport-pads" | "bbk-4pot" | "bbk-6pot" | "racing-pro" | "carbon-ceramic";
  maker: string;
  rotorDiameterMm: number;
  pistons: number;
  stoppingDistance100to0M: number;
  caliperColor: string;
  fadeResistance: "standard" | "high" | "endurance";
  notes?: string;
}

export interface SuspensionPart {
  id: string;
  kind: "suspension";
  code: string;
  name: string;
  subtype: "oem" | "sport-springs" | "coilovers-1way" | "coilovers-2way" | "air-suspension";
  maker: string;
  dropMm: number;
  stiffnessRating: number;
  dampingAdjustable: boolean;
  notes?: string;
}

export interface EcuPart {
  id: string;
  kind: "ecu";
  code: string;
  name: string;
  subtype: "oem" | "stage1" | "stage2" | "standalone";
  maker: string;
  powerMultiplier: number;
  revLimitDeltaRpm: number;
  features: Array<"burble" | "launch-control" | "no-lift-shift" | "anti-lag" | "flex-fuel" | "traction-control">;
  notes?: string;
}

export interface MountPart {
  id: string;
  kind: "mounts";
  code: string;
  name: string;
  subtype: "oem-rubber" | "poly-70a" | "poly-95a" | "solid-billet" | "tubular-subframe" | "adapter-plate";
  maker: string;
  stiffnessDampingRating: number;
  engineMovementLimitMm: number;
  weightDeltaKg: number;
  vibrationTransmissionRating: number;
  compatibleMountFamilies?: string[];
  notes?: string;
}

export interface CoolingPart {
  id: string;
  kind: "cooling";
  code: string;
  name: string;
  subtype: "oem" | "triple-core-radiator" | "dual-oil-cooler" | "dry-sump-kit";
  maker: string;
  heatDissipationKw: number;
  tempDropCoolantC: number;
  tempDropOilC: number;
  oilCapacityDeltaL: number;
  weightDeltaKg: number;
  gForceStarvationLimit: number;
  notes?: string;
}

export interface DifferentialPart {
  id: string;
  kind: "differential";
  code: string;
  name: string;
  subtype: "open" | "lsd-1.5way" | "lsd-2way" | "helical-torsen" | "spool" | "quick-change";
  maker: string;
  lockRateAccelerationPct: number;
  lockRateDecelerationPct: number;
  torqueBiasRatio: number;
  maxAxleTorqueNm: number;
  weightDeltaKg: number;
  notes?: string;
}

export type Part =
  | Engine
  | Transmission
  | Driveline
  | MountPart
  | CoolingPart
  | DifferentialPart
  | TurboPart
  | IntakePart
  | ExhaustPart
  | BrakePart
  | SuspensionPart
  | EcuPart;

export interface SwapMatch {
  part: Part;
  fit: Fitment;
  reasons: string[];
}

/** Chassis side of fitment — vehicles fill this, parts lib scores swaps. */
export interface ChassisFitment {
  id: string;
  layout: Layout;
  engineMountFamilies: string[];
  transMountFamilies: string[];
  swapTags: SwapTag[];
  oemEngineId: string;
  oemTransmissionId: string;
  oemDrivelineIds: string[];
}
