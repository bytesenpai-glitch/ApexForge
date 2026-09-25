// Body silhouette definitions and visual language for 2D CAD Blueprint 2.0
// Supporting: Coupe, Sedan, Hatchback/Liftback, Convertible, SUV/4x4, and Pickup Truck

import type { Body } from "@/domain/vehicles/types";

export type BodyArchetype = "coupe" | "sedan" | "hatch" | "convertible" | "suv" | "pickup";

export function getBodyArchetype(body: Body): BodyArchetype {
  switch (body) {
    case "coupe":
      return "coupe";
    case "sedan":
      return "sedan";
    case "hatch":
    case "liftback":
    case "mpv":
      return "hatch";
    case "convertible":
      return "convertible";
    case "suv":
    case "crossover":
      return "suv";
    case "pickup":
      return "pickup";
    default:
      return "coupe";
  }
}

export interface SilhouettePaths {
  outerMonocoque: string;
  greenhouseGlass: string;
  shutLines: string[];
  crashBars: { x: number; y: number; width: number; height: number }[];
  aeroFeatures?: string[];
  uniqueDecorations?: React.ReactNode;
}

// -------------------------------------------------------------
// 1. TOP VIEW SILHOUETTES (Canvas: 600 x 920, Axles: Y=210, Y=710)
// -------------------------------------------------------------

export function getTopViewPaths(archetype: BodyArchetype): SilhouettePaths {
  switch (archetype) {
    case "coupe":
      return {
        // Sculpted long hood, pinched waist, wide muscular rear haunches, ducktail/spoiler
        outerMonocoque:
          "M 210 50 C 260 40, 340 40, 390 50 C 445 62, 470 110, 480 170 C 490 230, 475 300, 470 380 C 465 440, 470 510, 488 590 C 505 670, 500 730, 485 790 C 470 845, 435 868, 385 872 C 340 875, 260 875, 215 872 C 165 868, 130 845, 115 790 C 100 730, 95 670, 112 590 C 130 510, 135 440, 130 380 C 125 300, 110 230, 120 170 C 130 110, 155 62, 210 50 Z",
        greenhouseGlass:
          "M 175 300 Q 300 275 425 300 L 405 560 Q 300 580 195 560 Z",
        shutLines: [
          // Hood shutline
          "M 140 255 Q 300 270 460 255",
          // Doors
          "M 130 360 L 175 360",
          "M 470 360 L 425 360",
          "M 132 540 L 195 540",
          "M 468 540 L 405 540",
          // Fastback rear glass & ducktail decklid
          "M 200 660 Q 300 680 400 660",
          "M 180 810 Q 300 825 420 810",
        ],
        crashBars: [
          { x: 215, y: 56, width: 170, height: 16 },
          { x: 215, y: 850, width: 170, height: 16 },
        ],
        aeroFeatures: [
          // Front aerodynamic splitter
          "M 180 42 Q 300 30 420 42 L 440 65 L 425 68 L 390 52 Q 300 42 210 52 L 175 68 L 160 65 Z",
          // Rear GT Wing / Ducktail outline
          "M 140 850 Q 300 865 460 850 L 470 862 Q 300 878 130 862 Z",
        ],
      };

    case "sedan":
      return {
        // Classic 3-box design: hood, 4-door cabin with B-pillar, distinct rear trunk
        outerMonocoque:
          "M 205 60 C 255 52, 345 52, 395 60 C 440 70, 468 115, 476 175 C 484 235, 482 320, 482 430 C 482 540, 484 640, 478 740 C 472 815, 442 855, 395 865 C 345 872, 255 872, 205 865 C 158 855, 128 815, 122 740 C 116 640, 118 540, 118 430 C 118 320, 116 235, 124 175 C 132 115, 160 70, 205 60 Z",
        greenhouseGlass:
          "M 175 285 Q 300 270 425 285 L 418 630 Q 300 645 182 630 Z",
        shutLines: [
          // Hood line
          "M 135 250 Q 300 265 465 250",
          // Front doors
          "M 118 420 L 178 420",
          "M 482 420 L 422 420",
          // Rear doors
          "M 119 570 L 180 570",
          "M 481 570 L 420 570",
          // B-Pillars divider
          "M 178 420 Q 300 420 422 420",
          // Rear windshield top & bottom
          "M 190 625 Q 300 640 410 625",
          // Trunk lid seam
          "M 170 735 Q 300 750 430 735",
        ],
        crashBars: [
          { x: 210, y: 65, width: 180, height: 16 },
          { x: 210, y: 845, width: 180, height: 16 },
        ],
      };

    case "hatch":
      return {
        // 2-box hot hatch: compact hood, roof extends almost to rear axle, steep hatch drop
        outerMonocoque:
          "M 210 80 C 260 72, 340 72, 390 80 C 438 90, 465 130, 474 190 C 482 250, 480 340, 480 460 C 480 580, 484 680, 476 770 C 468 830, 440 855, 390 858 C 345 860, 255 860, 210 858 C 160 855, 132 830, 124 770 C 116 680, 120 580, 120 460 C 120 340, 118 250, 126 190 C 135 130, 162 90, 210 80 Z",
        greenhouseGlass:
          "M 175 270 Q 300 255 425 270 L 420 730 Q 300 745 180 730 Z",
        shutLines: [
          // Hood line
          "M 136 240 Q 300 255 464 240",
          // Doors
          "M 120 430 L 178 430",
          "M 480 430 L 422 430",
          // Roof rack strips
          "M 195 300 L 195 720",
          "M 405 300 L 405 720",
          // Hatchback tailgate hinge line
          "M 160 725 Q 300 740 440 725",
          // Rear hatch glass & wiper
          "M 190 770 Q 300 785 410 770",
        ],
        crashBars: [
          { x: 215, y: 85, width: 170, height: 16 },
          { x: 215, y: 838, width: 170, height: 16 },
        ],
        aeroFeatures: [
          // Roof edge spoiler
          "M 155 790 Q 300 805 445 790 L 455 815 Q 300 830 145 815 Z",
        ],
      };

    case "convertible":
      return {
        // Ultra-compact roadster: small front overhang, exposed cockpit, short rear deck
        outerMonocoque:
          "M 215 110 C 260 102, 340 102, 385 110 C 430 120, 455 160, 465 210 C 475 260, 470 330, 465 420 C 460 500, 468 620, 468 700 C 465 765, 435 815, 385 825 C 340 830, 260 830, 215 825 C 165 815, 135 765, 132 700 C 132 620, 140 500, 135 420 C 130 330, 125 260, 135 210 C 145 160, 170 120, 215 110 Z",
        // Open cockpit cutout
        greenhouseGlass:
          "M 175 320 Q 300 300 425 320 L 415 540 Q 300 555 185 540 Z",
        shutLines: [
          // Pop-up headlights or hood vents
          "M 170 150 L 230 150 L 230 190 L 170 190 Z",
          "M 370 150 L 430 150 L 430 190 L 370 190 Z",
          // Hood line
          "M 148 260 Q 300 280 452 260",
          // Doors
          "M 135 410 L 180 410",
          "M 465 410 L 420 410",
          // Rear decklid & soft-top cover line
          "M 170 560 Q 300 575 430 560",
          "M 165 720 Q 300 735 435 720",
        ],
        crashBars: [
          { x: 220, y: 115, width: 160, height: 14 },
          { x: 220, y: 805, width: 160, height: 14 },
        ],
      };

    case "suv":
      return {
        // High, squared, wide fenders, roof luggage rails, rear-mounted spare wheel contour
        outerMonocoque:
          "M 195 45 C 255 38, 345 38, 405 45 C 455 52, 485 95, 492 165 C 500 235, 495 340, 495 470 C 495 600, 500 710, 492 780 C 485 845, 450 870, 395 875 C 345 878, 255 878, 205 875 C 150 870, 115 845, 108 780 C 100 710, 105 600, 105 470 C 105 340, 100 235, 108 165 C 115 95, 145 52, 195 45 Z",
        greenhouseGlass:
          "M 170 260 Q 300 245 430 260 L 425 740 Q 300 755 175 740 Z",
        shutLines: [
          // Heavy duty front bull-bar / bumper
          "M 125 70 L 475 70",
          // Boxy squared hood
          "M 120 230 Q 300 245 480 230",
          // 4-door shut lines
          "M 106 410 L 172 410",
          "M 494 410 L 428 410",
          "M 107 580 L 174 580",
          "M 493 580 L 426 580",
          // Longitudinal roof luggage rack bars
          "M 185 280 L 185 730",
          "M 415 280 L 415 730",
          "M 185 400 L 415 400",
          "M 185 550 L 415 550",
          // Upright tailgate hinge
          "M 135 765 L 465 765",
        ],
        crashBars: [
          { x: 195, y: 52, width: 210, height: 18 },
          { x: 195, y: 855, width: 210, height: 18 },
        ],
        aeroFeatures: [
          // External mounted rear spare tire cover outline
          "M 260 875 C 260 855, 340 855, 340 875 C 340 902, 260 902, 260 875 Z",
        ],
      };

    case "pickup":
      return {
        // Distinct front hood, crew-cab cabin, open cargo bed with corrugation floor & tailgate
        outerMonocoque:
          "M 195 40 C 255 32, 345 32, 405 40 C 458 48, 488 90, 495 160 C 502 230, 496 330, 496 440 C 496 525, 498 620, 498 750 C 498 830, 465 865, 410 870 C 350 874, 250 874, 190 870 C 135 865, 102 830, 102 750 C 102 620, 104 525, 104 440 C 104 330, 98 230, 105 160 C 112 90, 142 48, 195 40 Z",
        greenhouseGlass:
          "M 170 255 Q 300 240 430 255 L 425 490 Q 300 500 175 490 Z",
        shutLines: [
          // High truck hood
          "M 115 225 Q 300 240 485 225",
          // Crew cab doors
          "M 104 360 L 172 360",
          "M 496 360 L 428 360",
          // Cab to cargo bed structural gap!
          "M 104 515 L 496 515",
          "M 104 522 L 496 522",
          // Open cargo bed liner ribs (corrugated metal floor)
          "M 180 540 L 180 830",
          "M 220 540 L 220 830",
          "M 260 540 L 260 830",
          "M 300 540 L 300 830",
          "M 340 540 L 340 830",
          "M 380 540 L 380 830",
          "M 420 540 L 420 830",
          // Rear tailgate seam & bed sides
          "M 130 535 L 130 840",
          "M 470 535 L 470 840",
          "M 130 840 L 470 840",
        ],
        crashBars: [
          { x: 195, y: 46, width: 210, height: 18 },
          { x: 190, y: 852, width: 220, height: 18 },
        ],
      };
  }
}

// -------------------------------------------------------------
// 2. SIDE VIEW SILHOUETTES (Canvas: 1000 x 500, Wheels: X=230, X=770, Y=355)
// -------------------------------------------------------------

export interface SideViewGeometry {
  groundClearanceMm: number;
  overallHeightMm: number;
  overallLengthMm: number;
  bodyPath: string;
  glassPath: string;
  pillarLines: string[];
  doorShutLines: string[];
  wheelWellFront: { cx: number; cy: number; r: number };
  wheelWellRear: { cx: number; cy: number; r: number };
  rearSpoiler?: string;
  roofRack?: string;
  spareWheel?: { cx: number; cy: number; r: number };
  cargoBedLine?: string;
}

export function getSideViewGeometry(archetype: BodyArchetype): SideViewGeometry {
  switch (archetype) {
    case "coupe":
      return {
        groundClearanceMm: 120,
        overallHeightMm: 1290,
        overallLengthMm: 4520,
        // Low fastback sports profile
        bodyPath:
          "M 70 355 L 75 320 C 85 285, 120 270, 180 265 L 360 250 C 410 240, 440 200, 480 180 C 530 155, 630 155, 680 180 C 730 205, 780 250, 840 260 L 910 265 C 930 270, 940 295, 935 340 L 925 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
        glassPath:
          "M 410 242 L 485 185 L 670 185 L 750 252 Z",
        pillarLines: [
          "M 550 185 L 540 248", // A/B pillar divider
        ],
        doorShutLines: [
          "M 370 248 L 360 365",
          "M 620 230 L 610 365",
        ],
        wheelWellFront: { cx: 230, cy: 355, r: 62 },
        wheelWellRear: { cx: 770, cy: 355, r: 62 },
        rearSpoiler:
          "M 885 245 L 945 240 L 950 250 L 890 255 Z",
      };

    case "sedan":
      return {
        groundClearanceMm: 140,
        overallHeightMm: 1420,
        overallLengthMm: 4680,
        // Distinct 3-box profile: hood, cabin, flat rear trunk deck
        bodyPath:
          "M 80 355 L 85 310 C 95 275, 130 260, 200 255 L 350 245 C 400 230, 430 180, 470 160 C 520 140, 650 140, 710 160 C 750 185, 770 220, 810 250 L 895 255 C 925 260, 935 285, 930 335 L 920 355 L 855 355 C 850 305, 805 305, 770 305 C 735 305, 690 305, 685 355 L 315 355 C 310 305, 265 305, 230 305 C 195 305, 150 305, 145 355 Z",
        glassPath:
          "M 395 238 L 472 165 L 702 165 L 782 245 Z",
        pillarLines: [
          "M 585 165 L 585 245", // B-Pillar divider
        ],
        doorShutLines: [
          "M 360 245 L 350 355", // Front door front edge
          "M 585 245 L 585 355", // B-pillar cut
          "M 740 242 L 730 355", // Rear door rear edge
        ],
        wheelWellFront: { cx: 230, cy: 355, r: 62 },
        wheelWellRear: { cx: 770, cy: 355, r: 62 },
      };

    case "hatch":
      return {
        groundClearanceMm: 135,
        overallHeightMm: 1440,
        overallLengthMm: 4340,
        // 2-box hot-hatch profile, extended roofline, steep tailgate drop
        bodyPath:
          "M 100 355 L 105 315 C 115 280, 145 265, 210 260 L 330 250 C 375 235, 410 185, 450 162 C 500 145, 680 145, 770 152 C 815 158, 850 190, 875 250 C 895 290, 890 325, 885 355 L 855 355 C 850 305, 805 305, 770 305 C 735 305, 690 305, 685 355 L 315 355 C 310 305, 265 305, 230 305 C 195 305, 150 305, 145 355 Z",
        glassPath:
          "M 375 242 L 452 168 L 760 160 L 835 240 Z",
        pillarLines: [
          "M 565 165 L 565 245", // B-Pillar
          "M 710 162 L 720 242", // C-Pillar
        ],
        doorShutLines: [
          "M 340 250 L 330 355",
          "M 565 245 L 565 355",
          "M 735 235 L 725 355",
        ],
        wheelWellFront: { cx: 230, cy: 355, r: 62 },
        wheelWellRear: { cx: 770, cy: 355, r: 62 },
        rearSpoiler:
          "M 770 145 L 830 142 L 835 152 L 775 155 Z",
      };

    case "convertible":
      return {
        groundClearanceMm: 115,
        overallHeightMm: 1230,
        overallLengthMm: 3990,
        // Ultra-compact open-top roadster profile with rollover hoops
        bodyPath:
          "M 110 355 L 115 320 C 125 285, 155 275, 220 270 L 370 260 C 400 255, 415 235, 430 205 L 475 200 C 475 230, 480 265, 520 265 L 720 265 C 760 265, 790 270, 835 272 C 865 275, 875 300, 870 345 L 860 365 L 850 365 C 845 315, 805 315, 770 315 C 735 315, 695 315, 690 365 L 310 365 C 305 315, 265 315, 230 315 C 195 315, 155 315, 150 365 Z",
        // Windshield only (open cockpit)
        glassPath:
          "M 410 258 L 465 202 L 475 205 L 430 260 Z",
        pillarLines: [],
        doorShutLines: [
          "M 380 262 L 370 365",
          "M 650 265 L 640 365",
        ],
        wheelWellFront: { cx: 230, cy: 355, r: 60 },
        wheelWellRear: { cx: 770, cy: 355, r: 60 },
      };

    case "suv":
      return {
        groundClearanceMm: 230,
        overallHeightMm: 1910,
        overallLengthMm: 4980,
        // Lifted ground clearance, massive upright front, tall roof with rack, tailgate spare
        bodyPath:
          "M 70 345 L 75 270 C 80 230, 110 215, 180 210 L 330 200 C 375 190, 405 135, 445 115 C 500 95, 720 95, 780 105 C 830 115, 855 150, 865 210 L 865 330 L 855 345 L 850 345 C 845 285, 805 285, 770 285 C 735 285, 695 285, 690 345 L 310 345 C 305 285, 265 285, 230 285 C 195 285, 155 285, 150 345 Z",
        glassPath:
          "M 385 195 L 450 120 L 775 110 L 845 195 Z",
        pillarLines: [
          "M 550 115 L 550 200", // B-Pillar
          "M 690 112 L 690 198", // C-Pillar
        ],
        doorShutLines: [
          "M 345 202 L 335 345",
          "M 550 200 L 550 345",
          "M 720 198 L 710 345",
        ],
        wheelWellFront: { cx: 230, cy: 355, r: 72 },
        wheelWellRear: { cx: 770, cy: 355, r: 72 },
        roofRack:
          "M 450 95 L 780 95 L 780 102 L 450 102 Z",
        spareWheel: { cx: 890, cy: 230, r: 42 },
      };

    case "pickup":
      return {
        groundClearanceMm: 240,
        overallHeightMm: 1950,
        overallLengthMm: 5880,
        // High front truck nose, cab roof ending with vertical window, then open cargo bed
        bodyPath:
          "M 60 340 L 65 260 C 70 225, 100 210, 170 205 L 320 195 C 365 185, 395 135, 435 115 C 485 98, 590 98, 630 110 L 635 240 L 920 240 C 935 245, 940 270, 935 325 L 925 340 L 850 340 C 845 285, 805 285, 770 285 C 735 285, 695 285, 690 340 L 310 340 C 305 285, 265 285, 230 285 C 195 285, 155 285, 150 340 Z",
        glassPath:
          "M 375 190 L 440 120 L 620 115 L 620 195 Z",
        pillarLines: [
          "M 520 118 L 520 195", // B-Pillar
        ],
        doorShutLines: [
          "M 335 198 L 325 340",
          "M 520 195 L 520 340",
          // Cab to Bed separation cut
          "M 632 110 L 632 340",
        ],
        wheelWellFront: { cx: 230, cy: 355, r: 72 },
        wheelWellRear: { cx: 770, cy: 355, r: 72 },
        cargoBedLine:
          "M 635 240 L 925 240",
      };
  }
}
