import {
  getBrake,
  getCooling,
  getDifferential,
  getDriveline,
  getEcu,
  getEngine,
  getExhaust,
  getIntake,
  getMount,
  getSuspension,
  getTransmission,
  getTurbo,
  listCoolings,
  listDifferentials,
  listMounts,
  type BrakePart,
  type CoolingPart,
  type DifferentialPart,
  type Driveline,
  type EcuPart,
  type Engine,
  type ExhaustPart,
  type Fitment,
  type IntakePart,
  type MountPart,
  type Part,
  type SuspensionPart,
  type SwapMatch,
  type Transmission,
  type TurboPart,
} from "@/domain/parts/index";
import { vehicleSwaps } from "@/domain/vehicles/catalog";
import type { Vehicle } from "@/domain/vehicles/types";
import type {
  ActiveBuildSlots,
  PartSlotKind,
  PartSortOption,
  ResolvedBuildParts,
} from "@/types/tuning.types";

export function resolveBuildParts(
  vehicle: Vehicle,
  slots: ActiveBuildSlots,
): ResolvedBuildParts {
  const oemEngine = getEngine(vehicle.oem.engineId) ?? {
    id: vehicle.oem.engineId,
    kind: "engine" as const,
    code: `${vehicle.model} ${vehicle.trim}`,
    family: "OEM Stock",
    maker: "hyundai-kia" as const,
    displacementCc: 2000,
    cylinders: 4 as const,
    cylinderLayout: "inline" as const,
    weightKg: 155,
    valvetrain: "dohc",
    aspiration: "turbo" as const,
    fuel: "petrol" as const,
    powerHp: 250,
    torqueNm: 350,
    tunedTorqueNm: 420,
    orientation: vehicle.layout.includes("transverse") ? "transverse" as const : "longitudinal" as const,
    mountFamilies: vehicle.engineMountFamilies,
    bellhousing: "oem",
    ecuFamily: "oem-stock",
    swapTags: vehicle.swapTags,
  };

  const oemTrans = getTransmission(vehicle.oem.transmissionId) ?? {
    id: vehicle.oem.transmissionId,
    kind: "transmission" as const,
    code: "Stock Transmission",
    name: "OEM Gearbox",
    maker: "hyundai-kia" as const,
    type: "at" as const,
    gears: 6,
    torqueCapacityNm: 450,
    layouts: [vehicle.layout],
    mountFamilies: vehicle.transMountFamilies,
    bellhousings: ["oem"],
    swapTags: vehicle.swapTags,
    weightKg: 65,
  };

  const stockDlId = vehicle.oem.drivelineIds[0] ?? "dl-stock-open";
  const oemDriveline = getDriveline(stockDlId) ?? {
    id: stockDlId,
    kind: "driveline" as const,
    code: "OEM-DIFF",
    name: "OEM Differential",
    subtype: "differential" as const,
    maker: "hyundai-kia" as const,
    layouts: [vehicle.layout],
    swapTags: vehicle.swapTags,
  };

  const engine = slots.engineId ? getEngine(slots.engineId) ?? oemEngine : oemEngine;
  const transmission = slots.transId ? getTransmission(slots.transId) ?? oemTrans : oemTrans;
  const driveline = slots.drivelineId ? getDriveline(slots.drivelineId) ?? oemDriveline : oemDriveline;

  const mounts = slots.mountId ? getMount(slots.mountId) ?? null : null;
  const cooling = slots.coolingId ? getCooling(slots.coolingId) ?? null : null;
  const differential = slots.diffId ? getDifferential(slots.diffId) ?? null : null;

  const turbo = slots.turboId ? getTurbo(slots.turboId) ?? null : null;
  const intake = slots.intakeId ? getIntake(slots.intakeId) ?? null : null;
  const exhaust = slots.exhaustId ? getExhaust(slots.exhaustId) ?? null : null;
  const brakes = slots.brakeId ? getBrake(slots.brakeId) ?? null : null;
  const suspension = slots.suspensionId ? getSuspension(slots.suspensionId) ?? null : null;
  const ecu = slots.ecuId ? getEcu(slots.ecuId) ?? null : null;

  return {
    engine,
    transmission,
    driveline,
    mounts,
    cooling,
    differential,
    turbo,
    intake,
    exhaust,
    brakes,
    suspension,
    ecu,
    isCustomEngine: Boolean(slots.engineId && slots.engineId !== vehicle.oem.engineId),
    isCustomTrans: Boolean(slots.transId && slots.transId !== vehicle.oem.transmissionId),
    isCustomDriveline: Boolean(slots.drivelineId && slots.drivelineId !== stockDlId),
    isCustomMounts: Boolean(slots.mountId),
    isCustomCooling: Boolean(slots.coolingId),
    isCustomDiff: Boolean(slots.diffId),
    isCustomTurbo: Boolean(slots.turboId),
    isCustomIntake: Boolean(slots.intakeId),
    isCustomExhaust: Boolean(slots.exhaustId),
    isCustomBrakes: Boolean(slots.brakeId),
    isCustomSuspension: Boolean(slots.suspensionId),
    isCustomEcu: Boolean(slots.ecuId),
  };
}

export function getCompatibleSwapsBySlot(
  vehicle: Vehicle,
  slot: PartSlotKind,
  activeEngineId?: string,
): SwapMatch[] {
  if (slot === "mounts") {
    return listMounts().map((m) => ({
      part: m,
      fit: "bolt-in" as Fitment,
      reasons: ["Прямой крепеж на штатные точки подрамника"],
    }));
  }
  if (slot === "cooling") {
    return listCoolings().map((c) => ({
      part: c,
      fit: "bolt-in" as Fitment,
      reasons: ["Высокопроизводительное охлаждение контура ДВС"],
    }));
  }
  if (slot === "differential") {
    return listDifferentials().map((d) => ({
      part: d,
      fit: "bolt-in" as Fitment,
      reasons: ["Усиленный самоблок в штатный корпус редуктора"],
    }));
  }
  const allSwaps = vehicleSwaps(vehicle, activeEngineId);
  return allSwaps.filter((s) => s.part.kind === slot);
}

export function filterAndSortPartSwaps(
  swaps: SwapMatch[],
  query: string,
  fitFilter: "all" | Fitment,
  sortOrder: PartSortOption,
): SwapMatch[] {
  const q = query.trim().toLowerCase();

  const filtered = swaps.filter((s) => {
    if (fitFilter !== "all" && s.fit !== fitFilter) return false;
    if (!q) return true;
    const p = s.part;
    const code = p.code ?? "";
    const name = "name" in p ? String(p.name) : "";
    const family = "family" in p ? String(p.family) : "";
    const maker = "maker" in p ? String(p.maker) : "";
    const notes = "notes" in p ? String(p.notes) : "";
    const target = `${p.id} ${code} ${name} ${family} ${maker} ${notes}`.toLowerCase();
    return target.includes(q);
  });

  if (sortOrder === "power-desc") {
    return [...filtered].sort((a, b) => {
      const getPowerScore = (part: Part): number => {
        if ("powerHp" in part && typeof part.powerHp === "number") return part.powerHp;
        if ("powerGainHp" in part && typeof part.powerGainHp === "number") return part.powerGainHp;
        if ("torqueCapacityNm" in part && typeof part.torqueCapacityNm === "number") return part.torqueCapacityNm;
        return 0;
      };
      return getPowerScore(b.part) - getPowerScore(a.part);
    });
  }

  if (sortOrder === "fitment") {
    const fitRank: Record<Fitment, number> = { "bolt-in": 1, kit: 2, custom: 3 };
    return [...filtered].sort((a, b) => (fitRank[a.fit] ?? 99) - (fitRank[b.fit] ?? 99));
  }

  if (sortOrder === "alpha") {
    return [...filtered].sort((a, b) => {
      const nameA = ("name" in a.part ? String(a.part.name) : a.part.code).toLowerCase();
      const nameB = ("name" in b.part ? String(b.part.name) : b.part.code).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  return filtered;
}
