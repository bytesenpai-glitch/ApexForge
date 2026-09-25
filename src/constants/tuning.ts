import type { Fitment, Layout, PartSlotKind, Region, DriveFilter } from "@/types/tuning.types";
import type { Brand } from "@/domain/vehicles/types";

export const REGION_LIST: Array<{ id: "all" | Region; label: string; code: string }> = [
  { id: "all", label: "Все регионы (전체)", code: "ALL" },
  { id: "korea", label: "🇰🇷 Корея (한국)", code: "KR" },
  { id: "japan", label: "🇯🇵 Япония (일본 JDM)", code: "JP" },
  { id: "germany", label: "🇩🇪 Германия (독일 Euro)", code: "DE" },
  { id: "usa", label: "🇺🇸 США (미국 USDM)", code: "US" },
];

export const DRIVE_LIST: Array<{ id: DriveFilter; label: string; tag: string }> = [
  { id: "all", label: "Все типы привода", tag: "ALL" },
  { id: "rwd", label: "Задний (후륜 / RWD)", tag: "RWD" },
  { id: "awd", label: "Полный (사륜 / AWD)", tag: "AWD" },
  { id: "fwd", label: "Передний (전륜 / FWD)", tag: "FWD" },
];

export const REGION_LABELS: Record<Region, string> = {
  korea: "🇰🇷 Корея (한국 / KR)",
  japan: "🇯🇵 Япония (일본 / JDM)",
  germany: "🇩🇪 Германия (독일 / Euro)",
  usa: "🇺🇸 США (미국 / USDM)",
};

export const BRAND_LABELS: Record<Brand, string> = {
  hyundai: "현대 (Hyundai)",
  kia: "기아 (Kia)",
  toyota: "Toyota",
  lexus: "Lexus",
  nissan: "Nissan",
  honda: "Honda",
  subaru: "Subaru",
  mazda: "Mazda",
  bmw: "BMW",
  volkswagen: "Volkswagen",
  audi: "Audi",
  mercedes: "Mercedes-AMG",
  chevrolet: "Chevrolet",
  ford: "Ford",
  dodge: "Dodge",
};

export const LAYOUT_LABELS: Record<Layout, string> = {
  "transverse-fwd": "Поперечный передний (전치횡열 전륜 / FWD)",
  "transverse-awd": "Поперечный полный (전치횡열 사륜 / AWD)",
  "longitudinal-rwd": "Продольный задний (전치종열 후륜 / RWD)",
  "longitudinal-awd": "Продольный полный (전치종열 사륜 / AWD)",
};

export const FITMENT_CONFIG: Record<
  Fitment,
  { label: string; badgeClass: string; description: string }
> = {
  "bolt-in": {
    label: "Bolt-in",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    description: "Прямая совместимость (볼트온) — стоковые подушки и колокол без доработок",
  },
  kit: {
    label: "Kit",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    description: "Переходной комплект (어댑터 키트) — доступна проверенная переходная плита или кронштейны",
  },
  custom: {
    label: "Custom",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    description: "Индивидуальная подгонка (커스텀 가공) — изменение ориентации, переварка опор или тоннеля",
  },
};

export const SLOT_INFO: Record<
  PartSlotKind,
  { title: string; subtitle: string; icon: string }
> = {
  engine: {
    title: "Двигатель",
    subtitle: "엔진 (Internal Combustion Engine)",
    icon: "Gauge",
  },
  transmission: {
    title: "Коробка передач",
    subtitle: "변속기 (Transmission)",
    icon: "Cog",
  },
  driveline: {
    title: "Привод / Кардан",
    subtitle: "구동계 (Propshaft & AWD)",
    icon: "GitBranch",
  },
  mounts: {
    title: "Кронштейны и Плиты",
    subtitle: "마운트 및 어댑터 (Swap Mounts & Plates)",
    icon: "Layers",
  },
  cooling: {
    title: "Охлаждение / Масло",
    subtitle: "냉각 및 윤활 (Radiators & Dry Sump)",
    icon: "ShieldAlert",
  },
  differential: {
    title: "Дифференциал / LSD",
    subtitle: "차동장치 (Limited Slip Differential)",
    icon: "Split",
  },
  turbo: {
    title: "Турбо / Нагнетатель",
    subtitle: "과급기 (Forced Induction)",
    icon: "Zap",
  },
  intake: {
    title: "Впуск и Интеркулер",
    subtitle: "흡기 및 인터쿨러 (Cold Air Intake & FMIC)",
    icon: "Wind",
  },
  exhaust: {
    title: "Выпускная система",
    subtitle: "배기 시스템 (Performance Exhaust)",
    icon: "Flame",
  },
  brakes: {
    title: "Тормозная система",
    subtitle: "브레이크 (Big Brake Kit)",
    icon: "Disc",
  },
  suspension: {
    title: "Подвеска",
    subtitle: "서스펜션 (Coilovers & Sway Bars)",
    icon: "Activity",
  },
  ecu: {
    title: "Блок управления",
    subtitle: "엔진 제어기 (ECU Calibration)",
    icon: "Cpu",
  },
};
