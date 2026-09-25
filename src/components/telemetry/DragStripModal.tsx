"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Gauge,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import type { Vehicle } from "@/domain/vehicles/types";
import type { FormattedTelemetry, ResolvedBuildParts } from "@/types/tuning.types";
import {
  simulateQuarterMile,
  TIRE_COMPOUND_SPECS,
  type QuarterMileResult,
  type TireCompound,
} from "@/services/dynoSimulationService";
import { BRAND_LABELS, LAYOUT_LABELS } from "@/constants/tuning";

interface DragStripModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  resolved: ResolvedBuildParts;
  telemetry: FormattedTelemetry;
}

type TreeState = "idle" | "pre-stage" | "stage" | "amber-1" | "amber-2" | "amber-3" | "green" | "finished";

export function DragStripModal({
  isOpen,
  onClose,
  vehicle,
  resolved,
  telemetry,
}: DragStripModalProps) {
  const [selectedTire, setSelectedTire] = useState<TireCompound>("semi-slick-200tw");
  const [treeState, setTreeState] = useState<TreeState>("idle");
  const [result, setResult] = useState<QuarterMileResult | null>(null);
  const [progressDistanceM, setProgressDistanceM] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [currentG, setCurrentG] = useState(0);

  const runTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Clean timers
  useEffect(() => {
    return () => {
      if (runTimerRef.current) clearTimeout(runTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleLaunch = () => {
    if (treeState !== "idle" && treeState !== "finished") return;

    // Run physics simulation
    const simResult = simulateQuarterMile(vehicle, telemetry, selectedTire, 0.165);
    setResult(simResult);
    setProgressDistanceM(0);
    setCurrentSpeedKmh(0);
    setCurrentG(0);

    // Sequence the NHRA Christmas Tree lights
    setTreeState("pre-stage");

    setTimeout(() => {
      setTreeState("stage");
      setTimeout(() => {
        setTreeState("amber-1");
        setTimeout(() => {
          setTreeState("amber-2");
          setTimeout(() => {
            setTreeState("amber-3");
            setTimeout(() => {
              // GREEN LIGHT! Launch down the track!
              setTreeState("green");
              startTrackAnimation(simResult);
            }, 400);
          }, 400);
        }, 400);
      }, 500);
    }, 400);
  };

  const startTrackAnimation = (sim: QuarterMileResult) => {
    const startMs = performance.now();
    // Accelerated animation time (compress full ET into ~3.5 seconds for great UX)
    const animDurationMs = 3500;

    const loop = (now: number) => {
      const elapsed = now - startMs;
      const progress = Math.min(1.0, elapsed / animDurationMs);

      // Trajectory interpolation
      const targetM = Math.round(402.336 * Math.pow(progress, 1.35));
      const targetSpeed = Math.round(sim.quarterMileSpeedKmh * progress);
      const targetG = Number((sim.peakG * Math.max(0.2, 1 - progress * 0.7)).toFixed(2));

      setProgressDistanceM(targetM);
      setCurrentSpeedKmh(targetSpeed);
      setCurrentG(targetG);

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        setProgressDistanceM(402);
        setCurrentSpeedKmh(sim.quarterMileSpeedKmh);
        setCurrentG(0);
        setTreeState("finished");
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const handleReset = () => {
    if (runTimerRef.current) clearTimeout(runTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setTreeState("idle");
    setResult(null);
    setProgressDistanceM(0);
    setCurrentSpeedKmh(0);
    setCurrentG(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
              <Trophy className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                  APEX STRIP // 1/4 MILE ACCELERATION PHYSICS
                </span>
                <span className="text-[10px] font-mono text-slate-400">402.33m NHRA / FIA Standard</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model} · {LAYOUT_LABELS[vehicle.layout]}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tire Compound Selector Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/60 text-xs font-mono">
          <span className="text-slate-400">Тип резины (Tire Compound):</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(Object.keys(TIRE_COMPOUND_SPECS) as TireCompound[]).map((tKey) => {
              const spec = TIRE_COMPOUND_SPECS[tKey];
              const isSelected = selectedTire === tKey;
              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => {
                    setSelectedTire(tKey);
                    if (treeState === "finished") handleReset();
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                  title={spec.description}
                >
                  {spec.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Stage: Tree Lights + 400m Track + Time Slip */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-5">
          {/* TOP SECTION: CHRISTMAS TREE & REAL-TIME SPEEDOMETER */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/30 border border-slate-800/80 rounded-xl p-4">
            {/* NHRA Christmas Tree Lights (cols 3) */}
            <div className="md:col-span-4 flex items-center justify-center gap-4">
              {/* Christmas Tree Box */}
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                {/* Pre-Stage (Blue/Yellow LEDs) */}
                <div className="flex items-center gap-2">
                  <span
                    className={`size-3 rounded-full border border-slate-700 transition-colors ${
                      treeState !== "idle" ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "bg-slate-800"
                    }`}
                  />
                  <span
                    className={`size-3 rounded-full border border-slate-700 transition-colors ${
                      treeState !== "idle" ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "bg-slate-800"
                    }`}
                  />
                </div>

                {/* Stage */}
                <div className="flex items-center gap-2">
                  <span
                    className={`size-3 rounded-full border border-slate-700 transition-colors ${
                      treeState === "stage" ||
                      treeState === "amber-1" ||
                      treeState === "amber-2" ||
                      treeState === "amber-3" ||
                      treeState === "green" ||
                      treeState === "finished"
                        ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                        : "bg-slate-800"
                    }`}
                  />
                  <span
                    className={`size-3 rounded-full border border-slate-700 transition-colors ${
                      treeState === "stage" ||
                      treeState === "amber-1" ||
                      treeState === "amber-2" ||
                      treeState === "amber-3" ||
                      treeState === "green" ||
                      treeState === "finished"
                        ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                        : "bg-slate-800"
                    }`}
                  />
                </div>

                {/* Amber 1 */}
                <div
                  className={`size-6 rounded-full border border-slate-700 transition-colors ${
                    treeState === "amber-1" || treeState === "amber-2" || treeState === "amber-3"
                      ? "bg-amber-400 shadow-[0_0_15px_#f59e0b]"
                      : "bg-slate-800/80"
                  }`}
                />
                {/* Amber 2 */}
                <div
                  className={`size-6 rounded-full border border-slate-700 transition-colors ${
                    treeState === "amber-2" || treeState === "amber-3"
                      ? "bg-amber-400 shadow-[0_0_15px_#f59e0b]"
                      : "bg-slate-800/80"
                  }`}
                />
                {/* Amber 3 */}
                <div
                  className={`size-6 rounded-full border border-slate-700 transition-colors ${
                    treeState === "amber-3" ? "bg-amber-400 shadow-[0_0_15px_#f59e0b]" : "bg-slate-800/80"
                  }`}
                />

                {/* Green Light (GO!) */}
                <div
                  className={`size-7 rounded-full border border-slate-700 transition-colors ${
                    treeState === "green" || treeState === "finished"
                      ? "bg-emerald-400 shadow-[0_0_20px_#10b981]"
                      : "bg-slate-800/80"
                  }`}
                />
              </div>

              {/* Status / Tree Description */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Статус светофора</span>
                <span className="text-sm font-bold font-mono text-white">
                  {treeState === "idle" && "READY TO STAGE"}
                  {treeState === "pre-stage" && "PRE-STAGE DETECTED"}
                  {treeState === "stage" && "STAGED ON THE BEAM"}
                  {treeState.startsWith("amber") && "COUNTDOWN..."}
                  {treeState === "green" && "LAUNCH!! GO!"}
                  {treeState === "finished" && "RUN COMPLETED"}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {TIRE_COMPOUND_SPECS[selectedTire].description}
                </span>
              </div>
            </div>

            {/* Live Telemetry KPI dials (cols 5) */}
            <div className="md:col-span-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl p-3 bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Дистанция</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">
                  {progressDistanceM} <span className="text-xs text-slate-400">m</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">/ 402m</span>
              </div>

              <div className="rounded-xl p-3 bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Скорость</span>
                <div className="text-2xl font-black font-mono text-cyan-400 mt-0.5">
                  {currentSpeedKmh} <span className="text-xs text-slate-400">km/h</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {Math.round(currentSpeedKmh * 0.621371)} mph
                </span>
              </div>

              <div className="rounded-xl p-3 bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Перегрузка G</span>
                <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                  {currentG} <span className="text-xs text-slate-400">G</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300/80">Launch Peak</span>
              </div>
            </div>

            {/* Launch Trigger Button (cols 3) */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleLaunch}
                disabled={treeState !== "idle" && treeState !== "finished"}
                className={`w-full py-3.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  treeState === "idle" || treeState === "finished"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Zap className="size-4 fill-current" />
                <span>СТАРТ ЗАЕЗДА (LAUNCH)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Сброс на старт</span>
              </button>
            </div>
          </div>

          {/* DRAG STRIP ANIMATED TRACK */}
          <div className="relative w-full rounded-xl p-4 bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 mb-2 border-b border-slate-800/80">
              <span>СТАРТ (0m)</span>
              <span>60 FT (18m)</span>
              <span>330 FT (100m)</span>
              <span>1/8 MILE (201m)</span>
              <span>1000 FT (304m)</span>
              <span className="text-amber-400 font-bold">ФИНИШ 1/4 MILE (402m)</span>
            </div>

            {/* Asphalt Track Lane */}
            <div className="relative h-14 w-full bg-[#121824] rounded-lg border border-slate-800 flex items-center px-4 overflow-hidden">
              {/* White Center Dashes */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 border-b border-dashed border-white/20" />

              {/* Checkpoint Markers */}
              <div className="absolute left-[4.5%] top-0 bottom-0 w-px bg-cyan-500/30" />
              <div className="absolute left-[25%] top-0 bottom-0 w-px bg-cyan-500/30" />
              <div className="absolute left-[50%] top-0 bottom-0 w-px bg-amber-500/40" />
              <div className="absolute left-[75.7%] top-0 bottom-0 w-px bg-cyan-500/30" />
              <div className="absolute right-4 top-0 bottom-0 w-2 bg-checkerboard opacity-60" />

              {/* Moving Car Silhouette Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 flex items-center gap-1.5 z-10"
                style={{
                  left: `calc(1rem + ${(progressDistanceM / 402.336) * 88}%)`,
                }}
              >
                <div className="size-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-sm shadow-[0_0_15px_#06b6d4]">
                  🏎️
                </div>
                {currentSpeedKmh > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-black/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold whitespace-nowrap">
                    {currentSpeedKmh} km/h
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* TIME SLIP RECEIPT CARD */}
          {result && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fadeIn">
              {/* Authentic Thermal Paper Receipt */}
              <div className="w-full max-w-sm rounded-xl p-5 bg-[#faf8f5] text-slate-900 font-mono text-xs shadow-2xl border border-slate-300 relative overflow-hidden">
                {/* Top Serrated Edge Decorator */}
                <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
                  <div className="font-black text-sm uppercase tracking-widest text-slate-950">
                    APEX FORGE RACEWAY
                  </div>
                  <div className="text-[10px] text-slate-600">INJE SPEEDIUM INTERNATIONAL DRAGWAY</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    SLIP #{result.timeSlipId} · {new Date().toLocaleDateString("ko-KR")}
                  </div>
                </div>

                {/* Car Spec Header */}
                <div className="text-[11px] mb-3 pb-2 border-b border-slate-300 flex justify-between">
                  <span className="font-bold">{vehicle.model}</span>
                  <span className="text-slate-600">{resolved.engine.code}</span>
                </div>

                {/* Split Time Lines */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">R/T (Реакция):</span>
                    <span className="font-bold">{result.reactionTimeSec.toFixed(3)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">60 FT:</span>
                    <span className="font-bold">{result.sixtyFootSec.toFixed(3)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">330 FT:</span>
                    <span className="font-bold">{result.threeThirtyFootSec.toFixed(3)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">1/8 ET (201м):</span>
                    <span className="font-bold">{result.eighthMileSec.toFixed(3)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">1/8 MPH:</span>
                    <span className="font-bold">{result.eighthMileSpeedMph} mph ({result.eighthMileSpeedKmh} km/h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">1000 FT:</span>
                    <span className="font-bold">{result.thousandFootSec.toFixed(3)} s</span>
                  </div>

                  <div className="my-2 border-b-2 border-slate-900" />

                  {/* 1/4 MILE MAIN RESULT */}
                  <div className="flex justify-between items-center text-sm font-black text-slate-950">
                    <span>1/4 ET (402м):</span>
                    <span className="text-base text-rose-600">{result.quarterMileSec.toFixed(3)} s</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-slate-950">
                    <span>1/4 MPH (Trap):</span>
                    <span>{result.quarterMileSpeedMph} MPH</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Скорость на выходе:</span>
                    <span>{result.quarterMileSpeedKmh} км/ч</span>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="mt-4 pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-500 flex justify-between">
                  <span>РЕЗИНА: {TIRE_COMPOUND_SPECS[result.tireCompound].wearRating}</span>
                  <span>ПИК: {result.peakG}G</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/50 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Расчет включает сцепление шин, аэродинамику Cd/A и развесовку F:R</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
