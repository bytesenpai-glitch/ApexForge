"use client";

import React, { useMemo, useState } from "react";
import {
  Wrench,
  Gauge,
  Cog,
  GitBranch,
  Zap,
  Wind,
  Flame,
  Disc,
  Activity,
  Cpu,
  Check,
  Search,
  RotateCcw,
} from "lucide-react";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useUiStore } from "@/stores/useUiStore";
import { FITMENT_CONFIG, SLOT_INFO } from "@/constants/tuning";
import {
  getCompatibleSwapsBySlot,
  filterAndSortPartSwaps,
  resolveBuildParts,
} from "@/services/swapService";
import type { Fitment, PartSlotKind } from "@/types/tuning.types";
import type { CoolingPart, DifferentialPart, Engine, MountPart, Transmission } from "@/domain/parts/types";
import { Layers, ShieldAlert, Split } from "lucide-react";

const TABS: Array<{ id: PartSlotKind; label: string; icon: React.ElementType }> = [
  { id: "engine", label: "Двигатель (엔진)", icon: Gauge },
  { id: "transmission", label: "КПП (변속기)", icon: Cog },
  { id: "driveline", label: "Привод (구동계)", icon: GitBranch },
  { id: "mounts", label: "Опоры / Плиты", icon: Layers },
  { id: "cooling", label: "Охлаждение", icon: ShieldAlert },
  { id: "differential", label: "Дифференциал / LSD", icon: Split },
  { id: "turbo", label: "Турбо / Наддув", icon: Zap },
  { id: "intake", label: "Впуск и FMIC", icon: Wind },
  { id: "exhaust", label: "Выпуск (배기)", icon: Flame },
  { id: "brakes", label: "Тормоза", icon: Disc },
  { id: "suspension", label: "Подвеска", icon: Activity },
  { id: "ecu", label: "ЭБУ (ECU)", icon: Cpu },
];

export function PartsConfiguratorTabs() {
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const showToast = useUiStore((s) => s.showToast);

  const [tabSearch, setTabSearch] = useState("");
  const [tabFitment, setTabFitment] = useState<"all" | Fitment>("all");

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
    return getCompatibleSwapsBySlot(vehicle, activeTab, slots.engineId ?? undefined);
  }, [vehicle, activeTab, slots.engineId]);

  const filteredSwaps = useMemo(() => {
    return filterAndSortPartSwaps(allSwaps, tabSearch, tabFitment, "default");
  }, [allSwaps, tabSearch, tabFitment]);

  const handleEquip = (partId: string, name: string) => {
    equipPart(activeTab, partId);
    showToast(`Установлен: ${name}`);
  };

  const handleReset = () => {
    resetPart(activeTab);
    showToast(`Сброшен до заводского OEM: ${SLOT_INFO[activeTab].title}`);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur space-y-4">
      {/* Category Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          let isCustom = false;
          if (tab.id === "engine") isCustom = resolved.isCustomEngine;
          if (tab.id === "transmission") isCustom = resolved.isCustomTrans;
          if (tab.id === "driveline") isCustom = resolved.isCustomDriveline;
          if (tab.id === "turbo") isCustom = resolved.isCustomTurbo;
          if (tab.id === "intake") isCustom = resolved.isCustomIntake;
          if (tab.id === "exhaust") isCustom = resolved.isCustomExhaust;
          if (tab.id === "brakes") isCustom = resolved.isCustomBrakes;
          if (tab.id === "suspension") isCustom = resolved.isCustomSuspension;
          if (tab.id === "ecu") isCustom = resolved.isCustomEcu;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {isCustom && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-header: Current equipped info & Search/Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Совместимых вариантов: <strong className="text-white">{allSwaps.length}</strong>
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Вернуть OEM</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Поиск по деталям..."
              value={tabSearch}
              onChange={(e) => setTabSearch(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTabFitment("all")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                tabFitment === "all"
                  ? "bg-slate-700 text-white font-bold"
                  : "bg-slate-950 text-slate-400 border border-slate-800"
              }`}
            >
              Все
            </button>
            {(["bolt-in", "kit", "custom"] as Fitment[]).map((f) => (
              <button
                key={f}
                onClick={() => setTabFitment(f)}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  tabFitment === f
                    ? FITMENT_CONFIG[f].badgeClass + " font-bold"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                {FITMENT_CONFIG[f].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Parts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSwaps.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs">
            Нет доступных вариантов по заданному фильтру.
          </div>
        ) : (
          filteredSwaps.map((match) => {
            const part = match.part;
            const fitInfo = FITMENT_CONFIG[match.fit];
            const partTitle = "name" in part ? String(part.name) : `${part.code} · ${part.family}`;

            let isEquipped = false;
            if (activeTab === "engine") isEquipped = part.id === resolved.engine.id;
            if (activeTab === "transmission") isEquipped = part.id === resolved.transmission.id;
            if (activeTab === "driveline") isEquipped = part.id === resolved.driveline.id;
            if (activeTab === "mounts") isEquipped = part.id === resolved.mounts?.id;
            if (activeTab === "cooling") isEquipped = part.id === resolved.cooling?.id;
            if (activeTab === "differential") isEquipped = part.id === resolved.differential?.id;
            if (activeTab === "turbo") isEquipped = part.id === resolved.turbo?.id;
            if (activeTab === "intake") isEquipped = part.id === resolved.intake?.id;
            if (activeTab === "exhaust") isEquipped = part.id === resolved.exhaust?.id;
            if (activeTab === "brakes") isEquipped = part.id === resolved.brakes?.id;
            if (activeTab === "suspension") isEquipped = part.id === resolved.suspension?.id;
            if (activeTab === "ecu") isEquipped = part.id === resolved.ecu?.id;

            return (
              <div
                key={part.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? "bg-emerald-950/20 border-emerald-500/50 shadow-sm shadow-emerald-950"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white">
                          {part.code}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${fitInfo.badgeClass}`}
                        >
                          {fitInfo.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {partTitle}
                        {"maker" in part ? ` · ${String(part.maker)}` : ""}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEquip(part.id, partTitle)}
                      disabled={isEquipped}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors flex-shrink-0 ${
                        isEquipped
                          ? "bg-emerald-600/20 text-emerald-400 cursor-default"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>На авто</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-3 h-3" />
                          <span>Свапнуть</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Specs Snippet */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                    {part.kind === "engine" && (
                      <div className="text-slate-300 font-mono">
                        {(part as Engine).powerHp} л.с. / {(part as Engine).torqueNm} Н·м · {((part as Engine).displacementCc / 1000).toFixed(1)}L
                      </div>
                    )}
                    {part.kind === "transmission" && (
                      <div className="text-slate-300 font-mono">
                        {(part as Transmission).type.toUpperCase()} · {(part as Transmission).gears} ст. · лимит {(part as Transmission).torqueCapacityNm} Н·м
                      </div>
                    )}
                    {"powerGainHp" in part && typeof part.powerGainHp === "number" && (
                      <div className="text-emerald-400 font-mono font-semibold">
                        +{part.powerGainHp} л.с. мощности
                      </div>
                    )}
                    {"notes" in part && part.notes && (
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                        {String(part.notes)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
