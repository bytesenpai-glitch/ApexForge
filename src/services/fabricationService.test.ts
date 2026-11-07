import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getVehicle } from "@/domain/vehicles/lookup";
import { resolveBuildParts } from "@/services/swapService";
import { getIRLSwapGuide, generateSvgTemplateXml } from "./fabricationService";

describe("Fabrication & IRL Build Service", () => {
  it("resolves authentic K-Miata swap guide with exact fasteners and clearances", () => {
    const miata = getVehicle("mazda-miata-na-18");
    assert.ok(miata);

    const resolved = resolveBuildParts(miata!, {
      engineId: "eng-k24a2-honda",
      transId: "tr-miata-6mt-mazda",
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
    });

    const guide = getIRLSwapGuide(miata!, resolved);

    assert.equal(guide.engineId, "eng-k24a2-honda");
    assert.equal(guide.oilPanOrientation, "rear-sump");
    assert.ok(guide.fasteners.length >= 4);
    assert.ok(guide.fasteners.some((f) => f.grade === "10.9"));
    assert.ok(guide.clearances.some((c) => c.area === "subframe"));
    assert.ok(guide.wiring.some((w) => w.functionName.includes("зажигания") || w.functionName.includes("Ignition")));
    assert.ok(guide.templates.length >= 1);
  });

  it("generates 1:1 scale SVG blueprint with physical calibration bar", () => {
    const miata = getVehicle("mazda-miata-na-18");
    assert.ok(miata);

    const resolved = resolveBuildParts(miata!, {
      engineId: "eng-k24a2-honda",
      transId: "tr-miata-6mt-mazda",
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
    });

    const guide = getIRLSwapGuide(miata!, resolved);
    const tmpl = guide.templates[0];
    const svg = generateSvgTemplateXml(tmpl);

    assert.ok(svg.includes("<?xml version=\"1.0\""));
    assert.ok(svg.includes("1:1 SCALE VERIFICATION BAR (100mm)"));
    assert.ok(svg.includes("DOWEL PIN"));
    assert.ok(svg.includes("MATERIAL:"));
  });

  it("generates dynamic generic swap guide for custom swap combinations", () => {
    const elantra = getVehicle("hyundai-elantra-n-cn7");
    assert.ok(elantra);

    const resolved = resolveBuildParts(elantra!, {
      engineId: "eng-ls3-gm",
      transId: "tr-tremec-t56-magnum",
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
    });

    const guide = getIRLSwapGuide(elantra!, resolved);
    assert.ok(guide.swapDifficulty === "expert-fabrication" || guide.swapDifficulty === "advanced");
    assert.ok(guide.fasteners.length >= 3);
    assert.ok(guide.requiredTools.length >= 4);
  });
});
