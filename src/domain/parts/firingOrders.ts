import type { CylinderLayout } from "./types";

export interface CylinderSpec {
  id: number;
  label: string;
  bank: 1 | 2;
  firingAngleDeg: number; // 0 to 720 deg in 4-stroke cycle
  firingOrderIndex: number; // 1-based order in sequence (1, 2, 3...)
}

export interface EngineFiringOrderSpec {
  layout: CylinderLayout;
  cylinders: number;
  sequenceString: string; // e.g. "1 — 3 — 4 — 2"
  cylindersList: CylinderSpec[];
  notes: string;
}

/**
 * Resolves the authentic mechanical firing order and crank angles (0° - 720°)
 * for any given engine configuration in Apex Forge.
 */
export function resolveEngineFiringOrder(
  layout: CylinderLayout,
  cylinders: number,
  family?: string,
  engineCode?: string
): EngineFiringOrderSpec {
  const fam = (family || "").toLowerCase();
  const code = (engineCode || "").toLowerCase();

  // 1. Crossplane V8 vs Flatplane V8
  if (cylinders === 8 && layout === "v-engine") {
    const isFlatplane = fam.includes("voodoo") || code.includes("voodoo") || fam.includes("ferrari");
    if (isFlatplane) {
      // Flatplane V8 (Shelby GT350 Voodoo 5.2): 1-4-3-2-7-6-5-8
      const sequence = [1, 4, 3, 2, 7, 6, 5, 8];
      return {
        layout: "v-engine",
        cylinders: 8,
        sequenceString: "1 — 4 — 3 — 2 — 7 — 6 — 5 — 8 (Flat-Plane)",
        cylindersList: buildV8Cylinders(sequence, [0, 90, 180, 270, 360, 450, 540, 630]),
        notes: "Синхронный 180° плоский коленвал. Равномерное чередование банков, визжащий звук Formula-1.",
      };
    }

    const isCoyote = fam.includes("coyote") || code.includes("coyote");
    const isAMG = fam.includes("m156") || code.includes("m156") || fam.includes("amg");

    if (isCoyote) {
      // Ford Coyote 5.0 V8: 1-5-4-8-6-3-7-2
      const sequence = [1, 5, 4, 8, 6, 3, 7, 2];
      return {
        layout: "v-engine",
        cylinders: 8,
        sequenceString: "1 — 5 — 4 — 8 — 6 — 3 — 7 — 2 (Ford Crossplane)",
        cylindersList: buildV8Cylinders(sequence, [0, 90, 180, 270, 360, 450, 540, 630]),
        notes: "Crossplane V8 Ford Modular: несимметричный порядок зажигания с глубоким горловым рокотом.",
      };
    }

    if (isAMG) {
      // Mercedes AMG M156 6.2 V8: 1-5-4-2-6-3-7-8
      const sequence = [1, 5, 4, 2, 6, 3, 7, 8];
      return {
        layout: "v-engine",
        cylinders: 8,
        sequenceString: "1 — 5 — 4 — 2 — 6 — 3 — 7 — 8 (AMG Crossplane)",
        cylindersList: buildV8Cylinders(sequence, [0, 90, 180, 270, 360, 450, 540, 630]),
        notes: "Атмосферный 6.2L AMG V8: тяжелый басовый напор с выраженной асинхронностью выпусков.",
      };
    }

    // Standard GM LS Small-Block V8 (LS3 / LS7): 1-8-7-2-6-5-4-3
    const sequence = [1, 8, 7, 2, 6, 5, 4, 3];
    return {
      layout: "v-engine",
      cylinders: 8,
      sequenceString: "1 — 8 — 7 — 2 — 6 — 5 — 4 — 3 (GM LS Crossplane)",
      cylindersList: buildV8Cylinders(sequence, [0, 90, 180, 270, 360, 450, 540, 630]),
      notes: "Легендарный порядок зажигания GM Gen IV/V: неровный такт в левом и правом банках (90°-180°-270°-90°).",
    };
  }

  // 2. Inline-6 (2JZ, RB26, BMW S58 / S54 / B58)
  if (cylinders === 6 && layout === "inline") {
    // 1-5-3-6-2-4 (120° intervals)
    const sequence = [1, 5, 3, 6, 2, 4];
    return {
      layout: "inline",
      cylinders: 6,
      sequenceString: "1 — 5 — 3 — 6 — 2 — 4 (120° Straight-Six)",
      cylindersList: sequence.map((cylId, idx) => ({
        id: cylId,
        label: `CYL ${cylId}`,
        bank: 1,
        firingAngleDeg: idx * 120,
        firingOrderIndex: idx + 1,
      })),
      notes: "Идеальный механический баланс первичного и вторичного порядка. Мощные 3-я и 6-я гармоники.",
    };
  }

  // 3. Boxer-4 (Subaru EJ20 / EJ25 / FA20 / FA24)
  if (cylinders === 4 && layout === "boxer") {
    // 1-3-2-4
    const sequence = [1, 3, 2, 4];
    return {
      layout: "boxer",
      cylinders: 4,
      sequenceString: "1 — 3 — 2 — 4 (Subaru Boxer UEL)",
      cylindersList: [
        { id: 1, label: "CYL 1 (Прав)", bank: 1, firingAngleDeg: 0, firingOrderIndex: 1 },
        { id: 3, label: "CYL 3 (Прав)", bank: 1, firingAngleDeg: 180, firingOrderIndex: 2 },
        { id: 2, label: "CYL 2 (Лев)", bank: 2, firingAngleDeg: 360, firingOrderIndex: 3 },
        { id: 4, label: "CYL 4 (Лев)", bank: 2, firingAngleDeg: 540, firingOrderIndex: 4 },
      ],
      notes: "Оппозитный 4-цилиндровый ДВС. Цилиндры 1 и 3 справа, 2 и 4 слева. Разная длина труб дает боксерский рокот.",
    };
  }

  // 4. Boxer-6 (Porsche 911 Flat-6)
  if (cylinders === 6 && layout === "boxer") {
    // 1-6-2-4-3-5
    const sequence = [1, 6, 2, 4, 3, 5];
    return {
      layout: "boxer",
      cylinders: 6,
      sequenceString: "1 — 6 — 2 — 4 — 3 — 5 (Porsche Flat-6)",
      cylindersList: sequence.map((cylId, idx) => ({
        id: cylId,
        label: `CYL ${cylId}`,
        bank: [1, 2, 3].includes(cylId) ? 1 : 2,
        firingAngleDeg: idx * 120,
        firingOrderIndex: idx + 1,
      })),
      notes: "Оппозитная шестерка Porsche GT3: высокооборотистый визг с сухим картером до 9000 RPM.",
    };
  }

  // 5. V6 (VR38DETT, Lambda 3.3T, Audi 2.9 TFSI)
  if (cylinders === 6 && layout === "v-engine") {
    // 1-2-3-4-5-6 or 1-5-3-6-2-4 (Nissan / Hyundai 60-degree V6)
    const sequence = [1, 2, 3, 4, 5, 6];
    return {
      layout: "v-engine",
      cylinders: 6,
      sequenceString: "1 — 2 — 3 — 4 — 5 — 6 (60° V6)",
      cylindersList: sequence.map((cylId, idx) => ({
        id: cylId,
        label: `CYL ${cylId}`,
        bank: cylId % 2 !== 0 ? 1 : 2,
        firingAngleDeg: idx * 120,
        firingOrderIndex: idx + 1,
      })),
      notes: "Развал 60° со смещением шеек. Плотный горловой бас V6 с выраженным средним регистром.",
    };
  }

  // 6. Rotary Wankel (13B-REW)
  if (layout === "rotary") {
    return {
      layout: "rotary",
      cylinders: 2,
      sequenceString: "R1 (A-B-C) ⇄ R2 (A-B-C) (180° Eccentric)",
      cylindersList: [
        { id: 1, label: "R1-A (Перед)", bank: 1, firingAngleDeg: 0, firingOrderIndex: 1 },
        { id: 2, label: "R2-A (Зад)", bank: 2, firingAngleDeg: 180, firingOrderIndex: 2 },
        { id: 3, label: "R1-B (Перед)", bank: 1, firingAngleDeg: 360, firingOrderIndex: 3 },
        { id: 4, label: "R2-B (Зад)", bank: 2, firingAngleDeg: 540, firingOrderIndex: 4 },
      ],
      notes: "Двухсекционный роторный двигатель Ванкеля: 3 вспышки на оборот ротора, пронзительный визг.",
    };
  }

  // 7. V10 (BMW S85B50)
  if (cylinders === 10) {
    // 1-6-5-10-2-7-3-8-4-9 (72° intervals)
    const sequence = [1, 6, 5, 10, 2, 7, 3, 8, 4, 9];
    return {
      layout: "v-engine",
      cylinders: 10,
      sequenceString: "1 — 6 — 5 — 10 — 2 — 7 — 3 — 8 — 4 — 9 (V10 72°)",
      cylindersList: sequence.map((cylId, idx) => ({
        id: cylId,
        label: `CYL ${cylId}`,
        bank: cylId <= 5 ? 1 : 2,
        firingAngleDeg: idx * 72,
        firingOrderIndex: idx + 1,
      })),
      notes: "Атмосферный V10 Formula-1: 10 дросселей, пронзительный вой высоких обертонов до 8250 RPM.",
    };
  }

  // Default: Standard Inline-4 (Theta II, Gamma, 4G63T, K20/K24, EA888, B16B)
  const sequence = [1, 3, 4, 2];
  return {
    layout: "inline",
    cylinders: 4,
    sequenceString: "1 — 3 — 4 — 2 (180° Cross-Head I4)",
    cylindersList: [
      { id: 1, label: "CYL 1", bank: 1, firingAngleDeg: 0, firingOrderIndex: 1 },
      { id: 3, label: "CYL 3", bank: 1, firingAngleDeg: 180, firingOrderIndex: 2 },
      { id: 4, label: "CYL 4", bank: 1, firingAngleDeg: 360, firingOrderIndex: 3 },
      { id: 2, label: "CYL 2", bank: 1, firingAngleDeg: 540, firingOrderIndex: 4 },
    ],
    notes: "Классический порядок рядной четверки: поршни 1 и 4 в ВМТ вместе, 2 и 3 в НМТ. Равномерный 180° такт.",
  };
}

function buildV8Cylinders(sequence: number[], angles: number[]): CylinderSpec[] {
  return sequence.map((cylId, idx) => {
    // In V8, odd numbers (1, 3, 5, 7) are Bank 1 (Left), even numbers (2, 4, 6, 8) are Bank 2 (Right)
    const bank = cylId % 2 !== 0 ? (1 as const) : (2 as const);
    return {
      id: cylId,
      label: `CYL ${cylId}`,
      bank,
      firingAngleDeg: angles[idx],
      firingOrderIndex: idx + 1,
    };
  });
}
