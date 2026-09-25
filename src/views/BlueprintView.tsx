"use client";

import React from "react";
import { BlueprintCanvas } from "@/components/blueprint/BlueprintCanvas";
import { TelemetryDeck } from "@/components/telemetry/TelemetryDeck";
import { EngineeringAdvisor } from "@/components/telemetry/EngineeringAdvisor";

export function BlueprintView() {
  return (
    <div className="space-y-4">
      {/* 1. Live Telemetry & Dynamics Deck */}
      <TelemetryDeck />

      {/* 2. Smart Interactive Engineering Advisor */}
      <EngineeringAdvisor />

      {/* 3. Interactive 2D CAD Blueprint Chassis View */}
      <BlueprintCanvas />
    </div>
  );
}
