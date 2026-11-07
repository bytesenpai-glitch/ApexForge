"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Volume2,
  VolumeX,
  Zap,
  Flame,
  Gauge,
  Sparkles,
  Settings2,
  Disc3,
  Wind,
  Headphones,
  Keyboard,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { resolveBuildParts } from "@/services/swapService";
import {
  engineAudio,
  type ExhaustSoundPreset,
  type LoadMode,
  type FlywheelType,
  type AudioPerspective,
} from "@/services/audioEngineService";
import { resolveEngineFiringOrder } from "@/domain/parts/firingOrders";
import { FiringOrderVisualizer } from "./FiringOrderVisualizer";

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
  const [loadMode, setLoadMode] = useState<LoadMode>("neutral");
  const [flywheelType, setFlywheelType] = useState<FlywheelType>("oem");
  const [perspective, setPerspective] = useState<AudioPerspective>("cockpit");
  const [exhaustPreset, setExhaustPreset] = useState<ExhaustSoundPreset>("sport-resonated");
  const [currentBoost, setCurrentBoost] = useState(0.0);

  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const resolved = useMemo(() => {
    if (!vehicle) return null;
    return resolveBuildParts(vehicle, slots);
  }, [vehicle, slots]);

  const redline = resolved?.engine.redlineRpm ?? 7000;
  const idleRpm = 850;
  const hasTurbo = resolved?.turbo !== null || (resolved?.engine.aspiration !== "na");
  const displacementLiters = resolved?.engine.displacementCc
    ? Number((resolved.engine.displacementCc / 1000).toFixed(1))
    : 2.0;

  const firingOrderSpec = useMemo(() => {
    if (!resolved) return null;
    return resolveEngineFiringOrder(
      resolved.engine.cylinderLayout ?? "inline",
      resolved.engine.cylinders,
      resolved.engine.family,
      resolved.engine.code
    );
  }, [resolved]);

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
      displacementLiters,
      redlineRpm: resolved.engine.redlineRpm ?? 7000,
      exhaustType: defaultPreset,
      hasTurbo,
      engineCode: resolved.engine.code,
      family: resolved.engine.family,
    });
  }, [resolved, displacementLiters, hasTurbo]);

  // Clean shutdown on unmount or modal close
  useEffect(() => {
    if (!isOpen && isPlaying) {
      engineAudio.stop();
      setIsPlaying(false);
      setRpm(idleRpm);
      setThrottle(0);
      setCurrentBoost(0);
    }
  }, [isOpen, isPlaying, idleRpm]);

  // Live refs for physics loop to eliminate stale closures
  const isThrottlingRef = useRef(isThrottling);
  isThrottlingRef.current = isThrottling;

  const is2StepRef = useRef(is2StepActive);
  is2StepRef.current = is2StepActive;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const throttleRef = useRef(throttle);
  throttleRef.current = throttle;

  const loadModeRef = useRef(loadMode);
  loadModeRef.current = loadMode;

  const flywheelRef = useRef(flywheelType);
  flywheelRef.current = flywheelType;

  // Real-world Drivetrain & Flywheel Inertia Differential Physics Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let currentLocalRpm = rpm;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (!isPlayingRef.current) return;

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      let effectiveThrottle = isThrottlingRef.current ? 1.0 : throttleRef.current;
      if (is2StepRef.current) effectiveThrottle = 1.0;

      const isNeutral = loadModeRef.current === "neutral";
      const isLightFlywheel = flywheelRef.current === "lightweight";

      let maxRpmRate: number;
      if (isNeutral) {
        maxRpmRate = isLightFlywheel ? 4100 : 3100; // RPM/sec
      } else {
        maxRpmRate = isLightFlywheel ? 1550 : 1300; // RPM/sec
      }

      const rpmRatio = (currentLocalRpm - idleRpm) / (redline - idleRpm);
      const torqueCurve = 0.75 + 0.35 * Math.sin(Math.PI * Math.min(1, rpmRatio));

      let targetBoost = 0.0;
      if (hasTurbo && effectiveThrottle > 0.1) {
        const boostCap = isNeutral ? 0.35 : 1.75;
        const boostSpool = Math.max(0, (currentLocalRpm - 2400) / (redline - 2400));
        targetBoost = boostSpool * effectiveThrottle * boostCap;
      }

      if (is2StepRef.current) {
        const target = 5200 + (Math.random() * 280 - 140);
        currentLocalRpm += (target - currentLocalRpm) * 0.25;
        if (Math.random() > 0.62) {
          engineAudio.triggerPopAndBang();
        }
      } else if (effectiveThrottle > 0.02) {
        const delta = maxRpmRate * effectiveThrottle * torqueCurve * dt;
        currentLocalRpm = Math.min(redline, currentLocalRpm + delta);

        if (currentLocalRpm >= redline - 40) {
          currentLocalRpm = redline - 180 + (Math.random() * 120 - 60);
          if (Math.random() > 0.55) {
            engineAudio.triggerPopAndBang();
          }
        }
      } else {
        const dropRate = isNeutral ? (isLightFlywheel ? 2600 : 1900) : 1200;
        currentLocalRpm = Math.max(idleRpm, currentLocalRpm - dropRate * dt);
      }

      const finalRpm = Math.round(currentLocalRpm);
      setRpm(finalRpm);
      setCurrentBoost(targetBoost);

      engineAudio.setRpm(finalRpm);
      engineAudio.setThrottle(effectiveThrottle);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, redline, idleRpm, hasTurbo, rpm]);

  // Global Keyboard Driving Controls: [Space / W] = Gas, [B] = 2-Step, [S] = Blow-off flutter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!isPlayingRef.current) {
          engineAudio.start();
          setIsPlaying(true);
        }
        setIsThrottling(true);
      } else if (e.code === "KeyB") {
        e.preventDefault();
        if (!isPlayingRef.current) {
          engineAudio.start();
          setIsPlaying(true);
        }
        setIs2StepActive(true);
        engineAudio.set2Step(true);
      } else if (e.code === "KeyS") {
        e.preventDefault();
        engineAudio.triggerBov();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
        e.preventDefault();
        setIsThrottling(false);
      } else if (e.code === "KeyB") {
        e.preventDefault();
        setIs2StepActive(false);
        engineAudio.set2Step(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      engineAudio.stop();
      setIsPlaying(false);
      setRpm(idleRpm);
      setThrottle(0);
      setCurrentBoost(0);
    } else {
      engineAudio.start();
      setIsPlaying(true);
    }
  };

  const handleSelectPreset = (p: ExhaustSoundPreset) => {
    setExhaustPreset(p);
    engineAudio.setExhaustPreset(p);
  };

  const handleSelectPerspective = (p: AudioPerspective) => {
    setPerspective(p);
    engineAudio.setPerspective(p);
  };

  const handleSelectLoadMode = (m: LoadMode) => {
    setLoadMode(m);
    engineAudio.setLoadMode(m);
  };

  const handleSelectFlywheel = (f: FlywheelType) => {
    setFlywheelType(f);
    engineAudio.setFlywheelType(f);
  };

  const handleToggleChopIdle = () => {
    const next = !isChopIdle;
    setIsChopIdle(next);
    engineAudio.setChopIdle(next);
  };

  if (!isOpen || !vehicle || !resolved) return null;

  const rpmPercent = Math.min(100, Math.max(0, ((rpm - idleRpm) / (redline - idleRpm)) * 100));
  const isNearRedline = rpm >= redline - 550;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  Акустический симулятор ДВС (엔진 사운드 시뮬레이터)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 font-semibold">
                  Waveguide Physical Modeling
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {resolved.engine.code} ({displacementLiters}L {resolved.engine.cylinderLayout?.toUpperCase()} {resolved.engine.cylinders}-Cyl) · {resolved.engine.valvetrain?.toUpperCase() ?? "DOHC"} · Redline: {redline} RPM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual-Wing Cockpit Console (Zero Scroll Layout) */}
        <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-y-auto lg:overflow-hidden flex-1 bg-gradient-to-b from-slate-950 to-slate-900">
          {/* LEFT WING: Gauges, RPM Arc & Firing Order Visualizer */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3 bg-slate-950/70 p-3 sm:p-4 rounded-xl border border-slate-800/80">
            {/* Top Instruments Cluster */}
            <div className="grid grid-cols-3 gap-2 items-center">
              {/* Boost Pressure Gauge */}
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Wind className="w-3 h-3 text-cyan-400" />
                  <span>Буст (Boost)</span>
                </div>
                <div className="text-xl font-black font-mono text-cyan-400">
                  {isPlaying && hasTurbo ? `${currentBoost.toFixed(2)}` : "0.00"}{" "}
                  <span className="text-[10px] font-normal text-slate-500">bar</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, (currentBoost / 1.8) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Central RPM Big Readout */}
              <div className="relative flex flex-col items-center justify-center text-center">
                {(isNearRedline || is2StepActive) && isPlaying && (
                  <div className="absolute -top-6 flex items-center gap-1.5 animate-bounce">
                    <Flame className="w-5 h-5 text-amber-500 animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
                    <Flame className="w-5 h-5 text-rose-500 animate-pulse drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  </div>
                )}

                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-md">
                  {isPlaying ? rpm : "OFF"}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1">
                  <span>Обороты (RPM)</span>
                  {isChopIdle && isPlaying && rpm < 1100 && (
                    <span className="text-[8px] text-amber-400 bg-amber-500/15 px-1 rounded border border-amber-500/30 font-bold">
                      CHOP
                    </span>
                  )}
                </div>
              </div>

              {/* Drivetrain Load & Inertia Status */}
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Disc3 className="w-3 h-3 text-amber-400" />
                  <span>Инерция</span>
                </div>
                <div className="text-[11px] font-bold font-mono text-slate-200 truncate">
                  {loadMode === "in-gear" ? "2-я передача" : "Нейтраль (N)"}
                </div>
                <div className="text-[9px] text-slate-400 font-mono truncate">
                  {flywheelType === "lightweight" ? "Маховик 4.8 кг" : "Сток 12 кг"}
                </div>
              </div>
            </div>

            {/* RPM Sweep Arc Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isNearRedline || is2StepActive
                    ? "bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-lg shadow-rose-950 animate-pulse"
                    : "bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400"
                }`}
                style={{ width: `${isPlaying ? rpmPercent : 0}%` }}
              />
            </div>

            {/* Firing Order Visualizer */}
            {firingOrderSpec && (
              <div className="flex-1 min-h-0 flex flex-col justify-center">
                <FiringOrderVisualizer
                  spec={firingOrderSpec}
                  rpm={rpm}
                  isPlaying={isPlaying}
                  is2StepActive={is2StepActive}
                />
              </div>
            )}
          </div>

          {/* RIGHT WING: Acoustic Studio Console & Driving Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3 bg-slate-950/70 p-3 sm:p-4 rounded-xl border border-slate-800/80">
            {/* Listening Perspective Switcher */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold px-1">
                <span className="flex items-center gap-1 text-slate-400">
                  <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                  Точка прослушивания (Акустика):
                </span>
                <span className="font-mono text-indigo-400 uppercase text-[10px]">
                  {perspective === "cockpit" ? "В салоне (Бас)" : perspective === "tailpipe" ? "У насадки (Звон)" : "Под капотом"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "cockpit" as const, label: "В салоне", desc: "Бас в грудь" },
                  { id: "tailpipe" as const, label: "У выхлопа", desc: "Звон и отстрелы" },
                  { id: "engine-bay" as const, label: "Под капотом", desc: "Впуск и ГРМ" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPerspective(item.id)}
                    className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${
                      perspective === item.id
                        ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-[11px] font-bold">{item.label}</div>
                    <div className="text-[9px] text-slate-500 font-mono">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drivetrain Load & Flywheel Inertia */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px]">
              {/* Load Mode */}
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  Нагрузка КПП:
                </span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => handleSelectLoadMode("neutral")}
                    className={`py-1 px-1.5 rounded text-[10px] font-mono transition-all border cursor-pointer ${
                      loadMode === "neutral"
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Нейтраль N
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLoadMode("in-gear")}
                    className={`py-1 px-1.5 rounded text-[10px] font-mono transition-all border cursor-pointer ${
                      loadMode === "in-gear"
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    В пол (4.5с)
                  </button>
                </div>
              </div>

              {/* Flywheel & Chop Idle */}
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                  <Disc3 className="w-3 h-3 text-amber-400" />
                  Маховик и валы:
                </span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => handleSelectFlywheel(flywheelType === "oem" ? "lightweight" : "oem")}
                    className={`py-1 px-1.5 rounded text-[10px] font-mono transition-all border cursor-pointer ${
                      flywheelType === "lightweight"
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {flywheelType === "lightweight" ? "Кованый 4.8кг" : "Сток 12кг"}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleChopIdle}
                    className={`py-1 px-1.5 rounded text-[10px] font-mono transition-all border cursor-pointer ${
                      isChopIdle
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Chop: {isChopIdle ? "ВКЛ" : "ВЫКЛ"}
                  </button>
                </div>
              </div>
            </div>

            {/* Exhaust Profiles */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold px-1">
                <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <Settings2 className="w-3 h-3 text-orange-400" />
                  Выхлопной тракт:
                </span>
                <span className="font-mono text-orange-400 uppercase text-[10px]">
                  {exhaustPreset}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: "oem" as const, label: "Сток" },
                  { id: "sport-resonated" as const, label: "Спорт" },
                  { id: "valvetronic" as const, label: "Заслонка" },
                  { id: "straight-pipe" as const, label: "Прямоток" },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`py-1 px-1.5 rounded text-[10px] font-mono text-center transition-all cursor-pointer border ${
                      exhaustPreset === preset.id
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Throttle Slider */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <span className="text-slate-400 text-[10px]">Дроссель (Throttle):</span>
                <span className="font-mono text-cyan-400 text-xs">
                  {isThrottling ? "100% (WOT)" : `${Math.round(throttle * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                disabled={!isPlaying}
                value={isThrottling ? 1 : throttle}
                onChange={(e) => setThrottle(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>

            {/* Interactive Pedals and Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {/* Ignition Key */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  isPlaying
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50"
                }`}
              >
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlaying ? "Заглушить" : "Завести (START)"}</span>
              </button>

              {/* Hold Gas Pedal */}
              <button
                type="button"
                disabled={!isPlaying}
                onMouseDown={() => setIsThrottling(true)}
                onMouseUp={() => setIsThrottling(false)}
                onMouseLeave={() => setIsThrottling(false)}
                onTouchStart={() => setIsThrottling(true)}
                onTouchEnd={() => setIsThrottling(false)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md select-none active:scale-95 cursor-pointer ${
                  !isPlaying
                    ? "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
                    : isThrottling
                    ? "bg-amber-500 text-slate-950 shadow-amber-950/60 ring-2 ring-amber-400"
                    : "bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-950/40"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isThrottling ? "ГАЗ В ПОЛ!" : "Педаль газа"}</span>
              </button>

              {/* 2-Step Anti-Lag */}
              <button
                type="button"
                disabled={!isPlaying}
                onMouseDown={() => {
                  setIs2StepActive(true);
                  engineAudio.set2Step(true);
                }}
                onMouseUp={() => {
                  setIs2StepActive(false);
                  engineAudio.set2Step(false);
                }}
                onMouseLeave={() => {
                  setIs2StepActive(false);
                  engineAudio.set2Step(false);
                }}
                onTouchStart={() => {
                  setIs2StepActive(true);
                  engineAudio.set2Step(true);
                }}
                onTouchEnd={() => {
                  setIs2StepActive(false);
                  engineAudio.set2Step(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md select-none active:scale-95 cursor-pointer ${
                  !isPlaying
                    ? "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
                    : is2StepActive
                    ? "bg-rose-600 text-white shadow-rose-950/60 ring-2 ring-rose-400"
                    : "bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>2-Step Отсечка</span>
              </button>
            </div>

            {/* Hotkeys Bar */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-800">
              <Keyboard className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Клавиши: </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold">ПРОБЕЛ / W</kbd>
              <span>Газ</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold">B</kbd>
              <span>2-Step</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold">S</kbd>
              <span>Blow-off</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
