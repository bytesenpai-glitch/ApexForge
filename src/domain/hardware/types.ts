export type FastenerGrade = "8.8" | "10.9" | "12.9" | "Grade 8" | "Titanium Ti-6Al-4V";

export type ClearanceArea =
  | "firewall"
  | "subframe"
  | "hood"
  | "tunnel"
  | "steering-column"
  | "radiator-support";

export type ClearanceSeverity = "none" | "minor-massage" | "heavy-fabrication";

export type SignalType =
  | "12v-switched"
  | "ground"
  | "analog-5v"
  | "hall-pulse"
  | "vr-sensor"
  | "can-high"
  | "can-low"
  | "relay-trigger"
  | "pwm-valve";

export interface FastenerItem {
  id: string;
  category: "bellhousing" | "engine-mount" | "crossmember" | "driveshaft" | "starter";
  description: string;
  threadSpec: string; // e.g. "M10 x 1.25"
  lengthMm: number;
  grade: FastenerGrade;
  tighteningTorqueNm: number;
  quantity: number;
  standard: string; // e.g. "DIN 931 / ISO 4014"
  notes: string;
}

export interface ClearanceItem {
  area: ClearanceArea;
  label: string;
  severity: ClearanceSeverity;
  clearanceMm: number;
  description: string;
  actionRequired: string;
  isFatalConflict: boolean;
}

export interface WiringPinoutItem {
  pinNumber: string;
  wireColor: string;
  functionName: string;
  signalType: SignalType;
  chassisSide: string; // e.g. "Chassis Body Plug C101 Pin 8"
  engineSide: string;  // e.g. "ECU Connector A Pin 24"
  notes: string;
}

export interface TemplateHole {
  id: string;
  xMm: number;
  yMm: number;
  diameterMm: number;
  threadPitch?: string;
  label: string;
}

export interface FabricationTemplate {
  id: string;
  title: string;
  partType: "adapter-plate" | "motor-mount-bracket" | "trans-crossmember";
  material: string; // e.g. "6061-T6 Aluminum / D16T"
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  centerBoreDiameterMm?: number;
  centerBorePosition?: { xMm: number; yMm: number };
  dowelPins: { xMm: number; yMm: number; diameterMm: number }[];
  holes: TemplateHole[];
  outerContourPath: string; // SVG path data (in mm)
  calibrationLengthMm: number; // 100mm scale calibration
}

export interface IRLSwapGuide {
  vehicleId: string;
  engineId: string;
  transmissionId: string;
  swapDifficulty: "bolt-in" | "moderate" | "advanced" | "expert-fabrication";
  estimatedHours: number;
  oilPanOrientation: "front-sump" | "mid-sump" | "rear-sump" | "dry-sump";
  driveshaftLengthDeltaMm: number; // e.g. -45mm (shorten) or +20mm (lengthen)
  requiredTools: string[];
  fasteners: FastenerItem[];
  clearances: ClearanceItem[];
  wiring: WiringPinoutItem[];
  templates: FabricationTemplate[];
}
