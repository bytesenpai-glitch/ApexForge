import type {
  BrakePart,
  EcuPart,
  Engine,
  ExhaustPart,
  IntakePart,
  Layout,
  SuspensionPart,
  Transmission,
  TurboPart,
} from "./types.js";

export interface BuildTelemetryInput {
  engine: Engine;
  transmission: Transmission;
  layout: Layout;
  curbWeightKg?: number;
  turbo?: TurboPart;
  intake?: IntakePart;
  exhaust?: ExhaustPart;
  brakes?: BrakePart;
  suspension?: SuspensionPart;
  ecu?: EcuPart;
}

export interface BuildTelemetryOutput {
  totalPowerHp: number;
  totalTorqueNm: number;
  powerDeltaHp: number;
  torqueDeltaNm: number;
  accel0to100Sec: number;
  brake100to0M: number;
  soundDb: number;
  hasBurble: boolean;
  isGearboxOverloaded: boolean;
  torqueSafetyMarginNm: number;
  torqueSafetyPct: number;
  effectiveRevLimitRpm: number;
  rideHeightDeltaMm: number;
}

export function calculateBuildTelemetry(input: BuildTelemetryInput): BuildTelemetryOutput {
  const {
    engine,
    transmission,
    layout,
    curbWeightKg = 1520,
    turbo,
    intake,
    exhaust,
    brakes,
    suspension,
    ecu,
  } = input;

  // 1. Calculate Power & Torque Gains
  const turboHpGain = turbo?.powerGainHp ?? 0;
  const turboTqGain = turbo?.torqueGainNm ?? 0;

  const intakeHpGain = intake?.powerGainHp ?? 0;
  const intakeTqGain = intake?.torqueGainNm ?? 0;

  const exhaustHpGain = exhaust?.powerGainHp ?? 0;
  const exhaustTqGain = exhaust?.torqueGainNm ?? 0;

  const ecuMultiplier = ecu?.powerMultiplier ?? 1.0;

  const rawPower = (engine.powerHp + turboHpGain + intakeHpGain + exhaustHpGain) * ecuMultiplier;
  const rawTorque = (engine.torqueNm + turboTqGain + intakeTqGain + exhaustTqGain) * ecuMultiplier;

  const totalPowerHp = Math.round(rawPower);
  const totalTorqueNm = Math.round(rawTorque);

  const powerDeltaHp = totalPowerHp - engine.powerHp;
  const torqueDeltaNm = totalTorqueNm - engine.torqueNm;

  // 2. Transmission Torque Margin
  const torqueCapacity = transmission.torqueCapacityNm;
  const torqueSafetyMarginNm = torqueCapacity - totalTorqueNm;
  const torqueSafetyPct = Math.round((totalTorqueNm / torqueCapacity) * 100);
  const isGearboxOverloaded = totalTorqueNm > torqueCapacity;

  // 3. 0-100 km/h Acceleration Physics Model
  // Effective mass accounting for exhaust weight savings
  const effectiveWeight = curbWeightKg + (exhaust?.weightDeltaKg ?? 0);
  const powerToWeight = (totalPowerHp / effectiveWeight) * 1000; // hp per metric ton

  // Traction Factor based on Drive Layout and Power
  const isAwd = layout === "longitudinal-awd" || layout === "transverse-awd";
  const isRwd = layout === "longitudinal-rwd";

  let tractionFactor = 1.0;
  if (isAwd) {
    // AWD can put down huge power off the line without significant wheelspin
    tractionFactor = 1.25;
  } else if (isRwd) {
    // RWD has weight transfer to the rear, but spins at high power (>450 hp)
    tractionFactor = totalPowerHp > 450 ? 1.05 - (totalPowerHp - 450) * 0.0003 : 1.0;
  } else {
    // FWD suffers from weight transfer away from driven wheels, severe wheelspin > 280 hp
    tractionFactor = Math.max(0.68, 0.92 - Math.max(0, totalPowerHp - 250) * 0.0007);
  }

  // Shift latency penalty
  let shiftTimePenalty = 0.35; // default manual
  if (transmission.type === "dct") {
    shiftTimePenalty = 0.12;
  } else if (transmission.type === "at") {
    shiftTimePenalty = 0.22;
  } else if (transmission.type === "ivt") {
    shiftTimePenalty = 0.06;
  }

  // Raw theoretical 0-100 calculation based on power-to-weight and traction
  const raw0to100 = (72 / (Math.sqrt(powerToWeight) * tractionFactor)) + shiftTimePenalty;
  // Floor at 2.1s (physics limit for road-legal tires on unprepped surface)
  const accel0to100Sec = Math.max(2.1, Math.round(raw0to100 * 10) / 10);

  // 4. Braking 100-0 km/h
  const baseBrakeDistance = brakes?.stoppingDistance100to0M ?? 41.2;
  const weightPenaltyM = ((effectiveWeight - 1500) / 100) * 0.45;
  const brake100to0M = Math.max(29.5, Math.round((baseBrakeDistance + weightPenaltyM) * 10) / 10);

  // 5. Sound & Rev Limit
  const baseSoundDb = exhaust?.soundDb ?? 74;
  const soundDb = Math.min(118, baseSoundDb + (turbo && turbo.boostBar > 1.5 ? 4 : 0));
  const hasBurble = Boolean(exhaust?.hasBurble || ecu?.features.includes("burble"));

  const baseRevLimit = engine.redlineRpm ?? 6800;
  const revLimitDelta = ecu?.revLimitDeltaRpm ?? 0;
  const effectiveRevLimitRpm = baseRevLimit + revLimitDelta;

  const rideHeightDeltaMm = -(suspension?.dropMm ?? 0);

  return {
    totalPowerHp,
    totalTorqueNm,
    powerDeltaHp,
    torqueDeltaNm,
    accel0to100Sec,
    brake100to0M,
    soundDb,
    hasBurble,
    isGearboxOverloaded,
    torqueSafetyMarginNm,
    torqueSafetyPct,
    effectiveRevLimitRpm,
    rideHeightDeltaMm,
  };
}
