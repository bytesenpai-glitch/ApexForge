import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getEngine, getTransmission } from "@at-sim/parts";
import { getVehicle, listVehicles } from "./lookup.js";
import { vehicleCanSwap, vehicleSwaps } from "./catalog.js";

describe("vehicle catalog", () => {
  it("every vehicle points at real parts", () => {
    for (const vehicle of listVehicles()) {
      assert.ok(getEngine(vehicle.oem.engineId), vehicle.id);
      assert.ok(getTransmission(vehicle.oem.transmissionId), vehicle.id);
    }
  });

  it("has both kia and hyundai entries", () => {
    assert.ok(listVehicles("hyundai").length >= 10);
    assert.ok(listVehicles("kia").length >= 10);
  });

  it("Elantra N can take N 6MT as bolt-in", () => {
    const car = getVehicle("hyundai-elantra-n-cn7");
    assert.ok(car);
    const swap = vehicleCanSwap(car!, "tr-m6gf2-6mt-n");
    assert.equal(swap?.fit, "bolt-in");
  });

  it("Stinger 2.0T can take 3.3T as a documented kit/bolt-in, not impossible", () => {
    const car = getVehicle("kia-stinger-ck-20t");
    assert.ok(car);
    const swap = vehicleCanSwap(car!, "eng-g6dp-lambda-33t");
    assert.ok(swap);
    assert.notEqual(swap?.fit, "custom");
  });

  it("Rio cannot bolt-in Lambda 3.3T RWD", () => {
    const car = getVehicle("kia-rio-yb-16");
    assert.ok(car);
    const swap = vehicleCanSwap(car!, "eng-g6dp-lambda-33t");
    assert.ok(!swap || swap.fit === "custom");
  });

  it("unique vehicle ids", () => {
    const ids = listVehicles().map((v) => v.id);
    assert.equal(ids.length, new Set(ids).size);
  });

  it("swap list is non-empty", () => {
    const car = getVehicle("kia-k5-gt-dl3");
    assert.ok(car);
    assert.ok(vehicleSwaps(car!).length > 3);
  });

  it("has vehicles from all major regions (Japan, Germany, USA, Korea)", () => {
    assert.ok(listVehicles({ region: "japan" }).length >= 10);
    assert.ok(listVehicles({ region: "germany" }).length >= 8);
    assert.ok(listVehicles({ region: "usa" }).length >= 8);
    assert.ok(listVehicles({ region: "korea" }).length >= 20);
  });

  it("Miata NA can take Honda K24 as a documented cross-orientation custom swap", () => {
    const miata = getVehicle("mazda-miata-na-18");
    assert.ok(miata);
    const swap = vehicleCanSwap(miata!, "eng-k24a2-honda");
    assert.ok(swap);
    // Transverse engine into longitudinal RWD chassis is custom orientation
    assert.equal(swap?.fit, "custom");
  });

  it("Silvia S15 can take GM LS3 V8 as a documented swap", () => {
    const s15 = getVehicle("nissan-silvia-s15-spec-r");
    assert.ok(s15);
    const swap = vehicleCanSwap(s15!, "eng-ls3-gm");
    assert.ok(swap);
    assert.ok(swap?.fit === "bolt-in" || swap?.fit === "kit");
  });

  it("Golf R Mk7 can take Audi DAZA 2.5 TFSI (MQB platform bolt-in)", () => {
    const golfR = getVehicle("volkswagen-golf-r-mk7");
    assert.ok(golfR);
    const swap = vehicleCanSwap(golfR!, "eng-daza-25-tfsi-audi");
    assert.ok(swap);
    assert.equal(swap?.fit, "bolt-in");
  });
});
