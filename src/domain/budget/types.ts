import type { Vehicle } from "@/domain/vehicles/types";

export type BudgetItemCategory =
  | "donor-parts"          // 중고 부품 (Контрактные ДВС, КПП, редуктор)
  | "performance-hardware"  // 튜닝 파츠 (Турбины, интеркулер, тормоза, подвеска)
  | "fabrication-labor"     // 커스텀 가공 공임 (ЧПУ фрезеровка, аргонная сварка, подрамник)
  | "electronics-tuning"    // 배선 및 맵핑 (Коса проводки, ЭБУ, диностенд)
  | "consumables";          // 오일 및 소모품 (Масла, жидкости, фитинги AN, крепеж)

export interface BudgetItem {
  id: string;
  name: string;
  koreanName: string;
  category: BudgetItemCategory;
  costKrw: number;
  supplierContext: string;
  isOptional: boolean;
  laborHours?: number;
  notes?: string;
}

export interface BuildBudgetQuote {
  quoteNumber: string;
  issueDateKst: string;
  validUntilKst: string;
  vehicleName: string;
  vehiclePlateMock: string;
  items: BudgetItem[];
  subtotalPartsKrw: number;
  subtotalLaborKrw: number;
  taxVatKrw: number; // 부가세 10%
  totalKrw: number;
  depositRequiredKrw: number; // 계약금 30%
}
