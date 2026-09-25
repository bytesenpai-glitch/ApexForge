"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { useUiStore } from "@/stores/useUiStore";
import { decodeBuildFromQuery } from "@/services/shareBuildService";

function BuildHydratorInner() {
  const searchParams = useSearchParams();
  const selectVehicle = useVehicleStore((s) => s.selectVehicle);
  const loadSlots = useBuildStore((s) => s.loadSlots);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    if (!searchParams || searchParams.size === 0) return;
    const { vehicleId, slots } = decodeBuildFromQuery(searchParams);
    let hydrated = false;

    if (vehicleId) {
      selectVehicle(vehicleId);
      hydrated = true;
    }
    if (Object.keys(slots).length > 0) {
      loadSlots(slots);
      hydrated = true;
    }
    if (hydrated) {
      showToast("Конфигурация проекта успешно загружена по ссылке!");
    }
  }, [searchParams, selectVehicle, loadSlots, showToast]);

  return null;
}

export function UrlBuildHydrator() {
  return (
    <Suspense fallback={null}>
      <BuildHydratorInner />
    </Suspense>
  );
}
