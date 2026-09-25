// Shareable build URL encoder and decoder for Apex Forge
// Allows sharing complete track & street mod configurations via lightweight URL query params

import type { ActiveBuildSlots } from "@/types/tuning.types";

export interface SerializedBuildParams {
  v: string; // vehicleId
  eng?: string;
  tr?: string;
  dl?: string;
  mnt?: string;
  cl?: string;
  diff?: string;
  tb?: string;
  it?: string;
  ex?: string;
  brk?: string;
  susp?: string;
  ecu?: string;
}

export function encodeBuildToQuery(
  vehicleId: string,
  slots: ActiveBuildSlots
): string {
  const params = new URLSearchParams();
  params.set("v", vehicleId);

  if (slots.engineId) params.set("eng", slots.engineId);
  if (slots.transId) params.set("tr", slots.transId);
  if (slots.drivelineId) params.set("dl", slots.drivelineId);
  if (slots.mountId) params.set("mnt", slots.mountId);
  if (slots.coolingId) params.set("cl", slots.coolingId);
  if (slots.diffId) params.set("diff", slots.diffId);
  if (slots.turboId) params.set("tb", slots.turboId);
  if (slots.intakeId) params.set("it", slots.intakeId);
  if (slots.exhaustId) params.set("ex", slots.exhaustId);
  if (slots.brakeId) params.set("brk", slots.brakeId);
  if (slots.suspensionId) params.set("susp", slots.suspensionId);
  if (slots.ecuId) params.set("ecu", slots.ecuId);

  return params.toString();
}

export function decodeBuildFromQuery(
  searchParams: URLSearchParams
): { vehicleId: string | null; slots: Partial<ActiveBuildSlots> } {
  const vehicleId = searchParams.get("v");

  const slots: Partial<ActiveBuildSlots> = {};
  if (searchParams.has("eng")) slots.engineId = searchParams.get("eng");
  if (searchParams.has("tr")) slots.transId = searchParams.get("tr");
  if (searchParams.has("dl")) slots.drivelineId = searchParams.get("dl");
  if (searchParams.has("mnt")) slots.mountId = searchParams.get("mnt");
  if (searchParams.has("cl")) slots.coolingId = searchParams.get("cl");
  if (searchParams.has("diff")) slots.diffId = searchParams.get("diff");
  if (searchParams.has("tb")) slots.turboId = searchParams.get("tb");
  if (searchParams.has("it")) slots.intakeId = searchParams.get("it");
  if (searchParams.has("ex")) slots.exhaustId = searchParams.get("ex");
  if (searchParams.has("brk")) slots.brakeId = searchParams.get("brk");
  if (searchParams.has("susp")) slots.suspensionId = searchParams.get("susp");
  if (searchParams.has("ecu")) slots.ecuId = searchParams.get("ecu");

  return { vehicleId, slots };
}

export function getFullShareableUrl(
  vehicleId: string,
  slots: ActiveBuildSlots
): string {
  if (typeof window === "undefined") return "";
  const query = encodeBuildToQuery(vehicleId, slots);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?${query}`;
}
