import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateBuildTelemetry,
  getBrake,
  getEcu,
  getEngine,
  getExhaust,
  getIntake,
  getTransmission,
  getTurbo,
  listBrakes,
  listEcus,
  listExhausts,
  listIntakes,
  listParts,
  listSuspensions,
  listTurbos,
} from "./index";

describe("Bolt-on parts & Modular Tuning Engine", () => {
  it("loads all new bolt-on categories into registry", () => {
    const all = listParts();
    assert.ok(all.length > 60);

    assert.ok(listTurbos().length >= 8);
    assert.ok(listIntakes().length >= 5);
    assert.ok(listExhausts().length >= 5);
    assert.ok(listBrakes().length >= 5);
    assert.ok(listSuspensions().length >= 5);
    assert.ok(listEcus().length >= 5);
  });

  it("retrieves individual bolt-on components by ID", () => {
    const turbo = getTurbo("turbo-garrett-g30-770");
    assert.ok(turbo);
    assert.equal(turbo?.maker, "Garrett Motion");
    assert.equal(turbo?.boostBar, 2.2);

    const exhaust = getExhaust("exhaust-tomei-titanium");
    assert.ok(exhaust);
    assert.equal(exhaust?.hasBurble, true);
    assert.ok((exhaust?.weightDeltaKg ?? 0) < 0);

    const brake = getBrake("brake-carbon-ceramic-ccb");
    assert.ok(brake);
    assert.equal(brake?.fadeResistance, "endurance");
    assert.equal(brake?.rotorDiameterMm, 400);

    const ecu = getEcu("ecu-stage2-burble");
    assert.ok(ecu);
    assert.ok(ecu?.features.includes("anti-lag"));
  });

  it("calculates realistic performance telemetry and warns on gearbox overload", () => {
    const engine2jz = getEngine("eng-2jz-gte-toyota")!;
    const transCd009 = getTransmission("tr-cd009-6mt-nissan")!; // torqueCapacity 600 Nm
    const turboG30 = getTurbo("turbo-garrett-g30-770")!; // +275 hp, +300 Nm
    const exhaustTomei = getExhaust("exhaust-tomei-titanium")!; // +38 hp, +44 Nm
    const intakeWagner = getIntake("intake-fmic-wagner")!; // +36 hp, +46 Nm
    const ecuStage2 = getEcu("ecu-stage2-burble")!; // 1.24x multiplier
    const brakeBrembo = getBrake("brake-brembo-gt-6pot")!;

    const telemetry = calculateBuildTelemetry({
      engine: engine2jz,
      transmission: transCd009,
      layout: "longitudinal-rwd",
      curbWeightKg: 1560,
      turbo: turboG30,
      exhaust: exhaustTomei,
      intake: intakeWagner,
      ecu: ecuStage2,
      brakes: brakeBrembo,
    });

    // Stock 2JZ: 330 hp, 451 Nm
    // With G30 + Tomei + Wagner + Stage2: ~840 hp, ~1040 Nm
    assert.ok(telemetry.totalPowerHp > 800);
    assert.ok(telemetry.totalTorqueNm > 1000);

    // W58 (400 Nm) must be severely overloaded!
    assert.equal(telemetry.isGearboxOverloaded, true);
    assert.ok(telemetry.torqueSafetyMarginNm < 0);

    // 0-100 km/h acceleration should be blisteringly fast
    assert.ok(telemetry.accel0to100Sec < 3.8);
    assert.ok(telemetry.accel0to100Sec >= 2.1);

    // Brembo BBK stopping distance should be under 36 meters
    assert.ok(telemetry.brake100to0M < 36.0);
    assert.equal(telemetry.hasBurble, true);
    assert.ok(telemetry.soundDb > 100);
  });
});
