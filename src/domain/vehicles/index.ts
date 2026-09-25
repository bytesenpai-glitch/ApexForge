export type { Body, Brand, Region, Vehicle } from "./types";
export { hyundai } from "./data/hyundai";
export { kia } from "./data/kia";
export { japan } from "./data/japan";
export { germany } from "./data/germany";
export { usa } from "./data/usa";
export { findVehicles, getVehicle, listVehicles } from "./lookup";
export { describeOem, toChassis, vehicleCanSwap, vehicleSwaps } from "./catalog";
