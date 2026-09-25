"use client";

import React, { useMemo } from "react";
import { Search, Car } from "lucide-react";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { filterAndSortVehicles } from "@/services/catalogFilterService";
import { BRAND_LABELS, DRIVE_LIST, REGION_LIST } from "@/constants/tuning";
import type { Brand, VehicleSortOption } from "@/types/tuning.types";

export function VehicleSelector() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const selectVehicle = useVehicleStore((s) => s.selectVehicle);

  const regionFilter = useVehicleStore((s) => s.regionFilter);
  const setRegionFilter = useVehicleStore((s) => s.setRegionFilter);
  const driveFilter = useVehicleStore((s) => s.driveFilter);
  const setDriveFilter = useVehicleStore((s) => s.setDriveFilter);
  const brandFilter = useVehicleStore((s) => s.brandFilter);
  const setBrandFilter = useVehicleStore((s) => s.setBrandFilter);
  const searchQuery = useVehicleStore((s) => s.searchQuery);
  const setSearchQuery = useVehicleStore((s) => s.setSearchQuery);
  const vehicleSort = useVehicleStore((s) => s.vehicleSort);
  const setVehicleSort = useVehicleStore((s) => s.setVehicleSort);

  const availableBrands = useMemo(() => {
    return Array.from(new Set(vehicles.map((v) => v.brand))).sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return filterAndSortVehicles(vehicles, {
      region: regionFilter,
      brand: brandFilter,
      drive: driveFilter,
      body: "all",
      query: searchQuery,
      sort: vehicleSort,
    });
  }, [vehicles, regionFilter, brandFilter, driveFilter, searchQuery, vehicleSort]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur space-y-4">
      {/* Search & Selector Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Car Dropdown Picker */}
        <div className="flex-1 relative">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Выбор автомобиля (차량 선택)
          </label>
          <div className="relative">
            <Car className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedVehicleId}
              onChange={(e) => selectVehicle(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {filteredVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {BRAND_LABELS[v.brand] ?? v.brand} {v.model} {v.trim} ({v.years.from})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="sm:w-72">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Поиск модели / шасси
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Stinger, Supra, Skyline, M3..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Region Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {REGION_LIST.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegionFilter(r.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                regionFilter === r.id
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {r.code}
            </button>
          ))}
        </div>

        {/* Drive Layout Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {DRIVE_LIST.map((d) => (
            <button
              key={d.id}
              onClick={() => setDriveFilter(d.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                driveFilter === d.id
                  ? "bg-cyan-600 text-white font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {d.tag}
            </button>
          ))}
        </div>

        {/* Brand Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value as "all" | Brand)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Все марки (All Brands)</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {BRAND_LABELS[b] ?? b}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={vehicleSort}
            onChange={(e) => setVehicleSort(e.target.value as VehicleSortOption)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="default">Сортировка: По умолчанию</option>
            <option value="power-desc">Мощность: по убыванию</option>
            <option value="power-asc">Мощность: по возрастанию</option>
            <option value="year-desc">Год выпуска: новее</option>
            <option value="alpha">По названию (А-Я)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
