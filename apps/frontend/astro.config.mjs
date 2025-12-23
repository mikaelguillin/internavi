import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { fileURLToPath } from "url";
import path from "path";

import vercel from "@astrojs/vercel";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      // Use the UI package's Tailwind config
      configFile: path.resolve(
        __dirname,
        "../../packages/ui/tailwind.config.ts"
      ),
      // Also scan the UI package for classes
      applyBaseStyles: false, // We'll import globals.css manually
    }),
  ],

  // Enable SSR for results page
  output: "server",

  vite: {
    resolve: {
      alias: {
        // Resolve @ alias for UI package components
        "@": path.resolve(__dirname, "../../packages/ui/src"),
      },
    },
  },

  adapter: vercel(),
});