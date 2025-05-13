// Simple script to check if .env.test variables are loaded correctly
const dotenv = require("dotenv");
const path = require("path");

// Try to load from .env.test
const envFile = path.resolve(__dirname, ".env.test");
console.log(`Loading environment from: ${envFile}`);
const result = dotenv.config({ path: envFile });

// Check if it worked
if (result.error) {
  console.error(`Error loading .env.test file: ${result.error.message}`);
} else {
  console.log("Successfully loaded .env.test file");
}

// Log environment variables
console.log("\nEnvironment variables:");
console.log(`- SUPABASE_URL: ${process.env.SUPABASE_URL || "undefined"}`);
console.log(`- SUPABASE_PUBLIC_KEY: ${process.env.SUPABASE_PUBLIC_KEY || "undefined"}`);
console.log(`- E2E_USERNAME: ${process.env.E2E_USERNAME || "undefined"}`);
console.log(`- E2E_PASSWORD: ${process.env.E2E_PASSWORD || "undefined"}`);
console.log(`- E2E_USERNAME_ID: ${process.env.E2E_USERNAME_ID || "undefined"}`);

console.log("\nCurrent working directory:", process.cwd());
console.log("__dirname:", __dirname);
