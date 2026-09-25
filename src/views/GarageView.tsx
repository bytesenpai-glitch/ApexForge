"use client";

import React from "react";
import { VehicleSelector } from "@/components/garage/VehicleSelector";
import { VehicleSpecsCard } from "@/components/garage/VehicleSpecsCard";
import { TelemetryDeck } from "@/components/telemetry/TelemetryDeck";
import { EngineeringAdvisor } from "@/components/telemetry/EngineeringAdvisor";
import { PartsConfiguratorTabs } from "@/components/garage/PartsConfiguratorTabs";

export function GarageView() {
  return (
    <div className="space-y-4">
      {/* 1. Vehicle Selector & Region/Brand Filters */}
      <VehicleSelector />

      {/* 2. Loaded Vehicle Overview Card */}
      <VehicleSpecsCard />

      {/* 3. Live Telemetry & Dynamics Deck */}
      <TelemetryDeck />

      {/* 4. Smart Interactive Engineering Advisor */}
      <EngineeringAdvisor />

      {/* 5. Modular Swap Tabs Configurator with Compact Internal Scroll */}
      <PartsConfiguratorTabs />
    </div>
  );
}
