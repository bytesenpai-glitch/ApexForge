import test from "node:test";
import assert from "node:assert/strict";
import { engineAudio } from "./audioEngineService";

test("Audio Engine Service", async (t) => {
  await t.test("initializes with default safe state in Node environment", () => {
    const status = engineAudio.getStatus();
    assert.equal(status.isRunning, false);
    assert.equal(status.rpm, 850);
    assert.equal(status.throttle, 0);
    assert.equal(status.isChopIdle, false);
  });

  await t.test("accepts engine configuration updates without crashing", () => {
    engineAudio.setConfig({
      cylinders: 8,
      cylinderLayout: "v-engine",
      redlineRpm: 8250,
      exhaustType: "straight-pipe",
      hasTurbo: false,
      engineCode: "eng-voodoo-ford",
      family: "voodoo",
    });

    const status = engineAudio.getStatus();
    assert.equal(status.rpm, 850);
  });

  await t.test("allows setting throttle, exhaust presets, and chop idle", () => {
    engineAudio.setThrottle(0.75);
    engineAudio.setExhaustPreset("valvetronic");
    engineAudio.setChopIdle(true);

    const status = engineAudio.getStatus();
    assert.equal(status.throttle, 0.75);
    assert.equal(status.exhaustPreset, "valvetronic");
    assert.equal(status.isChopIdle, true);
  });

  await t.test("handles triggerBov and triggerPopAndBang safely without DOM AudioContext in Node", () => {
    assert.doesNotThrow(() => {
      engineAudio.triggerBov();
      engineAudio.triggerPopAndBang();
    });
  });
});
