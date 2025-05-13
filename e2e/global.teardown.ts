import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("delete test data from Supabase", async () => {
  console.log("Cleaning up test database for E2E tests...");

  // Initialize Supabase client with test credentials
  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabasePublicKey = process.env.SUPABASE_PUBLIC_KEY as string;
  const e2eUserId = process.env.E2E_USERNAME_ID as string;

  if (!supabaseUrl || !supabasePublicKey) {
    console.error("Missing Supabase credentials in environment variables.");
    return;
  }

  if (!e2eUserId) {
    console.error("Missing E2E_USERNAME_ID in environment variables.");
    return;
  }

  const supabase = createClient<Database>(supabaseUrl, supabasePublicKey);

  try {
    // Delete meetings only for the test user
    const { error } = await supabase.from("meetings").delete().eq("user_id", e2eUserId);

    if (error) {
      console.error("Error cleaning up meetings table:", error.message);
    } else {
      console.log(`Successfully cleaned up meetings for user ID: ${e2eUserId}`);
    }
  } catch (err) {
    console.error("Failed to clean up test database:", err);
  }
});
