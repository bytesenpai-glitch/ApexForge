import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getVehicle } from "@/domain/vehicles/lookup";
import { resolveBuildParts } from "@/services/swapService";
import { calculateBuildBudget, formatKrw } from "./budgetService";

describe("Build Budget & Quotation Service", () => {
  it("formats Korean Won currency correctly", () => {
    assert.equal(formatKrw(150000), "150,000원");
    assert.equal(formatKrw(12500000), "12,500,000원");
  });

  it("calculates realistic quotation for K-Miata swap in Korean Won", () => {
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

    const quote = calculateBuildBudget(miata!, resolved);

    assert.ok(quote.quoteNumber.startsWith("AF-"));
    assert.ok(quote.items.length >= 5);
    assert.ok(quote.subtotalPartsKrw > 0);
    assert.ok(quote.subtotalLaborKrw > 0);
    assert.equal(quote.taxVatKrw, Math.round((quote.subtotalPartsKrw + quote.subtotalLaborKrw) * 0.1));
    assert.equal(quote.totalKrw, quote.subtotalPartsKrw + quote.subtotalLaborKrw + quote.taxVatKrw);
    assert.equal(quote.depositRequiredKrw, Math.round(quote.totalKrw * 0.3));
  });
});
