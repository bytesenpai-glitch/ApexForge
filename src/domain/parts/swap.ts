import { brakes, ecus, exhausts, intakes, suspensions } from "./data/bolt_ons";
import { drivelines } from "./data/drivelines";
import { engines } from "./data/engines";
import { transmissions } from "./data/transmissions";
import { turbos } from "./data/turbos";
import type {
  BrakePart,
  ChassisFitment,
  Driveline,
  EcuPart,
  Engine,
  ExhaustPart,
  Fitment,
  IntakePart,
  Part,
  SuspensionPart,
  SwapMatch,
  Transmission,
  TurboPart,
} from "./types";

const allPartsList: Part[] = [
  ...engines,
  ...transmissions,
  ...drivelines,
  ...turbos,
  ...intakes,
  ...exhausts,
  ...brakes,
  ...suspensions,
  ...ecus,
];

const byId = new Map<string, Part>(allPartsList.map((part) => [part.id, part]));

export function getPart(id: string): Part | undefined {
  return byId.get(id);
}

export function getEngine(id: string): Engine | undefined {
  const part = byId.get(id);
  return part?.kind === "engine" ? part : undefined;
}

export function getTransmission(id: string): Transmission | undefined {
  const part = byId.get(id);
  return part?.kind === "transmission" ? part : undefined;
}

export function getDriveline(id: string): Driveline | undefined {
  const part = byId.get(id);
  return part?.kind === "driveline" ? part : undefined;
}

export function getTurbo(id: string): TurboPart | undefined {
  const part = byId.get(id);
  return part?.kind === "turbo" ? part : undefined;
}

export function getIntake(id: string): IntakePart | undefined {
  const part = byId.get(id);
  return part?.kind === "intake" ? part : undefined;
}

export function getExhaust(id: string): ExhaustPart | undefined {
  const part = byId.get(id);
  return part?.kind === "exhaust" ? part : undefined;
}

export function getBrake(id: string): BrakePart | undefined {
  const part = byId.get(id);
  return part?.kind === "brakes" ? part : undefined;
}

export function getSuspension(id: string): SuspensionPart | undefined {
  const part = byId.get(id);
  return part?.kind === "suspension" ? part : undefined;
}

export function getEcu(id: string): EcuPart | undefined {
  const part = byId.get(id);
  return part?.kind === "ecu" ? part : undefined;
}

export function listParts(): Part[] {
  return allPartsList;
}

export function listTurbos(): TurboPart[] {
  return turbos;
}

export function listIntakes(): IntakePart[] {
  return intakes;
}

export function listExhausts(): ExhaustPart[] {
  return exhausts;
}

export function listBrakes(): BrakePart[] {
  return brakes;
}

export function listSuspensions(): SuspensionPart[] {
  return suspensions;
}

export function listEcus(): EcuPart[] {
  return ecus;
}

function shares<T>(a: readonly T[], b: readonly T[]): boolean {
  const set = new Set(a);
  return b.some((item) => set.has(item));
}

function layoutOrientation(layout: ChassisFitment["layout"]): Engine["orientation"] {
  return layout.startsWith("longitudinal") ? "longitudinal" : "transverse";
}

const knownEngineKits: Array<[string, string]> = [
  // Hyundai / Kia
  ["eng-g4fj-gamma-16t", "eng-g4fp-smartstream-16t"],
  ["eng-g4na-nu-20", "eng-g4kn-smartstream-25"],
  ["eng-g4kn-smartstream-25", "eng-g4kp-smartstream-25t"],
  ["eng-g4kh-theta-20t", "eng-g4kp-smartstream-25t"],
  ["eng-g4kl-theta-20t-rwd", "eng-g6dp-lambda-33t"],

  // JDM / K-Swap / 2JZ
  ["eng-bp-ze-18-mazda", "eng-k24a2-honda"],
  ["eng-skyactiv-g-20-mazda", "eng-k24a2-honda"],
  ["eng-bp-ze-18-mazda", "eng-k20c1-honda"],
  ["eng-sr20det-nissan", "eng-2jz-gte-toyota"],
  ["eng-sr20det-nissan", "eng-rb26dett-nissan"],
  ["eng-fa24d-toyota-subaru", "eng-2jz-gte-toyota"],
  ["eng-vq35de-nissan", "eng-2jz-gte-toyota"],
  ["eng-b58b30-bmw", "eng-2jz-gte-toyota"],
  ["eng-1jz-gte-toyota", "eng-2jz-gte-toyota"],

  // LSx Swaps
  ["eng-sr20det-nissan", "eng-ls3-gm"],
  ["eng-vq35de-nissan", "eng-ls3-gm"],
  ["eng-13b-rew-mazda", "eng-ls3-gm"],
  ["eng-fa24d-toyota-subaru", "eng-ls3-gm"],
  ["eng-s54b32-bmw", "eng-ls3-gm"],
  ["eng-bp-ze-18-mazda", "eng-ls3-gm"],

  // Euro / VAG / BMW
  ["eng-ea888-gen4-vag", "eng-daza-25-tfsi-audi"],
  ["eng-s54b32-bmw", "eng-b58b30-bmw"],
  ["eng-s54b32-bmw", "eng-s65b40-bmw"],
  ["eng-b58b30-bmw", "eng-s58b30-bmw"],

  // USDM
  ["eng-ecoboost-23-ford", "eng-coyote-50-ford"],
  ["eng-coyote-50-ford", "eng-predator-52-sc-ford"],
  ["eng-lt1-gm", "eng-lt4-supercharged-gm"],
  ["eng-lt1-gm", "eng-ls3-gm"],
  ["eng-392-hemi-mopar", "eng-hellcat-62-sc-mopar"],
];

function kitPair(a: string, b: string): boolean {
  return knownEngineKits.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

function engineFit(chassis: ChassisFitment, engine: Engine): SwapMatch | null {
  if (engine.id === chassis.oemEngineId) {
    return { part: engine, fit: "bolt-in", reasons: ["OEM engine"] };
  }

  const reasons: string[] = [];
  const orientationOk = engine.orientation === layoutOrientation(chassis.layout);
  const mountsOk = shares(engine.mountFamilies, chassis.engineMountFamilies);
  const tagsOk = shares(engine.swapTags, chassis.swapTags);

  if (!orientationOk) {
    reasons.push(
      `orientation mismatch (${engine.orientation} vs ${layoutOrientation(chassis.layout)})`,
    );
    if (tagsOk || kitPair(engine.id, chassis.oemEngineId)) {
      return { part: engine, fit: "custom", reasons };
    }
    return null;
  }

  if (mountsOk && tagsOk) {
    reasons.push("same mount family", "platform swap tags match");
    return { part: engine, fit: "bolt-in", reasons };
  }

  if (mountsOk || tagsOk || kitPair(engine.id, chassis.oemEngineId)) {
    if (mountsOk) reasons.push("mount family overlaps");
    if (tagsOk) reasons.push("swap tags overlap");
    if (kitPair(engine.id, chassis.oemEngineId)) reasons.push("known H/K swap kit");
    return { part: engine, fit: "kit", reasons };
  }

  return null;
}

function transFit(chassis: ChassisFitment, trans: Transmission, engine: Engine | undefined): SwapMatch | null {
  const isOem = trans.id === chassis.oemTransmissionId;
  const isOemEngine = !engine || engine.id === chassis.oemEngineId;

  if (isOem && isOemEngine) {
    return { part: trans, fit: "bolt-in", reasons: ["OEM gearbox"] };
  }

  const reasons: string[] = [];
  const layoutOk = trans.layouts.includes(chassis.layout);
  const mountsOk = shares(trans.mountFamilies, chassis.transMountFamilies);
  const tagsOk = shares(trans.swapTags, chassis.swapTags);
  const bellOk = engine ? trans.bellhousings.includes(engine.bellhousing) : false;
  const torqueOk = engine ? trans.torqueCapacityNm >= engine.torqueNm : true;
  const tuneTorqueOk = engine ? trans.torqueCapacityNm >= engine.tunedTorqueNm : true;

  if (isOem) {
    reasons.push("OEM gearbox for chassis");
  }

  if (!layoutOk) {
    reasons.push(`layout mismatch (${trans.layouts.join(", ")} vs ${chassis.layout})`);
    return tagsOk ? { part: trans, fit: "custom", reasons } : null;
  }

  if (engine && !bellOk) {
    reasons.push(`bellhousing ${trans.bellhousings.join("|")} ??engine ${engine.bellhousing}`);
  }
  if (engine && !torqueOk) {
    reasons.push(`torque cap ${trans.torqueCapacityNm} Nm < engine ${engine.torqueNm} Nm`);
  } else if (engine && !tuneTorqueOk) {
    reasons.push(`stock torque OK, tuned ${engine.tunedTorqueNm} Nm exceeds gearbox`);
  }

  if (layoutOk && (mountsOk || tagsOk || isOem) && bellOk && torqueOk) {
    reasons.unshift(isOem ? "OEM gearbox fits chosen engine" : "bolt-in with current engine");
    return { part: trans, fit: "bolt-in", reasons };
  }

  if (layoutOk && (mountsOk || tagsOk || bellOk || isOem)) {
    if (mountsOk) reasons.push("gearbox mounts overlap");
    if (tagsOk) reasons.push("swap tags overlap");
    const fit: Fitment = engine && (!bellOk || !torqueOk) ? "custom" : "kit";
    return { part: trans, fit, reasons };
  }

  return null;
}

function drivelineFit(chassis: ChassisFitment, item: Driveline): SwapMatch | null {
  if (chassis.oemDrivelineIds.includes(item.id)) {
    return { part: item, fit: "bolt-in", reasons: ["OEM driveline"] };
  }

  const layoutOk = item.layouts.includes(chassis.layout);
  const tagsOk = shares(item.swapTags, chassis.swapTags);

  if (layoutOk && tagsOk) {
    return { part: item, fit: "bolt-in", reasons: ["layout and tags match"] };
  }
  if (layoutOk) {
    return { part: item, fit: "kit", reasons: ["same layout, different axle spec"] };
  }
  if (tagsOk) {
    return { part: item, fit: "custom", reasons: ["tags match, layout differs"] };
  }
  return null;
}

function turboFit(engine: Engine | undefined, turbo: TurboPart): SwapMatch {
  if (turbo.subtype === "oem") {
    return { part: turbo, fit: "bolt-in", reasons: ["?авод?кой OEM надд?в / вп??к"] };
  }

  if (turbo.subtype === "itb") {
    if (engine?.aspiration === "na") {
      return {
        part: turbo,
        fit: "bolt-in",
        reasons: ["?ногод?о??ел?н?й вп??к (ITB) оп?имизи?ован дл? а?мо??е?ного мо?о?а"],
      };
    }
    return {
      part: turbo,
      fit: "custom",
      reasons: ["Т?еб?е??? пе?еделка ???бокомп?е??о?ного ??ак?а в безнадд?вн?й"],
    };
  }

  if (turbo.subtype === "supercharger") {
    if (engine?.cylinders === 8) {
      return {
        part: turbo,
        fit: "bolt-in",
        reasons: ["?ол?-он комплек? ?некового нагне?а?ел? в ?азвал блока V8"],
      };
    }
    return {
      part: turbo,
      fit: "kit",
      reasons: ["?а??омн?е к?он??ейн? к?еплени? п?иводного ?емн? нагне?а?ел?"],
    };
  }

  if (engine?.aspiration === "turbo" || engine?.aspiration === "twin-turbo") {
    return {
      part: turbo,
      fit: "bolt-in",
      reasons: ["???ма? замена ??а?ной ???бин? на ?вели?енн?? ?ли?к?"],
    };
  }

  return {
    part: turbo,
    fit: "kit",
    reasons: ["Т??бо-ки?: ??еб?е??? в?п??кной коллек?о? под ???бин?, ?лив ма?ла и пайпинг"],
  };
}

function intakeFit(intake: IntakePart): SwapMatch {
  if (intake.subtype === "oem") {
    return { part: intake, fit: "bolt-in", reasons: ["?авод?кой OEM вп??кной ??ак?"] };
  }
  return {
    part: intake,
    fit: "bolt-in",
    reasons: ["Холодн?й вп??к в ??а?н?е по?адо?н?е ме??а"],
  };
}

function exhaustFit(exhaust: ExhaustPart): SwapMatch {
  if (exhaust.subtype === "oem") {
    return { part: exhaust, fit: "bolt-in", reasons: ["?авод?ка? в??лопна? ?и??ема"] };
  }
  if (exhaust.subtype === "headers") {
    return {
      part: exhaust,
      fit: "kit",
      reasons: ["?авнодлинн?е коллек?о?? (??еб?е??? мон?аж ? подгонкой ?лан?ев)"],
    };
  }
  return {
    part: exhaust,
    fit: "bolt-in",
    reasons: ["???мо?о?на? ??а??а по ??а?н?м ?о?кам подве?ов к?зова"],
  };
}

function brakeFit(brake: BrakePart): SwapMatch {
  if (brake.subtype === "oem") {
    return { part: brake, fit: "bolt-in", reasons: ["?авод?кие OEM ?о?моза"] };
  }
  if (brake.subtype === "carbon-ceramic") {
    return {
      part: brake,
      fit: "kit",
      reasons: ["Угле?од-ке?амика: ??еб????? ??иленн?е пово?о?н?е к?лаки и адап?е??"],
    };
  }
  return {
    part: brake,
    fit: "bolt-in",
    reasons: ["Big Brake Kit ?о ??а?н?ми пе?е?одн?ми к?он??ейнами"],
  };
}

function suspensionFit(suspension: SuspensionPart): SwapMatch {
  if (suspension.subtype === "oem") {
    return { part: suspension, fit: "bolt-in", reasons: ["?авод?ка? OEM подве?ка"] };
  }
  if (suspension.subtype === "air-suspension") {
    return {
      part: suspension,
      fit: "kit",
      reasons: ["?невмоподве?ка: п?окладка пневмомаги???алей, ?е?иве?а и комп?е??о?а"],
    };
  }
  return {
    part: suspension,
    fit: "bolt-in",
    reasons: ["?ин?ов?е ??ойки в ??а?н?е ??акан? к?зова"],
  };
}

function ecuFit(ecu: EcuPart): SwapMatch {
  if (ecu.subtype === "oem") {
    return { part: ecu, fit: "bolt-in", reasons: ["?авод?ка? п?о?ивка OEM"] };
  }
  if (ecu.subtype === "standalone") {
    return {
      part: ecu,
      fit: "kit",
      reasons: ["Спо??-Э?У: подкл??ение ?е?ез Plug-and-Play ко?? пе?е?одника"],
    };
  }
  return {
    part: ecu,
    fit: "bolt-in",
    reasons: ["??ог?аммн?й ?ле? Э?У ?е?ез завод?кой OBD-II по??"],
  };
}

export function listSwaps(chassis: ChassisFitment, engineOverrideId?: string): SwapMatch[] {
  const engine = getEngine(engineOverrideId ?? chassis.oemEngineId);
  const matches: SwapMatch[] = [];

  for (const part of engines) {
    const match = engineFit(chassis, part);
    if (match) matches.push(match);
  }
  for (const part of transmissions) {
    const match = transFit(chassis, part, engine);
    if (match) matches.push(match);
  }
  for (const part of drivelines) {
    const match = drivelineFit(chassis, part);
    if (match) matches.push(match);
  }
  for (const part of turbos) {
    matches.push(turboFit(engine, part));
  }
  for (const part of intakes) {
    matches.push(intakeFit(part));
  }
  for (const part of exhausts) {
    matches.push(exhaustFit(part));
  }
  for (const part of brakes) {
    matches.push(brakeFit(part));
  }
  for (const part of suspensions) {
    matches.push(suspensionFit(part));
  }
  for (const part of ecus) {
    matches.push(ecuFit(part));
  }

  const rank: Record<Fitment, number> = { "bolt-in": 0, kit: 1, custom: 2 };
  return matches.sort((a, b) => rank[a.fit] - rank[b.fit] || a.part.id.localeCompare(b.part.id));
}

export function canSwap(chassis: ChassisFitment, partId: string, engineOverrideId?: string): SwapMatch | undefined {
  return listSwaps(chassis, engineOverrideId).find((match) => match.part.id === partId);
}
