import {
  canSwap,
  getEngine,
  getPart,
  getTransmission,
  listSwaps,
  type ChassisFitment,
  type SwapMatch,
} from "@at-sim/parts";
import type { Vehicle } from "./types";

export function toChassis(vehicle: Vehicle): ChassisFitment {
  return {
    id: vehicle.id,
    layout: vehicle.layout,
    engineMountFamilies: vehicle.engineMountFamilies,
    transMountFamilies: vehicle.transMountFamilies,
    swapTags: vehicle.swapTags,
    oemEngineId: vehicle.oem.engineId,
    oemTransmissionId: vehicle.oem.transmissionId,
    oemDrivelineIds: vehicle.oem.drivelineIds,
  };
}

export function vehicleSwaps(vehicle: Vehicle, engineOverrideId?: string): SwapMatch[] {
  return listSwaps(toChassis(vehicle), engineOverrideId);
}

export function vehicleCanSwap(
  vehicle: Vehicle,
  partId: string,
  engineOverrideId?: string,
): SwapMatch | undefined {
  return canSwap(toChassis(vehicle), partId, engineOverrideId);
}

export function describeOem(vehicle: Vehicle): string {
  const engine = getEngine(vehicle.oem.engineId);
  const trans = getTransmission(vehicle.oem.transmissionId);
  const drivelines = vehicle.oem.drivelineIds.map((id) => {
    const part = getPart(id);
    return part && "name" in part ? part.name : id;
  });

  const engineLabel = engine
    ? `${engine.code} ${engine.family} ${engine.powerHp} hp / ${engine.torqueNm} Nm`
    : vehicle.oem.engineId;
  const transLabel = trans ? `${trans.code} ${trans.name}` : vehicle.oem.transmissionId;

  return `${engineLabel} + ${transLabel}` + (drivelines.length ? ` + ${drivelines.join(", ")}` : "");
}
