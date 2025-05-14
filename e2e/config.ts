/**
 * E2E test configuration
 */

export const TEST_CONFIG = {
  // Base URL for the application
  BASE_URL: process.env.TEST_BASE_URL || "http://localhost:3000",
  
  // API endpoints
  API: {
    BASE: "/api",
  },
  
  // Test timeouts
  TIMEOUTS: {
    NAVIGATION: 90000,
    ELEMENT: 20000,
    ACTION: 30000,
  }
}; 