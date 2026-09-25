"use client";

import React from "react";
import { Flame, Layers, Car, RotateCcw, CheckCircle2 } from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { BRAND_LABELS, LAYOUT_LABELS } from "@/constants/tuning";

export function AppHeader() {
  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);
  const toastMessage = useUiStore((s) => s.toastMessage);
  const showToast = useUiStore((s) => s.showToast);

  const resetAllToOem = useBuildStore((s) => s.resetAllToOem);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];

  const handleReset = () => {
    resetAllToOem();
    showToast("Все узлы возвращены в заводское состояние (OEM Stock)");
  };

  return (
    <header className="flex-shrink-0 bg-slate-950/90 backdrop-blur border-b border-slate-800 text-slate-100 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Slogan Banner */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-lg shadow-amber-950/40">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-black tracking-tight text-white uppercase">
                APEX FORGE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold tracking-wider">
                BUILT, NOT BOUGHT
              </span>
            </div>
            {vehicle ? (
              <p className="text-xs text-slate-400 truncate">
                {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model} {vehicle.trim} · {LAYOUT_LABELS[vehicle.layout]}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 truncate">
                The Local-First Modding Canvas for Track & Street Builds
              </p>
            )}
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("garage")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "garage"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Гараж (Garage)</span>
            </button>
            <button
              onClick={() => setViewMode("blueprint")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "blueprint"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D CAD Чертёж</span>
            </button>
          </div>

          {/* Reset to Stock Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Сбросить все доработки до заводских"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Сброс OEM</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="bg-amber-950/80 border-t border-amber-500/30 px-4 py-1.5 text-xs text-amber-300 text-center flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
}
