"use client";

import React, { useMemo, useState } from "react";
import {
  Layers,
  Sliders,
  RotateCcw,
  Compass,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Scan,
} from "lucide-react";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useUiStore } from "@/stores/useUiStore";
import { resolveBuildParts } from "@/services/swapService";
import { computeVehicleTelemetry } from "@/services/telemetryService";
import { BRAND_LABELS, LAYOUT_LABELS } from "@/constants/tuning";
import type { PartSlotKind } from "@/types/tuning.types";
import { BlueprintTopView } from "./BlueprintTopView";
import { BlueprintSideView } from "./BlueprintSideView";
import { getBodyArchetype } from "./bodySilhouettes";

type CadVisualMode = "dark-cad" | "classic-blueprint" | "stress-heatmap";
type CadProjection = "top" | "side" | "dual";

interface CadLayerConfig {
  chassis: boolean;
  powertrain: boolean;
  cooling: boolean;
  drivetrain: boolean;
  suspension: boolean;
  brakes: boolean;
  plumbing: boolean;
  dimensions: boolean;
}

const VEHICLE_GEOMETRY_SPECS: Record<string, { wheelbaseMm: number; frontTrackMm: number; rearTrackMm: number }> = {
  "elantra-n": { wheelbaseMm: 2720, frontTrackMm: 1585, rearTrackMm: 1581 },
  "stinger-gt": { wheelbaseMm: 2905, frontTrackMm: 1596, rearTrackMm: 1619 },
  "g70-33t": { wheelbaseMm: 2835, frontTrackMm: 1595, rearTrackMm: 1604 },
  "miata-na": { wheelbaseMm: 2265, frontTrackMm: 1410, rearTrackMm: 1425 },
  "miata-nd": { wheelbaseMm: 2310, frontTrackMm: 1495, rearTrackMm: 1505 },
  "silvia-s15": { wheelbaseMm: 2525, frontTrackMm: 1470, rearTrackMm: 1460 },
  "gtr-r35": { wheelbaseMm: 2780, frontTrackMm: 1590, rearTrackMm: 1600 },
  "supra-a80": { wheelbaseMm: 2550, frontTrackMm: 1520, rearTrackMm: 1525 },
  "supra-a90": { wheelbaseMm: 2470, frontTrackMm: 1594, rearTrackMm: 1589 },
  "bmw-m3-e46": { wheelbaseMm: 2731, frontTrackMm: 1508, rearTrackMm: 1525 },
  "bmw-m3-g80": { wheelbaseMm: 2857, frontTrackMm: 1617, rearTrackMm: 1605 },
  "golf-r-mk7": { wheelbaseMm: 2631, frontTrackMm: 1535, rearTrackMm: 1506 },
  "porsche-992-gt3": { wheelbaseMm: 2457, frontTrackMm: 1601, rearTrackMm: 1553 },
  "mustang-s550": { wheelbaseMm: 2720, frontTrackMm: 1582, rearTrackMm: 1655 },
  "hellcat-redeye": { wheelbaseMm: 2950, frontTrackMm: 1610, rearTrackMm: 1620 },
  "ford-f150-raptor-v8": { wheelbaseMm: 3680, frontTrackMm: 1880, rearTrackMm: 1870 },
  "toyota-land-cruiser-lc300": { wheelbaseMm: 2850, frontTrackMm: 1667, rearTrackMm: 1668 },
};

const BODY_ARCHETYPE_LABELS: Record<string, { label: string; badge: string; icon: string }> = {
  coupe: { label: "Спортивное купе / Фастбек", badge: "COUPE / FASTBACK", icon: "🏎️" },
  sedan: { label: "Классический 3-объемный седан", badge: "3-BOX SEDAN", icon: "🚗" },
  hatch: { label: "Хэтчбек / Лифтбек", badge: "HOT-HATCH / LIFTBACK", icon: "🚙" },
  convertible: { label: "Родстер / Кабриолет", badge: "ROADSTER / OPEN-TOP", icon: "🏎️" },
  suv: { label: "Внедорожник 4x4 / SUV", badge: "OFFROAD 4x4 / SUV", icon: "🚙" },
  pickup: { label: "Пикап с открытым кузовом", badge: "PICKUP TRUCK", icon: "🛻" },
};

export function BlueprintCanvas() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const slots = useBuildStore((s) => s.slots);
  const resetAllToOem = useBuildStore((s) => s.resetAllToOem);
  const resolved = useMemo(() => resolveBuildParts(vehicle, slots), [vehicle, slots]);
  const telemetry = useMemo(() => computeVehicleTelemetry(vehicle, resolved), [vehicle, resolved]);

  const openDrawer = useUiStore((s) => s.openDrawer);

  const [cadMode, setCadMode] = useState<CadVisualMode>("dark-cad");
  const [projection, setProjection] = useState<CadProjection>("top");
  const [layers, setLayers] = useState<CadLayerConfig>({
    chassis: true,
    powertrain: true,
    cooling: true,
    drivetrain: true,
    suspension: true,
    brakes: true,
    plumbing: true,
    dimensions: true,
  });

  const toggleLayer = (layerKey: keyof CadLayerConfig) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleNodeClick = (slot: PartSlotKind) => {
    openDrawer(slot);
  };

  // Vehicle geometry
  const geom = VEHICLE_GEOMETRY_SPECS[vehicle.id] ?? {
    wheelbaseMm: 2700,
    frontTrackMm: 1580,
    rearTrackMm: 1580,
  };

  const archetype = getBodyArchetype(vehicle.body);
  const bodyInfo = BODY_ARCHETYPE_LABELS[archetype] ?? BODY_ARCHETYPE_LABELS.coupe;

  return (
    <div
      className={`border rounded-2xl p-4 sm:p-6 backdrop-blur flex flex-col items-center relative overflow-hidden transition-colors ${
        cadMode === "classic-blueprint"
          ? "bg-[#0b274a] border-cyan-800/80 text-white"
          : "bg-slate-900/60 border-slate-800 text-slate-100"
      }`}
    >
      {/* Background CAD Grid Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          cadMode === "classic-blueprint"
            ? "bg-[linear-gradient(to_right,#38bdf825_1px,transparent_1px),linear-gradient(to_bottom,#38bdf825_1px,transparent_1px)] bg-[size:20px_20px]"
            : "bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:24px_24px]"
        }`}
      />

      {/* Blueprint Header Bar */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 mb-3 border-b border-slate-800/80 z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              APEX FORGE // 2D CAD MULTI-PROJECTION ENGINE 2.0
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40 font-bold">
              {bodyInfo.icon} {bodyInfo.badge}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
              ISO 128 CAD STANDARD
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mt-1">
            {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model} {vehicle.trim}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Силуэт: <span className="text-amber-300 font-semibold">{bodyInfo.label}</span> · Платформа: {vehicle.platform ?? "OEM Platform"} · {LAYOUT_LABELS[vehicle.layout]} · Развесовка:{" "}
            <span className="text-cyan-400 font-bold">{telemetry.frontWeightPct}% F : {telemetry.rearWeightPct}% R</span>
          </p>
        </div>

        {/* Projection Switcher & Visual Modes */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
          {/* Projection View Toggle (Top / Side / Dual) */}
          <div className="flex items-center rounded-lg p-1 bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setProjection("top")}
              className={`px-2.5 py-1 rounded font-mono transition-all cursor-pointer ${
                projection === "top"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Вид сверху (План компоновки / Top View)"
            >
              Вид сверху
            </button>
            <button
              type="button"
              onClick={() => setProjection("side")}
              className={`px-2.5 py-1 rounded font-mono transition-all cursor-pointer ${
                projection === "side"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Вид сбоку (Профиль силуэта / Side Elevation)"
            >
              Вид сбоку
            </button>
            <button
              type="button"
              onClick={() => setProjection("dual")}
              className={`px-2.5 py-1 rounded font-mono transition-all cursor-pointer ${
                projection === "dual"
                  ? "bg-emerald-500/20 text-emerald-300 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Двухоконный режим (Сплит: Профиль + План)"
            >
              Двойной CAD
            </button>
          </div>

          {/* Visual Mode Selector */}
          <div className="flex items-center rounded-lg p-1 bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setCadMode("dark-cad")}
              className={`px-2 py-1 rounded font-mono transition-all cursor-pointer ${
                cadMode === "dark-cad" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setCadMode("classic-blueprint")}
              className={`px-2 py-1 rounded font-mono transition-all cursor-pointer ${
                cadMode === "classic-blueprint" ? "bg-blue-600/30 text-sky-200 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Blueprint
            </button>
            <button
              type="button"
              onClick={() => setCadMode("stress-heatmap")}
              className={`px-2 py-1 rounded font-mono transition-all cursor-pointer ${
                cadMode === "stress-heatmap" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Heatmap
            </button>
          </div>

          <button
            type="button"
            onClick={resetAllToOem}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-xs font-mono text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer"
            title="Сбросить все агрегаты до стокового OEM состояния"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сброс OEM</span>
          </button>
        </div>
      </div>

      {/* Multi-Layer Toggle Toolbar */}
      <div className="w-full flex items-center justify-between flex-wrap gap-1.5 py-2 px-3 mb-4 rounded-xl bg-slate-950/70 border border-slate-800/80 z-10 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Слои CAD:</span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              { key: "chassis", label: "Кузов" },
              { key: "powertrain", label: "ДВС" },
              { key: "cooling", label: "Охлаждение" },
              { key: "drivetrain", label: "Привод" },
              { key: "suspension", label: "Подвеска" },
              { key: "brakes", label: "Тормоза" },
              { key: "plumbing", label: "Магистрали" },
              { key: "dimensions", label: "Замеры" },
            ] as const
          ).map((item) => {
            const active = layers[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleLayer(item.key)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border cursor-pointer ${
                  active
                    ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300 font-semibold"
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CANVAS PROJECTION CONTAINER */}
      <div className="w-full flex flex-col items-center justify-center gap-8 z-10">
        {/* SIDE PROFILE VIEW */}
        {(projection === "side" || projection === "dual") && (
          <div className="w-full flex flex-col items-center">
            {projection === "dual" && (
              <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-xs font-mono text-cyan-400">
                <span>[СЕКЦИЯ А-А] ПРОФИЛЬ: ВИД СБОКУ (SIDE ELEVATION)</span>
                <span className="text-[10px] text-slate-400">МАСШТАБ 1:25</span>
              </div>
            )}
            <BlueprintSideView
              vehicle={vehicle}
              resolved={resolved}
              telemetry={telemetry}
              cadMode={cadMode}
              layers={layers}
              geom={geom}
              onNodeClick={handleNodeClick}
            />
          </div>
        )}

        {/* TOP-DOWN PLAN VIEW */}
        {(projection === "top" || projection === "dual") && (
          <div className="w-full flex flex-col items-center">
            {projection === "dual" && (
              <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-xs font-mono text-cyan-400">
                <span>[СЕКЦИЯ Б-Б] ПЛАН: ВИД СВЕРХУ (TOP PLAN VIEW)</span>
                <span className="text-[10px] text-slate-400">МАСШТАБ 1:25</span>
              </div>
            )}
            <BlueprintTopView
              vehicle={vehicle}
              resolved={resolved}
              telemetry={telemetry}
              cadMode={cadMode}
              layers={layers}
              geom={geom}
              onNodeClick={handleNodeClick}
            />
          </div>
        )}
      </div>

      {/* Blueprint Footer Interactive Status */}
      <div className="w-full flex items-center justify-between flex-wrap gap-2 pt-4 mt-3 border-t border-slate-800/80 z-10 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Клик по любому узлу (ДВС, КПП, Тормоза, Кулер, Выхлоп) открывает подбор деталей</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Смещение CG: <strong className="text-cyan-400">{telemetry.cgOffsetMm} mm</strong>
          </span>
          <span className="text-slate-500">
            Развесовка: <strong className="text-amber-400">{telemetry.frontWeightPct}% : {telemetry.rearWeightPct}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
