"use client";

import React from "react";
import { useUiStore } from "@/stores/useUiStore";
import { GarageView } from "@/views/GarageView";
import { BlueprintView } from "@/views/BlueprintView";
import { UrlBuildHydrator } from "@/components/layout/UrlBuildHydrator";
import { GarageModal } from "@/components/garage/GarageModal";

export default function HomePage() {
  const viewMode = useUiStore((s) => s.viewMode);

  return (
    <div className="w-full">
      <UrlBuildHydrator />
      <GarageModal />
      {viewMode === "garage" ? <GarageView /> : <BlueprintView />}
    </div>
  );
}
