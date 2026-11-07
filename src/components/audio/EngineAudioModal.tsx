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
  Activity,
  Sparkles,
  Settings2,
  Disc3,
  Wind,
  Car,
  Headphones,
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
  const hasTurbo = resolved?.turbo !== null || (resolved?.engine.aspiration !== "na");
  const displacementLiters = resolved?.engine.displacementCc
    ? Number((resolved.engine.displacementCc / 1000).toFixed(1))
    : 2.0;

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
    engineAudio.setExhaustPreset(defaultPreset);
    engineAudio.setLoadMode(loadMode);
    engineAudio.setFlywheelType(flywheelType);
    engineAudio.setPerspective(perspective);
  }, [resolved, hasTurbo, loadMode, flywheelType, perspective, displacementLiters]);

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
          setFlamePops((p) => p + 1);
        }
      } else if (effectiveThrottle > 0.02) {
        const accelerationRate = maxRpmRate * effectiveThrottle * torqueCurve;
        currentLocalRpm += accelerationRate * dt;

        if (currentLocalRpm >= redline - 40) {
          engineAudio.triggerPopAndBang();
          setFlamePops((p) => p + 1);
          currentLocalRpm = redline - 240;
        }
      } else {
        const brakingRate = 1800 + rpmRatio * 800;
        currentLocalRpm -= brakingRate * dt;

        if (currentLocalRpm < idleRpm + 150) {
          currentLocalRpm += (idleRpm - currentLocalRpm) * 0.15;
        }
        currentLocalRpm = Math.max(idleRpm, currentLocalRpm);
      }

      const roundedRpm = Math.round(currentLocalRpm);
      setRpm(roundedRpm);
      setCurrentBoost(Number(targetBoost.toFixed(2)));

      engineAudio.setRpm(roundedRpm);
      engineAudio.setThrottle(effectiveThrottle);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, redline, idleRpm, hasTurbo]);

  // Handle Preset change
  const handleSelectPreset = (preset: ExhaustSoundPreset) => {
    setExhaustPreset(preset);
    engineAudio.setExhaustPreset(preset);
  };

  // Handle Load mode change
  const handleSelectLoadMode = (mode: LoadMode) => {
    setLoadMode(mode);
    engineAudio.setLoadMode(mode);
  };

  // Handle Flywheel type change
  const handleSelectFlywheel = (type: FlywheelType) => {
    setFlywheelType(type);
    engineAudio.setFlywheelType(type);
  };

  // Handle Perspective change
  const handleSelectPerspective = (p: AudioPerspective) => {
    setPerspective(p);
    engineAudio.setPerspective(p);
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
      setCurrentBoost(0);
    } else {
      engineAudio.start();
      setIsPlaying(true);
    }
  };

  if (!isOpen || !vehicle || !resolved) return null;

  const rpmPercent = Math.min(100, Math.max(0, ((rpm - idleRpm) / (redline - idleRpm)) * 100));
  const isNearRedline = rpm >= redline - 550;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] overflow-y-auto">
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
                  Waveguide & Impulse
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {resolved.engine.code} ({displacementLiters}L {resolved.engine.cylinderLayout?.toUpperCase()} {resolved.engine.cylinders}-Cyl) · {resolved.engine.valvetrain?.toUpperCase() ?? "DOHC"} · Redline: {redline} RPM
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
          {/* Main Gauges: Tachometer & Boost Gauge */}
          <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Boost Pressure Gauge */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>Буст (Boost)</span>
              </div>
              <div className="text-2xl font-black font-mono text-cyan-400">
                {isPlaying && hasTurbo ? `${currentBoost.toFixed(2)}` : "0.00"}{" "}
                <span className="text-xs font-normal text-slate-500">bar</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, (currentBoost / 1.8) * 100)}%` }}
                />
              </div>
            </div>

            {/* Central RPM Display */}
            <div className="relative flex flex-col items-center justify-center text-center space-y-1">
              {(isNearRedline || is2StepActive) && isPlaying && (
                <div className="absolute -top-7 flex items-center gap-2 animate-bounce">
                  <Flame className="w-7 h-7 text-amber-500 animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                  <Sparkles className="w-5 h-5 text-orange-400 animate-spin" />
                  <Flame className="w-7 h-7 text-rose-500 animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                </div>
              )}

              <div className="text-5xl font-black font-mono tracking-tight text-white drop-shadow-md">
                {isPlaying ? rpm : "OFF"}
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
                <span>Обороты (RPM)</span>
                {isChopIdle && isPlaying && rpm < 1100 && (
                  <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                    CHOP
                  </span>
                )}
              </div>
            </div>

            {/* Drivetrain Load & Flywheel Info */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Disc3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Инерция (Inertia)</span>
              </div>
              <div className="text-xs font-bold font-mono text-slate-200">
                {loadMode === "in-gear" ? "2-я передача" : "Нейтраль (N)"}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {flywheelType === "lightweight" ? "Маховик 4.8 кг" : "Сток 12 кг"}
              </div>
            </div>
          </div>

          {/* RPM Arc Bar */}
          <div className="w-full max-w-lg h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                isNearRedline || is2StepActive
                  ? "bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-lg shadow-rose-950"
                  : "bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400"
              }`}
              style={{ width: `${isPlaying ? rpmPercent : 0}%` }}
            />
          </div>

          {/* Audio Perspective Switcher (Cockpit vs Tailpipe vs Engine Bay) */}
          <div className="w-full max-w-lg bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                Точка прослушивания (Акустическая перспектива):
              </span>
              <span className="font-mono text-indigo-400 uppercase text-[11px]">
                {perspective === "cockpit" ? "В салоне" : perspective === "tailpipe" ? "У выхлопа" : "Под капотом"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "cockpit" as const,
                  label: "В салоне за рулем",
                  desc: "Бас в грудь, как в авто",
                },
                {
                  id: "tailpipe" as const,
                  label: "У насадки выхлопа",
                  desc: "Звон, газы и отстрелы",
                },
                {
                  id: "engine-bay" as const,
                  label: "Под капотом",
                  desc: "Впуск и механика ГРМ",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectPerspective(item.id)}
                  className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer border ${
                    perspective === item.id
                      ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300 font-bold shadow-sm shadow-indigo-950"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="text-[11px] font-bold">{item.label}</div>
                  <div className="text-[9px] text-slate-500 font-mono">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Physics Engine Controls: Load Mode & Flywheel Selection */}
          <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {/* Load Mode Selector */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Режим нагрузки трансмиссии:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSelectLoadMode("neutral")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    loadMode === "neutral"
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Нейтраль N (~2.0с)
                </button>
                <button
                  onClick={() => handleSelectLoadMode("in-gear")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    loadMode === "in-gear"
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Разгон в пол (~4.5с)
                </button>
              </div>
            </div>

            {/* Flywheel Mass Selector */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-amber-400" />
                Масса маховика (Инерция):
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSelectFlywheel("oem")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    flywheelType === "oem"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Сток (12 кг)
                </button>
                <button
                  onClick={() => handleSelectFlywheel("lightweight")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    flywheelType === "lightweight"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Кованый (4.8 кг)
                </button>
              </div>
            </div>
          </div>

          {/* Exhaust Acoustic Profiles */}
          <div className="w-full max-w-lg bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Settings2 className="w-3.5 h-3.5 text-orange-400" />
                Геометрия и глушитель выхлопа:
              </span>
              <span className="font-mono text-orange-400 uppercase text-[11px]">
                {exhaustPreset}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(
                [
                  { id: "oem", label: "OEM Сток", desc: "Тихий" },
                  { id: "sport-resonated", label: "Спорт-резонатор", desc: "Плотный бас" },
                  { id: "valvetronic", label: "Заслонка", desc: "Рык" },
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
              Архитектура: <strong>{displacementLiters}L {resolved.engine.cylinderLayout?.toUpperCase()} {resolved.engine.cylinders}-Cyl</strong>
            </span>
            {hasTurbo && (
              <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 font-mono text-cyan-300">
                Турбонаддув: <strong>{loadMode === "in-gear" ? "High Boost 1.75 bar" : "Free Spool"}</strong>
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

          {/* Smooth Throttle Slider Control */}
          <div className="w-full max-w-lg bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Степень открытия дросселя (Throttle):
              </span>
              <span className="font-mono text-cyan-400">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            />

            {/* Quick RPM Holding Buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: "Холостой", val: 0.0 },
                { label: "Круиз 30%", val: 0.3 },
                { label: "Полка 60%", val: 0.6 },
                { label: "Газ 100%", val: 1.0 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  disabled={!isPlaying}
                  onClick={() => setThrottle(btn.val)}
                  className="py-1 px-1.5 text-[10px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
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
              Подсказка: Выбери точку <strong>«В салоне за рулем»</strong> для звука из водительского кресла с басом кузова.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Удерживай <strong>ПРОБЕЛ</strong> для педали газа. На холостых отчетливо слышны дискретные хлопки цилиндров.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
