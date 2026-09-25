import type { Body, Vehicle } from "@/domain/vehicles/types";
import {
  getBodyArchetype,
  getSideViewGeometry,
  getTopViewPaths,
  type BodyArchetype,
  type SideViewGeometry,
  type SilhouettePaths,
} from "./bodySilhouettes";

/**
 * High-definition CAD vectors for iconic vehicle platforms.
 * Fallbacks gracefully to the archetype library (coupe, sedan, hatch, convertible, suv, pickup).
 */

export function getModelTopViewPaths(vehicle: Vehicle): SilhouettePaths {
  const id = vehicle.id.toLowerCase();
  const archetype = getBodyArchetype(vehicle.body);

  // 1. Hyundai Elantra N (CN7 / CN7 N-Line)
  if (id.includes("elantra-n") || id.includes("elantra-cn7")) {
    return {
      // Sharp parametric angular fastback sedan
      outerMonocoque:
        "M 210 52 C 260 42, 340 42, 390 52 C 445 64, 474 105, 482 165 C 490 225, 482 315, 480 425 C 478 535, 484 640, 482 745 C 480 815, 448 855, 395 864 C 345 870, 255 870, 205 864 C 152 855, 120 815, 118 745 C 116 640, 122 535, 120 425 C 118 315, 110 225, 118 165 C 126 105, 155 64, 210 52 Z",
      greenhouseGlass:
        "M 172 275 Q 300 258 428 275 L 420 635 Q 300 655 180 635 Z",
      shutLines: [
        // Sharp parametric hood shutlines
        "M 130 245 L 200 260 L 400 260 L 470 245",
        // Front & Rear doors with N angular side creases
        "M 120 415 L 174 415",
        "M 480 415 L 426 415",
        "M 119 565 L 178 565",
        "M 481 565 L 422 565",
        // B-Pillar divider
        "M 174 415 Q 300 415 426 415",
        // Fastback rear glass & decklid
        "M 188 630 Q 300 650 412 630",
        // Rear trunk lip seam
        "M 165 745 Q 300 760 435 745",
        // Front aggressive N triangular air intake cuts
        "M 140 100 L 170 140 L 135 155 Z",
        "M 460 100 L 430 140 L 465 155 Z",
      ],
      crashBars: [
        { x: 210, y: 58, width: 180, height: 16 },
        { x: 210, y: 846, width: 180, height: 16 },
      ],
      aeroFeatures: [
        // Front N-Aero Splitter with side endplate fins
        "M 160 55 L 205 45 Q 300 36 395 45 L 440 55 L 452 75 L 436 78 L 395 50 Q 300 44 205 50 L 164 78 L 148 75 Z",
        // Rear Swan-Neck N Racing Wing
        "M 145 825 Q 300 842 455 825 L 462 840 Q 300 858 138 840 Z",
        // Dual 130mm round exhaust tips
        "M 180 870 A 10 10 0 1 0 200 870 A 10 10 0 1 0 180 870",
        "M 400 870 A 10 10 0 1 0 420 870 A 10 10 0 1 0 400 870",
      ],
    };
  }

  // 2. Kia Stinger GT (CK)
  if (id.includes("stinger")) {
    return {
      outerMonocoque:
        "M 215 54 C 265 44, 335 44, 385 54 C 445 66, 476 112, 484 175 C 492 238, 484 325, 484 430 C 484 535, 488 640, 484 750 C 480 820, 446 862, 390 868 C 340 872, 260 872, 210 868 C 154 862, 120 820, 116 750 C 112 640, 116 535, 116 430 C 116 325, 108 238, 116 175 C 124 112, 155 66, 215 54 Z",
      greenhouseGlass:
        "M 174 278 Q 300 260 426 278 L 416 645 Q 300 668 184 645 Z",
      shutLines: [
        // Long sculpted hood with twin functional vents
        "M 132 250 Q 300 265 468 250",
        "M 230 150 L 250 180",
        "M 370 150 L 350 180",
        // Doors
        "M 116 425 L 175 425",
        "M 484 425 L 425 425",
        "M 117 580 L 180 580",
        "M 483 580 L 420 580",
        // Fastback rear window
        "M 184 645 Q 300 668 416 645",
        // Distinctive wrap-around taillight bar
        "M 125 790 L 155 830 L 445 830 L 475 790",
      ],
      crashBars: [
        { x: 215, y: 60, width: 170, height: 16 },
        { x: 210, y: 848, width: 180, height: 16 },
      ],
      aeroFeatures: [
        // Quad oval exhaust outlets
        "M 165 870 L 195 870",
        "M 205 870 L 235 870",
        "M 365 870 L 395 870",
        "M 405 870 L 435 870",
      ],
    };
  }

  // 3. Toyota Supra (A80)
  if (id.includes("supra-a80")) {
    return {
      outerMonocoque:
        "M 210 50 C 260 38, 340 38, 390 50 C 450 62, 476 108, 484 168 C 492 228, 476 295, 470 375 C 464 435, 475 510, 496 590 C 516 670, 510 740, 490 800 C 470 855, 435 875, 385 878 C 340 880, 260 880, 215 878 C 165 875, 130 855, 110 800 C 90 740, 84 670, 104 590 C 125 510, 136 435, 130 375 C 124 295, 108 228, 116 168 C 124 108, 150 62, 210 50 Z",
      greenhouseGlass:
        "M 172 295 Q 300 270 428 295 L 400 575 Q 300 600 200 575 Z",
      shutLines: [
        // Curved hood line
        "M 135 255 Q 300 275 465 255",
        // 2 doors
        "M 128 360 L 174 360",
        "M 472 360 L 426 360",
        "M 132 540 L 198 540",
        "M 468 540 L 402 540",
        // Recessed circular quad rear taillights
        "M 145 815 A 8 8 0 1 0 161 815 A 8 8 0 1 0 145 815",
        "M 170 815 A 8 8 0 1 0 186 815 A 8 8 0 1 0 170 815",
        "M 414 815 A 8 8 0 1 0 430 815 A 8 8 0 1 0 414 815",
        "M 439 815 A 8 8 0 1 0 455 815 A 8 8 0 1 0 439 815",
      ],
      crashBars: [
        { x: 215, y: 56, width: 170, height: 16 },
        { x: 215, y: 852, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // Massive iconic looping Supra hoop rear wing
        "M 125 825 C 125 805, 135 790, 150 790 L 450 790 C 465 790, 475 805, 475 825 L 460 835 L 440 810 L 160 810 L 140 835 Z",
      ],
    };
  }

  // 4. Nissan Silvia S15
  if (id.includes("silvia-s15")) {
    return {
      outerMonocoque:
        "M 215 54 C 265 42, 335 42, 385 54 C 445 66, 470 110, 478 170 C 486 230, 472 300, 468 380 C 464 440, 470 515, 486 595 C 502 675, 498 735, 482 795 C 466 850, 432 870, 385 874 C 340 876, 260 876, 215 874 C 168 870, 134 850, 118 795 C 102 735, 98 675, 114 595 C 130 515, 136 440, 132 380 C 128 300, 114 230, 122 170 C 130 110, 155 66, 215 54 Z",
      greenhouseGlass:
        "M 175 295 Q 300 272 425 295 L 405 565 Q 300 585 195 565 Z",
      shutLines: [
        // Low sleek hood
        "M 138 250 Q 300 268 462 250",
        // Sharp sculpted projector headlights
        "M 148 75 L 185 90 L 175 125 L 140 105 Z",
        "M 452 75 L 415 90 L 425 125 L 460 105 Z",
        // Doors
        "M 130 365 L 175 365",
        "M 470 365 L 425 365",
        "M 134 545 L 198 545",
        "M 466 545 L 402 545",
        // Rear trunk lip seam
        "M 180 815 Q 300 830 420 815",
      ],
      crashBars: [
        { x: 215, y: 60, width: 170, height: 16 },
        { x: 215, y: 850, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // JDM Drift Ducktail Spoiler
        "M 160 835 Q 300 850 440 835 L 448 848 Q 300 862 152 848 Z",
        // Angled single cannon titanium exhaust outlet
        "M 405 870 L 425 878",
      ],
    };
  }

  // 5. Mazda Miata NA
  if (id.includes("miata-na")) {
    return {
      outerMonocoque:
        "M 215 65 C 265 55, 335 55, 385 65 C 440 76, 465 120, 472 178 C 478 236, 468 310, 464 390 C 460 450, 466 525, 478 600 C 490 675, 486 730, 472 785 C 458 835, 428 855, 385 858 C 340 860, 260 860, 215 858 C 172 855, 142 835, 128 785 C 114 730, 110 675, 122 600 C 134 525, 140 450, 136 390 C 132 310, 122 236, 128 178 C 135 120, 160 76, 215 65 Z",
      greenhouseGlass:
        // Roadster soft-top / hard-top profile
        "M 185 320 Q 300 300 415 320 L 398 520 Q 300 535 202 520 Z",
      shutLines: [
        // Pop-up headlight lid cutouts on hood!
        "M 160 110 L 205 110 L 205 155 L 160 155 Z",
        "M 395 110 L 440 110 L 440 155 L 395 155 Z",
        // Hood seam
        "M 145 260 Q 300 275 455 260",
        // Compact roadster doors
        "M 135 360 L 185 360",
        "M 465 360 L 415 360",
        "M 137 510 L 202 510",
        "M 463 510 L 398 510",
        // Roadster rear deck lid
        "M 180 735 Q 300 750 420 735",
      ],
      crashBars: [
        { x: 220, y: 72, width: 160, height: 14 },
        { x: 220, y: 838, width: 160, height: 14 },
      ],
      aeroFeatures: [
        // Exposed roll bar behind seats
        "M 210 528 Q 235 510 260 528",
        "M 340 528 Q 365 510 390 528",
      ],
    };
  }

  // 6. Volkswagen Golf R (Mk7 / Mk8)
  if (id.includes("golf-r")) {
    return {
      outerMonocoque:
        "M 210 56 C 260 48, 340 48, 390 56 C 445 68, 472 115, 480 180 C 486 245, 482 340, 482 460 C 482 560, 484 660, 476 755 C 470 820, 442 858, 395 864 C 345 870, 255 870, 205 864 C 158 858, 130 820, 124 755 C 116 660, 118 560, 118 460 C 118 340, 114 245, 120 180 C 128 115, 155 68, 210 56 Z",
      greenhouseGlass:
        "M 172 265 Q 300 250 428 265 L 420 670 Q 300 685 180 670 Z",
      shutLines: [
        // Sharp hood line
        "M 134 235 Q 300 250 466 235",
        // Front & Rear doors
        "M 118 410 L 176 410",
        "M 482 410 L 424 410",
        "M 120 575 L 180 575",
        "M 480 575 L 420 575",
        // Vertical tailgate shutline
        "M 132 770 L 468 770",
      ],
      crashBars: [
        { x: 210, y: 64, width: 180, height: 16 },
        { x: 210, y: 846, width: 180, height: 16 },
      ],
      aeroFeatures: [
        // Extended hot-hatch roof spoiler
        "M 155 668 Q 300 655 445 668 L 452 685 Q 300 672 148 685 Z",
        // Quad exhaust outlets
        "M 170 868 L 195 868",
        "M 205 868 L 230 868",
        "M 370 868 L 395 868",
        "M 405 868 L 430 868",
      ],
    };
  }

  // 7. BMW M3 (E46 / G80)
  if (id.includes("bmw-m3")) {
    return {
      outerMonocoque:
        "M 210 52 C 260 40, 340 40, 390 52 C 452 64, 478 112, 486 172 C 494 232, 478 302, 474 382 C 470 442, 478 518, 498 598 C 516 678, 510 740, 492 800 C 472 854, 436 872, 388 875 C 340 878, 260 878, 212 875 C 164 872, 128 854, 108 800 C 90 740, 84 678, 102 598 C 122 518, 130 442, 126 382 C 122 302, 106 232, 114 172 C 122 112, 148 64, 210 52 Z",
      greenhouseGlass:
        "M 172 290 Q 300 268 428 290 L 406 570 Q 300 592 194 570 Z",
      shutLines: [
        // Power dome bulge in hood!
        "M 255 120 L 255 240",
        "M 345 120 L 345 240",
        "M 255 240 Q 300 255 345 240",
        // Hood line
        "M 132 250 Q 300 268 468 250",
        // Doors
        "M 128 365 L 175 365",
        "M 472 365 L 425 365",
        "M 132 545 L 198 545",
        "M 468 545 L 402 545",
        // CSL Ducktail rear trunk lid
        "M 178 812 Q 300 826 422 812",
      ],
      crashBars: [
        { x: 215, y: 58, width: 170, height: 16 },
        { x: 215, y: 852, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // Quad center-grouped M-power exhaust tips
        "M 260 874 A 7 7 0 1 0 274 874 A 7 7 0 1 0 260 874",
        "M 282 874 A 7 7 0 1 0 296 874 A 7 7 0 1 0 282 874",
        "M 304 874 A 7 7 0 1 0 318 874 A 7 7 0 1 0 304 874",
        "M 326 874 A 7 7 0 1 0 340 874 A 7 7 0 1 0 326 874",
      ],
    };
  }

  // 8. Ford Mustang GT (S550)
  if (id.includes("mustang")) {
    return {
      outerMonocoque:
        "M 205 48 C 260 36, 340 36, 395 48 C 455 60, 482 108, 490 170 C 498 232, 482 305, 478 385 C 474 445, 482 520, 502 600 C 520 680, 514 745, 495 805 C 474 860, 438 876, 390 878 C 340 880, 260 880, 210 878 C 162 876, 126 860, 105 805 C 86 745, 80 680, 98 600 C 118 520, 126 445, 122 385 C 118 305, 102 232, 110 170 C 118 108, 145 60, 205 48 Z",
      greenhouseGlass:
        "M 170 290 Q 300 268 430 290 L 402 575 Q 300 598 198 575 Z",
      shutLines: [
        // Long sculpted hood with dual heat extractors
        "M 130 252 Q 300 270 470 252",
        "M 235 155 L 255 190",
        "M 365 155 L 345 190",
        // Doors
        "M 125 365 L 174 365",
        "M 475 365 L 426 365",
        "M 130 550 L 198 550",
        "M 470 550 L 402 550",
        // Tri-bar taillight indicators
        "M 135 825 L 160 825",
        "M 440 825 L 465 825",
      ],
      crashBars: [
        { x: 210, y: 56, width: 180, height: 16 },
        { x: 210, y: 852, width: 180, height: 16 },
      ],
      aeroFeatures: [
        // Front chin splitter
        "M 150 55 L 205 42 Q 300 32 395 42 L 450 55 L 460 70 L 140 70 Z",
        // Quad aggressive exhaust tips
        "M 175 872 L 200 872",
        "M 210 872 L 235 872",
        "M 365 872 L 390 872",
        "M 400 872 L 425 872",
      ],
    };
  }

  // Fallback to archetype
  return getTopViewPaths(archetype);
}

export function getModelSideViewGeometry(vehicle: Vehicle): SideViewGeometry {
  const id = vehicle.id.toLowerCase();
  const archetype = getBodyArchetype(vehicle.body);

  // 1. Hyundai Elantra N (CN7 N)
  if (id.includes("elantra-n") || id.includes("elantra-cn7")) {
    return {
      groundClearanceMm: 135,
      overallHeightMm: 1415,
      overallLengthMm: 4675,
      // Sharp geometric fastback sedan profile
      bodyPath:
        "M 65 355 L 70 315 C 80 275, 115 255, 175 250 L 350 238 C 400 230, 430 180, 480 162 C 540 142, 650 142, 710 165 C 770 188, 830 235, 885 248 L 935 252 C 948 260, 955 285, 950 335 L 940 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 415 232 L 485 168 L 700 168 L 795 245 Z",
      pillarLines: [
        "M 575 168 L 570 235", // B-pillar
        "M 685 168 L 710 238", // C-pillar quarter window
      ],
      doorShutLines: [
        "M 370 236 L 360 365",
        "M 570 235 L 565 365",
        "M 740 242 L 725 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      // Swan-neck N spoiler
      rearSpoiler:
        "M 885 230 L 945 224 L 950 235 L 890 240 Z",
    };
  }

  // 2. Kia Stinger GT (CK)
  if (id.includes("stinger")) {
    return {
      groundClearanceMm: 130,
      overallHeightMm: 1400,
      overallLengthMm: 4830,
      // Sweeping Gran Turismo fastback
      bodyPath:
        "M 60 355 L 68 318 C 78 278, 115 258, 180 252 L 365 240 C 415 232, 445 182, 495 165 C 555 145, 665 145, 725 168 C 785 192, 850 240, 905 250 L 950 255 C 960 265, 965 290, 960 340 L 950 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 430 235 L 498 172 L 715 172 L 815 248 Z",
      pillarLines: [
        "M 590 172 L 585 238",
        "M 700 172 L 725 242",
      ],
      doorShutLines: [
        "M 385 238 L 375 365",
        "M 585 238 L 578 365",
        "M 760 244 L 745 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 915 245 L 955 242 L 958 250 L 918 252 Z",
    };
  }

  // 3. Toyota Supra (A80)
  if (id.includes("supra-a80")) {
    return {
      groundClearanceMm: 115,
      overallHeightMm: 1275,
      overallLengthMm: 4515,
      bodyPath:
        "M 70 355 L 75 318 C 85 280, 120 265, 185 260 L 360 248 C 410 238, 440 195, 480 175 C 530 150, 630 150, 680 175 C 730 200, 785 245, 845 255 L 915 260 C 935 268, 945 292, 940 338 L 930 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 415 240 L 485 180 L 665 180 L 755 250 Z",
      pillarLines: [
        "M 550 180 L 540 245",
      ],
      doorShutLines: [
        "M 370 245 L 360 365",
        "M 620 230 L 610 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      // Massive tall Supra hoop wing
      rearSpoiler:
        "M 865 255 L 880 195 L 940 195 L 945 205 L 892 205 L 882 258 Z",
    };
  }

  // 4. Nissan Silvia S15
  if (id.includes("silvia-s15")) {
    return {
      groundClearanceMm: 120,
      overallHeightMm: 1285,
      overallLengthMm: 4445,
      bodyPath:
        "M 72 355 L 78 322 C 88 288, 122 270, 180 266 L 360 252 C 410 242, 438 200, 480 180 C 530 156, 630 156, 680 180 C 730 206, 780 250, 840 260 L 912 265 C 932 270, 940 295, 936 340 L 926 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 412 245 L 485 186 L 668 186 L 752 254 Z",
      pillarLines: [
        "M 552 186 L 542 248",
      ],
      doorShutLines: [
        "M 372 250 L 362 365",
        "M 622 232 L 612 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 885 248 L 942 242 L 946 252 L 890 256 Z",
    };
  }

  // 5. Mazda Miata NA
  if (id.includes("miata-na")) {
    return {
      groundClearanceMm: 115,
      overallHeightMm: 1230,
      overallLengthMm: 3970,
      // Tiny compact roadster profile
      bodyPath:
        "M 95 355 L 102 325 C 112 295, 140 280, 195 275 L 340 265 C 385 258, 410 220, 445 200 C 490 180, 570 180, 610 200 C 650 220, 690 260, 740 268 L 845 272 C 865 278, 872 300, 868 342 L 858 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 380 258 L 450 205 L 595 205 L 655 264 Z",
      pillarLines: [
        "M 450 205 L 420 260",
      ],
      doorShutLines: [
        "M 345 265 L 335 365",
        "M 570 248 L 560 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      roofRack: undefined,
    };
  }

  // 6. Volkswagen Golf R
  if (id.includes("golf-r")) {
    return {
      groundClearanceMm: 125,
      overallHeightMm: 1465,
      overallLengthMm: 4285,
      // Upright hot-hatch with extended roof spoiler
      bodyPath:
        "M 75 355 L 82 320 C 92 282, 125 265, 185 260 L 350 248 C 400 238, 430 185, 475 165 C 525 145, 700 145, 755 145 C 800 145, 825 185, 835 240 L 850 338 L 840 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 410 240 L 478 172 L 740 172 L 795 242 Z",
      pillarLines: [
        "M 565 172 L 560 240",
        "M 670 172 L 665 240",
      ],
      doorShutLines: [
        "M 365 244 L 355 365",
        "M 560 240 L 552 365",
        "M 715 242 L 702 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      // Roof spoiler
      rearSpoiler:
        "M 740 142 L 785 138 L 788 148 L 745 150 Z",
    };
  }

  // 7. BMW M3
  if (id.includes("bmw-m3")) {
    return {
      groundClearanceMm: 120,
      overallHeightMm: 1370,
      overallLengthMm: 4490,
      bodyPath:
        "M 68 355 L 75 320 C 85 282, 120 266, 180 262 L 360 248 C 410 238, 438 192, 480 172 C 532 148, 638 148, 688 172 C 738 198, 792 242, 852 252 L 918 258 C 938 266, 946 290, 942 338 L 932 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 412 242 L 485 178 L 678 178 L 765 248 Z",
      pillarLines: [
        "M 558 178 L 548 244",
      ],
      doorShutLines: [
        "M 370 246 L 360 365",
        "M 625 232 L 615 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 885 245 L 945 240 L 948 248 L 890 252 Z",
    };
  }

  // 8. Ford Mustang GT (S550)
  if (id.includes("mustang")) {
    return {
      groundClearanceMm: 130,
      overallHeightMm: 1380,
      overallLengthMm: 4785,
      bodyPath:
        "M 62 355 L 70 318 C 80 278, 118 258, 185 252 L 368 240 C 418 230, 448 185, 498 168 C 555 146, 655 146, 715 168 C 775 192, 840 240, 895 250 L 945 254 C 955 264, 960 288, 955 338 L 945 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 428 234 L 498 174 L 705 174 L 805 246 Z",
      pillarLines: [
        "M 585 174 L 575 238",
      ],
      doorShutLines: [
        "M 380 238 L 370 365",
        "M 650 232 L 640 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 905 242 L 952 238 L 956 248 L 910 250 Z",
    };
  }

  // Fallback to archetype
  return getSideViewGeometry(archetype);
}
