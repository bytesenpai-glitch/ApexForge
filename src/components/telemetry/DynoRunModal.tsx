"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Activity,
  Flame,
  Gauge,
  Play,
  RotateCcw,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import type { Vehicle } from "@/domain/vehicles/types";
import type { FormattedTelemetry, ResolvedBuildParts } from "@/types/tuning.types";
import { generateDynoCurve, type DynoDataPoint } from "@/services/dynoSimulationService";
import { BRAND_LABELS } from "@/constants/tuning";

interface DynoRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  resolved: ResolvedBuildParts;
  telemetry: FormattedTelemetry;
}

export function DynoRunModal({
  isOpen,
  onClose,
  vehicle,
  resolved,
  telemetry,
}: DynoRunModalProps) {
  const curve = useMemo(
    () => generateDynoCurve(resolved.engine, telemetry, resolved),
    [resolved, telemetry]
  );

  const [isRunning, setIsRunning] = useState(false);
  const [currentRpm, setCurrentRpm] = useState(1000);
  const [hoveredPoint, setHoveredPoint] = useState<DynoDataPoint | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "gauge">("graph");

  const animRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number>(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Clean animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleStartPull = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentRpm(1000);
    startTimestampRef.current = performance.now();

    const durationMs = 3800; // 3.8s pull from 1000 to revLimit
    const minRpm = 1000;
    const maxRpm = curve.revLimitRpm;

    const tick = (now: number) => {
      const elapsed = now - startTimestampRef.current;
      const progress = Math.min(1.0, elapsed / durationMs);

      // Non-linear acceleration (slow start, fast mid, rev limit bounce)
      const eased = Math.pow(progress, 1.4);
      const targetRpm = Math.round(minRpm + (maxRpm - minRpm) * eased);
      setCurrentRpm(targetRpm);

      if (progress < 1.0) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setIsRunning(false);
        setCurrentRpm(maxRpm);
      }
    };

    animRef.current = requestAnimationFrame(tick);
  };

  const handleReset = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsRunning(false);
    setCurrentRpm(1000);
  };

  if (!isOpen) return null;

  // Find current data point based on currentRpm
  const currentPoint =
    curve.points.reduce((prev, curr) => {
      return Math.abs(curr.rpm - currentRpm) < Math.abs(prev.rpm - currentRpm) ? curr : prev;
    }, curve.points[0]) ?? curve.points[0];

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 320;
  const padding = { top: 30, right: 60, bottom: 40, left: 60 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const minRpm = 1000;
  const maxRpm = Math.max(9000, curve.revLimitRpm);
  const maxHp = Math.ceil((curve.peakHp * 1.15) / 100) * 100;
  const maxTorque = Math.ceil((curve.peakTorqueNm * 1.15) / 100) * 100;

  const getX = (rpm: number) => padding.left + ((rpm - minRpm) / (maxRpm - minRpm)) * innerW;
  const getYHp = (hp: number) => padding.top + innerH - (hp / maxHp) * innerH;
  const getYTorque = (tq: number) => padding.top + innerH - (tq / maxTorque) * innerH;

  // Build SVG Path strings
  const hpPath = curve.points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.rpm)} ${getYHp(p.hp)}`)
    .join(" ");

  const torquePath = curve.points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.rpm)} ${getYTorque(p.torqueNm)}`)
    .join(" ");

  const hpAreaPath = `${hpPath} L ${getX(curve.points[curve.points.length - 1].rpm)} ${padding.top + innerH} L ${getX(curve.points[0].rpm)} ${padding.top + innerH} Z`;
  const torqueAreaPath = `${torquePath} L ${getX(curve.points[curve.points.length - 1].rpm)} ${padding.top + innerH} L ${getX(curve.points[0].rpm)} ${padding.top + innerH} Z`;

  // Gauge needle rotation (-120deg at 0 to +120deg at maxRpm)
  const needleAngle = -120 + (currentRpm / maxRpm) * 240;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Activity className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  APEX DYNO // HUB CHASSIS DYNO SIMULATOR
                </span>
                <span className="text-[10px] font-mono text-slate-400">4th Gear 1:1 Pull</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model} · {resolved.engine.code}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Top KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-5 py-3 bg-slate-900/30 border-b border-slate-800/60">
          <div className="rounded-lg p-2 bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Пиковая мощность (Peak HP)</span>
            <div className="text-lg font-black font-mono text-cyan-400">
              {isRunning ? currentPoint.hp : curve.peakHp}{" "}
              <span className="text-xs font-normal text-slate-400">л.с.</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300/80">@ {curve.peakHpRpm} RPM</span>
          </div>

          <div className="rounded-lg p-2 bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Пиковый момент (Torque)</span>
            <div className="text-lg font-black font-mono text-amber-400">
              {isRunning ? currentPoint.torqueNm : curve.peakTorqueNm}{" "}
              <span className="text-xs font-normal text-slate-400">Н·м</span>
            </div>
            <span className="text-[10px] font-mono text-amber-300/80">@ {curve.peakTorqueRpm} RPM</span>
          </div>

          <div className="rounded-lg p-2 bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Давление наддува (Boost)</span>
            <div className="text-lg font-black font-mono text-emerald-400">
              {currentPoint.boostBar}{" "}
              <span className="text-xs font-normal text-slate-400">bar</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {resolved.turbo ? resolved.turbo.code : "OEM Boost"}
            </span>
          </div>

          <div className="rounded-lg p-2 bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Отсечка (Rev Limit)</span>
            <div className="text-lg font-black font-mono text-rose-400">
              {curve.revLimitRpm}{" "}
              <span className="text-xs font-normal text-slate-400">RPM</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Redline: {curve.redlineRpm}</span>
          </div>
        </div>

        {/* Main Content Area (Dyno Graph & Tachometer) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center">
          {/* View Switcher: Graph vs Tachometer */}
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("graph")}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  activeTab === "graph" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                График ВСХ (Dyno Graph)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("gauge")}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  activeTab === "gauge" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Приборный щиток (Tachometer)
              </button>
            </div>

            {/* Run Pull Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartPull}
                disabled={isRunning}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  isRunning
                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse"
                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-95 shadow-lg shadow-cyan-500/20"
                }`}
              >
                {isRunning ? (
                  <>
                    <Activity className="size-3.5 animate-spin" />
                    <span>ЗАМЕР В ПРОЦЕССЕ...</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-current" />
                    <span>СТАРТ ЗАМЕРА (DYNO PULL)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex size-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Сбросить RPM"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          {/* TAB 1: DYNO GRAPH */}
          {activeTab === "graph" && (
            <div className="w-full relative flex flex-col items-center">
              {/* Tooltip / Active Point readout */}
              {hoveredPoint && (
                <div className="absolute top-2 right-4 flex items-center gap-4 bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-lg font-mono text-xs z-20 pointer-events-none">
                  <span className="text-white font-bold">{hoveredPoint.rpm} RPM</span>
                  <span className="text-cyan-400">Мощность: {hoveredPoint.hp} л.с.</span>
                  <span className="text-amber-400">Момент: {hoveredPoint.torqueNm} Н·м</span>
                  {hoveredPoint.boostBar > 0 && <span className="text-emerald-400">Наддув: {hoveredPoint.boostBar} bar</span>}
                </div>
              )}

              <div className="w-full aspect-[720/320] max-w-3xl">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-full select-none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const scaleX = chartWidth / rect.width;
                    const svgX = mouseX * scaleX;
                    if (svgX >= padding.left && svgX <= padding.left + innerW) {
                      const rpmFraction = (svgX - padding.left) / innerW;
                      const targetRpm = Math.round(minRpm + rpmFraction * (maxRpm - minRpm));
                      const pt = curve.points.reduce((prev, curr) =>
                        Math.abs(curr.rpm - targetRpm) < Math.abs(prev.rpm - targetRpm) ? curr : prev
                      );
                      setHoveredPoint(pt);
                    }
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <defs>
                    <linearGradient id="hpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="tqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                    const y = padding.top + innerH * (1 - frac);
                    return (
                      <g key={`y-grid-${idx}`}>
                        <line x1={padding.left} y1={y} x2={padding.left + innerW} y2={y} stroke="rgba(51, 65, 85, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={padding.left - 8} y={y + 3} textAnchor="end" fill="#06b6d4" fontSize="9" fontFamily="monospace">
                          {Math.round(maxHp * frac)}
                        </text>
                        <text x={padding.left + innerW + 8} y={y + 3} textAnchor="start" fill="#f59e0b" fontSize="9" fontFamily="monospace">
                          {Math.round(maxTorque * frac)}
                        </text>
                      </g>
                    );
                  })}

                  {/* RPM Vertical Grid Lines */}
                  {[2000, 4000, 6000, 8000].map((rpmVal) => {
                    if (rpmVal > maxRpm) return null;
                    const x = getX(rpmVal);
                    return (
                      <g key={`x-grid-${rpmVal}`}>
                        <line x1={x} y1={padding.top} x2={x} y2={padding.top + innerH} stroke="rgba(51, 65, 85, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={x} y={padding.top + innerH + 16} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                          {rpmVal / 1000}k
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Areas */}
                  <path d={hpAreaPath} fill="url(#hpGrad)" />
                  <path d={torqueAreaPath} fill="url(#tqGrad)" />

                  {/* Torque Curve */}
                  <path d={torquePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Power HP Curve */}
                  <path d={hpPath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />

                  {/* Redline Shaded Zone */}
                  <rect
                    x={getX(curve.redlineRpm)}
                    y={padding.top}
                    width={getX(curve.revLimitRpm) - getX(curve.redlineRpm)}
                    height={innerH}
                    fill="rgba(244, 63, 94, 0.15)"
                    stroke="rgba(244, 63, 94, 0.4)"
                    strokeDasharray="4 2"
                  />

                  {/* Live Pull Sweep Cursor */}
                  {isRunning && (
                    <line
                      x1={getX(currentRpm)}
                      y1={padding.top}
                      x2={getX(currentRpm)}
                      y2={padding.top + innerH}
                      stroke="#f43f5e"
                      strokeWidth="2"
                    />
                  )}

                  {/* Peak Marker Circles */}
                  <circle cx={getX(curve.peakHpRpm)} cy={getYHp(curve.peakHp)} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={getX(curve.peakTorqueRpm)} cy={getYTorque(curve.peakTorqueNm)} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Legend Bar */}
              <div className="flex items-center gap-6 mt-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 rounded bg-cyan-400" />
                  <span className="text-cyan-300">Мощность двигателя (л.с. / Horsepower)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 rounded bg-amber-400" />
                  <span className="text-amber-300">Крутящий момент (Н·м / Torque)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40" />
                  <span className="text-rose-400">Зона отсечки (Rev Limiter)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TACHOMETER GAUGE */}
          {activeTab === "gauge" && (
            <div className="w-full flex flex-col items-center py-4">
              <div className="relative size-64 flex items-center justify-center">
                <svg viewBox="0 0 240 240" className="size-full">
                  {/* Gauge Arc */}
                  <circle
                    cx="120"
                    cy="120"
                    r="90"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="12"
                    strokeDasharray="377"
                    strokeDashoffset="94"
                    strokeLinecap="round"
                    transform="rotate(135 120 120)"
                  />
                  {/* Active RPM Sweep Arc */}
                  <circle
                    cx="120"
                    cy="120"
                    r="90"
                    fill="none"
                    stroke={currentRpm > curve.redlineRpm ? "#ef4444" : "#06b6d4"}
                    strokeWidth="12"
                    strokeDasharray="377"
                    strokeDashoffset={377 - (currentRpm / maxRpm) * 280}
                    strokeLinecap="round"
                    transform="rotate(135 120 120)"
                    className="transition-all duration-75"
                  />

                  {/* RPM Numbers */}
                  {[0, 2, 4, 6, 8, 10].map((num) => {
                    const angle = -120 + (num / 10) * 240;
                    const rad = (angle * Math.PI) / 180;
                    const x = 120 + 70 * Math.sin(rad);
                    const y = 120 - 70 * Math.cos(rad);
                    return (
                      <text key={`num-${num}`} x={x} y={y + 4} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        {num}
                      </text>
                    );
                  })}

                  {/* Center Needle */}
                  <g transform={`rotate(${needleAngle} 120 120)`}>
                    <line x1="120" y1="120" x2="120" y2="45" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="120" cy="120" r="10" fill="#0f172a" stroke="#ef4444" strokeWidth="3" />
                  </g>
                </svg>

                {/* Digital RPM Counter in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
                  <span className="text-3xl font-black font-mono text-white tracking-wider">
                    {currentRpm.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">RPM</span>
                </div>
              </div>

              {/* Limiter Spark Bounce Message */}
              {currentRpm >= curve.revLimitRpm && (
                <div className="flex items-center gap-2 mt-4 px-3 py-1 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono text-xs animate-bounce">
                  <Flame className="size-4 text-rose-400" />
                  <span>HARD CUT REV LIMITER // BURBLE FLAMES</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/50 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Движок симуляции откалиброван по OEM стендовым замерам DynoJet / SuperFlow</span>
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
