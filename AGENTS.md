# Apex Forge — System Invariants & Domain Dictionary (AGENTS.md)

> **Slogan**: «BUILT, NOT BOUGHT»  
> **Manifesto**: «Apex Forge — The Local-First Modding Canvas for Track & Street Builds»

## 1. Project Context & Architectural Foundation
- **Product**: **Apex Forge** — High-precision automotive tuning, modular engine swap compatibility matrix, 2D CAD blueprint visualizer, and live physics telemetry simulator for South Korean (현대/기아 / Hyundai & Kia), JDM, Euro, and USDM platforms.
- **Core Architecture Source**: `C:\Users\bytes\singularity-fleet-core` architectural core.
- **Stack**: Next.js 16+ (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Lucide Icons (`lucide-react`), Zustand v5 reactive stores.
- **Clean Architecture Boundaries**: Dependencies flow strictly unidirectional: `types` -> `services` -> `stores` -> `components/views`. Zero cyclic dependencies, zero barrel files (`index.ts` / `index.tsx` forbidden).

## 2. Automotive & Korean Logistics/Engineering Domain Standards
- **Component Nodes & Terminology**:
  - Двигатель (엔진 / Internal Combustion Engine): displacement, cylinders, valvetrain, aspiration (`na`, `turbo`, `twin-turbo`, `supercharged`).
  - Коробка передач (변속기 / Transmission): manual, automatic, DCT, sequential, IVT; gear ratios and torque limits (허용 토크 / Torque Capacity).
  - Гудонная часть (구동계 / Driveline): open differential, mechanical LSD, electronic LSD, transfer case, AWD coupling.
  - Наддув (과급기 / Forced Induction): single turbo, twin-scroll, twin-turbo, supercharger kits.
  - Впуск (흡기 / Cold Air Intake & Intercooler): high-flow intake, front mount intercooler (FMIC).
  - Выпуск (배기 시스템 / Performance Exhaust): high-flow downpipe, valvetronic cat-back, headers.
  - Тормоза (브레이크 시스템 / Big Brake Kit): 4/6-piston monoblock calipers, two-piece slotted rotors.
  - Подвеска (서스펜션 / Coilovers): mono-tube adjustable coilovers, polyurethane bushings.
  - ЭБУ (엔진 제어기 / Engine Control Unit): Stage 1/2/3 ECU remap, standalone ECU (모텍 / MoTeC, 할텍 / Haltech).
- **Fitment Classification (장착 호환성 / Fitment)**:
  - `bolt-in` (볼트온 / Bolt-in): Identical engine mounts, bellhousing bolt patterns, and OEM clearance.
  - `kit` (어댑터 키트 / Adapter Kit): Validated aftermarket adapter plate, custom engine mounts, or wiring patch harness.
  - `custom` (커스텀 가공 / Custom Fabrication): Orientation mismatch, firewall modification, custom driveshaft, or tunnel enlargement.
- **Chassis Layouts (구동 배치가이드 / Drivetrain Layouts)**:
  - `transverse-fwd` (전륜구동 전치횡열 / Transverse FWD)
  - `transverse-awd` (사륜구동 전치횡열 / Transverse AWD)
  - `longitudinal-rwd` (후륜구동 전치종열 / Longitudinal RWD)
  - `longitudinal-awd` (사륜구동 전치종열 / Longitudinal AWD)

## 3. Clean Architecture & Code Invariants
- **Unidirectional Layer Flow**:
  1. `types/`: Pure TypeScript interfaces without external dependencies or circular references.
  2. `services/`: Domain algorithms (telemetry calculation, swap fitment scoring, filter/sort pipelines).
  3. `stores/`: Zustand v5 state stores (`useVehicleStore`, `useBuildStore`, `useUiStore`).
  4. `components/`: Modular presentation components consuming store hooks. No direct heavy business calculations in JSX.
- **Zero Barrel Files**: Index re-export files (`index.ts` / `index.tsx`) are permanently forbidden. All imports must be direct point-to-point paths to the target file.
- **Strict Typing**: STRICTLY NO `any`. Use `import type` for all type imports.
- **Styling**: Tailwind CSS only (STRICTLY NO inline `style={{ ... }}`).
- **React 19 Safe Hook Ordering**: All hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, store selectors) must execute unconditionally at the top of the component before any early returns.
- **Zero Cascading Renders**: Wrap non-immediate state synchronizations in `queueMicrotask` to avoid render cycles.
- **Production Purity**: NO `console.log` statements in production code.

## 4. Verification Protocol
- Prior to completing any step:
  1. `npm run type-check` or `tsc --noEmit` must return 0 errors.
  2. Build compilation must succeed without warnings.
  3. Update `TASKS.md` with verified checklist items.
