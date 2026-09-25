"use client";

import { create } from "zustand";
import { listVehicles, type Brand, type Region, type Vehicle } from "@at-sim/vehicles";
import type { DriveFilter, VehicleSortOption } from "@/types/tuning.types";

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  regionFilter: "all" | Region;
  brandFilter: "all" | Brand;
  driveFilter: DriveFilter;
  bodyFilter: string;
  searchQuery: string;
  vehicleSort: VehicleSortOption;

  // Actions
  selectVehicle: (id: string) => void;
  setRegionFilter: (region: "all" | Region) => void;
  setBrandFilter: (brand: "all" | Brand) => void;
  setDriveFilter: (drive: DriveFilter) => void;
  setBodyFilter: (body: string) => void;
  setSearchQuery: (query: string) => void;
  setVehicleSort: (sort: VehicleSortOption) => void;
}

const allVehicles = listVehicles();
const defaultCarId = allVehicles[0]?.id ?? "kia-stinger-ck-20t";

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: allVehicles,
  selectedVehicleId: defaultCarId,
  regionFilter: "all",
  brandFilter: "all",
  driveFilter: "all",
  bodyFilter: "all",
  searchQuery: "",
  vehicleSort: "default",

  selectVehicle: (id: string) => set({ selectedVehicleId: id }),
  setRegionFilter: (region) => set({ regionFilter: region }),
  setBrandFilter: (brand) => set({ brandFilter: brand }),
  setDriveFilter: (drive) => set({ driveFilter: drive }),
  setBodyFilter: (body) => set({ bodyFilter: body }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setVehicleSort: (vehicleSort) => set({ vehicleSort }),
}));
