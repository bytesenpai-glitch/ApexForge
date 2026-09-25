"use client";

import React, { useEffect, useState } from "react";
import {
  Flame,
  Layers,
  Car,
  RotateCcw,
  CheckCircle2,
  Search,
  Zap,
  Activity,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useUiStore } from "@/stores/useUiStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { BRAND_LABELS, LAYOUT_LABELS } from "@/constants/tuning";

export function AppHeader() {
  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);
  const toastMessage = useUiStore((s) => s.toastMessage);
  const showToast = useUiStore((s) => s.showToast);
  const openDrawer = useUiStore((s) => s.openDrawer);

  const resetAllToOem = useBuildStore((s) => s.resetAllToOem);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];

  const handleReset = () => {
    resetAllToOem();
    showToast("Все узлы возвращены в заводское состояние (OEM Stock)");
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to open engine swap drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openDrawer("engine");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openDrawer]);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-3 sm:px-6 backdrop-blur print:hidden">
      {/* Left: Brand Identity & View Nav Tabs */}
      <div className="flex h-10 min-w-0 items-center gap-2 sm:gap-3">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/10 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-950/40">
            <Flame className="size-4.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white uppercase font-mono">
                APEX FORGE
              </span>
              <span className="hidden xl:inline-flex text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold tracking-wider">
                BUILT, NOT BOUGHT
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              MODDING CANVAS // TRACK & STREET
            </span>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden md:block h-6 w-px bg-slate-800" />

        {/* View Switcher Pills */}
        <div className="flex items-center rounded-lg p-0.5 bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("garage")}
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all cursor-pointer ${
              viewMode === "garage"
                ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Car className="size-3.5" />
            <span>Гараж (Garage)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("blueprint")}
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all cursor-pointer ${
              viewMode === "blueprint"
                ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="size-3.5" />
            <span>2D CAD Чертёж</span>
            <span className="text-[9px] font-mono px-1 rounded bg-cyan-900/60 text-cyan-300">2.0</span>
          </button>
        </div>

        {/* Quick Search Button (Ctrl+K) */}
        <button
          type="button"
          onClick={() => openDrawer("engine")}
          className="hidden lg:inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 text-[11px] font-medium text-slate-300 hover:border-slate-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
          title="Быстрый поиск деталей для свапа (Ctrl+K / ⌘K)"
        >
          <Search className="size-3.5 text-slate-400" />
          <span className="text-slate-300">Свап ДВС</span>
          <kbd className="inline-flex items-center gap-0.5 rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-400 border border-slate-700/80">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Vehicle Status, Sandbox Badge, Reset & GitHub */}
      <div className="flex h-10 shrink-0 items-center gap-2 sm:gap-2.5">
        {/* Active Vehicle Info Badge */}
        {vehicle && (
          <div className="hidden xl:flex items-center gap-2 rounded-lg bg-slate-950/80 border border-slate-800 px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              {BRAND_LABELS[vehicle.brand] ?? vehicle.brand} {vehicle.model}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              {vehicle.platform ?? "OEM"}
            </span>
          </div>
        )}

        {/* Local-First Sandbox Status Pill */}
        <div
          className="hidden sm:inline-flex h-6 items-center justify-center gap-1.5 rounded-full px-2.5 text-[10px] font-semibold tracking-wide bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30"
          title="Локальный движок симуляции с мгновенным откликом (Local-First Architecture)"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono">LOCAL-FIRST</span>
        </div>

        {/* Reset OEM Button */}
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2 sm:px-2.5 text-[11px] font-medium text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-all cursor-pointer active:scale-95"
          title="Сбросить все доработки до заводского OEM состояния"
        >
          <RotateCcw className="size-3.5 text-slate-400" />
          <span className="hidden sm:inline">Сброс OEM</span>
        </button>

        {/* GitHub Repository Link */}
        <Link
          href="https://github.com/bytesenpai-glitch/ApexForge"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-white transition-colors cursor-pointer"
          title="GitHub Репозиторий"
        >
          <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </Link>
      </div>

      {/* Floating Toast Notification Bar */}
      {toastMessage && (
        <div className="absolute top-14 left-0 right-0 bg-amber-950/90 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-300 text-center flex items-center justify-center gap-2 animate-fadeIn z-50">
          <CheckCircle2 className="size-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
}
