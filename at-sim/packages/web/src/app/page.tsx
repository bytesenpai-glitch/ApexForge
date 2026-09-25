"use client";

import React from "react";
import { useUiStore } from "@/stores/useUiStore";
import { GarageView } from "@/views/GarageView";
import { BlueprintView } from "@/views/BlueprintView";

export default function HomePage() {
  const viewMode = useUiStore((s) => s.viewMode);

  return (
    <div className="w-full">
      {viewMode === "garage" ? <GarageView /> : <BlueprintView />}
    </div>
  );
}
