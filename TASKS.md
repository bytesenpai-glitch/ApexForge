# Apex Forge — Implementation & Deployment Tasks (TASKS.md)

- [x] **Task 1: Core Architecture & Workspace Initialization**
  - [x] Create `AGENTS.md` and `ARCHITECTURE.md` baseline files.
  - [x] Install Next.js 16, Zustand v5, Lucide Icons, Tailwind CSS v4, and utility packages.

- [x] **Task 2: Build Clean Architecture Layers (Services, Stores, Constants & Types)**
  - [x] Create `src/types/tuning.types.ts` for clean leaf domain models.
  - [x] Create `src/constants/tuning.ts` for brand, region, layout, and fitment constants.
  - [x] Implement `src/services/telemetryService.ts` for physics and acceleration metrics.
  - [x] Implement `src/services/swapService.ts` for node compatibility scoring.
  - [x] Implement `src/services/catalogFilterService.ts` for vehicles and parts filtering/sorting.
  - [x] Create Zustand v5 stores: `useVehicleStore.ts`, `useBuildStore.ts`, `useUiStore.ts`.

- [x] **Task 3: Implement Modular UI Components (Tailwind & Lucide)**
  - [x] Create `src/components/layout/AppHeader.tsx` and toast notification system.
  - [x] Create `src/components/telemetry/TelemetryDeck.tsx` with live physics metrics and torque overload alert.
  - [x] Create `src/components/blueprint/BlueprintCanvas.tsx` with interactive 2D CAD SVG chassis and node hotspots.
  - [x] Create `src/components/drawer/NodeSwapDrawer.tsx` with search, fitment pills, and 1-click swap.
  - [x] Create `src/components/garage/VehicleSelector.tsx`, `VehicleSpecsCard.tsx`, and `PartsConfiguratorTabs.tsx`.

- [x] **Task 4: Next.js 16 App Router Entry & View Composition**
  - [x] Configure `next.config.ts`, `postcss.config.mjs`, and Tailwind CSS v4 in `src/app/globals.css`.
  - [x] Implement `src/app/layout.tsx` and `src/app/page.tsx` integrating Garage and Blueprint views.
  - [x] Update `package.json` scripts to run Next.js App Router (`next dev`, `next build`).

- [x] **Task 5: Verification & Production Purity**
  - [x] Verify zero TypeScript errors (`tsc --noEmit`).
  - [x] Verify production build compilation (`npm run build`).
  - [x] Eradicate legacy dead code (`App.tsx`, `styles.css`, `main.tsx`) and ensure zero barrel files.

- [x] **Task 6: Rebranding, Root Architecture Promotion & Vercel Automated Deploy**
  - [x] Rebrand to Apex Forge («BUILT, NOT BOUGHT» — «Apex Forge — The Local-First Modding Canvas for Track & Street Builds»).
  - [x] Push to GitHub `bytesenpai-glitch/ApexForge`.
  - [x] Promote Next.js 16 App Router directly to root, eliminating monorepo prefix build failures on Vercel.
  - [x] Strip legacy `.js` extensions in relative domain imports for Next.js 16 Turbopack compiler.
  - [x] Add root `vercel.json` and configure production deployment pipeline.

- [x] **Task 7: Swap Parts Catalog & Hardware Expansion**
  - [x] Add new iconic engines (K24A2, 2JZ-GTE, VR38DETT, S85 V10, 20B Rotary, LT4 V8, DAZA 2.5T, Porsche 4.0L Flat-6).
  - [x] Implement swap hardware: CNC bellhousing adapter plates, tubular swap subframes, polyurethane/billet motor mounts (`mounts.ts`).
  - [x] Add sequential gearboxes (Samsonas 6-Speed, Quaife QBE69G), Porsche PDK 7-Speed, and clutch-pack LSDs (Cusco 1.5/2-Way, OS Giken Super Lock, Wavetrac, Winters quick-change) (`differentials.ts`).
  - [x] Expand cooling and lubrication: race triple-core radiators, dual Setrab oil coolers, Peterson dry-sump systems (`cooling.ts`).
  - [x] Update `swapService.ts` compatibility scoring and fitment logic.

- [x] **Task 8: 2D CAD Blueprint 2.0 (Multi-Layer Engine & Dimensions)**
  - [x] Implement dynamic vehicle dimensions (Wheelbase, Track Width) scaling in SVG with ISO-standard dimension arrows.
  - [x] Add real-scale engine block visualizer matching cylinder layout (Inline-4/6, V6/V8/V10 angled banks, Boxer Flat-6, and Rotary trochoid chambers).
  - [x] Build multi-layer CAD toggle bar (Chassis, Powertrain, Cooling, Drivetrain, Suspension, Brakes, Plumbing, Dimensions).
  - [x] Add real-time Center of Gravity (CG) target reticle and dynamic F/R weight balance calculation (`% F:R`).
  - [x] Add visual modes (Dark CAD, Classic Technical Blueprint, Torque Stress Heatmap).

- [x] **Task 9: SingularityFleet UI/UX Design System & Navigation**
  - [x] Build sticky `h-14` glassmorphism topbar (`bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80`).
  - [x] Add `⌘K` / `Ctrl+K` keyboard shortcut listener for rapid swap drawer access.
  - [x] Integrate view mode pills (Garage vs CAD Blueprint) with active indicator glow.
  - [x] Add vehicle status pill with active engine, transmission, power, and layout tags.
  - [x] Add pulsating green `LOCAL-FIRST` status indicator badge.

