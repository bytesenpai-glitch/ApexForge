import test from "node:test";
import assert from "node:assert/strict";
import { resolveEngineFiringOrder } from "./firingOrders";

test("Engine Firing Order Domain Service", async (t) => {
  await t.test("resolves standard Inline-4 firing order 1-3-4-2", () => {
    const spec = resolveEngineFiringOrder("inline", 4, "theta-ii", "g4kh");
    assert.equal(spec.layout, "inline");
    assert.equal(spec.cylinders, 4);
    assert.ok(spec.sequenceString.includes("1 — 3 — 4 — 2"));
    assert.equal(spec.cylindersList.length, 4);
    assert.equal(spec.cylindersList[0].id, 1);
    assert.equal(spec.cylindersList[1].id, 3);
    assert.equal(spec.cylindersList[2].id, 4);
    assert.equal(spec.cylindersList[3].id, 2);
  });

  await t.test("resolves Inline-6 firing order 1-5-3-6-2-4 with 120 deg intervals", () => {
    const spec = resolveEngineFiringOrder("inline", 6, "2jz", "2jz-gte");
    assert.equal(spec.cylinders, 6);
    assert.ok(spec.sequenceString.includes("1 — 5 — 3 — 6 — 2 — 4"));
    assert.equal(spec.cylindersList[1].id, 5);
    assert.equal(spec.cylindersList[1].firingAngleDeg, 120);
  });

  await t.test("resolves GM LS Crossplane V8 firing order 1-8-7-2-6-5-4-3", () => {
    const spec = resolveEngineFiringOrder("v-engine", 8, "ls", "ls3");
    assert.ok(spec.sequenceString.includes("1 — 8 — 7 — 2 — 6 — 5 — 4 — 3"));
    assert.equal(spec.cylindersList.length, 8);
    // Cylinder 1 is Bank 1 (Left), Cylinder 8 is Bank 2 (Right)
    const cyl1 = spec.cylindersList.find((c) => c.id === 1);
    const cyl8 = spec.cylindersList.find((c) => c.id === 8);
    assert.equal(cyl1?.bank, 1);
    assert.equal(cyl8?.bank, 2);
  });

  await t.test("resolves Flatplane V8 Voodoo 5.2 firing order", () => {
    const spec = resolveEngineFiringOrder("v-engine", 8, "voodoo", "voodoo-5.2");
    assert.ok(spec.sequenceString.includes("Flat-Plane"));
  });

  await t.test("resolves Subaru Boxer-4 UEL firing order 1-3-2-4", () => {
    const spec = resolveEngineFiringOrder("boxer", 4, "ej", "ej207");
    assert.ok(spec.sequenceString.includes("1 — 3 — 2 — 4"));
    // Cyl 1 and 3 are Bank 1 (Right), Cyl 2 and 4 are Bank 2 (Left)
    const cyl1 = spec.cylindersList.find((c) => c.id === 1);
    const cyl2 = spec.cylindersList.find((c) => c.id === 2);
    assert.equal(cyl1?.bank, 1);
    assert.equal(cyl2?.bank, 2);
  });
});
