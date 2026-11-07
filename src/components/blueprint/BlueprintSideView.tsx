"use client";

import React from "react";
import type { Vehicle } from "@/domain/vehicles/types";
import type { FormattedTelemetry, PartSlotKind, ResolvedBuildParts } from "@/types/tuning.types";
import { getBodyArchetype, getSideViewGeometry } from "./bodySilhouettes";
import { getModelSideViewGeometry } from "./modelSilhouettes";

interface BlueprintSideViewProps {
  vehicle: Vehicle;
  resolved: ResolvedBuildParts;
  telemetry: FormattedTelemetry;
  cadMode: "dark-cad" | "classic-blueprint" | "stress-heatmap";
  layers: {
    chassis: boolean;
    powertrain: boolean;
    cooling: boolean;
    drivetrain: boolean;
    suspension: boolean;
    brakes: boolean;
    plumbing: boolean;
    dimensions: boolean;
  };
  geom: {
    wheelbaseMm: number;
    frontTrackMm: number;
    rearTrackMm: number;
  };
  hoveredSlot?: PartSlotKind | "fuel" | null;
  selectedSlot?: PartSlotKind | "fuel" | null;
  onNodeClick: (slot: PartSlotKind) => void;
  onNodeHover?: (slot: PartSlotKind | "fuel" | null) => void;
}

export function BlueprintSideView({
  vehicle,
  resolved,
  telemetry,
  cadMode,
  layers,
  geom: vehicleGeom,
  hoveredSlot,
  selectedSlot,
  onNodeClick,
  onNodeHover,
}: BlueprintSideViewProps) {
  const archetype = getBodyArchetype(vehicle.body);
  const geom = getModelSideViewGeometry(vehicle);

  const isSlotActive = (slot: PartSlotKind | "fuel") => hoveredSlot === slot || selectedSlot === slot;

  // Dynamic Stance and Clearance calculation based on installed suspension
  const dropMm = resolved.suspension?.dropMm ?? 0;
  const effectiveClearance = Math.max(35, geom.groundClearanceMm - dropMm);
  const bodyDropY = Math.round(dropMm * 0.22);

  const cylLayout = resolved.engine.cylinderLayout ?? (
    resolved.engine.family.toLowerCase().includes("v8") || resolved.engine.cylinders === 8
      ? "v-engine"
      : resolved.engine.family.toLowerCase().includes("v6") ||
        (resolved.engine.cylinders === 6 && resolved.engine.family.toLowerCase().includes("vq"))
      ? "v-engine"
      : resolved.engine.family.toLowerCase().includes("boxer") || resolved.engine.family.toLowerCase().includes("ej")
      ? "boxer"
      : resolved.engine.family.toLowerCase().includes("rotary") || resolved.engine.family.toLowerCase().includes("wankel")
      ? "rotary"
      : "inline"
  );

  const caliperColor = resolved.brakes?.caliperColor ?? "#10b981";

  // Dynamic Center of Gravity X position (Front axle is X=230, Rear axle is X=770; distance = 540)
  // Higher frontWeightPct shifts CG toward front axle (lower X)
  const cgX = Math.round(230 + (540 * (telemetry.rearWeightPct / 100.0)));
  // Ground line Y=410, CG height around 450mm scale in SVG = Y=320
  const cgY = Math.round(325 - (geom.groundClearanceMm > 150 ? 25 : 0));

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

  return (
    <div className="relative w-full aspect-[1000/500] max-w-4xl flex items-center justify-center select-none">
      {/* Dynamic Dimension Callouts */}
      {layers.dimensions && (
        <>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400/90 tracking-widest pointer-events-none">
            ◄ ОБЩАЯ ДЛИНА (OVERALL LENGTH): {geom.overallLengthMm.toLocaleString()} mm ►
          </div>
          <div className="absolute bottom-2 left-[50%] -translate-x-1/2 text-[10px] font-mono text-cyan-400/90 tracking-widest pointer-events-none">
            ◄ КОЛЕСНАЯ БАЗА (WHEELBASE): {vehicleGeom.wheelbaseMm.toLocaleString()} mm ►
          </div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-mono text-cyan-400/90 tracking-widest pointer-events-none whitespace-nowrap">
            ◄ ВЫСОТА: {geom.overallHeightMm.toLocaleString()} mm ►
          </div>
        </>
      )}

      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.18)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow-cyan-side" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-emerald-side" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-inspect-side" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.8  0 0 0 0 0.95  0 0 0 1 0" result="cyanGlow" />
            <feMerge>
              <feMergeNode in="cyanGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="tireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* --- DATUM GRID & GROUND PLANE --- */}
        {layers.dimensions && (
          <g id="side-datum">
            {/* Ground Line */}
            <line x1="30" y1="410" x2="970" y2="410" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
            <line x1="30" y1="416" x2="970" y2="416" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="3 3" />
            {/* Wheel Center Vertical Axle Datums */}
            <line x1="230" y1="80" x2="230" y2="430" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="6 4" strokeWidth="1" />
            <line x1="770" y1="80" x2="770" y2="430" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="6 4" strokeWidth="1" />
            {/* Ground Clearance dimension arrow */}
            <line x1="500" y1="410" x2="500" y2={355 + bodyDropY} stroke="#38bdf8" strokeWidth="1.5" />
            <polyline points="496,403 500,410 504,403" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <polyline points={`496,${362 + bodyDropY} 500,${355 + bodyDropY} 504,${362 + bodyDropY}`} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="510" y={388 + Math.round(bodyDropY / 2)} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
              CLEARANCE: {effectiveClearance} mm {dropMm > 0 ? `(-${dropMm}mm)` : ""}
            </text>
          </g>
        )}

        {/* --- LAYER 1: CHASSIS SILHOUETTE PROFILE (WITH DYNAMIC STANCE DROP) --- */}
        {layers.chassis && (
          <g id="layer-chassis-side" transform={`translate(0, ${bodyDropY})`}>
            {/* Outer Monocoque Body Profile */}
            <path
              d={geom.bodyPath}
              fill={cadMode === "classic-blueprint" ? "rgba(11, 46, 89, 0.85)" : "rgba(15, 23, 42, 0.85)"}
              stroke={cadMode === "classic-blueprint" ? "#bae6fd" : "rgba(56, 189, 248, 0.55)"}
              strokeWidth="2.5"
            />

            {/* Greenhouse Window Glass */}
            <path
              d={geom.glassPath}
              fill={cadMode === "classic-blueprint" ? "rgba(30, 58, 138, 0.5)" : "rgba(30, 41, 59, 0.6)"}
              stroke={cadMode === "classic-blueprint" ? "#7dd3fc" : "rgba(56, 189, 248, 0.35)"}
              strokeWidth="1.5"
            />

            {/* Pillars and Window Dividers */}
            {geom.pillarLines.map((lineD, idx) => (
              <path key={`pillar-${idx}`} d={lineD} stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" />
            ))}

            {/* Door Cutlines */}
            {geom.doorShutLines.map((doorD, idx) => (
              <path key={`door-${idx}`} d={doorD} stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" strokeDasharray="6 3" />
            ))}

            {/* Rear Aero Spoiler / Wing (if equipped on archetype) */}
            {geom.rearSpoiler && (
              <path d={geom.rearSpoiler} fill="#0ea5e9" stroke="#38bdf8" strokeWidth="1.5" filter="url(#glow-cyan-side)" />
            )}

            {/* Roof Rack (for SUV / 4x4) */}
            {geom.roofRack && (
              <path d={geom.roofRack} fill="#334155" stroke="#0ea5e9" strokeWidth="1.5" />
            )}

            {/* Cargo Bed Divider (for Pickup) */}
            {geom.cargoBedLine && (
              <path d={geom.cargoBedLine} stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
            )}

            {/* Exterior Spare Wheel (for SUV) */}
            {geom.spareWheel && (
              <g id="spare-tire-mount">
                <circle cx={geom.spareWheel.cx} cy={geom.spareWheel.cy} r={geom.spareWheel.r} fill="url(#tireGrad)" stroke="#38bdf8" strokeWidth="2" />
                <circle cx={geom.spareWheel.cx} cy={geom.spareWheel.cy} r={geom.spareWheel.r - 12} fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                <text x={geom.spareWheel.cx} y={geom.spareWheel.cy + 3} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  SPARE
                </text>
              </g>
            )}

            {/* Body Archetype Label Badge in lower sill */}
            <text x="500" y="345" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="0.1em">
              BODY ARCHETYPE: {archetype.toUpperCase()} // CHASSIS {vehicle.platform ?? "OEM"}
            </text>
          </g>
        )}

        {/* --- LAYER 2: COOLING & FRONT INTERCOOLER --- */}
        {layers.cooling && (
          <g
            id="layer-cooling-side"
            className="cursor-pointer transition-all duration-200"
            onClick={() => onNodeClick("cooling")}
            onMouseEnter={() => onNodeHover?.("cooling")}
            onMouseLeave={() => onNodeHover?.(null)}
            filter={isSlotActive("cooling") ? "url(#glow-inspect-side)" : undefined}
          >
            {/* Tilted Radiator in Front Grill */}
            <path
              d="M 175 240 L 195 240 L 180 320 L 160 320 Z"
              fill={isSlotActive("cooling") ? "rgba(30, 64, 175, 0.9)" : "rgba(30, 58, 138, 0.7)"}
              stroke={isSlotActive("cooling") ? "#38bdf8" : resolved.isCustomCooling ? "#38bdf8" : "#0284c7"}
              strokeWidth={isSlotActive("cooling") ? "3" : "2"}
            />
            {/* Front Mount Intercooler (FMIC) */}
            <rect
              x="135"
              y="285"
              width="24"
              height="40"
              rx="3"
              fill="#0f172a"
              stroke="#0ea5e9"
              strokeWidth="1.5"
            />
            <text x="147" y="308" textAnchor="middle" fill="#bae6fd" fontSize="7" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 147 308)">
              FMIC
            </text>
            {/* Dry Sump Oil Tank in Trunk (if equipped) */}
            {resolved.cooling?.subtype === "dry-sump-kit" && (
              <g id="dry-sump-side">
                <rect x="850" y="275" width="28" height="45" rx="5" fill="#0f172a" stroke="#10b981" strokeWidth="2" filter="url(#glow-emerald-side)" />
                <text x="864" y="302" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 864 302)">
                  SUMP
                </text>
              </g>
            )}
          </g>
        )}

        {/* --- LAYER 3: EXHAUST SYSTEM ELEVATION --- */}
        {layers.plumbing && (
          <g
            id="layer-exhaust-side"
            className="cursor-pointer transition-all duration-200"
            onClick={() => onNodeClick("exhaust")}
            onMouseEnter={() => onNodeHover?.("exhaust")}
            onMouseLeave={() => onNodeHover?.(null)}
            filter={isSlotActive("exhaust") ? "url(#glow-inspect-side)" : undefined}
          >
            {/* Downpipe from engine bay sweeping down to floor */}
            <path
              d="M 285 285 C 300 320, 310 345, 360 348 L 840 348"
              fill="none"
              stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
              strokeWidth="6"
              strokeLinecap="round"
              filter={resolved.isCustomExhaust ? "url(#glow-cyan-side)" : undefined}
            />
            {/* Catalytic Converter / Resonator */}
            <rect x="440" y="342" width="60" height="12" rx="4" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Rear Muffler Silencer Box */}
            <rect
              x="840"
              y="335"
              width="65"
              height="24"
              rx="5"
              fill="rgba(15, 23, 42, 0.9)"
              stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
              strokeWidth="2"
            />
            {/* Polished Exhaust Tips extending from rear bumper */}
            <rect x="905" y="343" width="22" height="9" rx="2" fill="#94a3b8" stroke="#f8fafc" strokeWidth="1.5" />
          </g>
        )}

        {/* --- LAYER 4: POWERTRAIN (ENGINE BLOCK PROFILE & TURBO) --- */}
        {layers.powertrain && (
          <g
            id="layer-powertrain-side"
            className="cursor-pointer transition-all duration-200"
            onClick={() => onNodeClick("engine")}
            onMouseEnter={() => onNodeHover?.("engine")}
            onMouseLeave={() => onNodeHover?.(null)}
            filter={isSlotActive("engine") ? "url(#glow-inspect-side)" : undefined}
          >
            {/* Mounts / Tubular Subframe profile underneath */}
            {layers.chassis && (
              <path
                d="M 190 350 L 320 350 L 330 330 L 180 330 Z"
                fill="rgba(15, 23, 42, 0.8)"
                stroke={resolved.isCustomMounts ? "#10b981" : "#475569"}
                strokeWidth="1.5"
                strokeDasharray={resolved.isCustomMounts ? "none" : "3 2"}
              />
            )}

            {/* Engine block geometry scaled by cylinder layout */}
            {cylLayout === "inline" && (
              // Tall upright block profile
              <g id="eng-inline-side">
                <rect x="235" y="235" width="85" height="85" rx="5" fill="#1e293b" stroke={resolved.isCustomEngine ? "#06b6d4" : "#38bdf8"} strokeWidth="2" />
                {/* Cam cover on top */}
                <rect x="230" y="222" width="95" height="16" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                {/* Intake manifold runners */}
                <path d="M 240 240 Q 220 255 210 270" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <path d="M 260 240 Q 240 255 230 270" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <text x="277" y="280" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  {resolved.engine.code}
                </text>
              </g>
            )}

            {cylLayout === "v-engine" && (
              // Slanted V-block profile
              <g id="eng-v-side">
                <path
                  d="M 225 240 L 325 240 L 310 320 L 240 320 Z"
                  fill="#1e293b"
                  stroke={resolved.isCustomEngine ? "#06b6d4" : "#38bdf8"}
                  strokeWidth="2"
                />
                {/* Supercharger / Valley Plenum on top */}
                <rect x="235" y="225" width="80" height="18" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                <text x="275" y="278" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  {resolved.engine.code}
                </text>
              </g>
            )}

            {cylLayout === "boxer" && (
              // Ultra-low pancake block profile
              <g id="eng-boxer-side">
                <rect x="220" y="270" width="100" height="48" rx="4" fill="#1e293b" stroke={resolved.isCustomEngine ? "#06b6d4" : "#38bdf8"} strokeWidth="2" />
                <rect x="245" y="255" width="50" height="16" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                <text x="270" y="298" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  BOXER // {resolved.engine.code}
                </text>
              </g>
            )}

            {cylLayout === "rotary" && (
              // Compact cylindrical housing profile
              <g id="eng-rotary-side">
                <circle cx="275" cy="280" r="35" fill="#1e293b" stroke={resolved.isCustomEngine ? "#06b6d4" : "#38bdf8"} strokeWidth="2" />
                <circle cx="275" cy="280" r="16" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                <text x="275" y="283" textAnchor="middle" fill="#bae6fd" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  ROTARY
                </text>
              </g>
            )}

            {/* Turbocharger & Air Filter Assembly */}
            {resolved.turbo && (
              <g
                id="side-turbo"
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick("turbo");
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  onNodeHover?.("turbo");
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  onNodeHover?.(null);
                }}
                filter={isSlotActive("turbo") ? "url(#glow-inspect-side)" : undefined}
              >
                {/* Snail Compressor Housing */}
                <circle cx="210" cy="265" r="15" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" filter="url(#glow-cyan-side)" />
                {/* High flow cone intake filter */}
                <path d="M 180 258 L 195 262 L 195 272 L 180 276 Z" fill="#ef4444" stroke="#f87171" strokeWidth="1.5" />
              </g>
            )}

            {/* Front Mount Intercooler (FMIC) in front bumper */}
            {layers.cooling && (
              <g
                id="side-fmic"
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick("cooling");
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  onNodeHover?.("cooling");
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  onNodeHover?.(null);
                }}
                filter={isSlotActive("cooling") ? "url(#glow-inspect-side)" : undefined}
              >
                <rect x="110" y="278" width="16" height="42" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" filter="url(#glow-cyan-side)" />
                <line x1="110" y1="288" x2="126" y2="288" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 1" />
                <line x1="110" y1="298" x2="126" y2="298" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 1" />
                <line x1="110" y1="308" x2="126" y2="308" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 1" />
                <path d="M 126 290 Q 165 290 195 270" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {/* --- LAYER 5: DRIVETRAIN & TRANSMISSION --- */}
        {layers.drivetrain && (
          <g
            id="layer-drivetrain-side"
            className="cursor-pointer transition-all duration-200"
            onClick={() => onNodeClick("transmission")}
            onMouseEnter={() => onNodeHover?.("transmission")}
            onMouseLeave={() => onNodeHover?.(null)}
            filter={isSlotActive("transmission") ? "url(#glow-inspect-side)" : undefined}
          >
            {/* Bellhousing mating cone */}
            <path
              d="M 320 245 L 360 270 L 360 330 L 310 325 Z"
              fill="#1e293b"
              stroke={isSlotActive("transmission") ? "#38bdf8" : transColor}
              strokeWidth={isSlotActive("transmission") ? "3" : "2"}
            />
            {/* Transmission Gearbox Casing */}
            <rect
              x="360"
              y="275"
              width="85"
              height="50"
              rx="4"
              fill="#0f172a"
              stroke={isSlotActive("transmission") ? "#38bdf8" : transColor}
              strokeWidth={isSlotActive("transmission") ? "3" : "2"}
            />
            {/* Shifter linkage into cabin */}
            <line x1="410" y1="275" x2="430" y2="230" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="430" cy="227" r="5" fill="#ef4444" />
            <text x="402" y="305" textAnchor="middle" fill="#bae6fd" fontSize="8" fontWeight="bold" fontFamily="monospace">
              {resolved.transmission.gears}MT/AT
            </text>

            {/* Driveshaft line to rear axle */}
            <line
              x1="445"
              y1="315"
              x2="735"
              y2="335"
              stroke={resolved.isCustomDriveline ? "#10b981" : "#38bdf8"}
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Rear Differential Pumpkin */}
            <g
              id="side-diff"
              className="cursor-pointer transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick("differential");
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                onNodeHover?.("differential");
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                onNodeHover?.(null);
              }}
              filter={isSlotActive("differential") || isSlotActive("driveline") ? "url(#glow-inspect-side)" : undefined}
            >
              <circle
                cx="750"
                cy="340"
                r="22"
                fill="#0f172a"
                stroke={isSlotActive("differential") ? "#38bdf8" : resolved.isCustomDiff ? "#10b981" : "#0284c7"}
                strokeWidth={isSlotActive("differential") ? "3" : "2.5"}
              />
              <line x1="738" y1="335" x2="762" y2="335" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="738" y1="345" x2="762" y2="345" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="750" y="343" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace">
                DIFF
              </text>
            </g>

            {/* Performance Fuel Cell under rear bench */}
            {layers.plumbing && (
              <g
                id="side-fuel-tank"
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick("cooling");
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  onNodeHover?.("fuel");
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  onNodeHover?.(null);
                }}
                filter={isSlotActive("fuel") ? "url(#glow-inspect-side)" : undefined}
              >
                <rect
                  x="620"
                  y="318"
                  width="95"
                  height="34"
                  rx="4"
                  fill={isSlotActive("fuel") ? "rgba(88, 28, 135, 0.8)" : "#0f172a"}
                  stroke={isSlotActive("fuel") ? "#e879f9" : "#a855f7"}
                  strokeWidth={isSlotActive("fuel") ? "3" : "2"}
                  strokeDasharray="4 2"
                />
                <circle cx="668" cy="318" r="5" fill="#c084fc" />
                <text x="668" y="338" textAnchor="middle" fill="#d8b4fe" fontSize="7" fontWeight="bold" fontFamily="monospace">
                  FUEL TANK
                </text>
              </g>
            )}
          </g>
        )}

        {/* --- LAYER 6: SUSPENSION COILOVERS (WHEEL WELLS) --- */}
        {layers.suspension && (
          <g
            id="layer-suspension-side"
            className="cursor-pointer transition-all duration-200"
            onClick={() => onNodeClick("suspension")}
            onMouseEnter={() => onNodeHover?.("suspension")}
            onMouseLeave={() => onNodeHover?.(null)}
            filter={isSlotActive("suspension") ? "url(#glow-inspect-side)" : undefined}
          >
            {/* Front Coilover */}
            <g id="front-coilover">
              {/* Upper strut top hat mount */}
              <rect x="220" y="240" width="20" height="6" rx="2" fill="#10b981" />
              {/* Damper shaft */}
              <line x1="230" y1="246" x2="230" y2="335" stroke="#94a3b8" strokeWidth="4" />
              {/* Helical coiled spring */}
              <path
                d="M 222 260 L 238 268 L 222 276 L 238 284 L 222 292 L 238 300 L 222 308 L 238 316 L 222 324"
                fill="none"
                stroke={resolved.isCustomSuspension ? "#10b981" : "#0ea5e9"}
                strokeWidth="2.5"
              />
            </g>

            {/* Rear Coilover */}
            <g id="rear-coilover">
              <rect x="760" y="240" width="20" height="6" rx="2" fill="#10b981" />
              <line x1="770" y1="246" x2="770" y2="335" stroke="#94a3b8" strokeWidth="4" />
              <path
                d="M 762 260 L 778 268 L 762 276 L 778 284 L 762 292 L 778 300 L 762 308 L 778 316 L 762 324"
                fill="none"
                stroke={resolved.isCustomSuspension ? "#10b981" : "#0ea5e9"}
                strokeWidth="2.5"
              />
            </g>
          </g>
        )}

        {/* --- LAYER 7: WHEELS & BIG BRAKE KITS --- */}
        {layers.brakes && (
          <g
            id="layer-wheels-brakes-side"
            className="cursor-pointer transition-all duration-200"
            onClick={() => onNodeClick("brakes")}
            onMouseEnter={() => onNodeHover?.("brakes")}
            onMouseLeave={() => onNodeHover?.(null)}
            filter={isSlotActive("brakes") ? "url(#glow-inspect-side)" : undefined}
          >
            {/* FRONT WHEEL ASSEMBLY (X=230, Y=355) */}
            <g id="front-wheel">
              {/* Outer Rubber Tire */}
              <circle cx="230" cy="355" r="55" fill="url(#tireGrad)" stroke="#334155" strokeWidth="2.5" />
              {/* Wheel Rim Lip */}
              <circle cx="230" cy="355" r="38" fill="url(#rimGrad)" stroke="#94a3b8" strokeWidth="2" />
              {/* Ventilated/Cross-Drilled Brake Rotor */}
              <circle cx="230" cy="355" r="26" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="230" cy="355" r="10" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
              {/* 6-Piston Front Brake Caliper */}
              <rect
                x="248"
                y="336"
                width="12"
                height="38"
                rx="3"
                fill={caliperColor}
                stroke="#ffffff"
                strokeWidth="1"
                filter="url(#glow-emerald-side)"
              />
              {/* Wheel Alloy Spokes */}
              <line x1="230" y1="317" x2="230" y2="393" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="192" y1="355" x2="268" y2="355" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="203" y1="328" x2="257" y2="382" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="203" y1="382" x2="257" y2="328" stroke="#cbd5e1" strokeWidth="2.5" />
            </g>

            {/* REAR WHEEL ASSEMBLY (X=770, Y=355) */}
            <g id="rear-wheel">
              <circle cx="770" cy="355" r="55" fill="url(#tireGrad)" stroke="#334155" strokeWidth="2.5" />
              <circle cx="770" cy="355" r="38" fill="url(#rimGrad)" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="770" cy="355" r="24" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="770" cy="355" r="10" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
              {/* 4-Piston Rear Brake Caliper */}
              <rect
                x="786"
                y="340"
                width="10"
                height="30"
                rx="3"
                fill={caliperColor}
                stroke="#ffffff"
                strokeWidth="1"
                filter="url(#glow-emerald-side)"
              />
              {/* Wheel Alloy Spokes */}
              <line x1="770" y1="317" x2="770" y2="393" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="732" y1="355" x2="808" y2="355" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="743" y1="328" x2="797" y2="382" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="743" y1="382" x2="797" y2="328" stroke="#cbd5e1" strokeWidth="2.5" />
            </g>
          </g>
        )}

        {/* --- LAYER 8: DYNAMIC CENTER OF GRAVITY (CG) RETICLE --- */}
        {layers.dimensions && (
          <g id="side-cg-reticle" transform={`translate(${cgX}, ${cgY})`}>
            {/* Outer Target Ring */}
            <circle cx="0" cy="0" r="14" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="0" cy="0" r="3" fill="#f43f5e" />
            {/* Crosshairs */}
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#f43f5e" strokeWidth="1.5" />
            {/* Alternating quadrants */}
            <path d="M 0 0 L 14 0 A 14 14 0 0 1 0 14 Z" fill="#f43f5e" opacity="0.4" />
            <path d="M 0 0 L -14 0 A 14 14 0 0 1 0 -14 Z" fill="#f43f5e" opacity="0.4" />
            {/* Label */}
            <text x="22" y="4" fill="#fb7185" fontSize="9" fontWeight="bold" fontFamily="monospace">
              CG: F {telemetry.frontWeightPct}% · Z={460 - geom.groundClearanceMm}mm
            </text>
          </g>
        )}

        {/* --- LAYER 9: GROUND CLEARANCE & DRIVELINE PINION ANGLE --- */}
        {layers.dimensions && (
          <g id="side-ground-and-pinion">
            {/* Ground Plane line */}
            <line x1="120" y1="410" x2="880" y2="410" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x="880" y="405" textAnchor="end" fill="#64748b" fontSize="8" fontFamily="monospace">GROUND PLANE (도로면)</text>

            {/* Clearance dimension arrow */}
            <line x1="500" y1="410" x2="500" y2={410 - effectiveClearance * 0.25} stroke="#38bdf8" strokeWidth="1.5" />
            <polygon points="500,410 497,404 503,404" fill="#38bdf8" />
            <polygon points={`500,${410 - effectiveClearance * 0.25} 497,${416 - effectiveClearance * 0.25} 503,${416 - effectiveClearance * 0.25}`} fill="#38bdf8" />
            <text x="508" y={410 - effectiveClearance * 0.12} fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
              지상고: {effectiveClearance}mm {dropMm > 0 ? `(-${dropMm}mm Coilovers)` : ""}
            </text>

            {/* Driveline Pinion Angle annotation */}
            <g transform="translate(560, 345)">
              <rect x="0" y="0" width="135" height="18" rx="3" fill="#0f172a" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.9" />
              <text x="6" y="12" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                PINION ANGLE: 2.1° ISO (정상)
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
