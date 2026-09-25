import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { engines } from "./data/engines";
import { transmissions } from "./data/transmissions";
import { canSwap, getEngine, listParts, listSwaps } from "./swap";
import type { ChassisFitment } from "./types";

const elantraN: ChassisFitment = {
  id: "hyundai-elantra-n-cn7",
  layout: "transverse-fwd",
  engineMountFamilies: ["theta-transverse-n", "theta-transverse"],
  transMountFamilies: ["dct-n-fwd", "mt-n-fwd"],
  swapTags: ["i4-n-fwd", "i4-transverse-mid"],
  oemEngineId: "eng-g4kh-theta-20t",
  oemTransmissionId: "tr-d8lf1-8dct",
  oemDrivelineIds: ["dl-n-el-lsd"],
};

describe("parts catalog", () => {
  it("has unique part ids", () => {
    const ids = listParts().map((part) => part.id);
    assert.equal(ids.length, new Set(ids).size);
  });

  it("lists bolt-in OEM engine for Elantra N", () => {
    const oem = canSwap(elantraN, "eng-g4kh-theta-20t");
    assert.equal(oem?.fit, "bolt-in");
  });

  it("allows Smartstream 2.5T as a kit swap into N chassis", () => {
    const swap = canSwap(elantraN, "eng-g4kp-smartstream-25t");
    assert.ok(swap);
    assert.notEqual(swap?.fit, "custom");
  });

  it("does not treat Stinger 3.3T as bolt-in on FWD N", () => {
    const swap = canSwap(elantraN, "eng-g6dp-lambda-33t");
    assert.ok(!swap || swap.fit === "custom");
  });

  it("flags 7DCT as too weak for Theta 2.0T", () => {
    const matches = listSwaps(elantraN).filter((m) => m.part.id === "tr-d7gf1-7dct");
    if (matches.length) {
      assert.ok(matches[0].reasons.some((r) => r.includes("torque") || r.includes("bellhousing")));
    }
  });

  it("every engine has a matching bellhousing gearbox", () => {
    for (const engine of engines) {
      const pair = transmissions.some((tr) => tr.bellhousings.includes(engine.bellhousing));
      assert.ok(pair, `no gearbox for ${engine.id} bellhousing ${engine.bellhousing}`);
    }
  });

  it("resolves engines by id", () => {
    assert.equal(getEngine("eng-g4kh-theta-20t")?.code, "G4KH");
  });

  it("does not treat OEM transmission as bolt-in if engine override is incompatible", () => {
    // If we override Elantra N engine with Lambda 3.8 V6 (hk-v6-lambda bellhousing),
    // OEM D8LF1 (hk-i4-theta bellhousing) should NOT be bolt-in
    const matches = listSwaps(elantraN, "eng-g6dm-lambda-38").filter(
      (m) => m.part.id === "tr-d8lf1-8dct",
    );
    assert.ok(matches.length > 0);
    assert.notEqual(matches[0].fit, "bolt-in");
    assert.ok(matches[0].reasons.some((r) => r.includes("bellhousing")));
  });

  it("G4FG is recognized as Gamma II with matching gearbox", () => {
    const g4fg = getEngine("eng-g4fg-nu-16");
    assert.equal(g4fg?.family, "Gamma II");
    assert.equal(g4fg?.bellhousing, "hk-i4-gamma");
  });
});
