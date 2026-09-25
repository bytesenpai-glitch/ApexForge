"use client";

import React from "react";
import { BlueprintCanvas } from "@/components/blueprint/BlueprintCanvas";
import { TelemetryDeck } from "@/components/telemetry/TelemetryDeck";

export function BlueprintView() {
  return (
    <div className="space-y-6">
      {/* 1. Live Telemetry & Dynamics Deck */}
      <TelemetryDeck />

      {/* 2. Interactive 2D CAD Blueprint Chassis View */}
      <BlueprintCanvas />
    </div>
  );
}
