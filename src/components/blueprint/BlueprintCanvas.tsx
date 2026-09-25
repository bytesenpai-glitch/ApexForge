"use client";

import React, { useMemo, useState } from "react";
import {
  Layers,
  Eye,
  Sliders,
  AlertTriangle,
  Flame,
  Gauge,
  Zap,
  RotateCcw,
  Maximize2,
  Minimize2,
  Info,
  CheckCircle,
} from "lucide-react";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useUiStore } from "@/stores/useUiStore";
import { resolveBuildParts } from "@/services/swapService";
import { computeVehicleTelemetry } from "@/services/telemetryService";
import { BRAND_LABELS, LAYOUT_LABELS } from "@/constants/tuning";
import type { PartSlotKind } from "@/types/tuning.types";

type CadVisualMode = "dark-cad" | "classic-blueprint" | "stress-heatmap";

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

  const isRwd = vehicle.layout === "longitudinal-rwd";
  const isAwd = vehicle.layout.includes("awd");
  const isTransverse = resolved.engine.orientation === "transverse";
  const caliperColor = resolved.brakes?.caliperColor ?? "#10b981";

  // Vehicle geometry
  const geom = VEHICLE_GEOMETRY_SPECS[vehicle.id] ?? {
    wheelbaseMm: 2700,
    frontTrackMm: 1580,
    rearTrackMm: 1580,
  };

  // Center of gravity Y offset (in SVG coordinates: baseline center is Y=460)
  // Higher front weight shifts CG upwards (toward front axle Y=210)
  const cgY = Math.round(460 - ((telemetry.frontWeightPct - 50.0) * 5.0));

  const handleNodeClick = (slot: PartSlotKind) => {
    openDrawer(slot);
  };

  // Cylinder Layout detection
  const cylLayout = resolved.engine.cylinderLayout ?? (
    resolved.engine.family.toLowerCase().includes("v8") || resolved.engine.cylinders === 8
      ? "v-engine"
      : resolved.engine.family.toLowerCase().includes("v6") || (resolved.engine.cylinders === 6 && resolved.engine.family.toLowerCase().includes("vq"))
      ? "v-engine"
      : resolved.engine.family.toLowerCase().includes("boxer") || resolved.engine.family.toLowerCase().includes("ej")
      ? "boxer"
      : resolved.engine.family.toLowerCase().includes("rotary") || resolved.engine.family.toLowerCase().includes("wankel")
      ? "rotary"
      : "inline"
  );

  // Heatmap stress colors
  const isTransOverloaded = telemetry.torqueWarning;
  const isTransStressed = telemetry.torqueHeadroomNm < 80;

  const getHeatmapColor = (isOverloaded: boolean, isStressed: boolean, defaultColor: string) => {
    if (cadMode !== "stress-heatmap") return defaultColor;
    if (isOverloaded) return "#ef4444";
    if (isStressed) return "#f59e0b";
    return "#10b981";
  };

  const transColor = getHeatmapColor(
    isTransOverloaded,
    isTransStressed,
    resolved.isCustomTrans ? "#06b6d4" : "#3b82f6"
  );
  const diffColor = getHeatmapColor(
    false,
    telemetry.torqueNm > 800,
    resolved.isCustomDiff ? "#10b981" : "#0ea5e9"
  );

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
              APEX FORGE // 2D CAD MODULAR CHASSIS CANVAS 2.0
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
              ISO 128 CAD STANDARD
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model} {vehicle.trim}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Шасси: {vehicle.platform ?? "OEM Platform"} · {LAYOUT_LABELS[vehicle.layout]} · Развесовка:{" "}
            <span className="text-cyan-400 font-bold">{telemetry.frontWeightPct}% F : {telemetry.rearWeightPct}% R</span>
          </p>
        </div>

        {/* Visual Mode Selector & Reset Actions */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
          <div className="flex items-center rounded-lg p-1 bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setCadMode("dark-cad")}
              className={`px-2.5 py-1 rounded font-mono transition-all ${
                cadMode === "dark-cad" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Cyber Dark
            </button>
            <button
              onClick={() => setCadMode("classic-blueprint")}
              className={`px-2.5 py-1 rounded font-mono transition-all ${
                cadMode === "classic-blueprint"
                  ? "bg-blue-600/30 text-sky-200 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Classic Blue
            </button>
            <button
              onClick={() => setCadMode("stress-heatmap")}
              className={`px-2.5 py-1 rounded font-mono transition-all ${
                cadMode === "stress-heatmap"
                  ? "bg-amber-500/20 text-amber-300 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Torque Heatmap
            </button>
          </div>

          <button
            onClick={resetAllToOem}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-xs font-mono text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
            title="Сбросить все агрегаты до стокового OEM состояния"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сбросить в OEM</span>
          </button>
        </div>
      </div>

      {/* Multi-Layer Toggle Toolbar */}
      <div className="w-full flex items-center justify-between flex-wrap gap-1.5 py-2 px-3 mb-3 rounded-xl bg-slate-950/70 border border-slate-800/80 z-10 text-xs">
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
                onClick={() => toggleLayer(item.key)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border ${
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

      {/* Blueprint SVG Chassis View */}
      <div className="relative w-full max-w-xl aspect-[600/920] z-10 flex items-center justify-center">
        {/* Dynamic CAD Dimension Annotations */}
        {layers.dimensions && (
          <>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400/90 tracking-widest pointer-events-none">
              ◄ КОЛЕЯ FRONT: {geom.frontTrackMm.toLocaleString()} mm ►
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400/90 tracking-widest pointer-events-none">
              ◄ КОЛЕЯ REAR: {geom.rearTrackMm.toLocaleString()} mm ►
            </div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono text-cyan-400/90 tracking-widest pointer-events-none whitespace-nowrap">
              ◄ БАЗА (WHEELBASE): {geom.wheelbaseMm.toLocaleString()} mm ►
            </div>
          </>
        )}

        <svg
          viewBox="0 0 600 920"
          className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.18)] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Guidelines & Center Axles */}
          {layers.dimensions && (
            <>
              <line x1="300" y1="30" x2="300" y2="890" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="6 4" strokeWidth="1" />
              <line x1="50" y1="210" x2="550" y2="210" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="50" y1="710" x2="550" y2="710" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="4 4" strokeWidth="1" />
            </>
          )}

          {/* --- LAYER 1: CHASSIS SILHOUETTE & ROLL CAGE --- */}
          {layers.chassis && (
            <g id="layer-chassis">
              {/* Outer Monocoque Contour */}
              <path
                d="M 200 50 C 250 40, 350 40, 400 50 C 440 60, 465 100, 475 160 C 485 220, 480 290, 485 390 C 490 510, 490 630, 480 720 C 470 790, 445 840, 395 855 C 345 865, 255 865, 205 855 C 155 840, 130 790, 120 720 C 110 630, 110 510, 115 390 C 120 290, 115 220, 125 160 C 135 100, 160 60, 200 50 Z"
                fill={cadMode === "classic-blueprint" ? "rgba(11, 46, 89, 0.85)" : "rgba(15, 23, 42, 0.8)"}
                stroke={cadMode === "classic-blueprint" ? "#bae6fd" : "rgba(56, 189, 248, 0.45)"}
                strokeWidth="2.5"
              />

              {/* Front & Rear Structural Crash Bars */}
              <rect x="220" y="55" width="160" height="15" rx="3" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />
              <rect x="220" y="845" width="160" height="15" rx="3" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />

              {/* Cabin Greenhouse & Windshield */}
              <path
                d="M 170 300 Q 300 280 430 300 L 415 540 Q 300 560 185 540 Z"
                fill="none"
                stroke="rgba(56, 189, 248, 0.25)"
                strokeWidth="1.5"
              />

              {/* FIA 6-Point Roll Cage */}
              <line x1="185" y1="320" x2="415" y2="520" stroke="rgba(244, 63, 94, 0.35)" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="415" y1="320" x2="185" y2="520" stroke="rgba(244, 63, 94, 0.35)" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="185" y1="320" x2="415" y2="320" stroke="rgba(244, 63, 94, 0.45)" strokeWidth="2.5" />
              <line x1="185" y1="520" x2="415" y2="520" stroke="rgba(244, 63, 94, 0.45)" strokeWidth="2.5" />
            </g>
          )}

          {/* --- LAYER 2: COOLING & PLUMBING (RADIATORS & DRY SUMP) --- */}
          {layers.cooling && (
            <g id="layer-cooling" className="cursor-pointer" onClick={() => handleNodeClick("cooling")}>
              {/* Front Radiator Core */}
              <rect
                x="210"
                y="75"
                width="180"
                height="28"
                rx="4"
                fill="rgba(30, 58, 138, 0.6)"
                stroke={resolved.isCustomCooling ? "#38bdf8" : "#0284c7"}
                strokeWidth="2"
              />
              <line x1="210" y1="84" x2="390" y2="84" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
              <line x1="210" y1="93" x2="390" y2="93" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
              <text x="300" y="93" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
                RADIATOR // {resolved.cooling?.code ?? "OEM"}
              </text>

              {/* Dual Oil Coolers (in bumper corners) */}
              <rect x="145" y="95" width="40" height="24" rx="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
              <rect x="415" y="95" width="40" height="24" rx="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />

              {/* Dry Sump Remote Tank in Trunk (if equipped) */}
              {resolved.cooling?.subtype === "dry-sump-kit" && (
                <g id="dry-sump-tank">
                  <circle cx="430" cy="790" r="22" fill="#0f172a" stroke="#10b981" strokeWidth="2" filter="url(#glow-emerald)" />
                  <text x="430" y="794" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    SUMP
                  </text>
                  {/* -10AN Braided Lines to Front */}
                  <path d="M 430 768 L 430 380 Q 430 200 370 170" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />
                </g>
              )}
            </g>
          )}

          {/* --- LAYER 3: EXHAUST SYSTEM --- */}
          {layers.plumbing && (
            <g id="node-exhaust" className="cursor-pointer" onClick={() => handleNodeClick("exhaust")}>
              <path
                d="M 330 240 Q 345 280 340 380 L 338 650 Q 338 720 360 790 L 375 850"
                fill="none"
                stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
                strokeWidth="7"
                strokeLinecap="round"
                filter={resolved.isCustomExhaust ? "url(#glow-cyan)" : undefined}
              />
              <path
                d="M 338 690 Q 310 750 240 790 L 225 850"
                fill="none"
                stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Muffler */}
              <rect
                x="220"
                y="810"
                width="160"
                height="38"
                rx="6"
                fill="rgba(15, 23, 42, 0.95)"
                stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
                strokeWidth="2"
              />
              <text x="300" y="833" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                EXHAUST // {resolved.exhaust?.code ?? "OEM"}
              </text>
            </g>
          )}

          {/* --- LAYER 4: DRIVELINE, DIFF & AXLES --- */}
          {layers.drivetrain && (
            <g id="layer-drivetrain">
              {/* Driveshaft / Propshaft */}
              {(isRwd || isAwd) && (
                <g className="cursor-pointer" onClick={() => handleNodeClick("driveline")}>
                  <line
                    x1="300"
                    y1="360"
                    x2="300"
                    y2="700"
                    stroke={resolved.isCustomDriveline ? "#10b981" : "#64748b"}
                    strokeWidth="9"
                    strokeLinecap="round"
                    filter={resolved.isCustomDriveline ? "url(#glow-emerald)" : undefined}
                  />
                </g>
              )}

              {/* Rear Differential */}
              <g id="node-differential" className="cursor-pointer" onClick={() => handleNodeClick("differential")}>
                <circle
                  cx="300"
                  cy="710"
                  r="34"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={diffColor}
                  strokeWidth="3"
                  filter={diffColor !== "#0ea5e9" ? "url(#glow-emerald)" : undefined}
                />
                {/* Axle Half-Shafts */}
                <line x1="110" y1="710" x2="490" y2="710" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
                <text x="300" y="707" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  LSD
                </text>
                <text x="300" y="722" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  {resolved.differential?.code ?? "OEM"}
                </text>
              </g>

              {/* Swap Adapter Plate / Mounts Hotspot */}
              <g id="node-mounts" className="cursor-pointer" onClick={() => handleNodeClick("mounts")}>
                <rect
                  x="250"
                  y="200"
                  width="100"
                  height="14"
                  rx="3"
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke={resolved.isCustomMounts ? "#10b981" : "#475569"}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <text x="300" y="210" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  PLATE // {resolved.mounts?.code ?? "OEM"}
                </text>
              </g>

              {/* Transmission Gearbox */}
              <g id="node-transmission" className="cursor-pointer" onClick={() => handleNodeClick("transmission")}>
                <path
                  d={isTransverse ? "M 225 185 L 375 185 L 360 270 L 240 270 Z" : "M 255 214 L 345 214 L 330 355 L 270 355 Z"}
                  fill="rgba(30, 41, 59, 0.95)"
                  stroke={transColor}
                  strokeWidth="2.5"
                  filter={transColor === "#ef4444" ? "url(#glow-amber)" : undefined}
                />
                <text x="300" y={isTransverse ? 230 : 280} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {resolved.transmission.code}
                </text>
                <text x="300" y={isTransverse ? 245 : 295} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  {resolved.transmission.type.toUpperCase()} · {resolved.transmission.torqueCapacityNm} Nm
                </text>
              </g>
            </g>
          )}

          {/* --- LAYER 5: ENGINE BLOCK & CYLINDERS --- */}
          {layers.powertrain && (
            <g id="node-engine" className="cursor-pointer" onClick={() => handleNodeClick("engine")}>
              {/* Outer Engine Block Frame */}
              <rect
                x={isTransverse ? "200" : "235"}
                y="115"
                width={isTransverse ? "200" : "130"}
                height={isTransverse ? "110" : "155"}
                rx="10"
                fill="rgba(15, 23, 42, 0.98)"
                stroke={resolved.isCustomEngine ? "#10b981" : "#38bdf8"}
                strokeWidth="2.5"
                filter={resolved.isCustomEngine ? "url(#glow-emerald)" : undefined}
              />

              {/* Accurate Cylinder Geometry Overlay */}
              {cylLayout === "v-engine" && (
                <g id="cylinders-v8">
                  {/* Left Bank */}
                  <rect x="245" y="125" width="22" height="110" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1" />
                  <circle cx="256" cy="140" r="7" fill="#0284c7" />
                  <circle cx="256" cy="165" r="7" fill="#0284c7" />
                  <circle cx="256" cy="190" r="7" fill="#0284c7" />
                  <circle cx="256" cy="215" r="7" fill="#0284c7" />
                  {/* Right Bank */}
                  <rect x="333" y="125" width="22" height="110" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1" />
                  <circle cx="344" cy="140" r="7" fill="#0284c7" />
                  <circle cx="344" cy="165" r="7" fill="#0284c7" />
                  <circle cx="344" cy="190" r="7" fill="#0284c7" />
                  <circle cx="344" cy="215" r="7" fill="#0284c7" />
                </g>
              )}

              {cylLayout === "boxer" && (
                <g id="cylinders-boxer">
                  <rect x="210" y="140" width="35" height="80" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1" />
                  <rect x="355" y="140" width="35" height="80" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1" />
                </g>
              )}

              {cylLayout === "rotary" && (
                <g id="cylinders-rotary">
                  <circle cx="300" cy="160" r="28" fill="rgba(168, 85, 247, 0.15)" stroke="#c084fc" strokeWidth="2" />
                  <polygon points="300,135 324,175 276,175" fill="none" stroke="#c084fc" strokeWidth="1.5" />
                </g>
              )}

              {cylLayout === "inline" && (
                <g id="cylinders-inline">
                  <circle cx="300" cy="135" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                  <circle cx="300" cy="160" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                  <circle cx="300" cy="185" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                  <circle cx="300" cy="210" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                </g>
              )}

              {/* Engine Badge Text */}
              <text x="300" y="150" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="black" fontFamily="monospace">
                {resolved.engine.code}
              </text>
              <text x="300" y="168" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                {resolved.engine.powerHp} HP · {resolved.engine.torqueNm} Nm
              </text>
              <text x="300" y="184" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                {resolved.engine.cylinders} CYL · {resolved.engine.aspiration.toUpperCase()} · {resolved.engine.weightKg ?? 160} kg
              </text>
            </g>
          )}

          {/* --- TURBO & INTAKE --- */}
          {layers.powertrain && (
            <>
              {/* Turbo */}
              <g id="node-turbo" className="cursor-pointer" onClick={() => handleNodeClick("turbo")}>
                <circle
                  cx="205"
                  cy="160"
                  r="24"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={resolved.isCustomTurbo ? "#a855f7" : "#64748b"}
                  strokeWidth="2.5"
                  filter={resolved.isCustomTurbo ? "url(#glow-amber)" : undefined}
                />
                <text x="205" y="164" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  TURBO
                </text>
              </g>

              {/* Intake & Air Filter */}
              <g id="node-intake" className="cursor-pointer" onClick={() => handleNodeClick("intake")}>
                <path
                  d="M 370 140 Q 425 130 435 160 L 455 160"
                  fill="none"
                  stroke={resolved.isCustomIntake ? "#06b6d4" : "#64748b"}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <rect
                  x="435"
                  y="145"
                  width="32"
                  height="32"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={resolved.isCustomIntake ? "#06b6d4" : "#64748b"}
                  strokeWidth="2"
                />
                <text x="451" y="165" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  AIR
                </text>
              </g>

              {/* ECU Module */}
              <g id="node-ecu" className="cursor-pointer" onClick={() => handleNodeClick("ecu")}>
                <rect
                  x="405"
                  y="235"
                  width="48"
                  height="36"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={resolved.isCustomEcu ? "#10b981" : "#64748b"}
                  strokeWidth="2"
                />
                <text x="429" y="257" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  ECU
                </text>
              </g>
            </>
          )}

          {/* --- LAYER 6: 4 WHEELS, TIRES & BRAKES --- */}
          {layers.brakes && (
            <g id="layer-brakes">
              {[
                { id: "fl", cx: 105, cy: 210 },
                { id: "fr", cx: 495, cy: 210 },
                { id: "rl", cx: 105, cy: 710 },
                { id: "rr", cx: 495, cy: 710 },
              ].map((wheel) => (
                <g key={wheel.id} className="cursor-pointer" onClick={() => handleNodeClick("brakes")}>
                  {/* Tire Footprint */}
                  <rect
                    x={wheel.cx - 24}
                    y={wheel.cy - 52}
                    width="48"
                    height="104"
                    rx="8"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="2.5"
                  />
                  {/* Brake Rotor Disc with Slots */}
                  <circle cx={wheel.cx} cy={wheel.cy} r="26" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                  {/* Caliper */}
                  <rect
                    x={wheel.cx < 300 ? wheel.cx - 26 : wheel.cx + 10}
                    y={wheel.cy - 18}
                    width="16"
                    height="36"
                    rx="4"
                    fill={caliperColor}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                </g>
              ))}
            </g>
          )}

          {/* --- LAYER 7: SUSPENSION COILOVERS --- */}
          {layers.suspension && (
            <g id="layer-suspension">
              {[
                { id: "s-fl", x: 155, y: 195 },
                { id: "s-fr", x: 425, y: 195 },
                { id: "s-rl", x: 155, y: 695 },
                { id: "s-rr", x: 425, y: 695 },
              ].map((co) => (
                <g key={co.id} className="cursor-pointer" onClick={() => handleNodeClick("suspension")}>
                  <rect
                    x={co.x}
                    y={co.y}
                    width="22"
                    height="32"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.95)"
                    stroke={resolved.isCustomSuspension ? "#f59e0b" : "#475569"}
                    strokeWidth="2"
                  />
                  <line x1={co.x + 4} y1={co.y + 8} x2={co.x + 18} y2={co.y + 8} stroke="#f59e0b" strokeWidth="2.5" />
                  <line x1={co.x + 4} y1={co.y + 16} x2={co.x + 18} y2={co.y + 16} stroke="#f59e0b" strokeWidth="2.5" />
                  <line x1={co.x + 4} y1={co.y + 24} x2={co.x + 18} y2={co.y + 24} stroke="#f59e0b" strokeWidth="2.5" />
                </g>
              ))}
            </g>
          )}

          {/* --- DYNAMIC CENTER OF GRAVITY (CG) TARGET RETICLE --- */}
          {layers.dimensions && (
            <g id="cg-marker">
              <circle cx="300" cy={cgY} r="18" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="300" cy={cgY} r="4" fill="#06b6d4" />
              <line x1="275" y1={cgY} x2="325" y2={cgY} stroke="#22d3ee" strokeWidth="1.5" />
              <line x1="300" y1={cgY - 25} x2="300" y2={cgY + 25} stroke="#22d3ee" strokeWidth="1.5" />
              <text x="330" y={cgY + 4} fill="#22d3ee" fontSize="9" fontWeight="bold" fontFamily="monospace">
                CG (ЦЕНТР ТЯЖЕСТИ)
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Blueprint Footer Legend */}
      <div className="w-full mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-3.5 flex-wrap text-[11px] font-mono">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={() => handleNodeClick("engine")}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 inline-block" />
            <span>ДВС (Engine)</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={() => handleNodeClick("mounts")}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/20 border border-emerald-400/60 inline-block" />
            <span>Опоры/Плита (Mounts)</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={() => handleNodeClick("cooling")}>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500/20 border border-sky-500/60 inline-block" />
            <span>Охлаждение (Cooling)</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={() => handleNodeClick("transmission")}>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/20 border border-cyan-500/60 inline-block" />
            <span>КПП (Gearbox)</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={() => handleNodeClick("differential")}>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 border border-indigo-500/60 inline-block" />
            <span>Дифференциал (LSD)</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white" onClick={() => handleNodeClick("brakes")}>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/60 inline-block" />
            <span>Тормоза (Brakes)</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-cyan-400/80">
          Кликните по любому узлу для быстрой замены
        </div>
      </div>
    </div>
  );
}
