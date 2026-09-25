"use client";

import React, { useState, useId, useRef } from "react";
import {
  Trophy,
  Warehouse,
  BookmarkPlus,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Check,
  X,
  Zap,
  Gauge,
  Weight,
  Flame,
  ExternalLink,
  ChevronRight,
  Clock,
  Car,
  Filter,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useGarageStore } from "@/stores/useGarageStore";
import { CURATED_PRESETS } from "@/domain/presets/curatedPresets";
import { getVehicle } from "@/domain/vehicles/lookup";
import type { BuildPreset, PresetCategory, SavedBuild } from "@/types/garage.types";

const CATEGORY_TABS: { id: PresetCategory; label: string; icon: string }[] = [
  { id: "all", label: "Все сетапы", icon: "🏁" },
  { id: "track", label: "Трек & TCR", icon: "🏎️" },
  { id: "drift", label: "Дрифт (Formula D)", icon: "💨" },
  { id: "drag", label: "Драг & Wangan", icon: "⚡" },
  { id: "touge", label: "Тогэ (9000 RPM)", icon: "🏔️" },
  { id: "time-attack", label: "Time Attack", icon: "⏱️" },
];

const AVAILABLE_TAGS = [
  "TRACK",
  "DRIFT",
  "DRAG",
  "STREET",
  "STAGE 2",
  "STAGE 3",
  "TIME ATTACK",
  "KDM",
  "JDM",
  "EURO",
];

const FLAG_EMOJIS: Record<string, string> = {
  KR: "🇰🇷",
  JP: "🇯🇵",
  DE: "🇩🇪",
  US: "🇺🇸",
};

export function GarageModal() {
  const isGarageModalOpen = useUiStore((s) => s.isGarageModalOpen);
  const closeGarageModal = useUiStore((s) => s.closeGarageModal);
  const showToast = useUiStore((s) => s.showToast);

  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const selectVehicle = useVehicleStore((s) => s.selectVehicle);
  const vehicles = useVehicleStore((s) => s.vehicles);

  const slots = useBuildStore((s) => s.slots);
  const loadSlots = useBuildStore((s) => s.loadSlots);
  const resetAllToOem = useBuildStore((s) => s.resetAllToOem);

  const savedBuilds = useGarageStore((s) => s.savedBuilds);
  const activePresetId = useGarageStore((s) => s.activePresetId);
  const setActivePresetId = useGarageStore((s) => s.setActivePresetId);
  const saveCurrentBuild = useGarageStore((s) => s.saveCurrentBuild);
  const deleteBuild = useGarageStore((s) => s.deleteBuild);
  const exportBuildToJson = useGarageStore((s) => s.exportBuildToJson);
  const importBuildFromJson = useGarageStore((s) => s.importBuildFromJson);

  // Local component states
  const [activeTab, setActiveTab] = useState<"presets" | "my-garage" | "save-current">("presets");
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>("all");
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["TRACK", "STAGE 2"]);
  const [appliedPresetNotification, setAppliedPresetNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputId = useId();
  const descInputId = useId();

  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Filter curated presets
  const filteredPresets = CURATED_PRESETS.filter((preset) => {
    if (selectedCategory === "all") return true;
    return preset.category === selectedCategory;
  });

  if (!isGarageModalOpen) return null;

  // Handle preset application
  const handleApplyPreset = (preset: BuildPreset) => {
    selectVehicle(preset.vehicleId);
    resetAllToOem();
    loadSlots(preset.slots);
    setActivePresetId(preset.id);
    setAppliedPresetNotification(preset.name);
    showToast(`Пресет "${preset.name}" успешно загружен!`);

    setTimeout(() => {
      setAppliedPresetNotification(null);
    }, 2500);
  };

  // Handle saved build loading
  const handleLoadSavedBuild = (build: SavedBuild) => {
    selectVehicle(build.vehicleId);
    resetAllToOem();
    loadSlots(build.slots);
    setActivePresetId(null);
    showToast(`Проект "${build.name}" загружен в конфигуратор!`);
    closeGarageModal();
  };

  // Handle save current build submission
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      saveName.trim() ||
      `${currentVehicle?.brand.toUpperCase()} ${currentVehicle?.model} Custom Project`;

    saveCurrentBuild({
      name: finalName,
      description: saveDesc.trim(),
      vehicleId: selectedVehicleId,
      slots,
      tags: selectedTags,
    });

    showToast(`Проект "${finalName}" сохранен в локальный гараж!`);
    setSaveName("");
    setSaveDesc("");
    setActiveTab("my-garage");
  };

  // Handle export to .apex file
  const handleExportApex = (id: string, name: string) => {
    const jsonStr = exportBuildToJson(id);
    if (!jsonStr) return;

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = name.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    link.href = url;
    link.download = `${safeName}.apex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Файл "${safeName}.apex" выгружен на диск!`);
  };

  // Handle file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = importBuildFromJson(content);
      if (result.success && result.build) {
        showToast(`Проект "${result.build.name}" успешно импортирован!`);
        setActiveTab("my-garage");
      } else {
        showToast(result.error ?? "Ошибка при импорте файла .apex");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Hidden File Input for .apex import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".apex,.json"
          className="hidden"
        />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-amber-400 shadow-inner">
              <Warehouse className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-mono">
                  АВТОСПОРТИВНЫЙ ГАРАЖ & ПРЕСЕТЫ
                </h2>
                <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  모터스포츠 차고
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Библиотека соревновательных сетапов (TCR, Drift, Wangan) и локальное сохранение
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeGarageModal}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            aria-label="Закрыть модальное окно"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-5 py-2.5 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "presets"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trophy className="size-3.5 text-amber-400" />
              <span>Культовые пресеты</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200">
                {CURATED_PRESETS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("my-garage")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "my-garage"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Warehouse className="size-3.5 text-cyan-400" />
              <span>Мой гараж</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-cyan-200">
                {savedBuilds.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("save-current")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "save-current"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookmarkPlus className="size-3.5 text-emerald-400" />
              <span>Сохранить текущий</span>
            </button>
          </div>

          {/* Quick Actions (Import .apex) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700 hover:text-white hover:border-slate-600 transition-all cursor-pointer active:scale-95"
              title="Импортировать проект из сохраненного файла .apex"
            >
              <Upload className="size-3.5 text-cyan-400" />
              <span>Импорт .apex</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: CURATED ICONIC PRESETS                                   */}
          {/* ============================================================== */}
          {activeTab === "presets" && (
            <div className="space-y-5">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                      selectedCategory === tab.id
                        ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40"
                        : "bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Presets Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPresets.map((preset) => {
                  const car = getVehicle(preset.vehicleId);
                  const isCurrentActive = activePresetId === preset.id;
                  const isJustApplied = appliedPresetNotification === preset.name;

                  return (
                    <div
                      key={preset.id}
                      className={`relative flex flex-col justify-between rounded-xl border p-4.5 transition-all ${
                        isCurrentActive
                          ? "border-amber-500/60 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 shadow-lg shadow-amber-950/20"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950/80"
                      }`}
                    >
                      {/* Card Header: Flag, Category Badge, Title */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base" title={preset.countryCode}>
                              {FLAG_EMOJIS[preset.countryCode] ?? "🏁"}
                            </span>
                            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-amber-500/30">
                              {preset.badgeTag}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-slate-400">
                            {preset.targetDiscipline}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                            <span>{preset.name}</span>
                            {isCurrentActive && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                АКТИВЕН
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 font-medium">
                              {car ? `${car.brand.toUpperCase()} ${car.model}` : preset.vehicleId}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {preset.koreanName}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300/90 leading-relaxed font-sans line-clamp-2">
                          {preset.description}
                        </p>

                        {/* Estimated Specs Bar */}
                        <div className="grid grid-cols-4 gap-2 py-2 px-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
                          <div>
                            <div className="text-[10px] text-slate-500 font-mono">МОЩНОСТЬ</div>
                            <div className="text-xs font-bold text-amber-400 font-mono">
                              {preset.specsEstimate.powerHp} л.с.
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-mono">МОМЕНТ</div>
                            <div className="text-xs font-bold text-amber-400 font-mono">
                              {preset.specsEstimate.torqueNm} Нм
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-mono">МАССА</div>
                            <div className="text-xs font-bold text-slate-300 font-mono">
                              {preset.specsEstimate.weightKg} кг
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-mono">0-100 КМ/Ч</div>
                            <div className="text-xs font-bold text-cyan-400 font-mono">
                              {preset.specsEstimate.zeroToHundredSec}
                            </div>
                          </div>
                        </div>

                        {/* Highlights Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {preset.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer: Action Button */}
                      <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">
                          {Object.keys(preset.slots).length} узлов в сетапе
                        </span>

                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          disabled={isJustApplied}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                            isJustApplied
                              ? "bg-emerald-500 text-slate-950 font-bold"
                              : isCurrentActive
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950"
                              : "bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500/40"
                          }`}
                        >
                          {isJustApplied ? (
                            <>
                              <Check className="size-3.5" />
                              <span>Применено!</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-3.5" />
                              <span>{isCurrentActive ? "Применить повторно" : "Применить сетап"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MY LOCAL GARAGE BUILDS                                  */}
          {/* ============================================================== */}
          {activeTab === "my-garage" && (
            <div className="space-y-4">
              {savedBuilds.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
                  <div className="size-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Warehouse className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono">
                      Твой гараж пуст
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Собери свой проект в конфигураторе и сохрани его, либо выбери один из культовых
                      пресетов во вкладке выше.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("save-current")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    <BookmarkPlus className="size-4" />
                    <span>Сохранить текущую сборку</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedBuilds.map((build) => {
                    const car = getVehicle(build.vehicleId);
                    const slotCount = Object.values(build.slots).filter(Boolean).length;

                    return (
                      <div
                        key={build.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                              <Car className="size-3.5" />
                              {car ? `${car.brand.toUpperCase()} ${car.model}` : build.vehicleId}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                              <Clock className="size-3" />
                              <span>{build.createdAtKst}</span>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-white tracking-tight">
                              {build.name}
                            </h3>
                            {build.description && (
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                {build.description}
                              </p>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {build.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Build Card Footer */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">
                            {slotCount} компонентов
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleExportApex(build.id, build.name)}
                              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
                              title="Экспорт в .apex файл"
                            >
                              <Download className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Удалить проект "${build.name}" из гаража?`)) {
                                  deleteBuild(build.id);
                                  showToast("Проект удален из локального гаража");
                                }
                              }}
                              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                              title="Удалить проект"
                            >
                              <Trash2 className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleLoadSavedBuild(build)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer active:scale-95"
                            >
                              <span>Загрузить</span>
                              <ChevronRight className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: SAVE CURRENT BUILD                                      */}
          {/* ============================================================== */}
          {activeTab === "save-current" && (
            <form onSubmit={handleSaveSubmit} className="max-w-xl mx-auto space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase">
                  Текущий активный автомобиль
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">
                    {currentVehicle ? `${currentVehicle.brand.toUpperCase()} ${currentVehicle.model}` : "Автомобиль не выбран"}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {currentVehicle?.trim ?? "Trim"}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Установлено модификаций: {Object.values(slots).filter(Boolean).length} / 12 слотов
                </div>
              </div>

              {/* Project Name Input */}
              <div className="space-y-1.5">
                <label htmlFor={nameInputId} className="block text-xs font-bold text-slate-300 font-mono">
                  НАЗВАНИЕ ПРОЕКТА *
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={`${currentVehicle?.model ?? "Автомобиль"} Stage 2+ Track Spec`}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              {/* Project Description Input */}
              <div className="space-y-1.5">
                <label htmlFor={descInputId} className="block text-xs font-bold text-slate-300 font-mono">
                  ЗАМЕТКИ И ОПИСАНИЕ СБОРКИ
                </label>
                <textarea
                  id={descInputId}
                  rows={3}
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  placeholder="Особенности сетапа, давление наддува, назначение (трек-дни, дрифт, город)..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-sans"
                />
              </div>

              {/* Tags Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 font-mono">
                  ТЕГИ ДИСЦИПЛИНЫ
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("my-garage")}
                  className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-black tracking-wide shadow-md shadow-emerald-950/40 hover:brightness-110 transition-all cursor-pointer active:scale-95 uppercase font-mono"
                >
                  <BookmarkPlus className="size-4" />
                  <span>Сохранить в гараж</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
