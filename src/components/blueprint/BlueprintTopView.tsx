"use client";

import React from "react";
import type { Vehicle } from "@/domain/vehicles/types";
import type { FormattedTelemetry, PartSlotKind, ResolvedBuildParts } from "@/types/tuning.types";
import { getBodyArchetype, getTopViewPaths } from "./bodySilhouettes";

interface BlueprintTopViewProps {
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
  onNodeClick: (slot: PartSlotKind) => void;
}

export function BlueprintTopView({
  vehicle,
  resolved,
  telemetry,
  cadMode,
  layers,
  geom,
  onNodeClick,
}: BlueprintTopViewProps) {
  const archetype = getBodyArchetype(vehicle.body);
  const silhouette = getTopViewPaths(archetype);

  const isRwd = vehicle.layout === "longitudinal-rwd";
  const isAwd = vehicle.layout.includes("awd");
  const isTransverse = resolved.engine.orientation === "transverse";
  const caliperColor = resolved.brakes?.caliperColor ?? "#10b981";

  // Center of gravity Y offset (in SVG coordinates: baseline center is Y=460)
  // Higher front weight shifts CG upwards (toward front axle Y=210)
  const cgY = Math.round(460 - (telemetry.frontWeightPct - 50.0) * 5.0);

  // Cylinder Layout detection
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
    <div className="relative w-full aspect-[600/920] max-w-xl flex items-center justify-center select-none">
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
        className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.18)]"
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

        {/* --- LAYER 1: CHASSIS SILHOUETTE --- */}
        {layers.chassis && (
          <g id="layer-chassis-top">
            {/* Outer Monocoque Contour tailored to Body Archetype */}
            <path
              d={silhouette.outerMonocoque}
              fill={cadMode === "classic-blueprint" ? "rgba(11, 46, 89, 0.85)" : "rgba(15, 23, 42, 0.8)"}
              stroke={cadMode === "classic-blueprint" ? "#bae6fd" : "rgba(56, 189, 248, 0.45)"}
              strokeWidth="2.5"
            />

            {/* Front & Rear Structural Crash Bars */}
            {silhouette.crashBars.map((bar, idx) => (
              <rect
                key={`crash-bar-${idx}`}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx="3"
                fill="none"
                stroke="rgba(56, 189, 248, 0.3)"
                strokeWidth="1.5"
              />
            ))}

            {/* Cabin Greenhouse & Windshield */}
            <path
              d={silhouette.greenhouseGlass}
              fill="none"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1.5"
            />

            {/* Detailed Body Panel Shutlines */}
            {silhouette.shutLines.map((shutPath, idx) => (
              <path
                key={`shut-${idx}`}
                d={shutPath}
                fill="none"
                stroke="rgba(56, 189, 248, 0.25)"
                strokeWidth="1"
                strokeDasharray="5 3"
              />
            ))}

            {/* Aerodynamic Features / Spoilers / Splitters */}
            {silhouette.aeroFeatures?.map((aeroD, idx) => (
              <path
                key={`aero-${idx}`}
                d={aeroD}
                fill="rgba(14, 165, 233, 0.2)"
                stroke="#38bdf8"
                strokeWidth="1.5"
                filter="url(#glow-cyan)"
              />
            ))}

            {/* FIA 6-Point Roll Cage */}
            <line x1="185" y1="320" x2="415" y2="520" stroke="rgba(244, 63, 94, 0.35)" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="415" y1="320" x2="185" y2="520" stroke="rgba(244, 63, 94, 0.35)" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="185" y1="320" x2="415" y2="320" stroke="rgba(244, 63, 94, 0.45)" strokeWidth="2.5" />
            <line x1="185" y1="520" x2="415" y2="520" stroke="rgba(244, 63, 94, 0.45)" strokeWidth="2.5" />

            {/* Body Archetype Label on Floor Pan */}
            <text x="300" y="475" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold" fontFamily="monospace" letterSpacing="0.15em">
              [{archetype.toUpperCase()}] {vehicle.platform ? `· ${vehicle.platform}` : ""}
            </text>
          </g>
        )}

        {/* --- LAYER 2: COOLING & PLUMBING (RADIATORS & DRY SUMP) --- */}
        {layers.cooling && (
          <g id="layer-cooling" className="cursor-pointer" onClick={() => onNodeClick("cooling")}>
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

            <rect x="145" y="95" width="40" height="24" rx="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
            <rect x="415" y="95" width="40" height="24" rx="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />

            {resolved.cooling?.subtype === "dry-sump-kit" && (
              <g id="dry-sump-tank">
                <circle cx="430" cy="790" r="22" fill="#0f172a" stroke="#10b981" strokeWidth="2" filter="url(#glow-emerald)" />
                <text x="430" y="794" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  SUMP
                </text>
                <path d="M 430 768 L 430 380 Q 430 200 370 170" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />
              </g>
            )}
          </g>
        )}

        {/* --- LAYER 3: EXHAUST SYSTEM --- */}
        {layers.plumbing && (
          <g id="node-exhaust" className="cursor-pointer" onClick={() => onNodeClick("exhaust")}>
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
            <rect
              x="220"
              y="810"
              width="160"
              height="38"
              rx="6"
              fill="rgba(15, 23, 42, 0.85)"
              stroke={resolved.isCustomExhaust ? "#06b6d4" : "#f59e0b"}
              strokeWidth="1.5"
            />
            <circle cx="225" cy="855" r="7" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <circle cx="375" cy="855" r="7" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <text x="300" y="833" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
              EXHAUST: {resolved.exhaust?.code ?? "OEM"}
            </text>
          </g>
        )}

        {/* --- LAYER 4: POWERTRAIN & ENGINE SWAP MOUNTS --- */}
        {layers.powertrain && (
          <g id="layer-powertrain">
            {/* Engine Swap Subframe / Billet Motor Mounts */}
            <g id="node-mounts" className="cursor-pointer" onClick={() => onNodeClick("mounts")}>
              <path
                d="M 180 180 L 210 200 L 210 240 L 180 260 Z"
                fill="#1e293b"
                stroke={resolved.isCustomMounts ? "#10b981" : "#475569"}
                strokeWidth="2"
                filter={resolved.isCustomMounts ? "url(#glow-emerald)" : undefined}
              />
              <path
                d="M 420 180 L 390 200 L 390 240 L 420 260 Z"
                fill="#1e293b"
                stroke={resolved.isCustomMounts ? "#10b981" : "#475569"}
                strokeWidth="2"
                filter={resolved.isCustomMounts ? "url(#glow-emerald)" : undefined}
              />
              <line
                x1="180"
                y1="220"
                x2="420"
                y2="220"
                stroke={resolved.isCustomMounts ? "#10b981" : "#334155"}
                strokeWidth="4"
                strokeDasharray={resolved.isCustomMounts ? "none" : "6 4"}
              />
            </g>

            {/* Engine Block with Scale-Accurate Cylinder Layout */}
            <g id="node-engine" className="cursor-pointer" onClick={() => onNodeClick("engine")}>
              {/* Outer Block Envelope */}
              <rect
                x={isTransverse ? "220" : "235"}
                y={isTransverse ? "165" : "150"}
                width={isTransverse ? "160" : "130"}
                height={isTransverse ? "105" : "135"}
                rx="8"
                fill="#0f172a"
                stroke={resolved.isCustomEngine ? "#06b6d4" : "#38bdf8"}
                strokeWidth="2.5"
                filter={resolved.isCustomEngine ? "url(#glow-cyan)" : undefined}
              />

              {/* Cylinders geometry: Inline / V-engine / Boxer / Rotary */}
              {cylLayout === "inline" && (
                <g id="cylinders-inline">
                  {isTransverse ? (
                    <>
                      <circle cx="250" cy="217" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="283" cy="217" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="317" cy="217" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="350" cy="217" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    </>
                  ) : (
                    <>
                      <circle cx="300" cy="170" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="300" cy="200" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="300" cy="230" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="300" cy="260" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    </>
                  )}
                </g>
              )}

              {cylLayout === "v-engine" && (
                <g id="cylinders-v-bank">
                  {/* Left Bank */}
                  <circle cx="270" cy="170" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="270" cy="200" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="270" cy="230" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="270" cy="260" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  {/* Right Bank */}
                  <circle cx="330" cy="170" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="330" cy="200" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="330" cy="230" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="330" cy="260" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  {/* Valley divider */}
                  <line x1="300" y1="160" x2="300" y2="270" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="3 3" />
                </g>
              )}

              {cylLayout === "boxer" && (
                <g id="cylinders-boxer">
                  <circle cx="255" cy="190" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="255" cy="225" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="255" cy="260" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="345" cy="190" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="345" cy="225" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="345" cy="260" r="13" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="275" y1="217" x2="325" y2="217" stroke="#38bdf8" strokeWidth="3" />
                </g>
              )}

              {cylLayout === "rotary" && (
                <g id="cylinders-rotary">
                  <polygon points="300,165 325,205 275,205" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="300" cy="192" r="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                  <polygon points="300,215 325,255 275,255" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="300" cy="242" r="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                </g>
              )}

              {/* Engine Code and Family */}
              <text x="300" y="140" textAnchor="middle" fill="#bae6fd" fontSize="11" fontWeight="bold" fontFamily="monospace">
                {resolved.engine.code} ({resolved.engine.displacementCc}cc)
              </text>
            </g>

            {/* Turbocharger Assembly */}
            {resolved.turbo && (
              <g id="node-turbo" className="cursor-pointer" onClick={() => onNodeClick("turbo")}>
                <circle cx="205" cy="190" r="22" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" filter="url(#glow-cyan)" />
                <circle cx="205" cy="190" r="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M 205 168 Q 235 150 250 165" fill="none" stroke="#06b6d4" strokeWidth="4" />
                <text x="205" y="193" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  TURBO
                </text>
              </g>
            )}

            {/* Cold Air Intake */}
            {layers.plumbing && (
              <g id="node-intake" className="cursor-pointer" onClick={() => onNodeClick("intake")}>
                <rect x="145" y="140" width="34" height="42" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                <path d="M 179 161 Q 195 161 205 175" fill="none" stroke="#10b981" strokeWidth="3" />
                <text x="162" y="165" textAnchor="middle" fill="#a7f3d0" fontSize="7" fontWeight="bold" fontFamily="monospace">
                  INTAKE
                </text>
              </g>
            )}
          </g>
        )}

        {/* --- LAYER 5: DRIVETRAIN (GEARBOX, SHAFTS, DIFFERENTIAL) --- */}
        {layers.drivetrain && (
          <g id="layer-drivetrain">
            {/* Gearbox / Transmission */}
            <g id="node-transmission" className="cursor-pointer" onClick={() => onNodeClick("transmission")}>
              <rect
                x="260"
                y={isTransverse ? "230" : "290"}
                width={isTransverse ? "90" : "80"}
                height={isTransverse ? "70" : "125"}
                rx="6"
                fill="#0f172a"
                stroke={transColor}
                strokeWidth="2.5"
                filter={isTransOverloaded ? "url(#glow-amber)" : undefined}
              />
              <line x1="270" y1="330" x2="330" y2="330" stroke={transColor} strokeWidth="1.5" />
              <line x1="270" y1="360" x2="330" y2="360" stroke={transColor} strokeWidth="1.5" />
              <text x="300" y="348" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
                {resolved.transmission.code}
              </text>
              <text x="300" y="380" textAnchor="middle" fill={isTransOverloaded ? "#ef4444" : "#93c5fd"} fontSize="8" fontWeight="bold" fontFamily="monospace">
                {resolved.transmission.gears} GEARS // {resolved.transmission.torqueCapacityNm} Nm
              </text>
            </g>

            {/* Driveshaft Propshaft */}
            {(isRwd || isAwd) && (
              <line
                x1="300"
                y1="415"
                x2="300"
                y2="665"
                stroke={resolved.isCustomDriveline ? "#10b981" : "#0284c7"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={resolved.isCustomDriveline ? "none" : "8 3"}
              />
            )}

            {/* Rear Differential Assembly */}
            <g id="node-differential" className="cursor-pointer" onClick={() => onNodeClick("differential")}>
              <rect
                x="265"
                y="665"
                width="70"
                height="65"
                rx="8"
                fill="#0f172a"
                stroke={diffColor}
                strokeWidth="2.5"
              />
              <circle cx="300" cy="697" r="16" fill="#1e293b" stroke={diffColor} strokeWidth="2" />
              <text x="300" y="700" textAnchor="middle" fill="#bae6fd" fontSize="8" fontWeight="bold" fontFamily="monospace">
                LSD
              </text>

              {/* Rear Drive Half-Shafts / Axles */}
              <line x1="125" y1="697" x2="265" y2="697" stroke={diffColor} strokeWidth="5" strokeLinecap="round" />
              <line x1="335" y1="697" x2="475" y2="697" stroke={diffColor} strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Front Axle Half-Shafts */}
            <line x1="125" y1="210" x2="235" y2="210" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
            <line x1="365" y1="210" x2="475" y2="210" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {/* --- LAYER 6: SUSPENSION & CONTROL ARMS --- */}
        {layers.suspension && (
          <g id="node-suspension" className="cursor-pointer" onClick={() => onNodeClick("suspension")}>
            {/* Front Wishbones / MacPherson Arms */}
            <polygon points="140,195 200,210 140,225" fill="none" stroke={resolved.isCustomSuspension ? "#10b981" : "#0ea5e9"} strokeWidth="2.5" />
            <polygon points="460,195 400,210 460,225" fill="none" stroke={resolved.isCustomSuspension ? "#10b981" : "#0ea5e9"} strokeWidth="2.5" />
            {/* Rear Multi-Link / Control Arms */}
            <polygon points="140,680 200,697 140,715" fill="none" stroke={resolved.isCustomSuspension ? "#10b981" : "#0ea5e9"} strokeWidth="2.5" />
            <polygon points="460,680 400,697 460,715" fill="none" stroke={resolved.isCustomSuspension ? "#10b981" : "#0ea5e9"} strokeWidth="2.5" />
          </g>
        )}

        {/* --- LAYER 7: BRAKES & WHEEL HUBS --- */}
        {layers.brakes && (
          <g id="node-brakes" className="cursor-pointer" onClick={() => onNodeClick("brakes")}>
            {/* Front-Left Brake & Wheel */}
            <rect x="75" y="165" width="45" height="90" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="120" y="180" width="12" height="60" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="117" y="190" width="10" height="40" rx="2" fill={caliperColor} stroke="#ffffff" strokeWidth="1" filter="url(#glow-emerald)" />

            {/* Front-Right Brake & Wheel */}
            <rect x="480" y="165" width="45" height="90" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="468" y="180" width="12" height="60" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="473" y="190" width="10" height="40" rx="2" fill={caliperColor} stroke="#ffffff" strokeWidth="1" filter="url(#glow-emerald)" />

            {/* Rear-Left Brake & Wheel */}
            <rect x="75" y="665" width="45" height="90" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="120" y="680" width="12" height="60" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="117" y="690" width="10" height="40" rx="2" fill={caliperColor} stroke="#ffffff" strokeWidth="1" filter="url(#glow-emerald)" />

            {/* Rear-Right Brake & Wheel */}
            <rect x="480" y="665" width="45" height="90" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="468" y="680" width="12" height="60" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="473" y="690" width="10" height="40" rx="2" fill={caliperColor} stroke="#ffffff" strokeWidth="1" filter="url(#glow-emerald)" />
          </g>
        )}

        {/* --- LAYER 8: DYNAMIC CENTER OF GRAVITY (CG) RETICLE --- */}
        {layers.dimensions && (
          <g id="cg-reticle" transform={`translate(300, ${cgY})`}>
            <circle cx="0" cy="0" r="16" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="0" cy="0" r="3" fill="#f43f5e" />
            <line x1="-22" y1="0" x2="22" y2="0" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#f43f5e" strokeWidth="1.5" />
            <path d="M 0 0 L 16 0 A 16 16 0 0 1 0 16 Z" fill="#f43f5e" opacity="0.35" />
            <path d="M 0 0 L -16 0 A 16 16 0 0 1 0 -16 Z" fill="#f43f5e" opacity="0.35" />
            <text x="25" y="4" fill="#fb7185" fontSize="10" fontWeight="bold" fontFamily="monospace">
              CG: {telemetry.frontWeightPct}% F : {telemetry.rearWeightPct}% R
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
