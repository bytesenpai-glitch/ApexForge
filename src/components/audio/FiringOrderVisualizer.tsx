"use client";

import React, { useEffect, useRef, useState } from "react";
import { Flame, Sparkles, Zap, RotateCw, Wind } from "lucide-react";
import type { EngineFiringOrderSpec, CylinderSpec } from "@/domain/parts/firingOrders";

interface FiringOrderVisualizerProps {
  spec: EngineFiringOrderSpec;
  rpm: number;
  isPlaying: boolean;
  is2StepActive: boolean;
}

type StrokeType = "power" | "exhaust" | "intake" | "compression";

interface CylinderRuntimeState {
  id: number;
  label: string;
  bank: 1 | 2;
  firingOrderIndex: number;
  stroke: StrokeType;
  strokeProgress: number; // 0 to 1 inside current stroke
  isFiring: boolean;
}

export function FiringOrderVisualizer({
  spec,
  rpm,
  isPlaying,
  is2StepActive,
}: FiringOrderVisualizerProps) {
  // Crankshaft rotation angle (0° to 720° for 4-stroke cycle)
  const [crankAngleDeg, setCrankAngleDeg] = useState(0);
  const crankAngleRef = useRef(0);

  const rpmRef = useRef(rpm);
  rpmRef.current = rpm;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Crankshaft physics rotation animation loop
  useEffect(() => {
    if (!isPlaying) {
      crankAngleRef.current = 0;
      setCrankAngleDeg(0);
      return;
    }

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (!isPlayingRef.current) return;

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // 4-stroke cycle: 2 revolutions (720 degrees) = 1 full cycle
      // Rotation speed in deg/sec = (RPM / 60) * 360 deg/sec
      const degPerSec = (rpmRef.current / 60) * 360;
      crankAngleRef.current = (crankAngleRef.current + degPerSec * dt) % 720;

      setCrankAngleDeg(crankAngleRef.current);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Compute live stroke state for every cylinder based on current crankAngleDeg
  const cylinderStates: CylinderRuntimeState[] = spec.cylindersList.map((cyl) => {
    if (!isPlaying) {
      return {
        id: cyl.id,
        label: cyl.label,
        bank: cyl.bank,
        firingOrderIndex: cyl.firingOrderIndex,
        stroke: "intake",
        strokeProgress: 0,
        isFiring: false,
      };
    }

    // Relative crank angle for this cylinder (0 to 720 deg)
    const relAngle = (crankAngleDeg - cyl.firingAngleDeg + 720) % 720;

    let stroke: StrokeType = "intake";
    let strokeProgress = 0;
    let isFiring = false;

    if (relAngle < 180) {
      // 0° to 180°: POWER STROKE (Рабочий ход / Вспышка газов)
      stroke = "power";
      strokeProgress = relAngle / 180;
      isFiring = true;
    } else if (relAngle < 360) {
      // 180° to 360°: EXHAUST STROKE (Выпуск газов в коллектор)
      stroke = "exhaust";
      strokeProgress = (relAngle - 180) / 180;
    } else if (relAngle < 540) {
      // 360° to 540°: INTAKE STROKE (Впуск свежей смеси)
      stroke = "intake";
      strokeProgress = (relAngle - 360) / 180;
    } else {
      // 540° to 720°: COMPRESSION STROKE (Сжатие смеси)
      stroke = "compression";
      strokeProgress = (relAngle - 540) / 180;
    }

    return {
      id: cyl.id,
      label: cyl.label,
      bank: cyl.bank,
      firingOrderIndex: cyl.firingOrderIndex,
      stroke,
      strokeProgress,
      isFiring,
    };
  });

  // Find cylinder currently firing
  const activeFiringCylinder = cylinderStates.find((c) => c.isFiring);

  // Group cylinders by Bank for V-engine or Boxer
  const bank1 = cylinderStates.filter((c) => c.bank === 1);
  const bank2 = cylinderStates.filter((c) => c.bank === 2);

  const getStrokeBadge = (stroke: StrokeType, isFiring: boolean) => {
    switch (stroke) {
      case "power":
        return {
          label: "РАБОЧИЙ ХОД",
          korean: "팽창행정",
          border: "border-amber-500/70",
          bg: "bg-amber-500/20",
          text: "text-amber-300",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.6)] ring-2 ring-amber-400",
        };
      case "exhaust":
        return {
          label: "ВЫПУСК",
          korean: "배기행정",
          border: "border-cyan-500/40",
          bg: "bg-cyan-500/10",
          text: "text-cyan-300",
          glow: "",
        };
      case "intake":
        return {
          label: "ВПУСК",
          korean: "흡기행정",
          border: "border-emerald-500/40",
          bg: "bg-emerald-500/10",
          text: "text-emerald-300",
          glow: "",
        };
      case "compression":
      default:
        return {
          label: "СЖАТИЕ",
          korean: "압축행정",
          border: "border-purple-500/40",
          bg: "bg-purple-500/10",
          text: "text-purple-300",
          glow: "",
        };
    }
  };

  return (
    <div className="w-full max-w-lg bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
      {/* Top Header: Firing Sequence Badge & Crankshaft Degree */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              Порядок зажигания (점화 순서 / Firing Order)
            </div>
            <div className="text-[11px] font-mono text-orange-400 font-bold">
              {spec.sequenceString}
            </div>
          </div>
        </div>

        {/* Crankshaft Cycle Angle (0 - 720°) */}
        <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-xs">
          <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isPlaying ? "animate-spin" : ""}`} />
          <span className="text-slate-400 text-[10px]">КВ:</span>
          <span className="font-bold text-cyan-300">{Math.round(crankAngleDeg)}° / 720°</span>
        </div>
      </div>

      {/* Main Cylinder Bank Diagrams */}
      <div className="space-y-3">
        {spec.layout === "v-engine" ? (
          /* V-Engine: Dual V-Angle Banks */
          <div className="grid grid-cols-2 gap-3">
            {/* Bank 1 (Left Bank: 1, 3, 5, 7) */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 font-semibold text-center border-b border-slate-800/60 pb-1">
                Банк 1 (Левый / Bank 1)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {bank1.map((cyl) => renderCylinderCard(cyl))}
              </div>
            </div>

            {/* Bank 2 (Right Bank: 2, 4, 6, 8) */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 font-semibold text-center border-b border-slate-800/60 pb-1">
                Банк 2 (Правый / Bank 2)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {bank2.map((cyl) => renderCylinderCard(cyl))}
              </div>
            </div>
          </div>
        ) : spec.layout === "boxer" ? (
          /* Boxer: Opposed Horizontal Banks */
          <div className="grid grid-cols-2 gap-3">
            {/* Bank 1 Right */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 font-semibold text-center border-b border-slate-800/60 pb-1">
                Правый блок (Right Bank 1 & 3)
              </div>
              <div className="space-y-2">
                {bank1.map((cyl) => renderCylinderCard(cyl))}
              </div>
            </div>

            {/* Bank 2 Left */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 font-semibold text-center border-b border-slate-800/60 pb-1">
                Левый блок (Left Bank 2 & 4)
              </div>
              <div className="space-y-2">
                {bank2.map((cyl) => renderCylinderCard(cyl))}
              </div>
            </div>
          </div>
        ) : (
          /* Inline: Straight Row */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {cylinderStates.map((cyl) => renderCylinderCard(cyl))}
          </div>
        )}
      </div>

      {/* Engineering Firing Order Notes */}
      <div className="text-[10px] text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Акустическая физика: </span>
          {spec.notes}
        </div>
      </div>
    </div>
  );

  function renderCylinderCard(cyl: CylinderRuntimeState) {
    const badge = getStrokeBadge(cyl.stroke, cyl.isFiring);

    return (
      <div
        key={cyl.id}
        className={`relative p-2 rounded-xl transition-all duration-75 flex flex-col items-center justify-between text-center border ${
          cyl.isFiring
            ? `${badge.bg} ${badge.border} ${badge.glow}`
            : "bg-slate-900/90 border-slate-800"
        }`}
      >
        {/* Fire flame overlay when firing */}
        {cyl.isFiring && isPlaying && (
          <div className="absolute -top-2.5 flex items-center gap-0.5 animate-bounce">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
          </div>
        )}

        <div className="flex items-center gap-1">
          <span className="text-xs font-black font-mono text-white">
            #{cyl.id}
          </span>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1 rounded">
            №{cyl.firingOrderIndex}
          </span>
        </div>

        {/* Dynamic Stroke Label */}
        <div
          className={`text-[9px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded ${
            cyl.isFiring
              ? "text-amber-200 bg-amber-500/30"
              : cyl.stroke === "exhaust"
              ? "text-cyan-300 bg-cyan-500/10"
              : cyl.stroke === "intake"
              ? "text-emerald-300 bg-emerald-500/10"
              : "text-purple-300 bg-purple-500/10"
          }`}
        >
          {badge.label}
        </div>

        {/* Stroke Progress Bar */}
        <div className="w-full mt-1.5 h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
          <div
            className={`h-full transition-all duration-75 ${
              cyl.isFiring ? "bg-amber-400" : "bg-slate-600"
            }`}
            style={{ width: `${Math.round(cyl.strokeProgress * 100)}%` }}
          />
        </div>
      </div>
    );
  }
}
