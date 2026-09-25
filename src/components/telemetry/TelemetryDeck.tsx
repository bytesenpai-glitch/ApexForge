"use client";

import React, { useMemo, useState } from "react";
import {
  Gauge,
  Zap,
  Activity,
  AlertTriangle,
  Timer,
  Scale,
  Disc,
  Volume2,
  CheckCircle,
  Play,
  Trophy,
} from "lucide-react";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { resolveBuildParts } from "@/services/swapService";
import { computeVehicleTelemetry } from "@/services/telemetryService";
import { DynoRunModal } from "./DynoRunModal";
import { DragStripModal } from "./DragStripModal";

export function TelemetryDeck() {
  const [isDynoOpen, setIsDynoOpen] = useState(false);
  const [isDragStripOpen, setIsDragStripOpen] = useState(false);

  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const slots = useBuildStore((s) => s.slots);

  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const resolved = useMemo(() => {
    return resolveBuildParts(vehicle, slots);
  }, [vehicle, slots]);

  const telemetry = useMemo(() => {
    return computeVehicleTelemetry(vehicle, resolved);
  }, [vehicle, resolved]);

  const powerGain = telemetry.raw.powerDeltaHp;
  const torqueGain = telemetry.raw.torqueDeltaNm;

  return (
    <div className="space-y-4">
      {/* Over-Torque Warning Alert */}
      {telemetry.torqueWarning && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold">Превышение предельного момента КПП (변속기 허용 토크 초과)</span>
            <p className="text-amber-200/80">
              Текущий крутящий момент ({telemetry.torqueNm} Н·м) превышает заявленную заводом прочность коробки ({resolved.transmission.torqueCapacityNm} Н·м) на {Math.abs(telemetry.torqueHeadroomNm)} Н·м. Рекомендуется усиление пакета сцеплений или свап на более прочную трансмиссию.
            </p>
          </div>
        </div>
      )}

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Power Card (Clickable to open Dyno) */}
        <div
          onClick={() => setIsDynoOpen(true)}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all group active:scale-98"
          title="Открыть интерактивный виртуальный диностенд (Dyno Graph)"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium group-hover:text-cyan-300 transition-colors">Мощность</span>
            <Gauge className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {telemetry.powerHp} <span className="text-xs font-normal text-slate-400">л.с.</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              {powerGain > 0 ? (
                <span className="text-emerald-400 font-semibold font-mono">+{powerGain} л.с.</span>
              ) : powerGain < 0 ? (
                <span className="text-amber-400 font-semibold font-mono">{powerGain} л.с.</span>
              ) : (
                <span className="text-slate-500">Завод (OEM)</span>
              )}
              <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                График ↗
              </span>
            </div>
          </div>
        </div>

        {/* Torque Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Крутящий момент</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {telemetry.torqueNm} <span className="text-xs font-normal text-slate-400">Н·м</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              {torqueGain > 0 ? (
                <span className="text-cyan-400 font-semibold font-mono">+{torqueGain} Н·м</span>
              ) : torqueGain < 0 ? (
                <span className="text-amber-400 font-semibold font-mono">{torqueGain} Н·м</span>
              ) : (
                <span className="text-slate-500">Завод (OEM)</span>
              )}
            </div>
          </div>
        </div>

        {/* 0-100 Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Разгон 0-100</span>
            <Timer className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {telemetry.zeroTo100}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">100-200: {telemetry.hundredTo200}</div>
          </div>
        </div>

        {/* 1/4 Mile Card (Clickable to open Drag Strip) */}
        <div
          onClick={() => setIsDragStripOpen(true)}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all group active:scale-98"
          title="Открыть симулятор заезда на 402м с огнями светофора (Drag Strip)"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium group-hover:text-amber-300 transition-colors">1/4 мили (402м)</span>
            <Activity className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {telemetry.quarterMileEt}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Выход: {telemetry.quarterMileTrap}</span>
              <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                Заезд ↗
              </span>
            </div>
          </div>
        </div>

        {/* Weight & Balance Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Развесовка / F:R</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {telemetry.frontWeightPct}<span className="text-xs font-normal text-slate-400">:{telemetry.rearWeightPct}%</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-1 font-semibold">
              {telemetry.weightKg} кг · {telemetry.ptwRatio} л.с./т
            </div>
          </div>
        </div>

        {/* Brakes & Safety Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Тормоза / Охлаждение</span>
            <Disc className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {telemetry.brakeDistance}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] mt-1">
              <span className="text-emerald-400 font-mono font-medium">
                Термо: {telemetry.thermalEnduranceRating}/10
              </span>
              <Volume2 className="w-3 h-3 text-slate-500" />
              <span className="text-slate-400 font-mono">{telemetry.raw.soundDb} дБ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Interactive Simulation Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="size-3.5 text-cyan-400" />
          <span>Стендовые испытания:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDynoOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-bold transition-all cursor-pointer hover:border-cyan-400"
          >
            <Play className="size-3 fill-current" />
            <span>Виртуальный диностенд (Dyno Pull)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDragStripOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer hover:border-amber-400"
          >
            <Trophy className="size-3" />
            <span>Заезд на 402 м (Drag Strip)</span>
          </button>
        </div>
      </div>

      {/* Dyno Run Modal */}
      <DynoRunModal
        isOpen={isDynoOpen}
        onClose={() => setIsDynoOpen(false)}
        vehicle={vehicle}
        resolved={resolved}
        telemetry={telemetry}
      />

      {/* Drag Strip Simulator Modal */}
      <DragStripModal
        isOpen={isDragStripOpen}
        onClose={() => setIsDragStripOpen(false)}
        vehicle={vehicle}
        resolved={resolved}
        telemetry={telemetry}
      />
    </div>
  );
}
