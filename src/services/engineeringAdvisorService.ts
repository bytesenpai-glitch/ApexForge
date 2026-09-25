import type { Vehicle } from "@/domain/vehicles/types";
import type { FormattedTelemetry, PartSlotKind, ResolvedBuildParts } from "@/types/tuning.types";

export type AdviceSeverity = "critical" | "warning" | "tip" | "optimal";

export interface EngineeringAdvice {
  id: string;
  category: "torque" | "cooling" | "brakes" | "lsd" | "mounts" | "fuel" | "optimal";
  severity: AdviceSeverity;
  koreanTerm: string;
  title: string;
  description: string;
  targetSlot?: PartSlotKind;
  recommendedPartId?: string;
  actionText?: string;
}

/**
 * Real-time engineering advisor inspecting mechanical synergy across engine, gearbox,
 * thermal cooling, braking kinetic limits, and differential setups.
 */
export function analyzeBuildSynergy(
  vehicle: Vehicle,
  resolved: ResolvedBuildParts,
  telemetry: FormattedTelemetry,
): EngineeringAdvice[] {
  const adviceList: EngineeringAdvice[] = [];

  // 1. Transmission Torque Capacity Safety Limit (변속기 허용 토크 한계)
  if (telemetry.torqueWarning) {
    const overrunNm = Math.abs(telemetry.torqueHeadroomNm);
    const isRwd = vehicle.layout.includes("rwd");
    const isTransverse = vehicle.layout.includes("transverse");

    let recTransId = "trans-t56-magnum";
    let recLabel = "Свапнуть КПП Tremec T56 Magnum (1000 Н·м)";

    if (isTransverse) {
      recTransId = "trans-n-dct-8";
      recLabel = "Свапнуть усиленную 8DCT N-Power (550 Н·м)";
    } else if (isRwd) {
      recTransId = "trans-bmw-8hp70-at";
      recLabel = "Свапнуть автомат ZF 8HP70 (750 Н·м)";
    }

    adviceList.push({
      id: "adv-torque-overload",
      category: "torque",
      severity: "critical",
      koreanTerm: "변속기 허용 토크 초과 (Torque Overload)",
      title: "Критическая перегрузка трансмиссии",
      description: `Текущий крутящий момент (${telemetry.torqueNm} Н·м) превышает предел коробки ${resolved.transmission.code} (${resolved.transmission.torqueCapacityNm} Н·м) на ${overrunNm} Н·м. Высокий риск срыва шлицев первичного вала и разрушения шестерен 3-й передачи.`,
      targetSlot: "transmission",
      recommendedPartId: recTransId,
      actionText: recLabel,
    });
  }

  // 2. Forced Induction Thermal Balance (흡기 및 인터쿨러 냉각 밸런с)
  const isHighBoost =
    Boolean(resolved.turbo && (resolved.turbo.boostBar >= 1.0 || resolved.turbo.powerGainHp >= 100));
  const hasNoFmic = !resolved.intake || resolved.intake.subtype === "oem";

  if (isHighBoost && hasNoFmic) {
    adviceList.push({
      id: "adv-cooling-fmic",
      category: "cooling",
      severity: "warning",
      koreanTerm: "인터쿨러 열용량 부족 (Intake Heat Soak)",
      title: "Недостаточная производительность интеркулера",
      description: `Установлен наддув с высоким давлением буста (+${resolved.turbo?.powerGainHp} л.с.), но впускной тракт остаётся стоковым. Температура воздуха на впуске (IAT) будет превышать 65°C, вызывая детонацию и аварийный откат УОЗ.`,
      targetSlot: "intake",
      recommendedPartId: "in-fmic-pro",
      actionText: "Установить фронтальный интеркулер FMIC 600x300",
    });
  }

  // 3. Kinetic Braking Match (제동력 및 운동에너지 매칭)
  const powerDelta = telemetry.raw.powerDeltaHp;
  const hasStockBrakes = !resolved.brakes || resolved.brakes.subtype === "oem";

  if (powerDelta >= 85 && hasStockBrakes) {
    adviceList.push({
      id: "adv-brakes-bbk",
      category: "brakes",
      severity: "warning",
      koreanTerm: "제동력 불균형 (Braking Deficit)",
      title: "Недостаточная тормозная способность для возросшей мощности",
      description: `Прибавка мощности (+${powerDelta} л.с.) значительно увеличила кинетическую энергию болида. Стоковые однопоршневые суппорты подвержены тепловому федингу (Brake Fade) при сериях торможений со скорости 180+ км/ч.`,
      targetSlot: "brakes",
      recommendedPartId: "br-bbk-6pot",
      actionText: "Установить многопоршневой Big Brake Kit (BBK 6-pot)",
    });
  }

  // 4. Differential Lock Rate & Drift/Track Setup (차동제한장치 LSD 최적화)
  const isHighPower = telemetry.powerHp >= 300;
  const isOpenDiff =
    !resolved.differential ||
    resolved.differential.subtype === "open" ||
    resolved.driveline.code.toLowerCase().includes("open");

  if (isHighPower && isOpenDiff) {
    adviceList.push({
      id: "adv-diff-lsd",
      category: "lsd",
      severity: "tip",
      koreanTerm: "차동장치 휠스핀 손실 (Open Diff Wheelspin)",
      title: "Потеря тяги через открытый свободный дифференциал",
      description: `При мощности ${telemetry.powerHp} л.с. открытый редуктор допускает пробуксовку разгруженного внутреннего колеса ("One-Wheel Peel"). Механический LSD обеспечит симметричную блокировку и контролируемый выход из апекса.`,
      targetSlot: "differential",
      recommendedPartId: "diff-cusco-2way",
      actionText: "Установить дисковый 2-Way LSD редуктор",
    });
  }

  // 5. Motor Mount Stiffness & Drivetrain Flex (엔진 마운트 강성 밸런스)
  const isHighTorque = telemetry.torqueNm >= 520;
  const hasRubberMounts = !resolved.mounts || resolved.mounts.subtype === "oem-rubber";

  if (isHighTorque && hasRubberMounts) {
    adviceList.push({
      id: "adv-mount-flex",
      category: "mounts",
      severity: "tip",
      koreanTerm: "엔진 틸팅 롤링 방지 (Motor Mount Rigidity)",
      title: "Избыточное отклонение двигателя под нагрузкой",
      description: `Крутящий момент ${telemetry.torqueNm} Н·м приводит к наклону мотора до 14 мм на мягких резиновых подушках OEM. Это перегружает фланцы выхлопа и затрудняет четкое переключение передач на треке.`,
      targetSlot: "mounts",
      recommendedPartId: "mount-poly-70a-street",
      actionText: "Установить полиуретановые опоры ДВС 70A",
    });
  }

  // 6. Optimal Synergy State (완벽한 기계적 밸런스)
  if (adviceList.length === 0) {
    adviceList.push({
      id: "adv-optimal",
      category: "optimal",
      severity: "optimal",
      koreanTerm: "최적의 밸런스 달성 (Engineered Harmony)",
      title: "Отличный инженерный баланс шасси и силовой установки",
      description: `Трансмиссия имеет достаточный запас по крутящему моменту (+${telemetry.torqueHeadroomNm} Н·м), система охлаждения и тормоза полностью согласованы с отдачей двигателя.`,
    });
  }

  return adviceList;
}
