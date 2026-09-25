export type { Body, Brand, Region, Vehicle } from "./types.js";
export { hyundai } from "./data/hyundai.js";
export { kia } from "./data/kia.js";
export { japan } from "./data/japan.js";
export { germany } from "./data/germany.js";
export { usa } from "./data/usa.js";
export { findVehicles, getVehicle, listVehicles } from "./lookup.js";
export { describeOem, toChassis, vehicleCanSwap, vehicleSwaps } from "./catalog.js";
