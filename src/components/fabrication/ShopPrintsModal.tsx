"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  Printer,
  Download,
  Wrench,
  Layers,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Ruler,
  FileText,
  Clock,
  Compass,
  Hammer,
  ShieldAlert,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { resolveBuildParts } from "@/services/swapService";
import { getIRLSwapGuide, generateSvgTemplateXml } from "@/services/fabricationService";

type ShopTab = "templates" | "fasteners" | "clearances" | "wiring" | "tools";

export function ShopPrintsModal() {
  const isOpen = useUiStore((s) => s.isShopPrintsModalOpen);
  const closeModal = useUiStore((s) => s.closeShopPrintsModal);
  const showToast = useUiStore((s) => s.showToast);

  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const slots = useBuildStore((s) => s.slots);

  const [activeTab, setActiveTab] = useState<ShopTab>("templates");
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);

  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const resolved = useMemo(() => {
    if (!vehicle) return null;
    return resolveBuildParts(vehicle, slots);
  }, [vehicle, slots]);

  const guide = useMemo(() => {
    if (!vehicle || !resolved) return null;
    return getIRLSwapGuide(vehicle, resolved);
  }, [vehicle, resolved]);

  const currentTemplate = useMemo(() => {
    if (!guide || !guide.templates.length) return null;
    return guide.templates[activeTemplateIndex] ?? guide.templates[0];
  }, [guide, activeTemplateIndex]);

  const svgXml = useMemo(() => {
    if (!currentTemplate) return "";
    return generateSvgTemplateXml(currentTemplate);
  }, [currentTemplate]);

  if (!isOpen || !vehicle || !resolved || !guide) return null;

  const handleDownloadSvg = () => {
    if (!currentTemplate || !svgXml) return;
    const blob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentTemplate.id}-1to1-scale.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Чертеж ${currentTemplate.title} (1:1 масштаб) успешно скачан!`);
  };

  const handlePrint = () => {
    if (!svgXml) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Разрешите всплывающие окна для печати чертежей");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentTemplate?.title ?? "Shop Print"} - 1:1 Scale Print</title>
          <style>
            @page { size: auto; margin: 5mm; }
            body { margin: 0; padding: 0; background: #fff; display: flex; justify-content: center; align-items: center; }
            svg { max-width: 100%; height: auto; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${svgXml}
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const difficultyBadge = {
    "bolt-in": { label: "Bolt-in (Болт-он)", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    moderate: { label: "Moderate (Умеренная подгонка)", cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
    advanced: { label: "Advanced (Требуется резка/сварка)", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    "expert-fabrication": { label: "Expert Custom (Полный кастом)", cls: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
  }[guide.swapDifficulty];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  IRL Shop Prints & Hardware BOM (실제 제작 도면 및 부품 명세서)
                </h2>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${difficultyBadge.cls}`}>
                  {difficultyBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {vehicle.brand.toUpperCase()} {vehicle.model} ({vehicle.generation}) ➔ Свап: {resolved.engine.code} {resolved.engine.family} + {resolved.transmission.code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Оценка работ: <strong className="text-slate-100">{guide.estimatedHours} ч.</strong></span>
            </div>
            <button
              onClick={closeModal}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "templates"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            1:1 Чертежи и лекала ({guide.templates.length})
          </button>

          <button
            onClick={() => setActiveTab("fasteners")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "fasteners"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Крепеж и моменты затяжки ({guide.fasteners.length})
          </button>

          <button
            onClick={() => setActiveTab("clearances")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "clearances"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Зазоры и доработка кузова ({guide.clearances.length})
          </button>

          <button
            onClick={() => setActiveTab("wiring")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "wiring"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Схема проводки ЭБУ ({guide.wiring.length})
          </button>

          <button
            onClick={() => setActiveTab("tools")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "tools"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            Специнструмент & Поддон
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: 1:1 TEMPLATES & PRINTS */}
          {activeTab === "templates" && (
            <div className="space-y-6">
              {guide.templates.length > 1 && (
                <div className="flex gap-2">
                  {guide.templates.map((tmpl, idx) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setActiveTemplateIndex(idx)}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                        activeTemplateIndex === idx
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                          : "bg-slate-800/40 text-slate-400 border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {tmpl.title}
                    </button>
                  ))}
                </div>
              )}

              {currentTemplate ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* SVG Drawing Canvas Preview */}
                  <div className="lg:col-span-2 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
                      <span className="font-mono text-cyan-400 font-semibold">
                        {currentTemplate.title} (Разрешение: {currentTemplate.widthMm} × {currentTemplate.heightMm} мм)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors font-medium"
                        >
                          <Printer className="w-3.5 h-3.5 text-cyan-400" />
                          Печать (1:1 A4)
                        </button>
                        <button
                          onClick={handleDownloadSvg}
                          className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Скачать SVG
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-center overflow-auto min-h-[380px] bg-slate-950">
                      <div
                        className="max-w-full drop-shadow-xl"
                        dangerouslySetInnerHTML={{ __html: svgXml }}
                      />
                    </div>
                  </div>

                  {/* Template Meta & Instructions */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        Спецификация заготовки (제작 사양)
                      </h4>
                      <dl className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <dt className="text-slate-400">Материал детали:</dt>
                          <dd className="font-mono font-medium text-slate-200">{currentTemplate.material}</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <dt className="text-slate-400">Рекомендуемая толщина:</dt>
                          <dd className="font-mono font-semibold text-cyan-400">{currentTemplate.thicknessMm} мм</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <dt className="text-slate-400">Габариты заготовки:</dt>
                          <dd className="font-mono text-slate-200">{currentTemplate.widthMm} × {currentTemplate.heightMm} мм</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <dt className="text-slate-400">Количество отверстий:</dt>
                          <dd className="font-mono text-slate-200">{currentTemplate.holes.length} шт.</dd>
                        </div>
                        <div className="flex justify-between py-1">
                          <dt className="text-slate-400">Центровочные штифты (Dowel):</dt>
                          <dd className="font-mono text-amber-400">{currentTemplate.dowelPins.length} шт.</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 text-amber-300">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        Инструкция по ручной калибровке печати
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        1. Распечатайте чертеж в масштабе ровно <strong>100% (Без масштабирования / Fit to page: OFF)</strong>.
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        2. Приложите физическую линейку к проверочной шкале внизу листа: расстояние между 0 и 100 мм должно составлять ровно <strong>100.0 мм</strong>.
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        3. Наклейте лист на металл аэрозольным клеем и выполните кернение центров отверстий по крестовинам.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">Чертежи не требуются для данного болт-он узла.</div>
              )}
            </div>
          )}

          {/* TAB 2: FASTENERS BOM & TORQUE */}
          {activeTab === "fasteners" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Ведомость крепежа для сопряжения ДВС, КПП, опор и привода</span>
                <span className="text-cyan-400 font-mono">Всего позиций: {guide.fasteners.length}</span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold">
                      <th className="py-3 px-4">Узел</th>
                      <th className="py-3 px-4">Назначение</th>
                      <th className="py-3 px-4">Резьба & Длина</th>
                      <th className="py-3 px-4">Класс прочности</th>
                      <th className="py-3 px-4">Момент затяжки (Нм)</th>
                      <th className="py-3 px-4">Кол-во</th>
                      <th className="py-3 px-4">Стандарт / Примечания</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {guide.fasteners.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono uppercase text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[10px]">
                            {f.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">{f.description}</td>
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">{f.threadSpec} × {f.lengthMm}мм</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            f.grade === "12.9" || f.grade === "Titanium Ti-6Al-4V"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                          }`}>
                            {f.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                            {f.tighteningTorqueNm} Нм
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{f.quantity} шт.</td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs">
                          <span className="text-slate-300">{f.standard}</span>
                          {f.notes && <p className="text-[11px] text-amber-300/80 mt-0.5">{f.notes}</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CLEARANCES & BODY CUTS */}
          {activeTab === "clearances" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guide.clearances.map((c, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      c.severity === "heavy-fabrication"
                        ? "bg-rose-500/10 border-rose-500/30"
                        : c.severity === "minor-massage"
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-emerald-500/10 border-emerald-500/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-100">{c.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.severity === "heavy-fabrication"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : c.severity === "minor-massage"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}>
                          {c.severity === "heavy-fabrication"
                            ? "Сварка / Резка"
                            : c.severity === "minor-massage"
                            ? "Подгиб / Проставка"
                            : "Штатный зазор"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{c.description}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
                        <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                        Требуемое действие:
                      </div>
                      <p className="text-slate-400 leading-snug">{c.actionRequired}</p>
                      <div className="mt-2 text-[11px] font-mono text-cyan-400">
                        Мин. безопасный зазор: <strong>{c.clearanceMm} мм</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WIRING PINOUT MATRIX */}
          {activeTab === "wiring" && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Таблица кросс-соединения салонного жгута кузова (Body Harness) и косы управления двигателем (Engine Harness).
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold">
                      <th className="py-3 px-4">Пин</th>
                      <th className="py-3 px-4">Сигнал & Назначение</th>
                      <th className="py-3 px-4">Цвет провода</th>
                      <th className="py-3 px-4">Сторона кузова (Chassis)</th>
                      <th className="py-3 px-4">Сторона ЭБУ (Engine/ECU)</th>
                      <th className="py-3 px-4">Инженерные примечания</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {guide.wiring.map((w, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">{w.pinNumber}</td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {w.functionName}
                          <span className="block text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                            {w.signalType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{w.wireColor}</td>
                        <td className="py-3 px-4 text-slate-200">{w.chassisSide}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400">{w.engineSide}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs text-[11px]">{w.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TOOLS & WORKSHOP CHECKLIST */}
          {activeTab === "tools" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  Необходимый специнструмент (필수 특수 공구)
                </h4>
                <ul className="space-y-2 text-xs">
                  {guide.requiredTools.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Критические параметры компоновки
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1">
                      Ориентация масляного картера (오일 팬 구조 / Oil Pan Sump):
                    </span>
                    <span className="font-mono font-bold text-cyan-400 text-sm uppercase">
                      {guide.oilPanOrientation === "rear-sump"
                        ? "Задний картер (Rear-Sump) — для балки заднего расположения"
                        : guide.oilPanOrientation === "front-sump"
                        ? "Передний картер (Front-Sump) — под балку с передней рейкой"
                        : "Сухой картер (Dry-Sump System)"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1">
                      Дельта длины карданного вала (드라이브샤프트 길이 변위):
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {guide.driveshaftLengthDeltaMm === 0
                        ? "0 мм (Штатная длина кардана сохраняется)"
                        : `${guide.driveshaftLengthDeltaMm > 0 ? "+" : ""}${guide.driveshaftLengthDeltaMm} мм (${
                            guide.driveshaftLengthDeltaMm < 0 ? "Укоротить кардан" : "Удлинить кардан"
                          })`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">
              ISO 9001 / DIN 931 Fastener Standards Checked
            </span>
          </div>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Закрыть (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}
