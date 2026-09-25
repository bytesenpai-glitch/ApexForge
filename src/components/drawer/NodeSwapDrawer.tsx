"use client";

import React, { useMemo } from "react";
import { X, Search, Check, Wrench, RotateCcw, Info } from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { FITMENT_CONFIG, SLOT_INFO } from "@/constants/tuning";
import { getCompatibleSwapsBySlot, filterAndSortPartSwaps, resolveBuildParts } from "@/services/swapService";
import type { Fitment } from "@/types/tuning.types";
import type { Engine, Transmission } from "@at-sim/parts";

export function NodeSwapDrawer() {
  const activeSlot = useUiStore((s) => s.activeDrawerSlot);
  const closeDrawer = useUiStore((s) => s.closeDrawer);
  const drawerSearch = useUiStore((s) => s.drawerSearch);
  const setDrawerSearch = useUiStore((s) => s.setDrawerSearch);
  const drawerFitment = useUiStore((s) => s.drawerFitment);
  const setDrawerFitment = useUiStore((s) => s.setDrawerFitment);
  const showToast = useUiStore((s) => s.showToast);

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
    return filterAndSortPartSwaps(allSwaps, drawerSearch, drawerFitment, "default");
  }, [allSwaps, drawerSearch, drawerFitment]);

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
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Модификация узла
              </span>
              <span className="text-xs text-slate-500">· {vehicle.model} {vehicle.trim}</span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
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

        {/* Current Equipped Node Card & Reset Button */}
        <div className="p-4 bg-slate-900/30 border-b border-slate-800/80 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Текущий узел в шасси:
              </span>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {activeSlot === "engine" && `${resolved.engine.code} · ${resolved.engine.family}`}
                {activeSlot === "transmission" && `${resolved.transmission.code} · ${resolved.transmission.name}`}
                {activeSlot === "driveline" && `${resolved.driveline.name}`}
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Вернуть OEM</span>
            </button>
          </div>
        </div>

        {/* Search & Fitment Filter Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3 flex-shrink-0 bg-slate-950">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по коду, серии или производителю..."
              value={drawerSearch}
              onChange={(e) => setDrawerSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setDrawerFitment("all")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                drawerFitment === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Все ({allSwaps.length})
            </button>
            {(["bolt-in", "kit", "custom"] as Fitment[]).map((f) => (
              <button
                key={f}
                onClick={() => setDrawerFitment(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
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

        {/* Available Swaps List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSwaps.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Нет доступных вариантов по заданному фильтру.
            </div>
          ) : (
            filteredSwaps.map((match) => {
              const part = match.part;
              const fitInfo = FITMENT_CONFIG[match.fit];
              const partTitle = "name" in part ? String(part.name) : `${part.code} · ${part.family}`;

              // Check if currently equipped
              let isEquipped = false;
              if (activeSlot === "engine") isEquipped = part.id === resolved.engine.id;
              if (activeSlot === "transmission") isEquipped = part.id === resolved.transmission.id;
              if (activeSlot === "driveline") isEquipped = part.id === resolved.driveline.id;
              if (activeSlot === "turbo") isEquipped = part.id === resolved.turbo?.id;
              if (activeSlot === "intake") isEquipped = part.id === resolved.intake?.id;
              if (activeSlot === "exhaust") isEquipped = part.id === resolved.exhaust?.id;
              if (activeSlot === "brakes") isEquipped = part.id === resolved.brakes?.id;
              if (activeSlot === "suspension") isEquipped = part.id === resolved.suspension?.id;
              if (activeSlot === "ecu") isEquipped = part.id === resolved.ecu?.id;

              return (
                <div
                  key={part.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isEquipped
                      ? "bg-emerald-950/20 border-emerald-500/50"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {part.code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${fitInfo.badgeClass}`}
                        >
                          {fitInfo.label}
                        </span>
                        {isEquipped && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono">
                            УСТАНОВЛЕН
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {partTitle}
                        {"maker" in part ? ` · ${String(part.maker)}` : ""}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEquip(part.id, partTitle)}
                      disabled={isEquipped}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                        isEquipped
                          ? "bg-emerald-600/20 text-emerald-400 cursor-default"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
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

                  {/* Part Metrics & Specs Deck */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {part.kind === "engine" && (
                      <>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Мощность / Момент:</span>
                          <span className="font-mono text-white font-semibold">
                            {(part as Engine).powerHp} л.с. / {(part as Engine).torqueNm} Н·м
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Объём / Конфиг:</span>
                          <span className="font-mono text-slate-300">
                            {((part as Engine).displacementCc / 1000).toFixed(1)} л · {(part as Engine).cylinders} цил.
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Наддув:</span>
                          <span className="text-slate-300 uppercase text-[11px]">
                            {(part as Engine).aspiration}
                          </span>
                        </div>
                      </>
                    )}

                    {part.kind === "transmission" && (
                      <>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Тип / Передачи:</span>
                          <span className="font-mono text-white font-semibold uppercase">
                            {(part as Transmission).type} · {(part as Transmission).gears} ст.
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Предел момента:</span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            до {(part as Transmission).torqueCapacityNm} Н·м
                          </span>
                        </div>
                      </>
                    )}

                    {"powerGainHp" in part && typeof part.powerGainHp === "number" && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Прирост мощности:</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          +{part.powerGainHp} л.с.
                        </span>
                      </div>
                    )}

                    {"torqueGainNm" in part && typeof part.torqueGainNm === "number" && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Прирост момента:</span>
                        <span className="font-mono text-cyan-400 font-semibold">
                          +{part.torqueGainNm} Н·м
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fitment Notes / OEM Reference */}
                  {("notes" in part && part.notes) && (
                    <div className="mt-2 text-[11px] text-slate-400 flex items-start gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{String(part.notes)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
