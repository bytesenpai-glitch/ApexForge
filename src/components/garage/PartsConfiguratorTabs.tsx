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
  Layers,
  ShieldAlert,
  Split,
  ShieldCheck,
} from "lucide-react";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useUiStore } from "@/stores/useUiStore";
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
import type { Fitment, PartSlotKind } from "@/types/tuning.types";
import type { CoolingPart, DifferentialPart, Engine, MountPart, Transmission } from "@/domain/parts/types";

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
  { id: "brakes", label: "Тормоза (BBK)", icon: Disc },
  { id: "suspension", label: "Подвеска", icon: Activity },
  { id: "ecu", label: "ЭБУ (ECU)", icon: Cpu },
];

export function PartsConfiguratorTabs() {
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const showToast = useUiStore((s) => s.showToast);

  const [tabSearch, setTabSearch] = useState("");
  const [tabFitment, setTabFitment] = useState<"all" | Fitment>("all");
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
    return getCompatibleSwapsBySlot(vehicle, activeTab, slots.engineId ?? undefined);
  }, [vehicle, activeTab, slots.engineId]);

  const filteredSwaps = useMemo(() => {
    let result = filterAndSortPartSwaps(allSwaps, tabSearch, tabFitment, "default");

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
  }, [allSwaps, tabSearch, tabFitment, discipline]);

  const handleEquip = (partId: string, name: string) => {
    equipPart(activeTab, partId);
    showToast(`Установлен: ${name}`);
  };

  const handleReset = () => {
    resetPart(activeTab);
    showToast(`Сброшен до заводского OEM: ${SLOT_INFO[activeTab].title}`);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur space-y-3">
      {/* Category Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-slate-800/80 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          let isCustom = false;
          if (tab.id === "engine") isCustom = resolved.isCustomEngine;
          if (tab.id === "transmission") isCustom = resolved.isCustomTrans;
          if (tab.id === "driveline") isCustom = resolved.isCustomDriveline;
          if (tab.id === "mounts") isCustom = resolved.isCustomMounts;
          if (tab.id === "cooling") isCustom = resolved.isCustomCooling;
          if (tab.id === "differential") isCustom = resolved.isCustomDiff;
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

      {/* Sub-header: Discipline Filters, Search and Fitment level */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-0.5">
        {/* Discipline Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {DISCIPLINE_FILTERS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDiscipline(d.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                discipline === d.id
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Search & Fitment Difficulty Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Поиск по деталям..."
              value={tabSearch}
              onChange={(e) => setTabSearch(e.target.value)}
              className="pl-7 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-36 sm:w-44"
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
              Все ({allSwaps.length})
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

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 border border-slate-800 transition-colors"
            title="Вернуть OEM сток"
          >
            <RotateCcw className="w-3 h-3" />
            <span>OEM</span>
          </button>
        </div>
      </div>

      {/* Compact Grid of Parts Cards with Controlled Internal Scroll (No huge page elongation) */}
      <div className="max-h-[440px] overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 custom-scrollbar">
        {filteredSwaps.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Нет доступных вариантов по выбранному фильтру категории и дисциплины.
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
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? "bg-emerald-950/20 border-emerald-500/50 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-white">
                          {part.code}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${fitInfo.badgeClass}`}
                        >
                          {fitInfo.label}
                        </span>
                        {isEquipped && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono">
                            НА АВТО
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium mt-0.5 truncate">
                        {partTitle}
                      </p>
                      <span className="text-[10px] text-slate-500 block">
                        {"maker" in part ? String(part.maker) : "OEM"} · {fitInfo.difficultyBadge}
                      </span>
                    </div>

                    <button
                      onClick={() => handleEquip(part.id, partTitle)}
                      disabled={isEquipped}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors flex-shrink-0 ${
                        isEquipped
                          ? "bg-emerald-600/20 text-emerald-400 cursor-default"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
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
                          <span>Свап</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Requirements Snippet */}
                  <div className="mt-2 text-[10px] rounded p-1.5 bg-slate-900/80 border border-slate-800 text-slate-400 leading-tight">
                    <span className="font-bold text-slate-300">Доработка: </span>
                    {fitInfo.description}
                  </div>

                  {/* Specs Snippet */}
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[11px] space-y-0.5">
                    {part.kind === "engine" && (
                      <div className="text-slate-300 font-mono font-semibold">
                        {(part as Engine).powerHp} л.с. / {(part as Engine).torqueNm} Н·м · {((part as Engine).displacementCc / 1000).toFixed(1)}L
                      </div>
                    )}
                    {part.kind === "transmission" && (
                      <div className="text-slate-300 font-mono">
                        {(part as Transmission).type.toUpperCase()} · {(part as Transmission).gears} ст. · лимит {(part as Transmission).torqueCapacityNm} Н·м
                      </div>
                    )}
                    {"powerGainHp" in part && typeof part.powerGainHp === "number" && (
                      <div className="text-emerald-400 font-mono font-bold">
                        +{part.powerGainHp} л.с. мощности
                      </div>
                    )}
                    {"torqueGainNm" in part && typeof part.torqueGainNm === "number" && (
                      <div className="text-cyan-400 font-mono font-bold">
                        +{part.torqueGainNm} Н·м крутящего момента
                      </div>
                    )}
                    {"notes" in part && part.notes && (
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 italic">
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
