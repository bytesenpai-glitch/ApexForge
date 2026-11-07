"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Volume2,
  VolumeX,
  Zap,
  Flame,
  Radio,
  Sliders,
  Gauge,
  GaugeCircle,
  Activity,
  Sparkles,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { resolveBuildParts } from "@/services/swapService";
import { engineAudio } from "@/services/audioEngineService";

export function EngineAudioModal() {
  const isOpen = useUiStore((s) => s.isAudioModalOpen);
  const closeModal = useUiStore((s) => s.closeAudioModal);
  const showToast = useUiStore((s) => s.showToast);

  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const slots = useBuildStore((s) => s.slots);

  const [isPlaying, setIsPlaying] = useState(false);
  const [rpm, setRpm] = useState(850);
  const [isThrottling, setIsThrottling] = useState(false);
  const [is2StepActive, setIs2StepActive] = useState(false);
  const [flamePops, setFlamePops] = useState(0);

  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const resolved = useMemo(() => {
    if (!vehicle) return null;
    return resolveBuildParts(vehicle, slots);
  }, [vehicle, slots]);

  const redline = resolved?.engine.redlineRpm ?? 7000;
  const idleRpm = 850;

  // Sync audio engine config whenever active build changes
  useEffect(() => {
    if (!resolved) return;
    engineAudio.setConfig({
      cylinders: resolved.engine.cylinders,
      cylinderLayout: resolved.engine.cylinderLayout ?? "inline",
      redlineRpm: resolved.engine.redlineRpm ?? 7000,
      exhaustType: resolved.exhaust?.subtype ?? "oem",
      hasTurbo: resolved.turbo !== null || resolved.engine.aspiration !== "na",
    });
  }, [resolved]);

  // Clean shutdown on unmount or close
  useEffect(() => {
    if (!isOpen && isPlaying) {
      engineAudio.stop();
      setIsPlaying(false);
      setRpm(idleRpm);
    }
  }, [isOpen, isPlaying, idleRpm]);

  // Throttle physics loop (Smooth RPM revving & deceleration)
  const isThrottlingRef = useRef(isThrottling);
  isThrottlingRef.current = isThrottling;

  const is2StepRef = useRef(is2StepActive);
  is2StepRef.current = is2StepActive;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let currentLocalRpm = rpm;

    const tick = () => {
      if (!isPlayingRef.current) return;

      if (is2StepRef.current) {
        // 2-Step launch control cut at 5200 RPM with random backfire pops
        const target = 5200 + (Math.random() * 300 - 150);
        currentLocalRpm = target;
        if (Math.random() > 0.6) {
          engineAudio.triggerPopAndBang();
          setFlamePops((p) => p + 1);
        }
      } else if (isThrottlingRef.current) {
        // Revving up
        currentLocalRpm = Math.min(redline, currentLocalRpm + 140);
        if (currentLocalRpm >= redline - 50) {
          // Bouncing on the rev limiter
          engineAudio.triggerPopAndBang();
          currentLocalRpm = redline - 250;
        }
      } else {
        // Dropping back down to idle
        currentLocalRpm = Math.max(idleRpm, currentLocalRpm - 95);
      }

      setRpm(Math.round(currentLocalRpm));
      engineAudio.setRpm(currentLocalRpm);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, redline, idleRpm]);

  // Keyboard Spacebar listener to rev throttle
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (!isPlayingRef.current) {
          handleToggleStart();
        }
        setIsThrottling(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsThrottling(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen]);

  const handleToggleStart = () => {
    if (isPlaying) {
      engineAudio.stop();
      setIsPlaying(false);
      setRpm(idleRpm);
    } else {
      engineAudio.start();
      setIsPlaying(true);
    }
  };

  if (!isOpen || !vehicle || !resolved) return null;

  const rpmPercent = Math.min(100, Math.max(0, ((rpm - idleRpm) / (redline - idleRpm)) * 100));
  const isNearRedline = rpm >= redline - 600;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Синтезатор звука выхлопа (엔진 사운드 시뮬레이터)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 font-semibold">
                  Web Audio API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {resolved.engine.code} ({resolved.engine.cylinderLayout?.toUpperCase()} {resolved.engine.cylinders}-Cyl) · {resolved.exhaust ? resolved.exhaust.name : "OEM Stock Exhaust"}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tachometer Body */}
        <div className="p-6 flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-slate-950 to-slate-900">
          {/* RPM Digital & Analog Arc Display */}
          <div className="relative w-72 h-44 flex flex-col items-center justify-end">
            {/* Fire flame burst effects when 2-step or rev limit */}
            {isNearRedline && isPlaying && (
              <div className="absolute top-0 flex items-center gap-2 animate-bounce">
                <Flame className="w-8 h-8 text-amber-500 animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                <Sparkles className="w-6 h-6 text-orange-400 animate-spin" />
                <Flame className="w-8 h-8 text-rose-500 animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
              </div>
            )}

            <div className="text-center space-y-1">
              <div className="text-5xl font-black font-mono tracking-tight text-white drop-shadow-md">
                {isPlaying ? rpm : "OFF"}
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                RPM / Об/мин (Красная зона: {redline})
              </div>
            </div>

            {/* RPM Progress Bar */}
            <div className="w-full mt-4 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isNearRedline
                    ? "bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-lg shadow-rose-950"
                    : "bg-gradient-to-r from-cyan-500 to-emerald-400"
                }`}
                style={{ width: `${isPlaying ? rpmPercent : 0}%` }}
              />
            </div>
          </div>

          {/* Engine & Sound Config Pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center text-xs">
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-slate-300">
              Конфигурация: <strong>{resolved.engine.cylinderLayout} {resolved.engine.cylinders}</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-cyan-400">
              Выхлоп: <strong>{resolved.exhaust ? resolved.exhaust.subtype : "сток OEM"}</strong>
            </span>
            {resolved.turbo && (
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 font-mono text-amber-300">
                Турбо: <strong>BOV Flutter Active</strong>
              </span>
            )}
          </div>

          {/* Interactive Controls Bar */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Start / Stop Ignition Switch */}
            <button
              onClick={handleToggleStart}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50"
              }`}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlaying ? "Заглушить мотор" : "Завести ДВС (START)"}</span>
            </button>

            {/* Hold to Rev Throttle Pedal */}
            <button
              disabled={!isPlaying}
              onMouseDown={() => setIsThrottling(true)}
              onMouseUp={() => setIsThrottling(false)}
              onMouseLeave={() => setIsThrottling(false)}
              onTouchStart={() => setIsThrottling(true)}
              onTouchEnd={() => setIsThrottling(false)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg select-none active:scale-95 cursor-pointer ${
                !isPlaying
                  ? "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
                  : isThrottling
                  ? "bg-amber-500 text-slate-950 shadow-amber-950/60 ring-2 ring-amber-400"
                  : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-950/40"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{isThrottling ? "ГАЗ В ПОЛ!" : "Педаль газа (Зажать)"}</span>
            </button>

            {/* 2-Step Anti-Lag Limiter */}
            <button
              disabled={!isPlaying}
              onMouseDown={() => setIs2StepActive(true)}
              onMouseUp={() => setIs2StepActive(false)}
              onMouseLeave={() => setIs2StepActive(false)}
              onTouchStart={() => setIs2StepActive(true)}
              onTouchEnd={() => setIs2StepActive(false)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg select-none active:scale-95 cursor-pointer ${
                !isPlaying
                  ? "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
                  : is2StepActive
                  ? "bg-rose-600 text-white shadow-rose-950/60 ring-2 ring-rose-400"
                  : "bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30"
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>2-Step Отсечка (Отстрелы)</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-mono">
            Подсказка: Удерживай клавишу <strong>ПРОБЕЛ (Spacebar)</strong> для симуляции нажатия педали газа.
          </p>
        </div>
      </div>
    </div>
  );
}
