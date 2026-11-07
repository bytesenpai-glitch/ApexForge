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

      {/* 2-Column Responsive Cockpit Workstation (Zero Page-Scroll Sprawl) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Column: Live Vehicle Specs, Dynamic Telemetry, and Engineering Advisor */}
        <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-16">
          <VehicleSpecsCard />
          <TelemetryDeck />
          <EngineeringAdvisor />
        </div>

        {/* Right Column: Modular Swap Tabs Configurator with Compact Internal Scroll */}
        <div className="xl:col-span-7 space-y-4">
          <PartsConfiguratorTabs />
        </div>
      </div>
    </div>
  );
}
