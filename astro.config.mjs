// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// Debug environment variables
console.log("PLATFORM_OPENAI_KEY:", import.meta.env.PLATFORM_OPENAI_KEY);

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  adapter: cloudflare({
    mode: "directory",
    functionPerRoute: true,
  }),
  server: {
    port: 3000,
    host: true, // Allow connections from all network interfaces
  },
  vite: {
    server: {
      port: 3000,
      strictPort: true, // Fail if port 3000 is not available
    },
  },
});
