"use client";

import React, { useMemo } from "react";
import {
  X,
  Printer,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Wrench,
  Cpu,
  Layers,
  Copy,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { resolveBuildParts } from "@/services/swapService";
import { calculateBuildBudget, formatKrw } from "@/services/budgetService";

export function BuildBudgetModal() {
  const isOpen = useUiStore((s) => s.isBudgetModalOpen);
  const closeModal = useUiStore((s) => s.closeBudgetModal);
  const showToast = useUiStore((s) => s.showToast);

  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const slots = useBuildStore((s) => s.slots);

  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const resolved = useMemo(() => {
    if (!vehicle) return null;
    return resolveBuildParts(vehicle, slots);
  }, [vehicle, slots]);

  const quote = useMemo(() => {
    if (!vehicle || !resolved) return null;
    return calculateBuildBudget(vehicle, resolved);
  }, [vehicle, resolved]);

  if (!isOpen || !vehicle || !resolved || !quote) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    try {
      const summaryText = `[Apex Forge 견적서] ${quote.vehicleName}
견적번호: ${quote.quoteNumber} (발행일: ${quote.issueDateKst})
---------------------------------------------
부품 공급가액: ${formatKrw(quote.subtotalPartsKrw)}
공임 및 가공비: ${formatKrw(quote.subtotalLaborKrw)}
부가가치세 (10%): ${formatKrw(quote.taxVatKrw)}
총 견적금액: ${formatKrw(quote.totalKrw)}
계약금 (30%): ${formatKrw(quote.depositRequiredKrw)}
---------------------------------------------
BUILT, NOT BOUGHT — Apex Forge Track & Street Studio`;

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(summaryText);
        showToast("Сводка сметы скопирована в буфер обмена!");
      }
    } catch {
      showToast("Не удалось скопировать смету");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Официальная смета постройки (견적서 / Build Quotation)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                  KRW (₩)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                № {quote.quoteNumber} · Дата выдачи: {quote.issueDateKst} (KST) · Действительно до: {quote.validUntilKst}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Скопировать текст сметы"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Копировать</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm"
              title="Печать сметы"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать (A4)</span>
            </button>
            <button
              onClick={closeModal}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/30">
          {/* Official Provider & Client Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                Исполнитель (공급자 / Contractor)
              </span>
              <p className="font-bold text-sm text-slate-100">Apex Forge Motorsport & Custom Fabrication</p>
              <p className="text-slate-400">Регистрационный номер (사업자등록번호): <strong>120-81-47521</strong></p>
              <p className="text-slate-400">Адрес: 서울특별시 영등포구 문래동 엔지니어링 랩</p>
            </div>

            <div className="space-y-1.5 md:border-l md:border-slate-800 md:pl-4">
              <span className="font-mono text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                Транспортное средство (대상 차량 / Vehicle Spec)
              </span>
              <p className="font-bold text-sm text-slate-100">{quote.vehicleName}</p>
              <p className="text-slate-400">Госномер (차량번호): <strong className="font-mono text-slate-200">{quote.vehiclePlateMock}</strong></p>
              <p className="text-slate-400">Конфигурация: {resolved.engine.code} ({resolved.engine.powerHp} hp) + {resolved.transmission.code}</p>
            </div>
          </div>

          {/* Detailed Line Items Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Спецификация компонентов и трудозатрат (견적 세부 내역)</span>
              <span className="text-slate-400 font-mono">Позиций: {quote.items.length}</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Категория</th>
                  <th className="py-2.5 px-4">Наименование детали / Работы</th>
                  <th className="py-2.5 px-4">Поставщик / Источник</th>
                  <th className="py-2.5 px-4 text-right">Сумма (KRW ₩)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {quote.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] uppercase">
                        {item.category === "donor-parts"
                          ? "Донор"
                          : item.category === "performance-hardware"
                          ? "Тюнинг"
                          : item.category === "fabrication-labor"
                          ? "Слесарка ЧПУ"
                          : item.category === "electronics-tuning"
                          ? "Электрика"
                          : "Расходники"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-200">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.koreanName}</div>
                      {item.notes && <div className="text-[10px] text-amber-300/80 mt-0.5">{item.notes}</div>}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      {item.supplierContext}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                      {formatKrw(item.costKrw)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block mb-1">Условия оплаты и гарантии (결제 및 품질보증):</span>
              <p className="text-slate-400 leading-relaxed">
                • <strong>Предоплата (계약금) 30%</strong> вносится перед закупкой контрактных узлов и металлопроката.
              </p>
              <p className="text-slate-400 leading-relaxed">
                • Расчёт остатка производится после финального прогона на колесном диностенде (다이노 측정) и ходовых испытаний.
              </p>
              <p className="text-slate-400 leading-relaxed">
                • Гарантия на сварные швы и геометрию кронштейнов — <strong>12 месяцев</strong> без ограничения пробега на треке.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Сумма компонентов (부품 공급가액):</span>
                <span className="font-mono text-slate-200">{formatKrw(quote.subtotalPartsKrw)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Работы, ЧПУ и диностенд (공임 및 가공비):</span>
                <span className="font-mono text-slate-200">{formatKrw(quote.subtotalLaborKrw)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>НДС 10% (부가가치세 VAT):</span>
                <span className="font-mono text-slate-300">{formatKrw(quote.taxVatKrw)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-extrabold text-emerald-400">
                <span>ИТОГО К ОПЛАТЕ (총 견적금액):</span>
                <span className="font-mono">{formatKrw(quote.totalKrw)}</span>
              </div>
              <div className="flex justify-between pt-1 text-xs text-amber-300">
                <span>Предоплата 30% (계약금):</span>
                <span className="font-mono font-bold">{formatKrw(quote.depositRequiredKrw)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">
              Korea Standard Invoice Format (세금계산서 연동 규격)
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
