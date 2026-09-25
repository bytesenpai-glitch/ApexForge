import { describeOem, getVehicle, listVehicles, vehicleSwaps } from "./index.js";

const targetId = process.argv[2] ?? "hyundai-elantra-n-cn7";
const vehicle = getVehicle(targetId);

if (!vehicle) {
  console.error(`Unknown vehicle: ${targetId}`);
  console.error("Available:");
  for (const item of listVehicles()) {
    console.error(`  ${item.id}`);
  }
  process.exit(1);
}

console.log(
  `${vehicle.brand} ${vehicle.model} ${vehicle.trim} (${vehicle.generation}, ${vehicle.years.from}–${vehicle.years.to})`,
);
console.log(`platform ${vehicle.platform} · ${vehicle.layout}`);
console.log(`OEM: ${describeOem(vehicle)}`);
console.log("");
console.log("Swaps:");

for (const match of vehicleSwaps(vehicle)) {
  const part = match.part;
  const label =
    part.kind === "engine"
      ? `${part.code} ${part.family} (${part.powerHp} hp)`
      : part.kind === "transmission"
        ? `${part.code} ${part.name}`
        : part.name;
  const oem =
    part.id === vehicle.oem.engineId ||
    part.id === vehicle.oem.transmissionId ||
    vehicle.oem.drivelineIds.includes(part.id)
      ? " [OEM]"
      : "";
  console.log(`  [${match.fit.padEnd(7)}] ${part.kind.padEnd(13)} ${label}${oem}`);
  for (const reason of match.reasons) {
    console.log(`             · ${reason}`);
  }
}
