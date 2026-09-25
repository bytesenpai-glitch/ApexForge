import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@at-sim/parts": fileURLToPath(new URL("../parts/src/index.ts", import.meta.url)),
      "@at-sim/vehicles": fileURLToPath(new URL("../vehicles/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
