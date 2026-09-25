"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  Search,
  Check,
  Wrench,
  RotateCcw,
  Info,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import {
  DISCIPLINE_FILTERS,
  FITMENT_CONFIG,
  SLOT_INFO,
  type DisciplineFilter,
} from "@/constants/tuning";
import {
  getCompatibleSwapsBySlot,
  filterAndSortPartSwaps,
  resolveBuildParts,
} from "@/services/swapService";
import type { Fitment } from "@/types/tuning.types";
import type { CoolingPart, DifferentialPart, Engine, MountPart, Transmission } from "@/domain/parts/types";

export function NodeSwapDrawer() {
  const activeSlot = useUiStore((s) => s.activeDrawerSlot);
  const closeDrawer = useUiStore((s) => s.closeDrawer);
  const drawerSearch = useUiStore((s) => s.drawerSearch);
  const setDrawerSearch = useUiStore((s) => s.setDrawerSearch);
  const drawerFitment = useUiStore((s) => s.drawerFitment);
  const setDrawerFitment = useUiStore((s) => s.setDrawerFitment);
  const showToast = useUiStore((s) => s.showToast);

  const [discipline, setDiscipline] = useState<DisciplineFilter>("all");

  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const slots = useBuildStore((s) => s.slots);
  const equipPart = useBuildStore((s) => s.equipPart);
  const resetPart = useBuildStore((s) => s.resetPart);

  const resolved = useMemo(() => resolveBuildParts(vehicle, slots), [vehicle, slots]);

  const allSwaps = useMemo(() => {
    if (!activeSlot) return [];
    return getCompatibleSwapsBySlot(vehicle, activeSlot, slots.engineId ?? undefined);
  }, [vehicle, activeSlot, slots.engineId]);

  const filteredSwaps = useMemo(() => {
    let result = filterAndSortPartSwaps(allSwaps, drawerSearch, drawerFitment, "default");

    if (discipline !== "all") {
      result = result.filter((m) => {
        const text = `${m.part.code} ${"name" in m.part ? m.part.name : ""} ${
          "notes" in m.part ? m.part.notes : ""
        }`.toLowerCase();
        if (discipline === "drift") {
          return text.includes("drift") || text.includes("2way") || text.includes("lsd") || text.includes("t56") || text.includes("angle");
        }
        if (discipline === "circuit") {
          return text.includes("track") || text.includes("race") || text.includes("bbk") || text.includes("coilover") || text.includes("fmic");
        }
        if (discipline === "drag") {
          return text.includes("boost") || text.includes("twin") || text.includes("magnum") || text.includes("1000") || text.includes("stage2");
        }
        if (discipline === "street") {
          return text.includes("street") || text.includes("oem") || text.includes("stage1") || text.includes("poly-70a");
        }
        return true;
      });
    }

    return result;
  }, [allSwaps, drawerSearch, drawerFitment, discipline]);

  if (!activeSlot) return null;

  const slotMeta = SLOT_INFO[activeSlot];

  const handleEquip = (partId: string, partTitle: string) => {
    equipPart(activeSlot, partId);
    showToast(`Установлен: ${partTitle}`);
  };

  const handleResetToStock = () => {
    resetPart(activeSlot);
    showToast(`Узел [${slotMeta.title}] сброшен до заводского OEM`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div className="flex-1" onClick={closeDrawer} />

      {/* Drawer Container */}
      <div className="w-full max-w-xl h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Модификация узла
              </span>
              <span className="text-[11px] text-slate-500">· {vehicle.model} {vehicle.trim}</span>
            </div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
              <span>{slotMeta.title}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">({slotMeta.subtitle})</span>
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Equipped Node Banner */}
        <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex-shrink-0 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
              Установлено в шасси:
            </span>
            <p className="text-xs font-bold text-white truncate">
              {activeSlot === "engine" && `${resolved.engine.code} · ${resolved.engine.family}`}
              {activeSlot === "transmission" && `${resolved.transmission.code} · ${resolved.transmission.name}`}
              {activeSlot === "driveline" && `${resolved.driveline.name}`}
              {activeSlot === "mounts" && (resolved.mounts ? resolved.mounts.name : "Заводские эластичные опоры OEM")}
              {activeSlot === "cooling" && (resolved.cooling ? resolved.cooling.name : "Заводской радиатор OEM")}
              {activeSlot === "differential" && (resolved.differential ? resolved.differential.name : "Заводской дифференциал OEM")}
              {activeSlot === "turbo" && (resolved.turbo ? `${resolved.turbo.name}` : "Атмосферный / Стоковый турбо")}
              {activeSlot === "intake" && (resolved.intake ? `${resolved.intake.name}` : "Заводской впуск (OEM)")}
              {activeSlot === "exhaust" && (resolved.exhaust ? `${resolved.exhaust.name}` : "Заводской выхлоп (OEM)")}
              {activeSlot === "brakes" && (resolved.brakes ? `${resolved.brakes.name}` : "Заводские тормоза (OEM)")}
              {activeSlot === "suspension" && (resolved.suspension ? `${resolved.suspension.name}` : "Заводская подвеска (OEM)")}
              {activeSlot === "ecu" && (resolved.ecu ? `${resolved.ecu.name}` : "Заводская прошивка ЭБУ (OEM)")}
            </p>
          </div>
          <button
            onClick={handleResetToStock}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>OEM</span>
          </button>
        </div>

        {/* Filter Bar: Disciplines + Search + Fitment Difficulty */}
        <div className="p-3 border-b border-slate-800 space-y-2 flex-shrink-0 bg-slate-950">
          {/* Discipline Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {DISCIPLINE_FILTERS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDiscipline(d.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  discipline === d.id
                    ? "bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-950"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по коду, бренду, материалам или серии..."
              value={drawerSearch}
              onChange={(e) => setDrawerSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Fitment Difficulty Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setDrawerFitment("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                drawerFitment === "all"
                  ? "bg-slate-700 text-white font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Все уровни ({allSwaps.length})
            </button>
            {(["bolt-in", "kit", "custom"] as Fitment[]).map((f) => (
              <button
                key={f}
                onClick={() => setDrawerFitment(f)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                  drawerFitment === f
                    ? FITMENT_CONFIG[f].badgeClass + " font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800"
                }`}
              >
                {FITMENT_CONFIG[f].label}
              </button>
            ))}
          </div>
        </div>

        {/* Available Swaps List (Clean, compact scrollable container) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredSwaps.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Нет доступных вариантов по заданному фильтру.
            </div>
          ) : (
            filteredSwaps.map((match) => {
              const part = match.part;
              const fitInfo = FITMENT_CONFIG[match.fit];
              const partTitle = "name" in part ? String(part.name) : `${part.code} · ${part.family}`;

              let isEquipped = false;
              if (activeSlot === "engine") isEquipped = part.id === resolved.engine.id;
              if (activeSlot === "transmission") isEquipped = part.id === resolved.transmission.id;
              if (activeSlot === "driveline") isEquipped = part.id === resolved.driveline.id;
              if (activeSlot === "mounts") isEquipped = part.id === resolved.mounts?.id;
              if (activeSlot === "cooling") isEquipped = part.id === resolved.cooling?.id;
              if (activeSlot === "differential") isEquipped = part.id === resolved.differential?.id;
              if (activeSlot === "turbo") isEquipped = part.id === resolved.turbo?.id;
              if (activeSlot === "intake") isEquipped = part.id === resolved.intake?.id;
              if (activeSlot === "exhaust") isEquipped = part.id === resolved.exhaust?.id;
              if (activeSlot === "brakes") isEquipped = part.id === resolved.brakes?.id;
              if (activeSlot === "suspension") isEquipped = part.id === resolved.suspension?.id;
              if (activeSlot === "ecu") isEquipped = part.id === resolved.ecu?.id;

              return (
                <div
                  key={part.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isEquipped
                      ? "bg-emerald-950/20 border-emerald-500/50 shadow-sm"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-white">
                          {part.code}
                        </span>
                        {/* Explicit Fitment Badge with difficulty level */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${fitInfo.badgeClass}`}
                        >
                          {fitInfo.label}
                        </span>
                        {isEquipped && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono">
                            УСТАНОВЛЕН
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">
                        {partTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {"maker" in part ? String(part.maker) : "OEM"} · {fitInfo.difficultyBadge}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEquip(part.id, partTitle)}
                      disabled={isEquipped}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                        isEquipped
                          ? "bg-emerald-600/20 text-emerald-400 cursor-default"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>На авто</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Свапнуть</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Swap Scope & Mechanical Fabrication Requirement Box */}
                  <div className="mt-2 text-[11px] rounded-lg p-2 bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {match.fit === "bolt-in" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      {match.fit === "kit" && <Wrench className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      {match.fit === "custom" && <Flame className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                      <span className="font-semibold text-slate-300 text-[10px] uppercase">
                        Требования к установке:
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-tight">
                      {fitInfo.description}
                    </p>
                    {match.reasons && match.reasons.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        {match.reasons.map((r, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 font-mono"
                          >
                            • {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Part Metrics & Specs Grid */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {part.kind === "engine" && (
                      <>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Мощность / Момент:</span>
                          <span className="font-mono text-white font-bold">
                            {(part as Engine).powerHp} л.с. / {(part as Engine).torqueNm} Н·м
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Объём / Конфиг:</span>
                          <span className="font-mono text-slate-300">
                            {((part as Engine).displacementCc / 1000).toFixed(1)}L · {(part as Engine).cylinders} цил.
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Тип наддува:</span>
                          <span className="text-slate-300 uppercase text-[10px] font-semibold">
                            {(part as Engine).aspiration}
                          </span>
                        </div>
                      </>
                    )}

                    {part.kind === "transmission" && (
                      <>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Тип трансмиссии:</span>
                          <span className="font-mono text-white font-bold uppercase">
                            {(part as Transmission).type} · {(part as Transmission).gears} ст.
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Предел момента:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            до {(part as Transmission).torqueCapacityNm} Н·м
                          </span>
                        </div>
                      </>
                    )}

                    {part.kind === "mounts" && (
                      <>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Жесткость / Демпфер:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {(part as MountPart).stiffnessDampingRating} / 10
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Люфт смещения ДВС:</span>
                          <span className="font-mono text-cyan-400 font-bold">
                            ±{(part as MountPart).engineMovementLimitMm} мм
                          </span>
                        </div>
                      </>
                    )}

                    {part.kind === "cooling" && (
                      <>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Теплоотдача:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {(part as CoolingPart).heatDissipationKw} кВт
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Предел перегрузки:</span>
                          <span className="font-mono text-cyan-400 font-bold">
                            до {(part as CoolingPart).gForceStarvationLimit} G
                          </span>
                        </div>
                      </>
                    )}

                    {part.kind === "differential" && (
                      <>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Блокировка (Разгон/Торм):</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {(part as DifferentialPart).lockRateAccelerationPct}% / {(part as DifferentialPart).lockRateDecelerationPct}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Лимит крутящего момента:</span>
                          <span className="font-mono text-cyan-400 font-bold">
                            до {(part as DifferentialPart).maxAxleTorqueNm} Н·м
                          </span>
                        </div>
                      </>
                    )}

                    {"powerGainHp" in part && typeof part.powerGainHp === "number" && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Прирост мощности:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          +{part.powerGainHp} л.с.
                        </span>
                      </div>
                    )}

                    {"torqueGainNm" in part && typeof part.torqueGainNm === "number" && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Прирост момента:</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          +{part.torqueGainNm} Н·м
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
