/// <reference types="node" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path";
import { fileURLToPath } from "node:url";


// Recreate __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: { port: 5173 },
  build: { outDir: "dist" },
});
