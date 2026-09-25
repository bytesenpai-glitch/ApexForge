import { germany } from "./data/germany.js";
import { hyundai } from "./data/hyundai.js";
import { japan } from "./data/japan.js";
import { kia } from "./data/kia.js";
import { usa } from "./data/usa.js";
import type { Brand, Region, Vehicle } from "./types.js";

const vehicles: Vehicle[] = [...japan, ...germany, ...usa, ...hyundai, ...kia];
const byId = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

export function listVehicles(filter?: { brand?: Brand; region?: Region } | Brand): Vehicle[] {
  if (typeof filter === "string") {
    return vehicles.filter((v) => v.brand === filter);
  }
  if (!filter) return [...vehicles];

  return vehicles.filter((v) => {
    if (filter.region && v.region !== filter.region) return false;
    if (filter.brand && v.brand !== filter.brand) return false;
    return true;
  });
}

export function getVehicle(id: string): Vehicle | undefined {
  return byId.get(id);
}

export function findVehicles(query: {
  region?: Region;
  brand?: Brand;
  model?: string;
  platform?: string;
  generation?: string;
}): Vehicle[] {
  const model = query.model?.toLowerCase();
  return vehicles.filter((vehicle) => {
    if (query.region && vehicle.region !== query.region) return false;
    if (query.brand && vehicle.brand !== query.brand) return false;
    if (query.platform && vehicle.platform !== query.platform) return false;
    if (query.generation && vehicle.generation !== query.generation) return false;
    if (model && !vehicle.model.toLowerCase().includes(model)) return false;
    return true;
  });
}
