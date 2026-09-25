"use client";

import React, { useMemo, useState } from "react";
import { getEngine, getTransmission, getDriveline } from "@/domain/parts/swap";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useUiStore } from "@/stores/useUiStore";
import { BRAND_LABELS, LAYOUT_LABELS, REGION_LABELS } from "@/constants/tuning";
import { Layers, Tag, ChevronDown, ChevronUp } from "lucide-react";

export function VehicleSpecsCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const setViewMode = useUiStore((s) => s.setViewMode);

  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const stockEngine = useMemo(() => getEngine(vehicle.oem.engineId), [vehicle]);
  const stockTrans = useMemo(() => getTransmission(vehicle.oem.transmissionId), [vehicle]);
  const stockDriveline = useMemo(() => getDriveline(vehicle.oem.drivelineIds[0]), [vehicle]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur space-y-3">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {REGION_LABELS[vehicle.region]}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {vehicle.years.from}–{vehicle.years.to}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              Платформа: {vehicle.platform}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
            {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model} {vehicle.trim}
            <span className="text-xs font-normal text-slate-400 ml-2">({vehicle.generation})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Компоновка: {LAYOUT_LABELS[vehicle.layout]} · Кузов: {vehicle.body.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <span>{isExpanded ? "Скрыть сток OEM" : "Спеки стока OEM"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setViewMode("blueprint")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-950"
          >
            <Layers className="w-4 h-4" />
            <span>2D CAD Чертёж</span>
          </button>
        </div>
      </div>

      {/* Expandable Stock Specs Matrix */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-800/80 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Engine Card */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                Заводской ДВС (OEM Engine)
              </span>
              <div className="text-xs font-bold text-white mt-1">
                {stockEngine ? `${stockEngine.code}` : vehicle.oem.engineId}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {stockEngine
                  ? `${(stockEngine.displacementCc / 1000).toFixed(1)}L · ${stockEngine.cylinders} цил. · ${stockEngine.powerHp} л.с. / ${stockEngine.torqueNm} Н·м`
                  : "Стоковый мотор"}
              </p>
            </div>

            {/* Transmission Card */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block">
                Заводская КПП (OEM Gearbox)
              </span>
              <div className="text-xs font-bold text-white mt-1">
                {stockTrans ? `${stockTrans.code}` : vehicle.oem.transmissionId}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {stockTrans
                  ? `${stockTrans.type.toUpperCase()} · ${stockTrans.gears} передач · лимит ${stockTrans.torqueCapacityNm} Н·м`
                  : "Стоковая трансмиссия"}
              </p>
            </div>

            {/* Driveline Card */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                Гудонная часть (Driveline)
              </span>
              <div className="text-xs font-bold text-white mt-1 truncate">
                {stockDriveline ? `${stockDriveline.name}` : "Заводской редуктор"}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {stockDriveline
                  ? `${stockDriveline.subtype === "differential" ? "Дифференциал" : "Раздатка (AWD)"} · ${stockDriveline.code}`
                  : "Stock open diff"}
              </p>
            </div>
          </div>

          {/* Swap Ecosystem Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Свап-теги:
            </span>
            {vehicle.swapTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-400"
              >
                #{tag}
              </span>
            ))}
            {vehicle.engineMountFamilies.map((m) => (
              <span
                key={m}
                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400"
              >
                mount:{m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
