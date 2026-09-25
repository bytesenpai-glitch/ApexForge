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

