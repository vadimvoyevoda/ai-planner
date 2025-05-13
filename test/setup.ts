import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect method with testing-library matchers
expect.extend(matchers);

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock global fetch if needed
// global.fetch = vi.fn();

// Set up any global mocks or environment variables here
// vi.mock('some-module-to-mock');

// Global setup for console error filtering if needed
// const originalConsoleError = console.error;
// console.error = (...args) => {
//   // Filter out specific warnings that might be noisy during tests
//   if (args[0].includes('specific error to ignore')) {
//     return;
//   }
//   originalConsoleError(...args);
// };
