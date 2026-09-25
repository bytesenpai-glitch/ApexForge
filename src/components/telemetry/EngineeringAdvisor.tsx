"use client";

import React, { useMemo } from "react";
import {
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useUiStore } from "@/stores/useUiStore";
import { resolveBuildParts } from "@/services/swapService";
import { computeVehicleTelemetry } from "@/services/telemetryService";
import { analyzeBuildSynergy, type EngineeringAdvice } from "@/services/engineeringAdvisorService";

export function EngineeringAdvisor() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const slots = useBuildStore((s) => s.slots);
  const equipPart = useBuildStore((s) => s.equipPart);
  const openDrawer = useUiStore((s) => s.openDrawer);
  const showToast = useUiStore((s) => s.showToast);

  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const resolved = useMemo(() => {
    return resolveBuildParts(vehicle, slots);
  }, [vehicle, slots]);

  const telemetry = useMemo(() => {
    return computeVehicleTelemetry(vehicle, resolved);
  }, [vehicle, resolved]);

  const advices = useMemo(() => {
    return analyzeBuildSynergy(vehicle, resolved, telemetry);
  }, [vehicle, resolved, telemetry]);

  const handleAction = (advice: EngineeringAdvice) => {
    if (advice.targetSlot && advice.recommendedPartId) {
      equipPart(advice.targetSlot, advice.recommendedPartId);
      showToast(`Рекомендация инженера применена: ${advice.actionText}`);
    } else if (advice.targetSlot) {
      openDrawer(advice.targetSlot);
    }
  };

  const criticalCount = advices.filter((a) => a.severity === "critical").length;
  const warningCount = advices.filter((a) => a.severity === "warning").length;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur space-y-3">
      {/* Header with status badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Рекомендации инженера
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                (엔지니어 가이드 / Smart Advisor)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Интерактивный анализ совместимости моментов, теплового режима и тормозной динамики
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {criticalCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Риск поломки: {criticalCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              Внимание: {warningCount}
            </span>
          )}
          {criticalCount === 0 && warningCount === 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Баланс подтвержден
            </span>
          )}
        </div>
      </div>

      {/* Advice Cards List */}
      <div className="space-y-2.5">
        {advices.map((advice) => {
          let cardBorder = "border-slate-800 bg-slate-950/60";
          let icon = <Lightbulb className="w-4 h-4 text-cyan-400" />;
          let badgeColor = "text-cyan-400 bg-cyan-950/40 border-cyan-800/60";

          if (advice.severity === "critical") {
            cardBorder = "border-rose-500/50 bg-rose-950/15";
            icon = <AlertTriangle className="w-4 h-4 text-rose-400" />;
            badgeColor = "text-rose-300 bg-rose-950/60 border-rose-700/60";
          } else if (advice.severity === "warning") {
            cardBorder = "border-amber-500/40 bg-amber-950/15";
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
            badgeColor = "text-amber-300 bg-amber-950/60 border-amber-700/60";
          } else if (advice.severity === "optimal") {
            cardBorder = "border-emerald-500/30 bg-emerald-950/10";
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            badgeColor = "text-emerald-400 bg-emerald-950/40 border-emerald-800/60";
          }

          return (
            <div
              key={advice.id}
              className={`p-3 rounded-xl border transition-all ${cardBorder} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex-shrink-0">{icon}</span>
                  <span className="text-xs font-bold text-white">{advice.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${badgeColor}`}>
                    {advice.koreanTerm}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300/90 leading-relaxed pl-6">
                  {advice.description}
                </p>
              </div>

              {advice.actionText && advice.targetSlot && (
                <button
                  onClick={() => handleAction(advice)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 shadow-sm ${
                    advice.severity === "critical"
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50"
                      : advice.severity === "warning"
                      ? "bg-amber-600 hover:bg-amber-500 text-slate-950 font-black shadow-amber-950/50"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{advice.actionText}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
