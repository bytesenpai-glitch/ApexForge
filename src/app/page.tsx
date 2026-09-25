"use client";

import React from "react";
import { useUiStore } from "@/stores/useUiStore";
import { GarageView } from "@/views/GarageView";
import { BlueprintView } from "@/views/BlueprintView";
import { UrlBuildHydrator } from "@/components/layout/UrlBuildHydrator";

export default function HomePage() {
  const viewMode = useUiStore((s) => s.viewMode);

  return (
    <div className="w-full">
      <UrlBuildHydrator />
      {viewMode === "garage" ? <GarageView /> : <BlueprintView />}
    </div>
  );
}
