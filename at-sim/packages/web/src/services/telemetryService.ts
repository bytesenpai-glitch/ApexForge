import { calculateBuildTelemetry } from "@at-sim/parts";
import type { FormattedTelemetry, ResolvedBuildParts } from "@/types/tuning.types";
import type { Vehicle } from "@at-sim/vehicles";

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

  const effectiveWeight = curbWeight + (build.exhaust?.weightDeltaKg ?? 0);
  const ptwRatio = Math.round((raw.totalPowerHp / (effectiveWeight / 1000)) * 10) / 10;

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
    zeroTo100: `${raw.accel0to100Sec.toFixed(1)} с`,
    hundredTo200: hundredTo200Formatted,
    quarterMileEt: `${quarterMileEtRaw.toFixed(2)} с`,
    quarterMileTrap: `${quarterMileTrapKmhRaw} км/ч`,
    topSpeed: `${topSpeedRaw} км/ч`,
    brakeDistance: `${raw.brake100to0M.toFixed(1)} м`,
    lateralG: `${(0.92 + (build.suspension ? 0.12 : 0)).toFixed(2)} G`,
    torqueHeadroomNm: raw.torqueSafetyMarginNm,
    torqueWarning: raw.isGearboxOverloaded,
    raw,
  };
}
