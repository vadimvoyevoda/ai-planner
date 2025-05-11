// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// Debug environment variables
console.log("PLATFORM_OPENAI_KEY:", import.meta.env.PLATFORM_OPENAI_KEY);

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Expose env variables to the client
      "import.meta.env.SUPABASE_URL": JSON.stringify(import.meta.env.SUPABASE_URL),
      "import.meta.env.SUPABASE_KEY": JSON.stringify(import.meta.env.SUPABASE_KEY),
      "import.meta.env.PLATFORM_OPENAI_KEY": JSON.stringify(import.meta.env.PLATFORM_OPENAI_KEY),
      "import.meta.env.OPENROUTER_API_KEY": JSON.stringify(import.meta.env.OPENROUTER_API_KEY),
    },
    envPrefix: ["VITE_", "PUBLIC_", "SUPABASE_", "PLATFORM_", "OPENROUTER_"],
  },
  adapter: node({
    mode: "standalone",
  }),
  experimental: { session: true },
});
