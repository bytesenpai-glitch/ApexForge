import type { Vehicle, Brand, Region } from "@at-sim/vehicles";
import { getEngine } from "@at-sim/parts";
import type { DriveFilter, VehicleSortOption } from "@/types/tuning.types";

export interface VehicleFilterCriteria {
  region: "all" | Region;
  brand: "all" | Brand;
  drive: DriveFilter;
  body: string;
  query: string;
  sort: VehicleSortOption;
}

export function filterAndSortVehicles(
  vehicles: Vehicle[],
  criteria: VehicleFilterCriteria,
): Vehicle[] {
  const { region, brand, drive, body, query, sort } = criteria;
  const q = query.trim().toLowerCase();

  const filtered = vehicles.filter((v) => {
    if (region !== "all" && v.region !== region) return false;
    if (brand !== "all" && v.brand !== brand) return false;
    if (body !== "all" && v.body !== body) return false;

    if (drive !== "all") {
      const isDriveMatch =
        (drive === "rwd" && v.layout === "longitudinal-rwd") ||
        (drive === "awd" && (v.layout === "longitudinal-awd" || v.layout === "transverse-awd")) ||
        (drive === "fwd" && v.layout === "transverse-fwd");
      if (!isDriveMatch) return false;
    }

    if (q) {
      const target = `${v.id} ${v.brand} ${v.model} ${v.trim} ${v.generation} ${v.platform} ${v.years.from}`.toLowerCase();
      if (!target.includes(q)) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    const getStockHp = (veh: Vehicle): number => {
      const eng = getEngine(veh.oem.engineId);
      return eng?.powerHp ?? 200;
    };

    if (sort === "power-desc") return getStockHp(b) - getStockHp(a);
    if (sort === "power-asc") return getStockHp(a) - getStockHp(b);
    if (sort === "year-desc") return b.years.from - a.years.from;
    if (sort === "year-asc") return a.years.from - b.years.from;
    if (sort === "alpha") return `${a.model} ${a.trim}`.localeCompare(`${b.model} ${b.trim}`);
    return 0;
  });
}
