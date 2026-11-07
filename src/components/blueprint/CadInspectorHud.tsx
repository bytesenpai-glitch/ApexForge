"use client";

import React, { useMemo } from "react";
import {
  Wrench,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import type { Vehicle } from "@/domain/vehicles/types";
import type { PartSlotKind, ResolvedBuildParts } from "@/types/tuning.types";

interface CadInspectorHudProps {
  slot: PartSlotKind | "fuel";
  resolved: ResolvedBuildParts;
  vehicle: Vehicle;
  onOpenDrawer: (slot: PartSlotKind) => void;
  onResetSlot: (slot: PartSlotKind) => void;
  onOpenAudioModal: () => void;
  onClose?: () => void;
}

interface NodeInspectionMeta {
  title: string;
  hangulTitle: string;
  englishTitle: string;
  partName: string;
  maker: string;
  metallurgy: string;
  specs: { label: string; value: string }[];
  isCustom: boolean;
  fitmentLabel: string;
  fitmentLevel: "bolt-in" | "kit" | "custom";
  targetSlot: PartSlotKind;
}

export function CadInspectorHud({
  slot,
  resolved,
  vehicle,
  onOpenDrawer,
  onResetSlot,
  onOpenAudioModal,
  onClose,
}: CadInspectorHudProps) {
  const meta: NodeInspectionMeta = useMemo(() => {
    switch (slot) {
      case "engine":
        return {
          title: "Двигатель внутреннего сгорания",
          hangulTitle: "엔진",
          englishTitle: "Internal Combustion Engine",
          partName: `${resolved.engine.family} (${resolved.engine.code})`,
          maker: String(resolved.engine.maker).toUpperCase(),
          metallurgy:
            "Кованый алюминиевый блок, коленвал из легированной стали 4340, гильзы чугун / Plasma-coated bores",
          specs: [
            { label: "Объем", value: `${resolved.engine.displacementCc.toLocaleString()} cc` },
            { label: "Конфигурация", value: `${resolved.engine.cylinderLayout ?? "Inline"} ${resolved.engine.cylinders}-цил.` },
            { label: "Мощность", value: `${resolved.engine.powerHp} HP` },
            { label: "Крутящий момент", value: `${resolved.engine.torqueNm} Nm` },
            { label: "Тюнинг потенциал", value: `${resolved.engine.tunedTorqueNm} Nm` },
            { label: "Отсечка", value: `${resolved.engine.redlineRpm ?? 6800} RPM` },
            { label: "Масса блока", value: `${resolved.engine.weightKg ?? 160} kg` },
          ],
          isCustom: resolved.isCustomEngine,
          fitmentLabel: resolved.isCustomEngine ? "어댑터 키트 (Adapter Kit)" : "볼트온 (Bolt-in)",
          fitmentLevel: resolved.isCustomEngine ? "kit" : "bolt-in",
          targetSlot: "engine",
        };

      case "transmission":
        return {
          title: "Трансмиссия и сцепление",
          hangulTitle: "변속기",
          englishTitle: "Transmission & Bellhousing",
          partName: `${resolved.transmission.name} (${resolved.transmission.code})`,
          maker: String(resolved.transmission.maker).toUpperCase(),
          metallurgy:
            "Алюминиевый картер кокильного литья, косозубые синхронизированные шестерни SNCM439, двухдисковое металлокерамическое сцепление",
          specs: [
            { label: "Тип КПП", value: `${resolved.transmission.type.toUpperCase()}` },
            { label: "Ступеней", value: `${resolved.transmission.gears}-ступенчатая` },
            { label: "Предел момента", value: `${resolved.transmission.torqueCapacityNm} Nm` },
            { label: "Масса коробки", value: `${resolved.transmission.weightKg ?? 65} kg` },
          ],
          isCustom: resolved.isCustomTrans,
          fitmentLabel: resolved.isCustomTrans ? "어댑터 키트 (Adapter Kit)" : "볼트온 (Bolt-in)",
          fitmentLevel: resolved.isCustomTrans ? "kit" : "bolt-in",
          targetSlot: "transmission",
        };

      case "turbo":
        return {
          title: "Турбокомпрессор и наддув",
          hangulTitle: "과급기",
          englishTitle: "Forced Induction & Turbo",
          partName: resolved.turbo?.name ?? "OEM Атмосферная система (NA)",
          maker: resolved.turbo?.maker ?? "OEM",
          metallurgy:
            "Горячая часть Inconel 718 (1050°C), фрезерованное компрессорное колесо Billet 6061-T6, двойные керамические шарикоподшипники",
          specs: [
            { label: "Тип", value: resolved.turbo ? resolved.turbo.subtype.toUpperCase() : "N/A" },
            { label: "Прирост мощности", value: resolved.turbo ? `+${resolved.turbo.powerGainHp} HP` : "0 HP" },
            { label: "Прирост момента", value: resolved.turbo ? `+${resolved.turbo.torqueGainNm} Nm` : "0 Nm" },
            { label: "Давление наддува", value: resolved.turbo?.boostBar ? `${resolved.turbo.boostBar} bar` : "0 bar" },
            { label: "Спул", value: resolved.turbo?.spoolRpm ? `${resolved.turbo.spoolRpm} RPM` : "N/A" },
          ],
          isCustom: Boolean(resolved.turbo),
          fitmentLabel: resolved.turbo ? "키트 / 볼트온 (Kit / Bolt-in)" : "볼트온 (Bolt-in)",
          fitmentLevel: resolved.turbo ? "kit" : "bolt-in",
          targetSlot: "turbo",
        };

      case "intake":
        return {
          title: "Впускная система и FMIC",
          hangulTitle: "흡기 및 인터쿨러",
          englishTitle: "Cold Air Intake & Intercooler",
          partName: resolved.intake?.name ?? "OEM Заводской впускной ресивер",
          maker: resolved.intake?.maker ?? "OEM",
          metallurgy:
            "100% Pre-Preg автоклавное углеволокно, полированный алюминиевый пайпинг 6061-T6, кремниевые 4-слойные силиконовые муфты",
          specs: [
            { label: "Тип", value: resolved.intake ? resolved.intake.subtype.toUpperCase() : "OEM" },
            { label: "Расход воздуха", value: resolved.intake?.cfmFlow ? `${resolved.intake.cfmFlow} CFM` : "550 CFM" },
            { label: "Снижение IAT", value: resolved.intake?.iatDropC ? `-${resolved.intake.iatDropC} °C` : "0 °C" },
            { label: "Прирост мощности", value: resolved.intake ? `+${resolved.intake.powerGainHp} HP` : "0 HP" },
          ],
          isCustom: Boolean(resolved.intake && resolved.intake.subtype !== "oem"),
          fitmentLabel: "볼트온 (Bolt-in)",
          fitmentLevel: "bolt-in",
          targetSlot: "intake",
        };

      case "exhaust":
        return {
          title: "Выхлопная система",
          hangulTitle: "배기 시스템",
          englishTitle: "Performance Exhaust System",
          partName: resolved.exhaust?.name ?? "OEM Выпускной тракт с катализатором",
          maker: resolved.exhaust?.maker ?? "OEM",
          metallurgy:
            "Титановый сплав Gr.5 / Нержавеющая сталь SUS304 с TIG-сваркой в среде аргона, бесшовные гибы на дорновом трубогибе",
          specs: [
            { label: "Диаметр трубы", value: resolved.exhaust?.pipeDiameterMm ? `${resolved.exhaust.pipeDiameterMm} mm` : "60 mm" },
            { label: "Громкость", value: resolved.exhaust?.soundDb ? `${resolved.exhaust.soundDb} dB` : "82 dB" },
            { label: "Прирост мощности", value: resolved.exhaust ? `+${resolved.exhaust.powerGainHp} HP` : "0 HP" },
            { label: "Дельта массы", value: resolved.exhaust?.weightDeltaKg ? `${resolved.exhaust.weightDeltaKg} kg` : "0 kg" },
          ],
          isCustom: resolved.isCustomExhaust,
          fitmentLabel: "볼트온 (Bolt-in)",
          fitmentLevel: "bolt-in",
          targetSlot: "exhaust",
        };

      case "brakes":
        return {
          title: "Тормозная система",
          hangulTitle: "브레이크 시스템",
          englishTitle: "Big Brake Kit & Slotted Rotors",
          partName: resolved.brakes?.name ?? "OEM Тормозные механизмы",
          maker: resolved.brakes?.maker ?? "OEM",
          metallurgy:
            "Моноблочные суппорты из авиационного кованого сплава, двухсоставные чугунные диски FC300 со шляпой из 7075-T6",
          specs: [
            { label: "Суппорты", value: resolved.brakes?.pistons ? `${resolved.brakes.pistons}-поршневые` : "OEM" },
            { label: "Диаметр дисков", value: resolved.brakes?.rotorDiameterMm ? `${resolved.brakes.rotorDiameterMm} mm` : "330 mm" },
            { label: "Торможение 100-0", value: resolved.brakes?.stoppingDistance100to0M ? `${resolved.brakes.stoppingDistance100to0M} m` : "36.5 m" },
            { label: "Стойкость к перегреву", value: resolved.brakes?.fadeResistance ? resolved.brakes.fadeResistance.toUpperCase() : "STANDARD" },
          ],
          isCustom: Boolean(resolved.brakes),
          fitmentLabel: "볼트온 (Bolt-in)",
          fitmentLevel: "bolt-in",
          targetSlot: "brakes",
        };

      case "suspension":
        return {
          title: "Подвеска и койловеры",
          hangulTitle: "서스펜션",
          englishTitle: "Mono-Tube Adjustable Coilovers",
          partName: resolved.suspension?.name ?? "OEM Заводские стойки и пружины",
          maker: resolved.suspension?.maker ?? "OEM",
          metallurgy:
            "Однотрубный 46-мм картридж с азотным подпором под давлением 25 бар, пружины из кремний-хромовой стали SAE9254",
          specs: [
            { label: "Тип", value: resolved.suspension ? resolved.suspension.subtype.toUpperCase() : "OEM" },
            { label: "Занижение клиренса", value: resolved.suspension?.dropMm ? `-${resolved.suspension.dropMm} mm` : "0 mm" },
            { label: "Индекс жесткости", value: resolved.suspension?.stiffnessRating ? `${resolved.suspension.stiffnessRating}/10` : "OEM" },
            { label: "Регулировка демпфирования", value: resolved.suspension?.dampingAdjustable ? "32-Way Click" : "OEM Фиксированная" },
          ],
          isCustom: resolved.isCustomSuspension,
          fitmentLabel: "볼트온 (Bolt-in)",
          fitmentLevel: "bolt-in",
          targetSlot: "suspension",
        };

      case "cooling":
        return {
          title: "Охлаждение и смазка",
          hangulTitle: "냉각 시스템",
          englishTitle: "Triple-Pass Radiator & Oil Cooler",
          partName: resolved.cooling?.name ?? "OEM Заводской радиатор",
          maker: resolved.cooling?.maker ?? "OEM",
          metallurgy:
            "Трехрядный алюминиевый радиатор высокой плотности Dual-Pass, сварные бачки TIG 5052, масляные шланги -10AN",
          specs: [
            { label: "Тип", value: resolved.cooling?.subtype.toUpperCase() ?? "OEM" },
            { label: "Теплоотвод", value: `${resolved.cooling?.heatDissipationKw ?? 45} kW` },
            { label: "Снижение t° ОЖ", value: `-${resolved.cooling?.tempDropCoolantC ?? 0} °C` },
            { label: "Снижение t° Масла", value: `-${resolved.cooling?.tempDropOilC ?? 0} °C` },
          ],
          isCustom: resolved.isCustomCooling,
          fitmentLabel: "볼트온 (Bolt-in)",
          fitmentLevel: "bolt-in",
          targetSlot: "cooling",
        };

      case "differential":
      case "driveline":
        return {
          title: "Дифференциал и трансмиссионные валы",
          hangulTitle: "차동기어",
          englishTitle: "Mechanical LSD & Half-Shafts",
          partName: resolved.differential?.name ?? "OEM Открытый дифференциал",
          maker: resolved.differential?.maker ?? "OEM",
          metallurgy:
            "Корпус дифференциала из кованой легированной стали SCM420H, фрикционные пластины с алмазоподобным углеродным напылением DLC",
          specs: [
            { label: "Тип блокировки", value: resolved.differential?.subtype.toUpperCase() ?? "OPEN" },
            { label: "Блокировка (Разгон)", value: `${resolved.differential?.lockRateAccelerationPct ?? 0}%` },
            { label: "Блокировка (Торможение)", value: `${resolved.differential?.lockRateDecelerationPct ?? 0}%` },
            { label: "Предел момента на оси", value: `${resolved.differential?.maxAxleTorqueNm ?? 450} Nm` },
          ],
          isCustom: resolved.isCustomDiff || resolved.isCustomDriveline,
          fitmentLabel: "볼트온 (Bolt-in)",
          fitmentLevel: "bolt-in",
          targetSlot: "differential",
        };

      case "mounts":
        return {
          title: "Опоры двигателя и подрамник",
          hangulTitle: "엔진 마운트",
          englishTitle: "Motor Mounts & Subframe Crossmember",
          partName: resolved.mounts?.name ?? "OEM Резиновые сайлентблоки",
          maker: resolved.mounts?.maker ?? "OEM",
          metallurgy:
            "Фрезерованный из монолитной плиты 6061-T6 алюминий, сайлентблоки из литого полиуретана 70A/95A Shore",
          specs: [
            { label: "Тип", value: resolved.mounts?.subtype.toUpperCase() ?? "OEM" },
            { label: "Жесткость", value: `${resolved.mounts?.stiffnessDampingRating ?? 5}/10` },
            { label: "Смещение мотора", value: `${resolved.mounts?.engineMovementLimitMm ?? 25} mm` },
          ],
          isCustom: resolved.isCustomMounts,
          fitmentLabel: resolved.isCustomMounts ? "어댑터 키트 (Adapter Kit)" : "볼트온 (Bolt-in)",
          fitmentLevel: resolved.isCustomMounts ? "kit" : "bolt-in",
          targetSlot: "mounts",
        };

      case "fuel":
      default:
        return {
          title: "Топливная система и бензобак",
          hangulTitle: "연료 시스템",
          englishTitle: "Performance Fuel Cell & Dual HPFP",
          partName: "Walbro 450LPH Dual E85 Fuel Delivery System",
          maker: "TI Automotive / Radium Engineering",
          metallurgy:
            "Алюминиевый фланцевый стакан 6061-T6, армированные сталью тефлоновые трубки PTFE -8AN, фильтр тонкой очистки 10 микрон из нержавеющей сетки",
          specs: [
            { label: "Производительность", value: "2x 450 LPH (1,200+ HP)" },
            { label: "Рабочее давление", value: "3.5 - 6.5 bar" },
            { label: "Совместимость", value: "Бензин 98/100 / Спирт E85 Ethanol" },
            { label: "Линии подачи", value: "-8AN Feed / -6AN Return" },
          ],
          isCustom: true,
          fitmentLabel: "어댑터 키트 (Adapter Kit)",
          fitmentLevel: "kit",
          targetSlot: "cooling",
        };
    }
  }, [slot, resolved]);

  return (
    <div className="w-full bg-slate-950/90 border border-cyan-500/40 rounded-xl p-3.5 sm:p-4 backdrop-blur shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
      {/* HUD Header */}
      <div className="flex items-start justify-between gap-3 border-b border-cyan-900/50 pb-2.5 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30">
              CAD COMPONENT TELEMETRY // {meta.targetSlot.toUpperCase()}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                meta.fitmentLevel === "bolt-in"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : meta.fitmentLevel === "kit"
                  ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
                  : "bg-rose-950/60 border-rose-500/40 text-rose-300"
              }`}
            >
              {meta.fitmentLabel}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-2">
            <span>{meta.title}</span>
            <span className="text-xs font-mono text-cyan-400/80 font-normal">
              ({meta.hangulTitle} / {meta.englishTitle})
            </span>
          </h3>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Installed Component Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs font-mono">
        {/* Main Info */}
        <div className="lg:col-span-7 space-y-2">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Установленный компонент</div>
            <div className="text-white font-bold text-sm mt-0.5">{meta.partName}</div>
            <div className="text-[11px] text-cyan-300 mt-0.5">Производитель: {meta.maker}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px]">
            <span className="text-slate-400">Материалы и металлургия: </span>
            <span className="text-slate-200">{meta.metallurgy}</span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
          {meta.specs.map((item) => (
            <div key={item.label} className="p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
              <div className="text-[9px] text-slate-400 uppercase truncate">{item.label}</div>
              <div className="text-cyan-200 font-bold text-[11px] mt-0.5 truncate">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenDrawer(meta.targetSlot)}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Конфигурировать узел</span>
          </button>

          <button
            type="button"
            onClick={() => onResetSlot(meta.targetSlot)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить на OEM</span>
          </button>
        </div>

        {meta.targetSlot === "engine" && (
          <button
            type="button"
            onClick={onOpenAudioModal}
            className="px-3 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Звуковой Dyno-тест (Акустика ДВС)</span>
          </button>
        )}
      </div>
    </div>
  );
}
