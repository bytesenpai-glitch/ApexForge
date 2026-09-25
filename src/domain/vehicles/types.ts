import type { Layout, SwapTag } from "@at-sim/parts";

export type Region = "japan" | "germany" | "usa" | "korea";

export type Brand =
  | "hyundai"
  | "kia"
  | "toyota"
  | "lexus"
  | "nissan"
  | "honda"
  | "subaru"
  | "mazda"
  | "bmw"
  | "volkswagen"
  | "audi"
  | "mercedes"
  | "chevrolet"
  | "ford"
  | "dodge";

export type Body =
  | "sedan"
  | "hatch"
  | "liftback"
  | "coupe"
  | "suv"
  | "crossover"
  | "mpv"
  | "pickup"
  | "convertible";

export interface Vehicle {
  id: string;
  region: Region;
  brand: Brand;
  model: string;
  trim: string;
  generation: string;
  years: { from: number; to: number };
  platform: string;
  body: Body;
  layout: Layout;
  oem: {
    engineId: string;
    transmissionId: string;
    drivelineIds: string[];
  };
  engineMountFamilies: string[];
  transMountFamilies: string[];
  swapTags: SwapTag[];
}
