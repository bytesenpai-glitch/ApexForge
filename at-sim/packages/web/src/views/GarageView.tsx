"use client";

import React from "react";
import { VehicleSelector } from "@/components/garage/VehicleSelector";
import { VehicleSpecsCard } from "@/components/garage/VehicleSpecsCard";
import { TelemetryDeck } from "@/components/telemetry/TelemetryDeck";
import { PartsConfiguratorTabs } from "@/components/garage/PartsConfiguratorTabs";

export function GarageView() {
  return (
    <div className="space-y-6">
      {/* 1. Vehicle Selector & Filters */}
      <VehicleSelector />

      {/* 2. Loaded Vehicle Overview Card */}
      <VehicleSpecsCard />

      {/* 3. Live Telemetry & Dynamics Deck */}
      <TelemetryDeck />

      {/* 4. Modular Swap Tabs Configurator */}
      <PartsConfiguratorTabs />
    </div>
  );
}
