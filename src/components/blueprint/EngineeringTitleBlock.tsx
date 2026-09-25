"use client";

import React from "react";
import type { Vehicle } from "@/domain/vehicles/types";
import type { FormattedTelemetry, ResolvedBuildParts } from "@/types/tuning.types";
import { BRAND_LABELS, LAYOUT_LABELS } from "@/constants/tuning";

interface EngineeringTitleBlockProps {
  vehicle: Vehicle;
  resolved: ResolvedBuildParts;
  telemetry: FormattedTelemetry;
  cadMode: "dark-cad" | "classic-blueprint" | "stress-heatmap";
}

export function EngineeringTitleBlock({
  vehicle,
  resolved,
  telemetry,
  cadMode,
}: EngineeringTitleBlockProps) {
  const currentDate = new Date().toISOString().split("T")[0].replace(/-/g, ".");

  const isClassic = cadMode === "classic-blueprint";

  return (
    <div
      className={`w-full max-w-2xl border rounded-lg overflow-hidden font-mono text-[10px] select-none transition-colors ${
        isClassic
          ? "bg-[#0b274a] border-cyan-500/60 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          : "bg-slate-950/95 border-slate-700/80 text-slate-300 shadow-xl"
      }`}
    >
      {/* Title Block Grid */}
      <div className="grid grid-cols-12 divide-x divide-y divide-slate-800/80 border-b border-slate-800/80">
        {/* Cell 1: Organization & Logo (cols 4) */}
        <div className="col-span-12 sm:col-span-4 p-2.5 flex flex-col justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold">
              DESIGN & ENGINEERING
            </div>
            <div className="text-xs font-black text-white tracking-wider mt-0.5">
              APEX FORGE MODS
            </div>
          </div>
          <div className="text-[9px] text-slate-400 mt-2">
            «BUILT, NOT BOUGHT»
          </div>
        </div>

        {/* Cell 2: Vehicle Title & Specs (cols 5) */}
        <div className="col-span-12 sm:col-span-5 p-2.5 flex flex-col justify-between">
          <div className="text-[9px] uppercase tracking-wider text-slate-400">
            ИЗДЕЛИЕ / ПЛАТФОРМА (ASSEMBLY / PLATFORM)
          </div>
          <div className="text-xs font-bold text-white truncate mt-0.5">
            {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model} {vehicle.trim}
          </div>
          <div className="text-[9px] text-cyan-300/80 truncate mt-1">
            Платформа: {vehicle.platform} · {LAYOUT_LABELS[vehicle.layout]}
          </div>
        </div>

        {/* Cell 3: Document Number & Scale (cols 3) */}
        <div className="col-span-12 sm:col-span-3 p-2.5 flex flex-col justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              ЧЕРТЕЖ (DWG NO.)
            </div>
            <div className="text-[10px] font-bold text-amber-400 truncate mt-0.5">
              AF-MOD-{vehicle.id.slice(0, 10).toUpperCase()}
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
            <span>МАСШТАБ: <strong>1:25</strong></span>
            <span>ЛИСТ: <strong>01/01</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Installed Components Spec Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800/80 p-2 bg-slate-900/40 text-[9px]">
        <div className="px-2 py-1">
          <span className="text-slate-400 block uppercase">Силовой агрегат (ICE):</span>
          <strong className="text-white truncate block">{resolved.engine.code}</strong>
          <span className="text-cyan-400 font-semibold">{telemetry.powerHp} л.с. · {telemetry.torqueNm} Н·м</span>
        </div>

        <div className="px-2 py-1">
          <span className="text-slate-400 block uppercase">Трансмиссия (Gearbox):</span>
          <strong className="text-white truncate block">{resolved.transmission.code}</strong>
          <span className="text-slate-300">{resolved.transmission.gears} передачи ({resolved.transmission.type.toUpperCase()})</span>
        </div>

        <div className="px-2 py-1">
          <span className="text-slate-400 block uppercase">Задний мост / LSD:</span>
          <strong className="text-white truncate block">{resolved.differential?.code ?? "OEM Open"}</strong>
          <span className="text-slate-300">{resolved.driveline.code}</span>
        </div>

        <div className="px-2 py-1">
          <span className="text-slate-400 block uppercase">Вес & Развесовка:</span>
          <strong className="text-amber-400 block">{telemetry.weightKg} кг</strong>
          <span className="text-cyan-300">{telemetry.frontWeightPct}% F : {telemetry.rearWeightPct}% R</span>
        </div>
      </div>

      {/* Row 3: Approval Stamps & Date */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 text-[8.5px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>СТАНДАРТ: <strong>ISO 128 / ГОСТ 2.104</strong></span>
          <span>ВЕРИФИКАЦИЯ: <strong className="text-emerald-400">PASSED 100%</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span>ДАТА ВЫПУСКА: <strong>{currentDate} (KST)</strong></span>
          <span className="text-cyan-400 font-bold">APEX FORGE CAD 2.0</span>
        </div>
      </div>
    </div>
  );
}
