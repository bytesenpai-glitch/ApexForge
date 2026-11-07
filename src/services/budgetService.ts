import type { Vehicle } from "@/domain/vehicles/types";
import type { ResolvedBuildParts } from "@/types/tuning.types";
import type { BudgetItem, BuildBudgetQuote } from "@/domain/budget/types";

export function formatKrw(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function calculateBuildBudget(
  vehicle: Vehicle,
  resolved: ResolvedBuildParts,
): BuildBudgetQuote {
  const items: BudgetItem[] = [];

  // 1. ENGINE COST
  const isCustomEngine = resolved.engine.id !== vehicle.oem.engineId;
  if (isCustomEngine) {
    let engineCostKrw = 4500000; // Baseline 4.5M KRW
    if (resolved.engine.powerHp > 450) engineCostKrw = 9500000;
    if (resolved.engine.family.includes("V8") || resolved.engine.family.includes("V10")) engineCostKrw = 12500000;
    if (resolved.engine.family.toLowerCase().includes("porsche") || resolved.engine.code.toLowerCase().includes("porsche")) engineCostKrw = 28000000;

    items.push({
      id: "bgt-engine",
      name: `Контрактный двигатель ${resolved.engine.code} ${resolved.engine.family}`,
      koreanName: `중고 엔진 어셈블리 (${resolved.engine.code})`,
      category: "donor-parts",
      costKrw: engineCostKrw,
      supplierContext: "폐차장 직거래 / JDM 수입 부품 전문점",
      isOptional: false,
      notes: "В сборе с навесным оборудованием (генератор, стартер, коса ДВС)",
    });
  }

  // 2. TRANSMISSION COST
  const isCustomTrans = resolved.transmission.id !== vehicle.oem.transmissionId;
  if (isCustomTrans) {
    let transCostKrw = 2200000;
    if (resolved.transmission.type === "sequential") transCostKrw = 14000000;
    if (resolved.transmission.code.includes("PDK") || resolved.transmission.code.includes("8HP")) transCostKrw = 5500000;

    items.push({
      id: "bgt-transmission",
      name: `Трансмиссия ${resolved.transmission.code} (${resolved.transmission.name})`,
      koreanName: `미션 어셈블리 (${resolved.transmission.code})`,
      category: "donor-parts",
      costKrw: transCostKrw,
      supplierContext: "국내 리빌드 전문점 / 수입 오버홀 파츠",
      isOptional: false,
      notes: "Проверена на люфты синхронизаторов и первичного вала",
    });
  }

  // 3. FABRICATION & HARDWARE ADAPTERS
  if (isCustomEngine || isCustomTrans) {
    items.push({
      id: "bgt-adapter-plate",
      name: "Комплект переходной планшайбы ЧПУ и маховика",
      koreanName: "CNC 미션 어댑터 플레이트 & 커스텀 플라이휠",
      category: "fabrication-labor",
      costKrw: 1450000,
      supplierContext: "문래동 정밀가공 / 6061-T6 Billet",
      isOptional: false,
      laborHours: 6,
      notes: "Включая крепеж класса 10.9 и центровочные втулки",
    });

    items.push({
      id: "bgt-mounts-crossmember",
      name: "Кастомные опоры двигателя и траверса КПП",
      koreanName: "커스텀 엔진 마운트 브래킷 & 미션 크로스멤버 제작",
      category: "fabrication-labor",
      costKrw: 950000,
      supplierContext: "레이스 팩토리 파브리케이션 (TIG 용접)",
      isOptional: false,
      laborHours: 12,
      notes: "Полиуретановые втулки 75A Shore",
    });

    items.push({
      id: "bgt-driveshaft",
      name: "Балансировка и подгонка длины карданного вала",
      koreanName: "드라이브샤프트 단축/연장 가공 및 고속 밸런싱",
      category: "fabrication-labor",
      costKrw: 550000,
      supplierContext: "특수 샤프트 전문 가공소",
      isOptional: false,
      laborHours: 4,
      notes: "Динамическая балансировка до 8000 об/мин с крестовинами 1350",
    });
  }

  // 4. BOLT-ON PERFORMANCE PARTS
  if (resolved.turbo && resolved.turbo.subtype !== "oem") {
    items.push({
      id: "bgt-turbo",
      name: `Турбо-кит: ${resolved.turbo.name} (${resolved.turbo.maker})`,
      koreanName: `터보차저 키트 (${resolved.turbo.name})`,
      category: "performance-hardware",
      costKrw: 3200000,
      supplierContext: "HKS / Garrett Korea 공식 대리점",
      isOptional: false,
      notes: `Наддув: ${resolved.turbo.boostBar} бар (+${resolved.turbo.powerGainHp} л.с.)`,
    });
  }

  if (resolved.intake && resolved.intake.subtype !== "oem") {
    items.push({
      id: "bgt-intake",
      name: `Впускная система / FMIC: ${resolved.intake.name}`,
      koreanName: `흡기 시스템 & 인터쿨러 (${resolved.intake.name})`,
      category: "performance-hardware",
      costKrw: 1250000,
      supplierContext: "Coupang 로켓설치 / Wagner Tuning",
      isOptional: false,
    });
  }

  if (resolved.exhaust && resolved.exhaust.subtype !== "oem") {
    items.push({
      id: "bgt-exhaust",
      name: `Спортивная выхлопная трасса: ${resolved.exhaust.name}`,
      koreanName: `커스텀 가변 배기 시스템 (${resolved.exhaust.name})`,
      category: "performance-hardware",
      costKrw: 2400000,
      supplierContext: "아크라포빅 / 준비엘 (Jun B.L) Korea",
      isOptional: false,
      notes: `Звуковое давление: ${resolved.exhaust.soundDb} дБ, диаметр: ${resolved.exhaust.pipeDiameterMm} мм`,
    });
  }

  if (resolved.brakes && resolved.brakes.subtype !== "oem") {
    items.push({
      id: "bgt-brakes",
      name: `Тормозная система Big Brake Kit: ${resolved.brakes.name}`,
      koreanName: `고성능 브레이크 키트 (${resolved.brakes.name})`,
      category: "performance-hardware",
      costKrw: 3800000,
      supplierContext: "Brembo Korea 공식 유통사",
      isOptional: false,
    });
  }

  if (resolved.suspension && resolved.suspension.subtype !== "oem") {
    items.push({
      id: "bgt-suspension",
      name: `Регулируемые винтовые стойки: ${resolved.suspension.name}`,
      koreanName: `감쇄력 조절식 일체형 코일오버 (${resolved.suspension.name})`,
      category: "performance-hardware",
      costKrw: 2600000,
      supplierContext: "KW Korea / 오린스 코리아",
      isOptional: false,
    });
  }

  // 5. ELECTRONICS, HARNESS & DYNO MAPPING
  items.push({
    id: "bgt-ecu-wiring",
    name: "Сращивание моторного жгута и кастомная проводка",
    koreanName: "스왑 배선 하네스 제작 & 차체 캔통신(CAN) 연동",
    category: "electronics-tuning",
    costKrw: 1200000,
    supplierContext: "레이스 모터스포츠 와이어링 랩",
    isOptional: false,
    laborHours: 16,
    notes: "Тефлоновые провода Raychem / герметичные разъемы Deutsch DT",
  });

  items.push({
    id: "bgt-dyno-tuning",
    name: "Индивидуальная калибровка на колесном диностенде (Dyno)",
    koreanName: "다이노젯 휠마력 실차 맵핑 (다이노 튜닝)",
    category: "electronics-tuning",
    costKrw: 800000,
    supplierContext: "Apex Forge 다이노 튜닝 센터",
    isOptional: false,
    notes: "Настройка топливных карт, угла зажигания и наддува по передачам",
  });

  // 6. CONSUMABLES & FLUIDS
  items.push({
    id: "bgt-consumables",
    name: "Технические жидкости, фильтры и крепежные метизы",
    koreanName: "고성능 합성유, 냉각수 및 고장력 볼트 일체",
    category: "consumables",
    costKrw: 650000,
    supplierContext: "Motul / Motul 300V Motorsport",
    isOptional: false,
    notes: "Моторное масло 300V 15W-50, трансмиссионное LSD масло, фреон",
  });

  // Totals calculation
  const subtotalPartsKrw = items
    .filter((i) => i.category !== "fabrication-labor" && i.category !== "electronics-tuning")
    .reduce((acc, i) => acc + i.costKrw, 0);

  const subtotalLaborKrw = items
    .filter((i) => i.category === "fabrication-labor" || i.category === "electronics-tuning")
    .reduce((acc, i) => acc + i.costKrw, 0);

  const taxVatKrw = Math.round((subtotalPartsKrw + subtotalLaborKrw) * 0.1);
  const totalKrw = subtotalPartsKrw + subtotalLaborKrw + taxVatKrw;
  const depositRequiredKrw = Math.round(totalKrw * 0.3);

  // KST Date generator
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const issueDateKst = `${year}.${month}.${day}`;
  const validUntilKst = `${year}.${String(now.getMonth() + 2).padStart(2, "0")}.${day}`;

  const quoteNumber = `AF-${year}${month}-${Math.floor(1000 + Math.random() * 9000)}`;
  const vehicleName = `${vehicle.brand.toUpperCase()} ${vehicle.model} (${vehicle.generation})`;

  return {
    quoteNumber,
    issueDateKst,
    validUntilKst,
    vehicleName,
    vehiclePlateMock: "12가 3456",
    items,
    subtotalPartsKrw,
    subtotalLaborKrw,
    taxVatKrw,
    totalKrw,
    depositRequiredKrw,
  };
}
