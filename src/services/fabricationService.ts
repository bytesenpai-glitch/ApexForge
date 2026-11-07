import type { Vehicle } from "@/domain/vehicles/types";
import type { ResolvedBuildParts } from "@/types/tuning.types";
import type { FabricationTemplate, IRLSwapGuide } from "@/domain/hardware/types";
import { KNOWN_SWAP_GUIDES, generateGenericSwapGuide } from "@/domain/hardware/database";

export function getIRLSwapGuide(
  vehicle: Vehicle,
  resolvedParts: ResolvedBuildParts,
): IRLSwapGuide {
  const engineId = resolvedParts.engine.id;
  const key = `${vehicle.id}:${engineId}`;

  if (KNOWN_SWAP_GUIDES[key]) {
    return KNOWN_SWAP_GUIDES[key];
  }

  const isCrossOrientation =
    (vehicle.layout.startsWith("transverse") && resolvedParts.engine.orientation === "longitudinal") ||
    (vehicle.layout.startsWith("longitudinal") && resolvedParts.engine.orientation === "transverse");

  return generateGenericSwapGuide(
    vehicle.id,
    engineId,
    resolvedParts.transmission.id,
    isCrossOrientation,
    resolvedParts.engine.powerHp,
    resolvedParts.engine.torqueNm,
  );
}

/**
 * Generates an ISO-standard, 1:1 millimetre-scale vector SVG blueprint.
 * Includes a mandatory 100mm physical calibration bar to ensure 100% print accuracy before cutting.
 */
export function generateSvgTemplateXml(template: FabricationTemplate): string {
  const pad = 30;
  const totalW = template.widthMm + pad * 2;
  const totalH = template.heightMm + pad * 2 + 60; // Extra room for calibration bar & title block

  // Hole markers with center-punch crosshairs
  const holesSvg = template.holes
    .map((h) => {
      const cx = h.xMm + pad;
      const cy = h.yMm + pad;
      const r = h.diameterMm / 2;
      return `
        <!-- Hole: ${h.label} (${h.diameterMm}mm) -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0f172a" stroke="#38bdf8" stroke-width="0.75" />
        <line x1="${cx - r - 3}" y1="${cy}" x2="${cx + r + 3}" y2="${cy}" stroke="#ef4444" stroke-width="0.5" stroke-dasharray="1,1" />
        <line x1="${cx}" y1="${cy - r - 3}" x2="${cx}" y2="${cy + r + 3}" stroke="#ef4444" stroke-width="0.5" stroke-dasharray="1,1" />
        <text x="${cx + r + 4}" y="${cy + 3}" font-family="monospace" font-size="7" fill="#94a3b8">Ø${h.diameterMm}${h.threadPitch ? ` (${h.threadPitch})` : ""}</text>
      `;
    })
    .join("");

  // Dowel pins (critical alignment pins)
  const dowelsSvg = template.dowelPins
    .map((d, i) => {
      const cx = d.xMm + pad;
      const cy = d.yMm + pad;
      const r = d.diameterMm / 2;
      return `
        <!-- Dowel Pin #${i + 1} (Ø${d.diameterMm}mm) -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3,1" />
        <circle cx="${cx}" cy="${cy}" r="1" fill="#f59e0b" />
        <text x="${cx + r + 3}" y="${cy - 3}" font-family="monospace" font-size="7" font-weight="bold" fill="#f59e0b">DOWEL PIN Ø${d.diameterMm}</text>
      `;
    })
    .join("");

  // Center bore
  const centerBoreSvg =
    template.centerBoreDiameterMm && template.centerBorePosition
      ? `
        <!-- Center Bore -->
        <circle cx="${template.centerBorePosition.xMm + pad}" cy="${template.centerBorePosition.yMm + pad}" r="${template.centerBoreDiameterMm / 2}" fill="none" stroke="#22c55e" stroke-width="1.0" stroke-dasharray="4,2" />
        <text x="${template.centerBorePosition.xMm + pad}" y="${template.centerBorePosition.yMm + pad}" text-anchor="middle" dominant-baseline="middle" font-family="monospace" font-size="8" fill="#22c55e">CENTER BORE Ø${template.centerBoreDiameterMm}mm</text>
      `
      : "";

  // 100mm Calibration Ruler
  const calY = template.heightMm + pad + 25;
  const calX = pad;
  const calLen = template.calibrationLengthMm;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}mm" height="${totalH}mm">
  <defs>
    <pattern id="grid-10mm" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" stroke-width="0.2" />
    </pattern>
  </defs>

  <!-- Background Technical Grid -->
  <rect width="${totalW}" height="${totalH}" fill="#020617" />
  <rect width="${totalW}" height="${totalH}" fill="url(#grid-10mm)" />

  <!-- Outer Cut Contour (CNC Milling / Laser Cut) -->
  <g transform="translate(${pad}, ${pad})">
    <path d="${template.outerContourPath}" fill="#090d16" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.5" />
  </g>

  ${holesSvg}
  ${dowelsSvg}
  ${centerBoreSvg}

  <!-- Physical 100mm Calibration Bar -->
  <g id="calibration-bar">
    <rect x="${calX}" y="${calY}" width="${calLen}" height="10" fill="#0f172a" stroke="#64748b" stroke-width="0.5" />
    <line x1="${calX}" y1="${calY}" x2="${calX}" y2="${calY + 10}" stroke="#f8fafc" stroke-width="1.5" />
    <line x1="${calX + 50}" y1="${calY}" x2="${calX + 50}" y2="${calY + 10}" stroke="#94a3b8" stroke-width="0.8" />
    <line x1="${calX + calLen}" y1="${calY}" x2="${calX + calLen}" y2="${calY + 10}" stroke="#f8fafc" stroke-width="1.5" />
    <text x="${calX}" y="${calY - 3}" font-family="monospace" font-size="7" fill="#94a3b8">0mm</text>
    <text x="${calX + 50}" y="${calY - 3}" font-family="monospace" font-size="7" fill="#94a3b8" text-anchor="middle">50mm</text>
    <text x="${calX + calLen}" y="${calY - 3}" font-family="monospace" font-size="7" fill="#94a3b8" text-anchor="end">100mm (VERIFY WITH RULER)</text>
    <text x="${calX + calLen + 15}" y="${calY + 7}" font-family="monospace" font-size="8" font-weight="bold" fill="#38bdf8">1:1 SCALE VERIFICATION BAR (100mm)</text>
  </g>

  <!-- Title Block & Material Specs -->
  <g id="title-block" transform="translate(${pad}, ${calY + 20})">
    <rect x="0" y="0" width="${template.widthMm}" height="32" fill="#090d16" stroke="#475569" stroke-width="0.75" />
    <text x="8" y="12" font-family="sans-serif" font-weight="bold" font-size="9" fill="#f8fafc">${template.title}</text>
    <text x="8" y="24" font-family="monospace" font-size="7.5" fill="#94a3b8">MATERIAL: ${template.material} | THICKNESS: ${template.thicknessMm}mm | TOLERANCE: ±0.1mm</text>
    <text x="${template.widthMm - 8}" y="24" text-anchor="end" font-family="monospace" font-size="7.5" fill="#38bdf8">APEX FORGE CAD v2.5 | 1:1 REAL PRINT</text>
  </g>
</svg>`;
}
