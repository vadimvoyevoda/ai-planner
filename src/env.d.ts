/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { SupabaseClient, User, Session } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";
import type { JSX as AstroJSX } from "astro/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: User;
      session?: Session;
    }
  }

  namespace JSX {
    interface IntrinsicElements extends AstroJSX.IntrinsicElements {}
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_ENV_NAME: 'local' | 'integration' | 'prod';
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;
  readonly PUBLIC_SUPABASE_PROJECT_ID: string;
  readonly PLATFORM_OPENAI_KEY: string;
  readonly SITE_URL: string;
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly GOOGLE_REDIRECT_URI: string;
  readonly OPENROUTER_API_KEY: string;
  
  // Feature flags overrides
  readonly FF_AUTH?: string;
  readonly FF_COLLECTIONS?: string;
  readonly [key: `FF_${string}`]: string | undefined; // Dla dynamicznych flag

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
