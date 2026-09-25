import assert from "node:assert";
import { describe, it } from "node:test";
import { CURATED_PRESETS } from "./curatedPresets";
import { getVehicle } from "../vehicles/lookup";
import { getPart } from "../parts/swap";

describe("Curated Pro Presets Catalog", () => {
  it("contains at least 8 legendary authentic presets", () => {
    assert.ok(CURATED_PRESETS.length >= 8);
  });

  it("every preset has unique id and valid metadata", () => {
    const ids = new Set<string>();
    for (const preset of CURATED_PRESETS) {
      assert.ok(!ids.has(preset.id), `Duplicate preset id: ${preset.id}`);
      ids.add(preset.id);
      assert.ok(preset.name.length > 0);
      assert.ok(preset.koreanName.length > 0);
      assert.ok(preset.highlights.length >= 3);
      assert.ok(preset.specsEstimate.powerHp > 100);
      assert.ok(preset.specsEstimate.torqueNm > 100);
    }
  });

  it("every preset points to a valid vehicle in the vehicle catalog", () => {
    for (const preset of CURATED_PRESETS) {
      const car = getVehicle(preset.vehicleId);
      assert.ok(car, `Vehicle not found: ${preset.vehicleId} for preset ${preset.id}`);
    }
  });

  it("every slot item in presets resolves to a recognized engine, transmission, or bolt-on", () => {
    for (const preset of CURATED_PRESETS) {
      const slots = preset.slots;
      if (slots.engineId) {
        const eng = getPart(slots.engineId);
        assert.ok(eng, `Engine not found: ${slots.engineId} in preset ${preset.id}`);
      }
      if (slots.transId) {
        const trans = getPart(slots.transId);
        assert.ok(trans, `Transmission not found: ${slots.transId} in preset ${preset.id}`);
      }
      if (slots.diffId) {
        const diff = getPart(slots.diffId);
        assert.ok(diff, `Diff not found: ${slots.diffId} in preset ${preset.id}`);
      }
      if (slots.turboId) {
        const turbo = getPart(slots.turboId);
        assert.ok(turbo, `Turbo not found: ${slots.turboId} in preset ${preset.id}`);
      }
      if (slots.intakeId) {
        const intake = getPart(slots.intakeId);
        assert.ok(intake, `Intake not found: ${slots.intakeId} in preset ${preset.id}`);
      }
      if (slots.exhaustId) {
        const exhaust = getPart(slots.exhaustId);
        assert.ok(exhaust, `Exhaust not found: ${slots.exhaustId} in preset ${preset.id}`);
      }
      if (slots.brakeId) {
        const brake = getPart(slots.brakeId);
        assert.ok(brake, `Brakes not found: ${slots.brakeId} in preset ${preset.id}`);
      }
      if (slots.suspensionId) {
        const susp = getPart(slots.suspensionId);
        assert.ok(susp, `Suspension not found: ${slots.suspensionId} in preset ${preset.id}`);
      }
      if (slots.ecuId) {
        const ecu = getPart(slots.ecuId);
        assert.ok(ecu, `ECU not found: ${slots.ecuId} in preset ${preset.id}`);
      }
      if (slots.mountId) {
        const mount = getPart(slots.mountId);
        assert.ok(mount, `Mount not found: ${slots.mountId} in preset ${preset.id}`);
      }
      if (slots.coolingId) {
        const cooling = getPart(slots.coolingId);
        assert.ok(cooling, `Cooling not found: ${slots.coolingId} in preset ${preset.id}`);
      }
    }
  });
});
