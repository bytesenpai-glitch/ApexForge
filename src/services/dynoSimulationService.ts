// Dyno simulation and 1/4-mile drag strip physics engine for Apex Forge
// Computes high-fidelity torque/HP curves across RPM and discrete physics for 402m launches

import type { Engine } from "@/domain/parts/types";
import type { FormattedTelemetry, ResolvedBuildParts } from "@/types/tuning.types";
import type { Vehicle } from "@/domain/vehicles/types";

export interface DynoDataPoint {
  rpm: number;
  hp: number;
  torqueNm: number;
  boostBar: number;
}

export interface DynoCurveResult {
  points: DynoDataPoint[];
  peakHp: number;
  peakHpRpm: number;
  peakTorqueNm: number;
  peakTorqueRpm: number;
  redlineRpm: number;
  revLimitRpm: number;
}

export type TireCompound = "street-oem" | "semi-slick-200tw" | "drag-radial" | "pro-slick";

export const TIRE_COMPOUND_SPECS: Record<
  TireCompound,
  { label: string; gripCoeff: number; wearRating: string; description: string }
> = {
  "street-oem": {
    label: "OEM Street (300+ TW)",
    gripCoeff: 0.88,
    wearRating: "340 TW",
    description: "Стандартная гражданская резина. Пробуксовка при агрессивном старте с места.",
  },
  "semi-slick-200tw": {
    label: "Track Semi-Slick (200 TW)",
    gripCoeff: 1.12,
    wearRating: "200 TW",
    description: "Спортивный полуслик (Advan A052 / Toyo R888R / Cup 2). Отличный зацеп на прогретом асфальте.",
  },
  "drag-radial": {
    label: "DOT Drag Radial (100 TW)",
    gripCoeff: 1.32,
    wearRating: "100 TW",
    description: "Дрэговые радиальные шины Mickey Thompson ET Street. Высокий профиль и мягкий борт.",
  },
  "pro-slick": {
    label: "Full Pro Slick (Wrinkle Wall)",
    gripCoeff: 1.55,
    wearRating: "0 TW",
    description: "Профессиональный гоночный слик для подготовленного стрипа с клеем (VHT TrackBite).",
  },
};

export interface QuarterMileResult {
  tireCompound: TireCompound;
  reactionTimeSec: number;
  sixtyFootSec: number;
  threeThirtyFootSec: number;
  eighthMileSec: number;
  eighthMileSpeedKmh: number;
  eighthMileSpeedMph: number;
  thousandFootSec: number;
  quarterMileSec: number;
  quarterMileSpeedKmh: number;
  quarterMileSpeedMph: number;
  peakG: number;
  wheelSlipPct: number;
  trajectory: { timeSec: number; distanceM: number; speedKmh: number; gForce: number }[];
  timeSlipId: string;
  trackTempC: number;
  densityAltitudeFt: number;
}

// --------------------------------------------------------------------------
// 1. DYNO CURVE GENERATION
// --------------------------------------------------------------------------

export function generateDynoCurve(
  engine: Engine,
  telemetry: FormattedTelemetry,
  resolved: ResolvedBuildParts
): DynoCurveResult {
  const redline = engine.redlineRpm || 7000;
  const revLimit = telemetry.raw.effectiveRevLimitRpm || redline + 250;
  const peakHp = telemetry.powerHp;
  const peakTorque = telemetry.torqueNm;

  const points: DynoDataPoint[] = [];

  // Determine engine characteristics
  const isTurbo = engine.aspiration === "turbo" || engine.aspiration === "twin-turbo" || Boolean(resolved.turbo);
  const isSupercharged = engine.aspiration === "supercharged";
  const isRotary = engine.cylinderLayout === "rotary" || engine.family.toLowerCase().includes("rotary");

  // Approximate peak RPMs
  let peakTorqueRpm = isTurbo ? Math.round(redline * 0.52) : Math.round(redline * 0.65);
  let peakHpRpm = isRotary ? Math.round(redline * 0.92) : Math.round(redline * 0.86);

  if (isSupercharged) {
    peakTorqueRpm = Math.round(redline * 0.48);
  }

  const spoolRpm = isTurbo ? 2800 : 0;
  const step = 200;

  for (let rpm = 1000; rpm <= revLimit; rpm += step) {
    let torqueFactor = 0;
    let boostBar = 0;

    if (isTurbo) {
      // Turbo boost curve with lag under spoolRpm and flat plateau
      if (rpm < spoolRpm) {
        torqueFactor = 0.45 + 0.25 * (rpm / spoolRpm);
        boostBar = 0.2 * (rpm / spoolRpm);
      } else {
        const spoolProgress = Math.min(1, (rpm - spoolRpm) / 800);
        const topEndTaper = rpm > peakHpRpm ? Math.max(0.75, 1 - (rpm - peakHpRpm) / (revLimit - peakHpRpm) * 0.22) : 1;
        torqueFactor = (0.7 + 0.3 * spoolProgress) * topEndTaper;
        boostBar = (resolved.turbo ? 1.8 : 1.2) * spoolProgress * (rpm > peakHpRpm ? 0.9 : 1);
      }
    } else if (isSupercharged) {
      // Instant low end boost, slight top end drop
      const topEnd = rpm > peakHpRpm ? 1 - (rpm - peakHpRpm) / (revLimit - peakHpRpm) * 0.15 : 1;
      torqueFactor = (0.8 + 0.2 * (rpm / peakTorqueRpm)) * topEnd;
      boostBar = 0.8 + 0.4 * (rpm / revLimit);
    } else if (isRotary) {
      // Rotary high rev breath
      const rotaryRise = Math.pow(rpm / redline, 0.85);
      torqueFactor = 0.4 + 0.6 * rotaryRise;
    } else {
      // Naturally aspirated bell curve
      const normalizedRpm = rpm / peakTorqueRpm;
      torqueFactor = Math.sin((normalizedRpm * Math.PI) / 2.3);
      if (rpm > peakTorqueRpm) {
        const dropRatio = (rpm - peakTorqueRpm) / (revLimit - peakTorqueRpm);
        torqueFactor = Math.max(0.68, 1 - dropRatio * 0.28);
      }
    }

    const currentTorqueNm = Math.round(peakTorque * Math.max(0.35, Math.min(1.0, torqueFactor)));
    // HP = (Nm * RPM) / 7127
    const currentHp = Math.round((currentTorqueNm * rpm) / 7127);

    points.push({
      rpm,
      hp: Math.min(peakHp * 1.02, currentHp),
      torqueNm: currentTorqueNm,
      boostBar: Number(boostBar.toFixed(2)),
    });
  }

  return {
    points,
    peakHp,
    peakHpRpm,
    peakTorqueNm: peakTorque,
    peakTorqueRpm,
    redlineRpm: redline,
    revLimitRpm: revLimit,
  };
}

// --------------------------------------------------------------------------
// 2. 1/4-MILE DRAG STRIP PHYSICS SIMULATION
// --------------------------------------------------------------------------

export function simulateQuarterMile(
  vehicle: Vehicle,
  telemetry: FormattedTelemetry,
  tire: TireCompound = "semi-slick-200tw",
  reactionTimeSec = 0.18
): QuarterMileResult {
  const tireSpec = TIRE_COMPOUND_SPECS[tire];
  const weightKg = telemetry.weightKg;
  const powerHp = telemetry.powerHp;
  const torqueNm = telemetry.torqueNm;

  // Drivetrain launch traction multiplier
  let driveTractionMultiplier = 1.0;
  if (vehicle.layout.includes("awd")) {
    driveTractionMultiplier = 1.35; // All 4 wheels hook immediately
  } else if (vehicle.layout === "longitudinal-rwd") {
    driveTractionMultiplier = 1.05; // Rear weight transfer on squat
  } else {
    driveTractionMultiplier = 0.82; // FWD front lift / wheel hop
  }

  const effectiveGrip = tireSpec.gripCoeff * driveTractionMultiplier;
  const maxLaunchG = Math.min(2.1, effectiveGrip * (vehicle.layout.includes("awd") ? 1.25 : 1.0));

  // Discrete simulation parameters
  const dt = 0.02; // 20ms steps
  const targetDistanceM = 402.336; // 1/4 mile = 1320 feet

  let timeSec = 0;
  let distanceM = 0;
  let speedMs = 0;
  let peakG = 0;
  let totalSlipAccum = 0;
  let slipCount = 0;

  let sixtyFootSec = 0;
  let threeThirtyFootSec = 0;
  let eighthMileSec = 0;
  let eighthMileSpeedKmh = 0;
  let thousandFootSec = 0;

  const trajectory: QuarterMileResult["trajectory"] = [];

  // Aerodynamic parameters
  const cd = 0.32;
  const frontalArea = 2.15;
  const airDensity = 1.2; // kg/m^3

  while (distanceM < targetDistanceM && timeSec < 30) {
    // Engine available accelerating force at current speed
    // P = F * v => F = P / v
    const speedFloor = Math.max(speedMs, 3.5);
    const powerWatts = powerHp * 745.7;
    let engineForceN = (powerWatts / speedFloor) * 0.88; // 88% drivetrain efficiency

    // Low speed launch torque limit
    const firstGearTorqueForce = (torqueNm * 3.8 * 3.7 * 0.9) / 0.32;
    if (speedMs < 12) {
      engineForceN = Math.min(engineForceN, firstGearTorqueForce);
    }

    // Maximum traction force limit before wheelspin
    const normalForceN = weightKg * 9.81;
    const maxTractionForceN = normalForceN * effectiveGrip;

    // Wheel slip calculation
    let isSlipping = false;
    if (engineForceN > maxTractionForceN) {
      isSlipping = true;
      const slipRatio = (engineForceN - maxTractionForceN) / engineForceN;
      totalSlipAccum += slipRatio;
      slipCount++;
      // Traction penalty when spinning
      engineForceN = maxTractionForceN * 0.94;
    }

    // Aerodynamic Drag & Rolling Resistance
    const aeroDragN = 0.5 * airDensity * cd * frontalArea * Math.pow(speedMs, 2);
    const rollResistanceN = 0.015 * weightKg * 9.81;

    const netForceN = Math.max(0, engineForceN - aeroDragN - rollResistanceN);
    const accelMs2 = netForceN / weightKg;
    const currentG = accelMs2 / 9.81;

    if (currentG > peakG) peakG = Number(currentG.toFixed(2));

    // Integrate
    speedMs += accelMs2 * dt;
    distanceM += speedMs * dt;
    timeSec += dt;

    // Checkpoints (in meters)
    // 60 feet = 18.288 m
    if (distanceM >= 18.288 && sixtyFootSec === 0) {
      sixtyFootSec = Number(timeSec.toFixed(3));
    }
    // 330 feet = 100.584 m
    if (distanceM >= 100.584 && threeThirtyFootSec === 0) {
      threeThirtyFootSec = Number(timeSec.toFixed(3));
    }
    // 1/8 mile (660 feet) = 201.168 m
    if (distanceM >= 201.168 && eighthMileSec === 0) {
      eighthMileSec = Number(timeSec.toFixed(3));
      eighthMileSpeedKmh = Math.round(speedMs * 3.6);
    }
    // 1000 feet = 304.8 m
    if (distanceM >= 304.8 && thousandFootSec === 0) {
      thousandFootSec = Number(timeSec.toFixed(3));
    }

    // Log trajectory every 100ms
    if (Math.round(timeSec * 100) % 10 === 0) {
      trajectory.push({
        timeSec: Number(timeSec.toFixed(2)),
        distanceM: Math.round(distanceM),
        speedKmh: Math.round(speedMs * 3.6),
        gForce: Number(currentG.toFixed(2)),
      });
    }
  }

  const quarterMileSec = Number(timeSec.toFixed(3));
  const quarterMileSpeedKmh = Math.round(speedMs * 3.6);
  const quarterMileSpeedMph = Math.round(quarterMileSpeedKmh * 0.621371);
  const eighthMileSpeedMph = Math.round(eighthMileSpeedKmh * 0.621371);
  const avgSlipPct = slipCount > 0 ? Math.round((totalSlipAccum / slipCount) * 100) : 4;

  // Generate unique NHRA-style time slip ID
  const timeSlipId = `AF-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    tireCompound: tire,
    reactionTimeSec,
    sixtyFootSec: sixtyFootSec || Number((quarterMileSec * 0.17).toFixed(3)),
    threeThirtyFootSec: threeThirtyFootSec || Number((quarterMileSec * 0.44).toFixed(3)),
    eighthMileSec: eighthMileSec || Number((quarterMileSec * 0.64).toFixed(3)),
    eighthMileSpeedKmh: eighthMileSpeedKmh || Math.round(quarterMileSpeedKmh * 0.78),
    eighthMileSpeedMph: eighthMileSpeedMph || Math.round(quarterMileSpeedMph * 0.78),
    thousandFootSec: thousandFootSec || Number((quarterMileSec * 0.84).toFixed(3)),
    quarterMileSec,
    quarterMileSpeedKmh,
    quarterMileSpeedMph,
    peakG: Math.min(peakG, maxLaunchG),
    wheelSlipPct: avgSlipPct,
    trajectory,
    timeSlipId,
    trackTempC: 24,
    densityAltitudeFt: 350,
  };
}
