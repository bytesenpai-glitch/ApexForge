import { calculateBuildTelemetry } from "@/domain/parts/index";
import type { FormattedTelemetry, ResolvedBuildParts } from "@/types/tuning.types";
import type { Vehicle } from "@/domain/vehicles/types";

const BODY_WEIGHT_ESTIMATE: Record<string, number> = {
  coupe: 1480,
  sedan: 1560,
  hatch: 1380,
  liftback: 1650,
  suv: 1980,
  crossover: 1720,
  mpv: 1850,
  convertible: 1540,
  pickup: 2100,
};

const BASE_FRONT_BIAS_BY_LAYOUT: Record<string, number> = {
  "transverse-fwd": 0.62,
  "transverse-awd": 0.58,
  "longitudinal-rwd": 0.52,
  "longitudinal-awd": 0.54,
};

export function computeVehicleTelemetry(
  vehicle: Vehicle,
  build: ResolvedBuildParts,
): FormattedTelemetry {
  const curbWeight = BODY_WEIGHT_ESTIMATE[vehicle.body] ?? 1520;

  const raw = calculateBuildTelemetry({
    engine: build.engine,
    transmission: build.transmission,
    layout: vehicle.layout,
    curbWeightKg: curbWeight,
    turbo: build.turbo ?? undefined,
    intake: build.intake ?? undefined,
    exhaust: build.exhaust ?? undefined,
    brakes: build.brakes ?? undefined,
    suspension: build.suspension ?? undefined,
    ecu: build.ecu ?? undefined,
  });

  // Calculate component weight deltas
  const engineWeight = build.engine.weightKg ?? 160;
  const engineDelta = engineWeight - 160;
  const transWeight = build.transmission.weightKg ?? 65;
  const transDelta = transWeight - 65;
  const coolingDelta = build.cooling?.weightDeltaKg ?? 0;
  const mountDelta = build.mounts?.weightDeltaKg ?? 0;
  const diffDelta = build.differential?.weightDeltaKg ?? 0;
  const exhaustDelta = build.exhaust?.weightDeltaKg ?? 0;

  const effectiveWeight = Math.max(
    800,
    curbWeight + engineDelta + transDelta + coolingDelta + mountDelta + diffDelta + exhaustDelta,
  );
  const ptwRatio = Math.round((raw.totalPowerHp / (effectiveWeight / 1000)) * 10) / 10;

  // Dynamic front/rear weight distribution
  const baseFrontRatio = BASE_FRONT_BIAS_BY_LAYOUT[vehicle.layout] ?? 0.53;
  const baseFrontWeight = curbWeight * baseFrontRatio;
  const baseRearWeight = curbWeight * (1 - baseFrontRatio);

  // Engine is 85% on front axle; mounts 60% front; cooling 80% front (dry-sump tank is rear)
  const isDrySump = build.cooling?.subtype === "dry-sump-kit";
  const coolingFrontDelta = isDrySump ? -4.0 : coolingDelta * 0.8;
  const coolingRearDelta = isDrySump ? 12.5 : coolingDelta * 0.2;

  const newFrontWeight = baseFrontWeight + (engineDelta * 0.85) + (transDelta * 0.45) + coolingFrontDelta + (mountDelta * 0.6);
  const newRearWeight = baseRearWeight + (engineDelta * 0.15) + (transDelta * 0.55) + coolingRearDelta + (diffDelta * 0.9) + exhaustDelta;

  const totalCalculated = newFrontWeight + newRearWeight;
  const frontWeightPct = Math.round((newFrontWeight / totalCalculated) * 1000) / 10;
  const rearWeightPct = Math.round((100 - frontWeightPct) * 10) / 10;

  // Center of gravity shift (approx mm offset from wheelbase center)
  const cgOffsetMm = Math.round((frontWeightPct - 50.0) * 26.5);

  // Thermal endurance calculation
  let thermalRating = 5.0;
  if (build.cooling) {
    if (build.cooling.subtype === "triple-core-radiator") thermalRating += 2.2;
    if (build.cooling.subtype === "dual-oil-cooler") thermalRating += 1.8;
    if (build.cooling.subtype === "dry-sump-kit") thermalRating += 4.5;
  }
  const thermalEnduranceRating = Math.min(10.0, Math.round(thermalRating * 10) / 10);

  // 100-200 km/h physics approximation based on drag & power-to-weight
  const isAwd = vehicle.layout.includes("awd");
  const awdDragPenalty = isAwd ? 0.4 : 0.0;
  const hundredTo200Raw = Math.max(
    3.2,
    (3800 / Math.max(120, raw.totalPowerHp)) * ((effectiveWeight / 1400) ** 0.8) + awdDragPenalty,
  );
  const hundredTo200Formatted = `${hundredTo200Raw.toFixed(1)} с`;

  // 1/4 mile ET & trap speed approximation
  const quarterMileEtRaw = Math.max(
    8.4,
    (5.825 * Math.cbrt(effectiveWeight / Math.max(100, raw.totalPowerHp))) + (isAwd ? -0.2 : 0.15),
  );
  const quarterMileTrapKmhRaw = Math.min(
    330,
    Math.round(365 * Math.cbrt(Math.max(100, raw.totalPowerHp) / effectiveWeight)),
  );

  // Top speed theoretical approximation
  const aeroFactor = vehicle.body === "coupe" ? 0.28 : vehicle.body === "suv" ? 0.38 : 0.31;
  const topSpeedRaw = Math.min(
    360,
    Math.round(Math.cbrt((raw.totalPowerHp * 735.5) / (0.5 * 1.225 * aeroFactor * 2.1)) * 3.6),
  );

  return {
    powerHp: raw.totalPowerHp,
    torqueNm: raw.totalTorqueNm,
    weightKg: effectiveWeight,
    ptwRatio,
    frontWeightPct,
    rearWeightPct,
    cgOffsetMm,
    zeroTo100: `${raw.accel0to100Sec.toFixed(1)} с`,
    hundredTo200: hundredTo200Formatted,
    quarterMileEt: `${quarterMileEtRaw.toFixed(2)} с`,
    quarterMileTrap: `${quarterMileTrapKmhRaw} км/ч`,
    topSpeed: `${topSpeedRaw} км/ч`,
    brakeDistance: `${raw.brake100to0M.toFixed(1)} м`,
    lateralG: `${(0.92 + (build.suspension ? 0.12 : 0) + (build.differential ? 0.05 : 0)).toFixed(2)} G`,
    torqueHeadroomNm: raw.torqueSafetyMarginNm,
    torqueWarning: raw.isGearboxOverloaded,
    thermalEnduranceRating,
    raw,
  };
}
