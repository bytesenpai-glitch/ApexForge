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

export type DisciplineFilter = "all" | "street" | "circuit" | "drift" | "drag";

export const DISCIPLINE_FILTERS: Array<{
  id: DisciplineFilter;
  label: string;
  korean: string;
  desc: string;
}> = [
  { id: "all", label: "Все детали", korean: "전체 (All)", desc: "Полный каталог совместимых компонентов" },
  { id: "street", label: "Стрит / Дейли", korean: "스트리트 (Street)", desc: "Надёжность, быстрый спул и комфортный отклик" },
  { id: "circuit", label: "Трек / Кольцо", korean: "트랙/서킷 (Circuit)", desc: "Максимальный держак, термостойкость и баланс" },
  { id: "drift", label: "Дрифт Спек", korean: "드리프트 (Drift)", desc: "Широкая полка момента, 2-Way блокировка и выворот" },
  { id: "drag", label: "Драг / High-Boost", korean: "드래그 (Drag 402m)", desc: "Максимальная пиковая мощность и прочность трансмиссии" },
];

export interface FitmentMeta {
  label: string;
  koreanLabel: string;
  difficultyBadge: string;
  badgeClass: string;
  description: string;
  requirements: string;
  fabricationRisk: "none" | "medium" | "high";
}

export const FITMENT_CONFIG: Record<Fitment, FitmentMeta> = {
  "bolt-in": {
    label: "Bolt-in (Болт-он)",
    koreanLabel: "볼트온 (Bolt-in)",
    difficultyBadge: "Сложность 1/5 · Заводской крепеж",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    description: "Прямая болт-он установка: заводские опоры, штатный колокол КПП и проводка без сварки и резки",
    requirements: "Стандартный гаражный набор ключей, заводские разъемы без доработки проводки",
    fabricationRisk: "none",
  },
  kit: {
    label: "Kit Swap (Нужна доработка)",
    koreanLabel: "스왑 키트 (Kit Swap)",
    difficultyBadge: "Сложность 3/5 · Требуется адаптер-кит",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    description: "Требуется переходной комплект: плита колокола КПП (스왑 어댑터 플레이트), кастомные подушки ДВС или переходная коса ЭБУ",
    requirements: "Переходная плита колокола, усиленные кронштейны, удлинитель кулисы КПП",
    fabricationRisk: "medium",
  },
  custom: {
    label: "Custom (Полный кастом)",
    koreanLabel: "커스텀 가공 (Full Custom)",
    difficultyBadge: "Сложность 5/5 · Полная подгонка кузова",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    description: "Глубокая кастомная инженерия: резка тоннеля пола (변속기 터널 절단), кастомный подрамник, укорачивание кардана и перенос узлов",
    requirements: "Сварочные работы (TIG/MIG), резка тоннеля, изготовление балансированного карданного вала",
    fabricationRisk: "high",
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
