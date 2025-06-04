// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// Debug environment variables only in dev mode
if (process.env.NODE_ENV !== 'production') {
  console.log("PLATFORM_OPENAI_KEY:", process.env.PLATFORM_OPENAI_KEY ? "Set" : "Not set");
  console.log("Environment:", process.env.PUBLIC_ENV_NAME || "undefined");
}

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
    functionPerRoute: false, // Consolidate functions to reduce cold starts
    runtime: {
      mode: "local",
      persistToStorage: true, // Enable storage persistence
    }
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
    build: {
      minify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Put heavy dependencies in separate chunks
            if (id.includes('node_modules/openai/')) {
              return 'openai';
            }
            if (id.includes('node_modules/@supabase/')) {
              return 'supabase';
            }
          }
        }
      }
    },
    // Define environment variable types
    define: {
      'import.meta.env.PUBLIC_ENV_NAME': JSON.stringify(process.env.PUBLIC_ENV_NAME || 'local'),
    }
  },
});
