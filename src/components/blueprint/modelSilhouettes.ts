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
      outerMonocoque:
        "M 210 52 C 260 42, 340 42, 390 52 C 445 64, 474 105, 482 165 C 490 225, 482 315, 480 425 C 478 535, 484 640, 482 745 C 480 815, 448 855, 395 864 C 345 870, 255 870, 205 864 C 152 855, 120 815, 118 745 C 116 640, 122 535, 120 425 C 118 315, 110 225, 118 165 C 126 105, 155 64, 210 52 Z",
      greenhouseGlass:
        "M 172 275 Q 300 258 428 275 L 420 635 Q 300 655 180 635 Z",
      shutLines: [
        "M 130 245 L 200 260 L 400 260 L 470 245",
        "M 120 415 L 174 415",
        "M 480 415 L 426 415",
        "M 119 565 L 178 565",
        "M 481 565 L 422 565",
        "M 174 415 Q 300 415 426 415",
        "M 188 630 Q 300 650 412 630",
        "M 165 745 Q 300 760 435 745",
        "M 140 100 L 170 140 L 135 155 Z",
        "M 460 100 L 430 140 L 465 155 Z",
      ],
      crashBars: [
        { x: 210, y: 58, width: 180, height: 16 },
        { x: 210, y: 846, width: 180, height: 16 },
      ],
      aeroFeatures: [
        "M 160 55 L 205 45 Q 300 36 395 45 L 440 55 L 452 75 L 436 78 L 395 50 Q 300 44 205 50 L 164 78 L 148 75 Z",
        "M 145 825 Q 300 842 455 825 L 462 840 Q 300 858 138 840 Z",
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
        "M 132 250 Q 300 265 468 250",
        "M 230 150 L 250 180",
        "M 370 150 L 350 180",
        "M 116 425 L 175 425",
        "M 484 425 L 425 425",
        "M 117 580 L 180 580",
        "M 483 580 L 420 580",
        "M 184 645 Q 300 668 416 645",
        "M 125 790 L 155 830 L 445 830 L 475 790",
      ],
      crashBars: [
        { x: 215, y: 60, width: 170, height: 16 },
        { x: 210, y: 848, width: 180, height: 16 },
      ],
      aeroFeatures: [
        "M 165 870 L 195 870",
        "M 205 870 L 235 870",
        "M 365 870 L 395 870",
        "M 405 870 L 435 870",
      ],
    };
  }

  // 3. Mitsubishi Lancer Evolution IX MR (CT9A)
  if (id.includes("lancer-evo") || id.includes("evolution")) {
    return {
      // Boxy, aggressive WRC rally sedan with wide flared front and rear box arches
      outerMonocoque:
        "M 210 54 C 255 46, 345 46, 390 54 C 445 66, 482 110, 486 170 C 490 220, 474 310, 472 410 C 470 510, 488 620, 492 730 C 494 805, 452 856, 395 864 C 345 870, 255 870, 205 864 C 148 856, 106 805, 108 730 C 112 620, 130 510, 128 410 C 126 310, 110 220, 114 170 C 118 110, 155 66, 210 54 Z",
      greenhouseGlass:
        "M 168 280 Q 300 265 432 280 L 424 640 Q 300 655 176 640 Z",
      shutLines: [
        // Huge central aluminum mesh hood heat extractor vent
        "M 240 140 L 360 140 L 340 210 L 260 210 Z",
        // Twin NACA cooling ducts on hood
        "M 205 160 L 225 180 L 210 185 Z",
        "M 395 160 L 375 180 L 390 185 Z",
        // Hood shutline
        "M 125 250 Q 300 262 475 250",
        // Front & Rear doors
        "M 124 410 L 170 410",
        "M 476 410 L 430 410",
        "M 122 560 L 174 560",
        "M 478 560 L 426 560",
        // Rear trunk
        "M 155 745 Q 300 758 445 745",
      ],
      crashBars: [
        { x: 210, y: 60, width: 180, height: 16 },
        { x: 210, y: 846, width: 180, height: 16 },
      ],
      aeroFeatures: [
        // Front rally chin lip
        "M 150 56 L 205 46 Q 300 38 395 46 L 450 56 L 460 72 L 140 72 Z",
        // Roof vortex generators (9 shark fins across rear glass top)
        "M 200 635 L 205 645 M 230 635 L 235 645 M 260 635 L 265 645 M 290 635 L 295 645 M 320 635 L 325 645 M 350 635 L 355 645 M 380 635 L 385 645 M 400 635 L 405 645",
        // Massive carbon-fiber rear rally wing with wickerbill
        "M 135 815 Q 300 832 465 815 L 472 834 Q 300 850 128 834 Z",
        // Single 115mm titanium cannon exhaust tip (left side JDM spec)
        "M 175 868 A 12 12 0 1 0 199 868 A 12 12 0 1 0 175 868",
      ],
    };
  }

  // 4. Porsche 911 GT3 (992)
  if (id.includes("porsche") || id.includes("992") || id.includes("gt3")) {
    return {
      // Iconic rear-engine teardrop silhouette with wide widebody rear hips
      outerMonocoque:
        "M 215 58 C 265 48, 335 48, 385 58 C 438 68, 468 112, 474 175 C 478 238, 464 320, 460 415 C 456 505, 480 595, 506 685 C 522 755, 488 830, 420 858 C 365 868, 235 868, 180 858 C 112 830, 78 755, 94 685 C 120 595, 144 505, 140 415 C 136 320, 122 238, 126 175 C 132 112, 162 68, 215 58 Z",
      greenhouseGlass:
        "M 178 285 Q 300 262 422 285 L 396 580 Q 300 605 204 580 Z",
      shutLines: [
        // Front hood nostrils (dual air extractors)
        "M 240 110 L 265 145 L 250 150 Z",
        "M 360 110 L 335 145 L 350 150 Z",
        // Front frunk hood line
        "M 155 240 Q 300 258 445 240",
        // 2-door coupe cut
        "M 136 360 L 180 360",
        "M 464 360 L 420 360",
        "M 142 530 L 205 530",
        "M 458 530 L 395 530",
        // Rear engine lid cooling slatted grille
        "M 220 660 L 380 660 M 220 680 L 380 680 M 220 700 L 380 700",
      ],
      crashBars: [
        { x: 215, y: 64, width: 170, height: 16 },
        { x: 215, y: 846, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // Huge top-mounted Swan-Neck GT3 Rear Wing
        "M 125 790 Q 300 812 475 790 L 485 814 Q 300 838 115 814 Z",
        // Center-exit dual GT3 titanium exhaust pipes
        "M 285 868 A 9 9 0 1 0 303 868 A 9 9 0 1 0 285 868",
        "M 312 868 A 9 9 0 1 0 330 868 A 9 9 0 1 0 312 868",
      ],
    };
  }

  // 5. Honda Civic Type R (EK9 / FL5)
  if (id.includes("civic-type-r") || id.includes("ek9")) {
    return {
      // Classic pure JDM lightweight 3-door hot hatch
      outerMonocoque:
        "M 215 58 C 260 48, 340 48, 385 58 C 438 70, 468 118, 474 185 C 478 250, 470 350, 470 470 C 470 575, 472 675, 464 760 C 458 820, 432 856, 385 862 C 340 866, 260 866, 215 862 C 168 856, 142 820, 136 760 C 128 675, 130 575, 130 470 C 130 350, 122 250, 126 185 C 132 118, 162 70, 215 58 Z",
      greenhouseGlass:
        "M 170 268 Q 300 252 430 268 L 420 680 Q 300 695 180 680 Z",
      shutLines: [
        "M 138 238 Q 300 252 462 238",
        "M 130 430 L 174 430",
        "M 470 430 L 426 430",
        "M 140 770 L 460 770",
      ],
      crashBars: [
        { x: 215, y: 64, width: 170, height: 16 },
        { x: 215, y: 844, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // Front Spoon-style aero lip
        "M 160 58 L 210 48 Q 300 40 390 48 L 440 58 L 450 72 L 150 72 Z",
        // High-mounted EK9 roof wing spoiler
        "M 155 675 Q 300 660 445 675 L 452 694 Q 300 678 148 694 Z",
        // Single 76mm N1 exhaust cannon (right side)
        "M 395 864 A 9 9 0 1 0 413 864 A 9 9 0 1 0 395 864",
      ],
    };
  }

  // 6. Toyota GR Yaris (RZ)
  if (id.includes("gr-yaris") || id.includes("yaris")) {
    return {
      // Ultra-wide bulging rear WRC rally haunches with compact length
      outerMonocoque:
        "M 215 62 C 260 52, 340 52, 385 62 C 438 74, 468 122, 475 190 C 480 255, 472 345, 470 445 C 468 535, 492 635, 502 730 C 506 795, 465 848, 395 856 C 345 862, 255 862, 205 856 C 135 848, 94 795, 98 730 C 108 635, 132 535, 130 445 C 128 345, 120 255, 125 190 C 132 122, 162 74, 215 62 Z",
      greenhouseGlass:
        "M 175 272 Q 300 256 425 272 L 406 665 Q 300 682 194 665 Z",
      shutLines: [
        "M 135 240 Q 300 255 465 240",
        "M 130 420 L 175 420",
        "M 470 420 L 425 420",
        "M 145 765 L 455 765",
      ],
      crashBars: [
        { x: 215, y: 68, width: 170, height: 16 },
        { x: 215, y: 838, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // GR-Four front massive intake mouth
        "M 175 80 L 425 80 L 415 125 L 185 125 Z",
        // WRC rear roof spoiler
        "M 160 658 Q 300 642 440 658 L 448 676 Q 300 660 152 676 Z",
        // Twin round rally exhaust tips
        "M 175 858 A 9 9 0 1 0 193 858 A 9 9 0 1 0 175 858",
        "M 407 858 A 9 9 0 1 0 425 858 A 9 9 0 1 0 407 858",
      ],
    };
  }

  // 7. Chevrolet Corvette C6 Z06 (LS7)
  if (id.includes("corvette") || id.includes("z06")) {
    return {
      // Wide, ultra-low front-midship supercar silhouette with glass bubble hatch
      outerMonocoque:
        "M 210 52 C 260 40, 340 40, 390 52 C 452 64, 482 110, 488 175 C 494 238, 478 320, 474 415 C 470 510, 488 610, 508 710 C 522 785, 485 852, 415 864 C 360 870, 240 870, 185 864 C 115 852, 78 785, 92 710 C 112 610, 130 510, 126 415 C 122 320, 106 238, 112 175 C 118 110, 148 64, 210 52 Z",
      greenhouseGlass:
        "M 172 288 Q 300 265 428 288 L 398 620 Q 300 645 202 620 Z",
      shutLines: [
        // Front nose scoop for LS7 7.0L cold air intake
        "M 255 75 L 345 75 L 340 92 L 260 92 Z",
        // Long reverse-opening front clamshell hood
        "M 126 270 Q 300 290 474 270",
        // Doors with Corvette side gills
        "M 115 380 L 175 380",
        "M 485 380 L 425 380",
        // Fastback glass hatch
        "M 195 625 Q 300 650 405 625",
      ],
      crashBars: [
        { x: 215, y: 58, width: 170, height: 16 },
        { x: 215, y: 846, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // Z06 Front carbon splitter
        "M 150 56 L 205 44 Q 300 34 395 44 L 450 56 L 460 72 L 140 72 Z",
        // Iconic 4 center-grouped exhaust tips
        "M 264 866 A 7 7 0 1 0 278 866 A 7 7 0 1 0 264 866",
        "M 284 866 A 7 7 0 1 0 298 866 A 7 7 0 1 0 284 866",
        "M 304 866 A 7 7 0 1 0 318 866 A 7 7 0 1 0 304 866",
        "M 324 866 A 7 7 0 1 0 338 866 A 7 7 0 1 0 324 866",
      ],
    };
  }

  // 8. Toyota Supra (A80)
  if (id.includes("supra-a80")) {
    return {
      outerMonocoque:
        "M 210 55 C 260 45, 340 45, 390 55 C 445 68, 475 115, 482 180 C 488 245, 475 330, 470 425 C 465 520, 482 625, 498 725 C 510 795, 475 856, 410 864 C 360 870, 240 870, 190 864 C 125 856, 90 795, 102 725 C 118 625, 135 520, 130 425 C 125 330, 112 245, 118 180 C 125 115, 155 68, 210 55 Z",
      greenhouseGlass:
        "M 175 280 Q 300 260 425 280 L 402 590 Q 300 615 198 590 Z",
      shutLines: [
        "M 130 250 Q 300 268 470 250",
        "M 125 385 L 174 385",
        "M 475 385 L 426 385",
      ],
      crashBars: [
        { x: 215, y: 60, width: 170, height: 16 },
        { x: 210, y: 846, width: 180, height: 16 },
      ],
      aeroFeatures: [
        "M 135 810 Q 300 830 465 810 L 472 830 Q 300 850 128 830 Z",
        "M 165 868 A 12 12 0 1 0 189 868 A 12 12 0 1 0 165 868",
      ],
    };
  }

  // 9. Nissan Silvia S15
  if (id.includes("silvia-s15")) {
    return {
      outerMonocoque:
        "M 215 54 C 265 44, 335 44, 385 54 C 445 66, 474 112, 480 175 C 486 238, 472 325, 468 425 C 464 525, 476 630, 488 735 C 496 805, 462 856, 405 864 C 355 870, 245 870, 195 864 C 138 856, 104 805, 112 735 C 124 630, 136 525, 132 425 C 128 325, 114 238, 120 175 C 126 112, 155 66, 215 54 Z",
      greenhouseGlass:
        "M 174 278 Q 300 258 426 278 L 406 580 Q 300 605 194 580 Z",
      shutLines: [
        "M 132 250 Q 300 268 468 250",
        "M 124 380 L 175 380",
        "M 476 380 L 425 380",
      ],
      crashBars: [
        { x: 215, y: 60, width: 170, height: 16 },
        { x: 215, y: 846, width: 170, height: 16 },
      ],
      aeroFeatures: [
        "M 155 820 Q 300 834 445 820 L 452 836 Q 300 850 148 836 Z",
        "M 175 868 A 11 11 0 1 0 197 868 A 11 11 0 1 0 175 868",
      ],
    };
  }

  // 10. Mazda Miata NA
  if (id.includes("miata-na")) {
    return {
      outerMonocoque:
        "M 215 62 C 260 52, 340 52, 385 62 C 435 74, 462 122, 468 185 C 472 248, 462 335, 458 430 C 454 525, 465 625, 474 725 C 480 790, 448 845, 395 854 C 345 860, 255 860, 205 854 C 152 845, 120 790, 126 725 C 135 625, 146 525, 142 430 C 138 335, 128 248, 132 185 C 138 122, 165 74, 215 62 Z",
      greenhouseGlass:
        "M 178 285 Q 300 265 422 285 L 398 520 Q 300 540 202 520 Z",
      shutLines: [
        // Pop-up headlights
        "M 160 110 L 210 110 L 205 150 L 155 150 Z",
        "M 440 110 L 390 110 L 395 150 L 445 150 Z",
        "M 140 245 Q 300 262 460 245",
      ],
      crashBars: [
        { x: 215, y: 68, width: 170, height: 16 },
        { x: 215, y: 836, width: 170, height: 16 },
      ],
      aeroFeatures: [
        "M 180 858 A 9 9 0 1 0 198 858 A 9 9 0 1 0 180 858",
      ],
    };
  }

  // 11. Nissan Skyline GT-R R34 (BNR34)
  if (id.includes("skyline") || id.includes("r34") || id.includes("bnr34")) {
    return {
      outerMonocoque:
        "M 210 50 C 260 42, 340 42, 390 50 C 448 58, 482 105, 486 170 C 490 232, 476 320, 474 425 C 472 530, 485 635, 492 735 C 498 805, 465 858, 405 866 C 355 870, 245 870, 195 866 C 135 858, 102 805, 108 735 C 115 635, 128 530, 126 425 C 124 320, 110 232, 114 170 C 118 105, 152 58, 210 50 Z",
      greenhouseGlass:
        "M 172 270 Q 300 252 428 270 L 412 610 Q 300 635 188 610 Z",
      shutLines: [
        // R34 signature front twin-nostril grille and hood lines
        "M 130 245 Q 300 260 470 245",
        "M 125 410 L 174 410",
        "M 475 410 L 426 410",
        "M 188 610 Q 300 630 412 610",
        "M 145 745 Q 300 758 455 745",
      ],
      crashBars: [
        { x: 210, y: 56, width: 180, height: 16 },
        { x: 210, y: 848, width: 180, height: 16 },
      ],
      aeroFeatures: [
        // Front bumper large intercooler mouth & brake ducts
        "M 165 72 L 435 72 L 420 115 L 180 115 Z",
        // Legendary BNR34 Tall Dual-Blade GT Wing
        "M 130 805 Q 300 818 470 805 L 476 828 Q 300 842 124 828 Z",
        // Stanchion mount brackets
        "M 215 805 L 215 832",
        "M 385 805 L 385 832",
        // Iconic 4 round tail-lamps (Outer large, Inner small)
        "M 152 860 A 8 8 0 1 0 168 860 A 8 8 0 1 0 152 860",
        "M 176 860 A 6 6 0 1 0 188 860 A 6 6 0 1 0 176 860",
        "M 412 860 A 6 6 0 1 0 424 860 A 6 6 0 1 0 412 860",
        "M 432 860 A 8 8 0 1 0 448 860 A 8 8 0 1 0 432 860",
        // Left-side large titanium 4.5-inch cannon exhaust
        "M 150 868 A 12 12 0 1 0 174 868 A 12 12 0 1 0 150 868",
      ],
    };
  }

  // 12. BMW M3 (E46)
  if (id.includes("bmw-m3-e46") || id.includes("e46")) {
    return {
      outerMonocoque:
        "M 212 55 C 262 46, 338 46, 388 55 C 445 66, 476 112, 482 175 C 488 238, 474 325, 470 425 C 466 525, 478 630, 488 735 C 496 805, 460 856, 405 864 C 355 870, 245 870, 195 864 C 140 856, 104 805, 112 735 C 122 630, 134 525, 130 425 C 126 325, 112 238, 118 175 C 124 112, 155 66, 212 55 Z",
      greenhouseGlass:
        "M 175 278 Q 300 260 425 278 L 406 595 Q 300 620 194 595 Z",
      shutLines: [
        // E46 M Power Dome on Hood
        "M 255 120 Q 300 110 345 120 L 340 240 Q 300 248 260 240 Z",
        // Kidney grilles
        "M 250 56 L 290 56 L 288 85 L 252 85 Z",
        "M 310 56 L 350 56 L 348 85 L 312 85 Z",
        "M 132 250 Q 300 265 468 250",
        "M 125 385 L 175 385",
        "M 475 385 L 425 385",
        // M side gills
        "M 116 295 L 122 315",
        "M 484 295 L 478 315",
      ],
      crashBars: [
        { x: 215, y: 60, width: 170, height: 16 },
        { x: 215, y: 846, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // Quad closely grouped stainless exhaust tips
        "M 265 868 A 7 7 0 1 0 279 868 A 7 7 0 1 0 265 868",
        "M 285 868 A 7 7 0 1 0 299 868 A 7 7 0 1 0 285 868",
        "M 305 868 A 7 7 0 1 0 319 868 A 7 7 0 1 0 305 868",
        "M 325 868 A 7 7 0 1 0 339 868 A 7 7 0 1 0 325 868",
        // Subtle CSL trunk ducktail lip
        "M 185 842 Q 300 855 415 842 L 418 852 Q 300 864 182 852 Z",
      ],
    };
  }

  // 13. Mazda RX-7 (FD3S)
  if (id.includes("rx7") || id.includes("fd3s")) {
    return {
      outerMonocoque:
        "M 215 56 C 260 46, 340 46, 385 56 C 440 68, 474 116, 480 180 C 484 245, 466 330, 462 425 C 458 520, 474 625, 488 725 C 496 795, 458 854, 405 862 C 355 868, 245 868, 195 862 C 142 854, 104 795, 112 725 C 126 625, 142 520, 138 425 C 134 330, 116 245, 120 180 C 126 116, 160 68, 215 56 Z",
      greenhouseGlass:
        "M 176 280 Q 300 260 424 280 L 396 580 Q 300 610 204 580 Z",
      shutLines: [
        // Iconic Pop-up Headlights
        "M 152 105 L 208 105 L 202 152 L 148 152 Z",
        "M 448 105 L 392 105 L 398 152 L 452 152 Z",
        "M 135 242 Q 300 262 465 242",
        // Double-bubble roof contours
        "M 215 320 Q 255 310 285 320 L 285 490 Q 255 500 215 490 Z",
        "M 315 320 Q 345 310 385 320 L 385 490 Q 345 500 315 490 Z",
      ],
      crashBars: [
        { x: 215, y: 62, width: 170, height: 16 },
        { x: 215, y: 844, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // Curved rear spoiler
        "M 155 810 Q 300 826 445 810 L 452 828 Q 300 844 148 828 Z",
        // Dual stainless exhaust tips
        "M 175 864 A 10 10 0 1 0 195 864 A 10 10 0 1 0 175 864",
      ],
    };
  }

  // 14. Ford Mustang GT / Shelby GT500 (S550)
  if (id.includes("mustang") || id.includes("shelby")) {
    return {
      outerMonocoque:
        "M 212 50 C 262 40, 338 40, 388 50 C 452 62, 486 108, 492 175 C 498 240, 484 330, 480 430 C 476 530, 492 635, 502 735 C 510 805, 470 862, 410 868 C 360 872, 240 872, 190 868 C 130 862, 90 805, 98 735 C 108 635, 124 530, 120 430 C 116 330, 102 240, 108 175 C 114 108, 148 62, 212 50 Z",
      greenhouseGlass:
        "M 172 280 Q 300 262 428 280 L 412 605 Q 300 635 188 605 Z",
      shutLines: [
        // Aggressive dual hood heat extractors
        "M 230 145 L 265 145 L 260 210 L 235 210 Z",
        "M 370 145 L 335 145 L 340 210 L 365 210 Z",
        "M 124 265 Q 300 282 476 265",
        "M 115 390 L 175 390",
        "M 485 390 L 425 390",
      ],
      crashBars: [
        { x: 210, y: 56, width: 180, height: 16 },
        { x: 210, y: 848, width: 180, height: 16 },
      ],
      aeroFeatures: [
        // Massive front shark splitter
        "M 140 54 L 195 42 Q 300 32 405 42 L 460 54 L 470 70 L 130 70 Z",
        // Quad 4.0-inch active valved exhaust tips
        "M 152 868 A 9 9 0 1 0 170 868 A 9 9 0 1 0 152 868",
        "M 176 868 A 9 9 0 1 0 194 868 A 9 9 0 1 0 176 868",
        "M 406 868 A 9 9 0 1 0 424 868 A 9 9 0 1 0 406 868",
        "M 430 868 A 9 9 0 1 0 448 868 A 9 9 0 1 0 430 868",
      ],
    };
  }

  // 15. Genesis G70 3.3T Sport
  if (id.includes("g70")) {
    return {
      outerMonocoque:
        "M 215 54 C 265 44, 335 44, 385 54 C 445 66, 476 112, 484 175 C 492 238, 482 325, 480 430 C 478 535, 484 640, 482 745 C 478 815, 446 860, 390 866 C 340 870, 260 870, 210 866 C 154 860, 122 815, 118 745 C 116 640, 122 535, 120 430 C 118 325, 108 238, 116 175 C 124 112, 155 66, 215 54 Z",
      greenhouseGlass:
        "M 174 276 Q 300 258 426 276 L 416 640 Q 300 664 184 640 Z",
      shutLines: [
        // Genesis Crest Grille outline
        "M 245 56 L 355 56 L 335 98 L 300 115 L 265 98 Z",
        // Quad Two-Line Headlights
        "M 140 92 L 185 86",
        "M 140 104 L 185 98",
        "M 460 92 L 415 86",
        "M 460 104 L 415 98",
        "M 130 250 Q 300 265 470 250",
        "M 120 415 L 175 415",
        "M 480 415 L 425 415",
      ],
      crashBars: [
        { x: 215, y: 58, width: 170, height: 16 },
        { x: 215, y: 846, width: 170, height: 16 },
      ],
      aeroFeatures: [
        // Dual large oval exhaust ports
        "M 165 868 A 12 8 0 1 0 189 868 A 12 8 0 1 0 165 868",
        "M 411 868 A 12 8 0 1 0 435 868 A 12 8 0 1 0 411 868",
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
      bodyPath:
        "M 65 355 L 70 315 C 80 275, 115 255, 175 250 L 350 238 C 400 230, 430 180, 480 162 C 540 142, 650 142, 710 165 C 770 188, 830 235, 885 248 L 935 252 C 948 260, 955 285, 950 335 L 940 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 415 232 L 485 168 L 700 168 L 795 245 Z",
      pillarLines: [
        "M 575 168 L 570 235",
        "M 685 168 L 710 238",
      ],
      doorShutLines: [
        "M 370 236 L 360 365",
        "M 570 235 L 565 365",
        "M 740 242 L 725 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 885 230 L 945 224 L 950 235 L 890 240 Z",
    };
  }

  // 2. Mitsubishi Lancer Evolution IX MR (CT9A)
  if (id.includes("lancer-evo") || id.includes("evolution")) {
    return {
      groundClearanceMm: 140,
      overallHeightMm: 1450,
      overallLengthMm: 4535,
      // Aggressive boxy rally sedan profile with tall carbon wing
      bodyPath:
        "M 62 355 L 68 315 C 76 275, 115 258, 180 252 L 350 242 C 395 235, 425 185, 475 168 C 530 148, 645 148, 705 168 C 765 190, 815 238, 865 248 L 925 252 C 940 260, 948 285, 942 335 L 932 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 410 236 L 480 172 L 695 172 L 785 244 Z",
      pillarLines: [
        "M 570 172 L 565 238",
        "M 675 172 L 695 240",
      ],
      doorShutLines: [
        "M 365 240 L 355 365",
        "M 565 238 L 558 365",
        "M 725 244 L 710 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      // Tall authentic carbon WRC rear wing
      rearSpoiler:
        "M 865 250 L 880 190 L 935 190 L 940 200 L 890 200 L 880 252 Z",
    };
  }

  // 3. Porsche 911 GT3 (992)
  if (id.includes("porsche") || id.includes("992") || id.includes("gt3")) {
    return {
      groundClearanceMm: 100,
      overallHeightMm: 1279,
      overallLengthMm: 4573,
      // Tear-drop rear-engine fastback profile with massive swan-neck rear wing
      bodyPath:
        "M 65 355 L 72 322 C 82 285, 120 270, 185 265 L 365 252 C 415 242, 445 190, 485 170 C 535 145, 625 145, 675 170 C 725 195, 805 245, 875 255 L 945 260 C 955 270, 960 295, 952 342 L 942 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 420 245 L 490 175 L 660 175 L 785 252 Z",
      pillarLines: [
        "M 555 175 L 545 248",
      ],
      doorShutLines: [
        "M 375 250 L 365 365",
        "M 635 235 L 625 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      // Swan-neck GT3 tall rear wing
      rearSpoiler:
        "M 865 255 L 878 185 L 950 180 L 955 192 L 892 195 L 880 258 Z",
    };
  }

  // 4. Chevrolet Corvette C6 Z06 (LS7)
  if (id.includes("corvette") || id.includes("z06")) {
    return {
      groundClearanceMm: 105,
      overallHeightMm: 1245,
      overallLengthMm: 4460,
      // Ultra-low front-midship supercar profile with glass fastback bubble
      bodyPath:
        "M 68 355 L 74 322 C 84 285, 122 268, 190 262 L 375 248 C 425 238, 452 192, 492 172 C 542 148, 638 148, 688 172 C 738 198, 815 245, 875 255 L 935 260 C 948 268, 952 295, 946 342 L 936 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 425 242 L 498 178 L 675 178 L 795 250 Z",
      pillarLines: [
        "M 565 178 L 555 245",
      ],
      doorShutLines: [
        "M 382 248 L 372 365",
        "M 645 235 L 635 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 905 252 L 945 248 L 948 256 L 910 258 Z",
    };
  }

  // 5. Honda Civic Type R (EK9)
  if (id.includes("civic-type-r") || id.includes("ek9")) {
    return {
      groundClearanceMm: 130,
      overallHeightMm: 1365,
      overallLengthMm: 4180,
      bodyPath:
        "M 75 355 L 82 320 C 92 285, 125 268, 185 262 L 350 250 C 395 240, 425 188, 470 168 C 520 148, 680 148, 735 148 C 780 148, 805 188, 815 242 L 830 340 L 820 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 410 242 L 475 174 L 720 174 L 775 244 Z",
      pillarLines: [
        "M 555 174 L 548 242",
      ],
      doorShutLines: [
        "M 362 248 L 352 365",
        "M 620 236 L 610 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 720 145 L 775 140 L 778 150 L 725 152 Z",
    };
  }

  // 6. Toyota GR Yaris (RZ)
  if (id.includes("gr-yaris") || id.includes("yaris")) {
    return {
      groundClearanceMm: 124,
      overallHeightMm: 1455,
      overallLengthMm: 3995,
      bodyPath:
        "M 78 355 L 85 320 C 95 285, 128 268, 188 262 L 340 250 C 385 240, 415 188, 460 168 C 510 148, 660 148, 715 148 C 760 148, 785 188, 795 242 L 810 340 L 800 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 400 242 L 465 174 L 700 174 L 755 244 Z",
      pillarLines: [
        "M 545 174 L 538 242",
      ],
      doorShutLines: [
        "M 352 248 L 342 365",
        "M 600 236 L 590 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 700 145 L 755 140 L 758 150 L 705 152 Z",
    };
  }

  // 7. Toyota Supra (A80)
  if (id.includes("supra-a80")) {
    return {
      groundClearanceMm: 115,
      overallHeightMm: 1275,
      overallLengthMm: 4515,
      bodyPath:
        "M 70 355 L 75 318 C 85 280, 120 265, 185 260 L 360 248 C 410 238, 440 195, 480 175 C 530 150, 630 150, 680 175 C 730 200, 785 245, 845 255 L 915 260 C 935 268, 945 292, 940 338 L 930 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 415 240 L 485 180 L 665 180 L 755 250 Z",
      pillarLines: ["M 550 180 L 540 245"],
      doorShutLines: [
        "M 370 245 L 360 365",
        "M 620 230 L 610 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 865 255 L 880 195 L 940 195 L 945 205 L 892 205 L 882 258 Z",
    };
  }

  // 8. Nissan Silvia S15
  if (id.includes("silvia-s15")) {
    return {
      groundClearanceMm: 120,
      overallHeightMm: 1285,
      overallLengthMm: 4445,
      bodyPath:
        "M 72 355 L 78 322 C 88 288, 122 270, 180 266 L 360 252 C 410 242, 438 200, 480 180 C 530 156, 630 156, 680 180 C 730 206, 780 250, 840 260 L 912 265 C 932 270, 940 295, 936 340 L 926 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 412 245 L 485 186 L 668 186 L 752 254 Z",
      pillarLines: ["M 552 186 L 542 248"],
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

  // 9. Mazda Miata NA
  if (id.includes("miata-na")) {
    return {
      groundClearanceMm: 115,
      overallHeightMm: 1230,
      overallLengthMm: 3970,
      bodyPath:
        "M 95 355 L 102 325 C 112 295, 140 280, 195 275 L 340 265 C 385 258, 410 220, 445 200 C 490 180, 570 180, 610 200 C 650 220, 690 260, 740 268 L 845 272 C 865 278, 872 300, 868 342 L 858 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 380 258 L 450 205 L 595 205 L 655 264 Z",
      pillarLines: ["M 450 205 L 420 260"],
      doorShutLines: [
        "M 345 265 L 335 365",
        "M 570 248 L 560 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
    };
  }

  // 10. Nissan Skyline GT-R R34 (BNR34)
  if (id.includes("skyline") || id.includes("r34") || id.includes("bnr34")) {
    return {
      groundClearanceMm: 130,
      overallHeightMm: 1360,
      overallLengthMm: 4600,
      bodyPath:
        "M 65 355 L 70 310 C 80 265, 120 250, 180 246 L 360 236 C 415 228, 435 180, 480 160 C 535 140, 650 140, 705 162 C 760 185, 810 232, 870 244 L 930 248 C 948 255, 955 285, 950 338 L 940 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 415 228 L 485 165 L 695 165 L 785 242 Z",
      pillarLines: [
        "M 575 165 L 565 235",
      ],
      doorShutLines: [
        "M 370 240 L 360 365",
        "M 635 224 L 625 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 885 244 L 900 170 L 950 170 L 955 182 L 912 182 L 902 246 Z",
    };
  }

  // 11. BMW M3 (E46)
  if (id.includes("bmw-m3-e46") || id.includes("e46")) {
    return {
      groundClearanceMm: 110,
      overallHeightMm: 1370,
      overallLengthMm: 4492,
      bodyPath:
        "M 72 355 L 78 318 C 88 278, 125 260, 180 256 L 360 245 C 412 235, 436 190, 480 170 C 532 148, 642 148, 695 170 C 748 194, 795 240, 855 252 L 920 256 C 938 262, 945 288, 940 338 L 930 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 412 238 L 485 175 L 685 175 L 772 248 Z",
      pillarLines: [
        "M 570 175 L 560 242",
      ],
      doorShutLines: [
        "M 370 248 L 360 365",
        "M 630 232 L 620 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 890 254 L 925 248 L 928 255 L 895 258 Z",
    };
  }

  // 12. Mazda RX-7 (FD3S)
  if (id.includes("rx7") || id.includes("fd3s")) {
    return {
      groundClearanceMm: 115,
      overallHeightMm: 1230,
      overallLengthMm: 4285,
      bodyPath:
        "M 78 355 L 84 325 C 94 290, 128 274, 185 270 L 360 258 C 410 248, 435 204, 475 185 C 522 162, 615 162, 665 185 C 715 210, 765 252, 825 264 L 895 270 C 915 276, 924 300, 920 342 L 910 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 410 250 L 478 190 L 655 190 L 738 258 Z",
      pillarLines: ["M 545 190 L 535 252"],
      doorShutLines: [
        "M 368 258 L 358 365",
        "M 610 240 L 600 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 865 266 L 905 252 L 910 260 L 870 270 Z",
    };
  }

  // 13. Ford Mustang GT / Shelby GT500 (S550)
  if (id.includes("mustang") || id.includes("shelby")) {
    return {
      groundClearanceMm: 130,
      overallHeightMm: 1380,
      overallLengthMm: 4784,
      bodyPath:
        "M 65 355 L 70 310 C 80 262, 118 245, 175 240 L 370 228 C 425 220, 448 174, 495 155 C 555 135, 660 135, 715 158 C 770 180, 825 230, 885 244 L 940 248 C 958 256, 965 285, 960 338 L 950 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 425 222 L 498 160 L 705 160 L 802 240 Z",
      pillarLines: [
        "M 585 160 L 575 230",
      ],
      doorShutLines: [
        "M 378 232 L 368 365",
        "M 645 218 L 635 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 900 244 L 945 236 L 948 245 L 905 250 Z",
    };
  }

  // 14. Genesis G70 3.3T Sport
  if (id.includes("g70")) {
    return {
      groundClearanceMm: 130,
      overallHeightMm: 1400,
      overallLengthMm: 4685,
      bodyPath:
        "M 68 355 L 74 316 C 84 274, 120 256, 178 252 L 355 240 C 408 232, 434 184, 482 165 C 540 144, 650 144, 706 168 C 764 190, 820 236, 880 248 L 932 252 C 948 260, 954 286, 948 336 L 938 365 L 860 365 C 855 315, 805 315, 770 315 C 735 315, 685 315, 680 365 L 320 365 C 315 315, 265 315, 230 315 C 195 315, 145 315, 140 365 Z",
      glassPath:
        "M 418 234 L 488 170 L 700 170 L 790 246 Z",
      pillarLines: [
        "M 578 170 L 572 238",
        "M 684 170 L 706 240",
      ],
      doorShutLines: [
        "M 368 242 L 358 365",
        "M 565 240 L 555 365",
        "M 698 242 L 688 365",
      ],
      wheelWellFront: { cx: 230, cy: 355, r: 62 },
      wheelWellRear: { cx: 770, cy: 355, r: 62 },
      rearSpoiler:
        "M 896 250 L 934 246 L 936 254 L 898 256 Z",
    };
  }

  // Fallback to archetype
  return getSideViewGeometry(archetype);
}
