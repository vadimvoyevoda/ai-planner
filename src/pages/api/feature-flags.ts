import { z } from "zod";
import type { APIRoute } from "astro";
import type { Environment } from "@/features/featureFlags";

export const prerender = false;

// Walidacja parametrów zapytania
const querySchema = z.object({
  env: z.enum(["local", "integration", "prod"]).optional().default("local"),
});

// Tymczasowa baza danych flag - w rzeczywistym projekcie mogłaby być w bazie danych
const featureFlagsDatabase: Record<Environment, Record<string, boolean>> = {
  local: {
    auth: true,
    collections: true,
    newPaymentSystem: true,
  },
  integration: {
    auth: true, 
    collections: true,
    newPaymentSystem: true,
  },
  prod: {
    auth: true,
    collections: true,
    newPaymentSystem: false,
  },
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const envParam = url.searchParams.get("env") || "local";
    
    const { env } = querySchema.parse({ env: envParam });
    
    return new Response(
      JSON.stringify({
        flags: featureFlagsDatabase[env as Environment],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Błąd podczas pobierania flag:", error);
    
    return new Response(
      JSON.stringify({
        error: "Nie udało się pobrać flag",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { env, flags } = body;
    
    if (!env || !flags || typeof flags !== "object") {
      throw new Error("Nieprawidłowe dane wejściowe");
    }
    
    // Weryfikacja środowiska
    if (!["local", "integration", "prod"].includes(env)) {
      throw new Error("Nieprawidłowe środowisko");
    }
    
    // Aktualizacja flag w "bazie danych"
    featureFlagsDatabase[env as Environment] = {
      ...featureFlagsDatabase[env as Environment],
      ...flags,
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Flagi zostały zaktualizowane",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Błąd podczas aktualizacji flag:", error);
    
    return new Response(
      JSON.stringify({
        error: "Nie udało się zaktualizować flag",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}; 