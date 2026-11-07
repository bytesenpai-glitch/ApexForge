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

- [x] **Task 10: Codebase Audit & Architectural Remediation**
  - [x] Fix TypeScript errors in parts domain (`Engine` notes property, `BrandGroup` type validation).
  - [x] Eliminate catalog duplicates (Veloster N JS, BMW S65 & S85).
  - [x] Match missing bellhousings (Mitsubishi W6MAA 6MT, Toyota Gazoo RC61, AMG 722.9 7G-Tronic, Audi DL501 7-Speed, Ford Coyote MT82, GM LS T56).
  - [x] Eradicate barrel files (`src/domain/parts/index.ts`, `src/domain/vehicles/index.ts`) and dead demo file (`demo.ts`).
  - [x] Verify zero TypeScript errors (`tsc --noEmit`), 31/31 passing unit tests, and successful Turbopack production build.

- [x] **Task 11: IRL Shop Prints & Hardware BOM System**
  - [x] Create hardware types (`FastenerItem`, `ClearanceItem`, `WiringPinoutItem`, `FabricationTemplate`, `IRLSwapGuide`).
  - [x] Implement authentic engineering database (`KNOWN_SWAP_GUIDES`) with K-Miata, LS-Silvia, 2JZ-Genesis, DAZA-Golf, and dynamic fallback generator.
  - [x] Build ISO-standard 1:1 scale SVG template generator with 100mm physical calibration bar.
  - [x] Implement interactive `ShopPrintsModal.tsx` with 5 shop tabs: 1:1 CAD Prints, Fasteners BOM & Torque Specs, Clearances, Wiring Matrix, and Tools Checklist.
  - [x] Add trigger buttons in `AppHeader`, `VehicleSpecsCard`, and `BlueprintCanvas`.
  - [x] Verify 34/34 passing unit tests, zero TS errors, and Turbopack production build.

- [x] **Task 12: Build Budget (KRW ₩), Web Audio Engine Sound & 2D CAD 2.5 Enhancements**
  - [x] Expand vehicle catalog with Lancer Evo IX MR, Civic Type R EK9, GR Yaris RZ, Porsche 911 GT3 (992), BMW M3 E92 V8, Audi RS5 B8, Mercedes C63 AMG W204, Shelby GT350, Corvette C6 Z06.
  - [x] Implement Build Budget & Quotation service (`calculateBuildBudget`) with South Korean Won (`₩`) formatting and official invoice standards (`BuildBudgetModal.tsx`).
  - [x] Create procedural Web Audio Engine Synthesizer (`audioEngineService.ts`) with custom cylinder firing orders, exhaust filters, BOV flutter, and 2-step anti-lag (`EngineAudioModal.tsx`).
  - [x] Enhance 2D CAD Blueprint with exhaust system downpipe & muffler routing, 1000mm ISO scale bar, ground clearance dimensions, and driveline pinion angle.
  - [x] Verify zero TypeScript errors (`tsc --noEmit`), 36/36 passing unit tests, and successful Turbopack build.

- [x] **Task 13: Acoustic Waveguide Physical Modeling & Animated Firing Order Engine**
  - [x] Rebuild `audioEngineService.ts` with Stanford CCRMA Digital Waveguide (14.2ms delay line with phase reflection and lowpass damping), discrete combustion puff pulses, and MAF flow turbulence.
  - [x] Implement driver perspective switch: `cockpit` (in-cabin floorpan rumble & induction roar), `tailpipe` (exterior rasp & pops), `engine-bay` (valvetrain clatter & turbo whistle).
  - [x] Integrate real rotational flywheel inertia differential: neutral mode (2.0s rev-up) vs in-gear dyno load (4.5s rev-up with progressive turbo boost gauge up to 1.75 bar).
  - [x] Implement `firingOrders.ts` domain service and unit tests (47/47 tests pass).
  - [x] Implement `FiringOrderVisualizer.tsx` with live 720° crankshaft angle synchronization, bank geometry (Inline, V-Engine, Boxer), and live 4-stroke cycle phasing (Power, Exhaust, Intake, Compression).

- [x] **Task 14: 2D CAD Blueprint 3.0, Model Silhouettes & Interactive Component Inspector HUD**
  - [x] Add authentic SVG CAD vector silhouettes in `modelSilhouettes.ts` for Nissan Skyline GT-R BNR34, BMW M3 E46, Mazda RX-7 FD3S, Ford Mustang S550/Shelby, Genesis G70 3.3T Sport, Mitsubishi Evo IX, Porsche GT3 992, Corvette C6 Z06, Civic Type R EK9, Toyota GR Yaris.
  - [x] Add mechanical subassemblies in Top and Side views: Front-Mount Intercooler (FMIC) with mandrel-bent charge piping, Steering Rack & tie-rods, Front Anti-Roll Sway Bar, and Performance Fuel Cell with dual in-tank fuel pumps and -8AN PTFE braided lines.
  - [x] Implement `CadInspectorHud.tsx` interactive component inspection card showing part title, bilingual terminology, material composition (Billet 6061-T6, Inconel 718, SUS304, etc.), technical tolerances, fitment tier badge, quick configure/reset actions, and 1-click Engine Audio Dyno trigger.
  - [x] Add SVG glow reticle and node hover/active states across Top and Side CAD views.
  - [x] Verify zero TypeScript errors (`tsc --noEmit`), 47/47 passing tests, Next.js 16 Turbopack production build, and deploy to Vercel production (`https://apexforge-sigma.vercel.app`).





