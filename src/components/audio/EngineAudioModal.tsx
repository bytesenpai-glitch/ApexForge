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
  Settings2,
  Disc,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { resolveBuildParts } from "@/services/swapService";
import { engineAudio, type ExhaustSoundPreset } from "@/services/audioEngineService";

export function EngineAudioModal() {
  const isOpen = useUiStore((s) => s.isAudioModalOpen);
  const closeModal = useUiStore((s) => s.closeAudioModal);

  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const slots = useBuildStore((s) => s.slots);

  const [isPlaying, setIsPlaying] = useState(false);
  const [rpm, setRpm] = useState(850);
  const [throttle, setThrottle] = useState(0); // 0.0 to 1.0
  const [isThrottling, setIsThrottling] = useState(false);
  const [is2StepActive, setIs2StepActive] = useState(false);
  const [isChopIdle, setIsChopIdle] = useState(false);
  const [exhaustPreset, setExhaustPreset] = useState<ExhaustSoundPreset>("sport-resonated");
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

  // Sync audio engine configuration whenever vehicle or parts change
  useEffect(() => {
    if (!resolved) return;

    let defaultPreset: ExhaustSoundPreset = "sport-resonated";
    if (resolved.exhaust) {
      if (resolved.exhaust.subtype === "straight-pipe") defaultPreset = "straight-pipe";
      else if (resolved.exhaust.subtype === "titanium-catback") defaultPreset = "valvetronic";
      else defaultPreset = "sport-resonated";
    }

    setExhaustPreset(defaultPreset);
    engineAudio.setConfig({
      cylinders: resolved.engine.cylinders,
      cylinderLayout: resolved.engine.cylinderLayout ?? "inline",
      redlineRpm: resolved.engine.redlineRpm ?? 7000,
      exhaustType: defaultPreset,
      hasTurbo: resolved.turbo !== null || resolved.engine.aspiration !== "na",
      engineCode: resolved.engine.code,
      family: resolved.engine.family,
    });
    engineAudio.setExhaustPreset(defaultPreset);
  }, [resolved]);

  // Clean shutdown on unmount or modal close
  useEffect(() => {
    if (!isOpen && isPlaying) {
      engineAudio.stop();
      setIsPlaying(false);
      setRpm(idleRpm);
      setThrottle(0);
    }
  }, [isOpen, isPlaying, idleRpm]);

  // Throttle physics loop (Realistic inertia, throttle load & overrun decel)
  const isThrottlingRef = useRef(isThrottling);
  isThrottlingRef.current = isThrottling;

  const is2StepRef = useRef(is2StepActive);
  is2StepRef.current = is2StepActive;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const throttleRef = useRef(throttle);
  throttleRef.current = throttle;

  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let currentLocalRpm = rpm;

    const tick = () => {
      if (!isPlayingRef.current) return;

      if (is2StepRef.current) {
        // 2-Step launch control cut at 5200 RPM with rapid backfire pops
        const target = 5200 + (Math.random() * 320 - 160);
        currentLocalRpm = target;
        engineAudio.setThrottle(1.0);
        if (Math.random() > 0.65) {
          engineAudio.triggerPopAndBang();
          setFlamePops((p) => p + 1);
        }
      } else if (isThrottlingRef.current) {
        // Full throttle acceleration
        engineAudio.setThrottle(1.0);
        setThrottle(1.0);
        currentLocalRpm = Math.min(redline, currentLocalRpm + 160);
        if (currentLocalRpm >= redline - 40) {
          // Bouncing on the rev limiter with fuel cut
          engineAudio.triggerPopAndBang();
          setFlamePops((p) => p + 1);
          currentLocalRpm = redline - 280;
        }
      } else {
        // Deceleration down to idle (throttle 0)
        engineAudio.setThrottle(0.0);
        setThrottle(0.0);
        // Engine braking deceleration rate
        currentLocalRpm = Math.max(idleRpm, currentLocalRpm - 110);
      }

      setRpm(Math.round(currentLocalRpm));
      engineAudio.setRpm(currentLocalRpm);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, redline, idleRpm]);

  // Handle Preset change
  const handleSelectPreset = (preset: ExhaustSoundPreset) => {
    setExhaustPreset(preset);
    engineAudio.setExhaustPreset(preset);
  };

  // Handle Chop Idle toggle
  const handleToggleChopIdle = () => {
    const next = !isChopIdle;
    setIsChopIdle(next);
    engineAudio.setChopIdle(next);
  };

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
      setThrottle(0);
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
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Акустический симулятор ДВС (엔진 사운드 시뮬레이터)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 font-semibold">
                  Физическая модель
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {resolved.engine.code} ({resolved.engine.cylinderLayout?.toUpperCase()} {resolved.engine.cylinders}-Cyl) · {resolved.engine.valvetrain?.toUpperCase() ?? "DOHC"} · Redline: {redline} RPM
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tachometer Body */}
        <div className="p-6 flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-slate-950 to-slate-900">
          {/* RPM Digital & Fire burst effect */}
          <div className="relative w-full max-w-md h-40 flex flex-col items-center justify-end">
            {(isNearRedline || is2StepActive) && isPlaying && (
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
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                <span>RPM (Обороты ДВС)</span>
                {isChopIdle && isPlaying && rpm < 1100 && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                    CAM LOPE
                  </span>
                )}
              </div>
            </div>

            {/* RPM Progress Bar */}
            <div className="w-full mt-4 h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isNearRedline || is2StepActive
                    ? "bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-lg shadow-rose-950"
                    : "bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400"
                }`}
                style={{ width: `${isPlaying ? rpmPercent : 0}%` }}
              />
            </div>
          </div>

          {/* Exhaust Acoustic Profiles */}
          <div className="w-full max-w-md bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                Акустический профиль выхлопа:
              </span>
              <span className="font-mono text-cyan-400 uppercase text-[11px]">
                {exhaustPreset}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(
                [
                  { id: "oem", label: "OEM Сток", desc: "Приглушенный" },
                  { id: "sport-resonated", label: "Спорт-резонатор", desc: "Глубокий бас" },
                  { id: "valvetronic", label: "Заслонка", desc: "Сочный рокот" },
                  { id: "straight-pipe", label: "Прямоток", desc: "Злой звон" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer border ${
                    exhaustPreset === preset.id
                      ? "bg-orange-500/15 border-orange-500/50 text-orange-300 font-bold shadow-sm shadow-orange-950"
                      : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <div className="text-[11px] font-bold">{preset.label}</div>
                  <div className="text-[9px] text-slate-500 font-mono">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Engine Parameters & Cam Tuning */}
          <div className="flex items-center gap-2 flex-wrap justify-center text-xs">
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-slate-300">
              Конфигурация: <strong>{resolved.engine.cylinderLayout?.toUpperCase()} {resolved.engine.cylinders}-Cyl</strong>
            </span>
            {resolved.turbo && (
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 font-mono text-amber-300">
                Турбонаддув: <strong>BOV Flutter Active</strong>
              </span>
            )}
            <button
              onClick={handleToggleChopIdle}
              className={`px-3 py-1 rounded-lg font-mono text-xs transition-all cursor-pointer border ${
                isChopIdle
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              Злые валы (Chop Idle): {isChopIdle ? "ВКЛ" : "ВЫКЛ"}
            </button>
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
              <span>{isThrottling ? "ГАЗ В ПОЛ (WOT)!" : "Педаль газа (Зажать)"}</span>
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

          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-400 font-mono">
              Подсказка: Удерживай клавишу <strong>ПРОБЕЛ (Spacebar)</strong> для симуляции нажатия педали газа.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              При быстром сбросе газа с высоких оборотов автоматически генерируются отстрелы и попкорн (Overrun Burble).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
