"use client";

import React, { useMemo } from "react";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useUiStore } from "@/stores/useUiStore";
import { resolveBuildParts } from "@/services/swapService";
import { BRAND_LABELS, LAYOUT_LABELS } from "@/constants/tuning";
import type { PartSlotKind } from "@/types/tuning.types";

export function BlueprintCanvas() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const slots = useBuildStore((s) => s.slots);
  const resolved = useMemo(() => resolveBuildParts(vehicle, slots), [vehicle, slots]);

  const openDrawer = useUiStore((s) => s.openDrawer);

  const isRwd = vehicle.layout === "longitudinal-rwd";
  const isAwd = vehicle.layout.includes("awd");
  const isTransverse = resolved.engine.orientation === "transverse";
  const caliperColor = resolved.brakes?.caliperColor ?? "#10b981";

  const handleNodeClick = (slot: PartSlotKind) => {
    openDrawer(slot);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur flex flex-col items-center relative overflow-hidden">
      {/* Background CAD Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Blueprint Header Bar */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              APEX FORGE // 2D CAD MODULAR CHASSIS CANVAS
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model} {vehicle.trim}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Шасси: {vehicle.platform ?? "OEM Platform"} · {LAYOUT_LABELS[vehicle.layout]}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Кликните на узел для моментального свапа</span>
        </div>
      </div>

      {/* Blueprint SVG Chassis View */}
      <div className="relative w-full max-w-lg aspect-[600/900] z-10 flex items-center justify-center">
        {/* Dimension Annotations */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-500/70 tracking-widest pointer-events-none">
          ◄ FRONT TRACK: 1,590 mm ►
        </div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono text-cyan-500/70 tracking-widest pointer-events-none whitespace-nowrap">
          ◄ WHEELBASE: 2,750 mm ►
        </div>

        <svg
          viewBox="0 0 600 900"
          className="w-full h-full drop-shadow-[0_0_25px_rgba(6,182,212,0.15)] select-none"
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

          {/* Guidelines */}
          <line x1="300" y1="40" x2="300" y2="860" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="6 4" strokeWidth="1" />
          <line x1="60" y1="210" x2="540" y2="210" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="60" y1="710" x2="540" y2="710" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="4 4" strokeWidth="1" />

          {/* Car Silhouette Contour */}
          <path
            d="M 200 60 C 250 50, 350 50, 400 60 C 440 70, 460 110, 470 170 C 480 230, 475 300, 480 400 C 485 520, 485 640, 475 730 C 465 800, 440 840, 390 850 C 340 858, 260 858, 210 850 C 160 840, 135 800, 125 730 C 115 640, 115 520, 120 400 C 125 300, 120 230, 130 170 C 140 110, 160 70, 200 60 Z"
            fill="rgba(15, 23, 42, 0.7)"
            stroke="rgba(56, 189, 248, 0.35)"
            strokeWidth="2"
          />

          {/* Cabin & Greenhouse */}
          <path
            d="M 170 310 Q 300 290 430 310 L 415 540 Q 300 560 185 540 Z"
            fill="none"
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="1.5"
          />

          {/* --- EXHAUST PIPING SYSTEM --- */}
          <g
            id="node-exhaust"
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => handleNodeClick("exhaust")}
          >
            <path
              d="M 330 240 Q 345 280 340 380 L 338 650 Q 338 720 360 790 L 375 845"
              fill="none"
              stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
              strokeWidth="7"
              strokeLinecap="round"
              filter={resolved.isCustomExhaust ? "url(#glow-cyan)" : undefined}
            />
            <path
              d="M 338 690 Q 310 750 240 790 L 225 845"
              fill="none"
              stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Muffler */}
            <rect
              x="220"
              y="800"
              width="160"
              height="40"
              rx="8"
              fill="rgba(15, 23, 42, 0.9)"
              stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
              strokeWidth="2"
            />
            <text x="300" y="825" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              EXHAUST // {resolved.exhaust?.name ?? "OEM"}
            </text>
          </g>

          {/* --- DRIVELINE / PROPSHAFT & REAR AXLE --- */}
          {(isRwd || isAwd) && (
            <g
              id="node-driveline"
              className="cursor-pointer transition-transform hover:opacity-90"
              onClick={() => handleNodeClick("driveline")}
            >
              {/* Center Driveshaft */}
              <line
                x1="300"
                y1="360"
                x2="300"
                y2="700"
                stroke={resolved.isCustomDriveline ? "#10b981" : "#64748b"}
                strokeWidth="8"
                strokeLinecap="round"
                filter={resolved.isCustomDriveline ? "url(#glow-emerald)" : undefined}
              />
              {/* Rear Differential */}
              <circle
                cx="300"
                cy="710"
                r="32"
                fill="rgba(15, 23, 42, 0.95)"
                stroke={resolved.isCustomDriveline ? "#10b981" : "#0ea5e9"}
                strokeWidth="2.5"
              />
              {/* Rear Axles */}
              <line x1="120" y1="710" x2="480" y2="710" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              <text x="300" y="714" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                DIFF
              </text>
            </g>
          )}

          {/* --- TRANSMISSION GEARBOX CASING --- */}
          <g
            id="node-transmission"
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => handleNodeClick("transmission")}
          >
            <path
              d={isTransverse ? "M 230 190 L 370 190 L 360 270 L 240 270 Z" : "M 260 210 L 340 210 L 325 350 L 275 350 Z"}
              fill="rgba(30, 41, 59, 0.9)"
              stroke={resolved.isCustomTrans ? "#06b6d4" : "#3b82f6"}
              strokeWidth="2.5"
              filter={resolved.isCustomTrans ? "url(#glow-cyan)" : undefined}
            />
            <text x="300" y={isTransverse ? 235 : 280} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="monospace">
              {resolved.transmission.code}
            </text>
          </g>

          {/* --- ENGINE BLOCK & CYLINDERS --- */}
          <g
            id="node-engine"
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => handleNodeClick("engine")}
          >
            <rect
              x={isTransverse ? "210" : "240"}
              y="120"
              width={isTransverse ? "180" : "120"}
              height={isTransverse ? "110" : "150"}
              rx="10"
              fill="rgba(15, 23, 42, 0.95)"
              stroke={resolved.isCustomEngine ? "#10b981" : "#38bdf8"}
              strokeWidth="2.5"
              filter={resolved.isCustomEngine ? "url(#glow-emerald)" : undefined}
            />
            <text x="300" y="150" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="black" fontFamily="monospace">
              {resolved.engine.code}
            </text>
            <text x="300" y="168" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
              {resolved.engine.powerHp} HP · {resolved.engine.torqueNm} Nm
            </text>
            <text x="300" y="185" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
              {resolved.engine.cylinders} CYL · {resolved.engine.aspiration.toUpperCase()}
            </text>
          </g>

          {/* --- TURBOCHARGER / SUPERCHARGER --- */}
          <g
            id="node-turbo"
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => handleNodeClick("turbo")}
          >
            <circle
              cx="210"
              cy="160"
              r="22"
              fill="rgba(15, 23, 42, 0.95)"
              stroke={resolved.isCustomTurbo ? "#a855f7" : "#64748b"}
              strokeWidth="2"
            />
            <text x="210" y="164" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace">
              TURBO
            </text>
          </g>

          {/* --- INTAKE & AIR FILTER --- */}
          <g
            id="node-intake"
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => handleNodeClick("intake")}
          >
            <path
              d="M 370 140 Q 420 130 430 160 L 450 160"
              fill="none"
              stroke={resolved.isCustomIntake ? "#06b6d4" : "#64748b"}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <rect
              x="430"
              y="145"
              width="30"
              height="30"
              rx="6"
              fill="rgba(15, 23, 42, 0.95)"
              stroke={resolved.isCustomIntake ? "#06b6d4" : "#64748b"}
              strokeWidth="2"
            />
            <text x="445" y="163" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
              AIR
            </text>
          </g>

          {/* --- ECU MODULE --- */}
          <g
            id="node-ecu"
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => handleNodeClick("ecu")}
          >
            <rect
              x="400"
              y="230"
              width="45"
              height="35"
              rx="6"
              fill="rgba(15, 23, 42, 0.95)"
              stroke={resolved.isCustomEcu ? "#10b981" : "#64748b"}
              strokeWidth="2"
            />
            <text x="422" y="252" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">
              ECU
            </text>
          </g>

          {/* --- 4 WHEELS & BRAKE CALIPERS --- */}
          {[
            { id: "fl", cx: 105, cy: 210 },
            { id: "fr", cx: 495, cy: 210 },
            { id: "rl", cx: 105, cy: 710 },
            { id: "rr", cx: 495, cy: 710 },
          ].map((wheel) => (
            <g
              key={wheel.id}
              className="cursor-pointer"
              onClick={() => handleNodeClick("brakes")}
            >
              {/* Tire */}
              <rect
                x={wheel.cx - 22}
                y={wheel.cy - 50}
                width="44"
                height="100"
                rx="8"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="2"
              />
              {/* Brake Rotor */}
              <circle
                cx={wheel.cx}
                cy={wheel.cy}
                r="24"
                fill="#1e293b"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Brake Caliper */}
              <rect
                x={wheel.cx < 300 ? wheel.cx - 24 : wheel.cx + 8}
                y={wheel.cy - 16}
                width="16"
                height="32"
                rx="4"
                fill={caliperColor}
                stroke="#ffffff"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* --- 4 SUSPENSION COILOVERS --- */}
          {[
            { id: "s-fl", x: 155, y: 195 },
            { id: "s-fr", x: 425, y: 195 },
            { id: "s-rl", x: 155, y: 695 },
            { id: "s-rr", x: 425, y: 695 },
          ].map((co) => (
            <g
              key={co.id}
              className="cursor-pointer"
              onClick={() => handleNodeClick("suspension")}
            >
              <rect
                x={co.x}
                y={co.y}
                width="20"
                height="30"
                rx="4"
                fill="rgba(15, 23, 42, 0.9)"
                stroke={resolved.isCustomSuspension ? "#f59e0b" : "#475569"}
                strokeWidth="2"
              />
              <line x1={co.x + 4} y1={co.y + 8} x2={co.x + 16} y2={co.y + 8} stroke="#f59e0b" strokeWidth="2" />
              <line x1={co.x + 4} y1={co.y + 15} x2={co.x + 16} y2={co.y + 15} stroke="#f59e0b" strokeWidth="2" />
              <line x1={co.x + 4} y1={co.y + 22} x2={co.x + 16} y2={co.y + 22} stroke="#f59e0b" strokeWidth="2" />
            </g>
          ))}
        </svg>
      </div>

      {/* Interactive Blueprint Footer Legend */}
      <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/60 inline-block" />
            <span>Двигатель (Engine)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-500/20 border border-cyan-500/60 inline-block" />
            <span>Трансмиссия (Gearbox)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/60 inline-block" />
            <span>Выпуск (Exhaust)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/60 inline-block" />
            <span>Турбо / FMIC</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Interactive SVG CAD Engine v2
        </span>
      </div>
    </div>
  );
}
