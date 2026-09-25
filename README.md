# Apex Forge

<div align="center">

```
   ___    ____  _______  __   __________  ____  ____________
  /   |  / __ \/ ____/ |/ /  / ____/ __ \/ __ \/ ____/ ____/
 / /| | / /_/ / __/  |   /  / /_  / / / / /_/ / / __/ __/   
/ ___ |/ ____/ /___ /   |  / __/ / /_/ / _, _/ /_/ / /___   
/_/  |_/_/   /_____//_/|_| /_/    \____/_/ |_|\____/_____/   
```

### «BUILT, NOT BOUGHT»

**«Apex Forge — The Local-First Modding Canvas for Track & Street Builds»**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Zustand v5](https://img.shields.io/badge/Zustand-v5-orange?style=for-the-badge)](https://zustand.docs.pmnd.rs/)
[![Local First](https://img.shields.io/badge/Architecture-Local--First-emerald?style=for-the-badge)](https://localfirstweb.dev/)

</div>

---

## ⚡ О проекте (Manifesto)

**Apex Forge** — локальный высокоточный симулятор свапа двигателей, трансмиссий, узлов шасси и расчёта физической телеметрии для трековых и уличных проектов. Создан для энтузиастов и инженеров, ценящих инженерную точность, а не поверхностные сборки.

> **«BUILT, NOT BOUGHT»** — философия Apex Forge. Каждый узел, каждый болт-он и свап анализируются с точки зрения реальной физической совместимости, запаса прочности по крутящему моменту (Torque Headroom) и влияния на динамику автомобиля.

---

## 🛠️ Ключевые возможности

### 1. 📐 Интерактивный 2D CAD Чертёж шасси (2D Blueprint Canvas)
- Пропорциональный векторный чертёж кузова с привязкой к реальной базе (Wheelbase) и колее (Front Track).
- Интерактивные SVG-хотспоты для всех 9 ключевых узлов:
  - **ДВС (엔진 / Engine)**: 2–8 цил., поперечное и продольное расположение, атмосферные и наддувные.
  - **КПП (변속기 / Transmission)**: MT, AT, DCT, IVT с контролем предельного крутящего момента.
  - **Гудонная часть (구동계 / Driveline)**: открытые, блокировки LSD (1-way, 1.5-way, 2-way, e-LSD) и полный привод AWD.
  - **Наддув (과급기 / Forced Induction)**: Single-Turbo, Twin-Scroll, Twin-Turbo, Supercharger.
  - **Впуск (흡기 / Cold Air Intake & FMIC)**: фильтры нулевого сопротивления и интеркулеры.
  - **Выпуск (배기 시스템 / Performance Exhaust)**: Downpipe, Cat-back, титановые трассы, отстрелы (Burble/Pops).
  - **Тормоза (브레이크 / Big Brake Kit)**: 4/6-поршневые моноблоки с расчётом тормозного пути 100-0 км/ч.
  - **Подвеска (서스펜션 / Coilovers)**: регулируемые койловеры с занижением и боковой перегрузкой.
  - **ЭБУ (엔진 제어기 / ECU Tuning)**: Stage 1/2/3, Standalone блоки (MoTeC, Haltech).

### 2. ⚡ Быстрый Slide-over Drawer для моментального свапа
- Фильтрация по уровням заводской и кастомной совместимости:
  - `Bolt-in` (볼트온) — прямая посадка на заводские подушки и родной колокол.
  - `Kit` (어댑터 키트) — совместимость через доступную переходную плиту или кастомные опоры.
  - `Custom` (커с텀 가공) — изменение ориентации, доработка моторного щита и тоннеля.

### 3. 🏁 Расчёт физической телеметрии в реальном времени
- **0–100 км/ч** с учётом типа привода (FWD, RWD, AWD) и потерь сцепления шин.
- **100–200 км/ч** и расчёт прохождения **1/4 мили (402 м)** со скоростью на выходе (Trap Speed).
- **Удельная мощность** (л.с./т / Power-to-weight ratio).
- **Защита КПП от перегрузки (Over-Torque Warning)**: визуальное оповещение о дефиците прочности коробки передач при превышении допустимого момента свапнутого мотора.

### 4. 🌏 Мульти-региональный каталог платформ
- **🇰🇷 Южная Корея (한국)**: Hyundai (Stinger, Elantra N, Genesis Coupe, i30 N), Kia (K5, EV6, Cerato).
- **🇯🇵 Япония (JDM)**: Toyota (Supra A80), Nissan (Skyline GT-R BNR34, Silvia S15), Mazda (RX-7 FD3S).
- **🇩🇪 Германия (Euro)**: BMW (M3 E46), Volkswagen (Golf R Mk7), Audi (RS3 8V).
- **🇺🇸 США (USDM)**: Chevrolet (Corvette C6), Ford (Mustang GT).

---

## 🏛️ Архитектура Clean Architecture

```
src/
├── types/              # Domain leaf interfaces (строгая типизация, 0 any)
├── constants/          # Константы платформ, региональные метки, компоновки
├── services/           # Чистые доменные алгоритмы:
│   ├── telemetryService.ts       # Физика ускорения, торможения и перегрузок
│   ├── swapService.ts            # Оценка совместимости узлов (bolt-in, kit, custom)
│   └── catalogFilterService.ts   # Многокритериальная фильтрация и сортировка
├── stores/             # Реактивные хранилища Zustand v5:
│   ├── useVehicleStore.ts        # Выбор автомобиля, фильтры региона и привода
│   ├── useBuildStore.ts          # Активная конфигурация установленных узлов
│   └── useUiStore.ts             # Режимы отображения (Garage vs CAD Blueprint)
├── components/         # Модульные презентационные компоненты (Tailwind v4 + Lucide):
│   ├── layout/AppHeader.tsx      # Верхняя панель, статус и слоган
│   ├── blueprint/                # 2D CAD Чертёж и хотспоты
│   ├── drawer/                   # Slide-over панель поиска и свапа деталей
│   ├── garage/                   # Селектор авто, карточка спецификаций, вкладки
│   └── telemetry/                # Инженерный дашборд динамических показателей
├── views/              # Верхнеуровневые экраны (GarageView, BlueprintView)
└── app/                # Next.js 16 App Router (layout.tsx, page.tsx, globals.css)
```

---

## 🚀 Быстрый запуск

Приложение работает **100% локально** в браузере, не требует внешних баз данных или сторонних облачных API:

```bash
# Клонирование репозитория
git clone https://github.com/bytesenpai-glitch/ApexForge.git
cd ApexForge

# Установка зависимостей
npm install

# Запуск локального сервера разработки
npm run dev

# Сборка оптимизированного продакшен-бандла
npm run build

# Запуск тестов совместимости узлов и каталогов
npm test
```

---

## 📜 Лицензия

MIT License © 2026 Apex Forge Team. **BUILT, NOT BOUGHT.**
