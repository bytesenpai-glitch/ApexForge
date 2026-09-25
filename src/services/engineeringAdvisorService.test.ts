import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeBuildSynergy } from "./engineeringAdvisorService";
import { getVehicle } from "@/domain/vehicles/lookup";
import { resolveBuildParts } from "./swapService";
import { computeVehicleTelemetry } from "./telemetryService";

describe("Engineering Advisor Service", () => {
  const elantraN = getVehicle("hyundai-elantra-n-cn7")!;

  it("detects torque overload on weaker transmission", () => {
    // Equip Elantra N with a transmission that has low torque capacity (e.g. 7DCT with 250Nm)
    const slots = {
      engineId: "eng-g4kp-smartstream-25t", // 422 Nm torque
      transId: "tr-d7gf1-7dct", // 250 Nm limit
      drivelineId: null,
      mountId: null,
      coolingId: null,
      diffId: null,
      turboId: null,
      intakeId: null,
      exhaustId: null,
      brakeId: null,
      suspensionId: null,
      ecuId: null,
    };

    const resolved = resolveBuildParts(elantraN, slots);
    const telemetry = computeVehicleTelemetry(elantraN, resolved);
    const advices = analyzeBuildSynergy(elantraN, resolved, telemetry);

    const torqueAdvice = advices.find((a) => a.category === "torque");
    assert.ok(torqueAdvice, "should generate torque warning");
    assert.equal(torqueAdvice.severity, "critical");
    assert.ok(torqueAdvice.actionText?.includes("Свапнуть"));
  });

  it("detects cooling deficit when running high boost on OEM intake", () => {
    const slots = {
      engineId: null,
      transId: null,
      drivelineId: null,
      mountId: null,
      coolingId: null,
      diffId: null,
      turboId: "turbo-garrett-g30-770", // High boost turbo (+275 hp, 2.2 bar)
      intakeId: null, // OEM intake
      exhaustId: null,
      brakeId: null,
      suspensionId: null,
      ecuId: null,
    };

    const resolved = resolveBuildParts(elantraN, slots);
    const telemetry = computeVehicleTelemetry(elantraN, resolved);
    const advices = analyzeBuildSynergy(elantraN, resolved, telemetry);

    const coolingAdvice = advices.find((a) => a.category === "cooling");
    assert.ok(coolingAdvice, "should advise installing FMIC");
    assert.equal(coolingAdvice.severity, "warning");
    assert.equal(coolingAdvice.targetSlot, "intake");
  });

  it("flags stock brakes when massive power gain is detected", () => {
    const slots = {
      engineId: null,
      transId: null,
      drivelineId: null,
      mountId: null,
      coolingId: null,
      diffId: null,
      turboId: "turbo-garrett-g30-770", // +275 hp
      intakeId: "in-fmic-pro",
      exhaustId: "ex-straight-pipe",
      brakeId: null, // OEM brakes
      suspensionId: null,
      ecuId: "ecu-haltech-elite2500",
    };

    const resolved = resolveBuildParts(elantraN, slots);
    const telemetry = computeVehicleTelemetry(elantraN, resolved);
    const advices = analyzeBuildSynergy(elantraN, resolved, telemetry);

    const brakeAdvice = advices.find((a) => a.category === "brakes");
    assert.ok(brakeAdvice, "should advise Big Brake Kit upgrade");
    assert.equal(brakeAdvice.severity, "warning");
  });

  it("reports optimal balance when components are properly matched", () => {
    const slots = {
      engineId: null,
      transId: null,
      drivelineId: null,
      mountId: null,
      coolingId: null,
      diffId: null,
      turboId: null,
      intakeId: null,
      exhaustId: null,
      brakeId: null,
      suspensionId: null,
      ecuId: null,
    };

    const resolved = resolveBuildParts(elantraN, slots);
    const telemetry = computeVehicleTelemetry(elantraN, resolved);
    const advices = analyzeBuildSynergy(elantraN, resolved, telemetry);

    const optimalAdvice = advices.find((a) => a.category === "optimal");
    assert.ok(optimalAdvice, "stock Elantra N should have optimal balance");
    assert.equal(optimalAdvice.severity, "optimal");
  });
});
