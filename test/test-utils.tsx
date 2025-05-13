import { renderHook as rtlRenderHook, act } from "@testing-library/react";
import { ReactNode } from "react";

/**
 * Custom renderHook utility that allows for providing a wrapper component.
 * Useful for testing hooks that need context providers.
 */
export function renderHook<Result, Props>(
  render: (props: Props) => Result,
  { wrapper, ...options }: { wrapper?: React.ComponentType<{ children: ReactNode }> } & any = {}
) {
  return rtlRenderHook(render, { wrapper, ...options });
}

/**
 * Creates a mock function that simulates an asynchronous operation.
 * Useful for mocking API calls.
 */
export function createAsyncMock<T>(value: T, delay = 0) {
  return vi.fn().mockImplementation(
    () =>
      new Promise<T>((resolve) => {
        setTimeout(() => resolve(value), delay);
      })
  );
}

/**
 * Helper for testing components that use fetch API.
 * Sets up the necessary mocks and cleanup.
 */
export function setupFetchMock(response: any, status = 200) {
  const originalFetch = global.fetch;

  // Mock fetch response
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as Response)
  );

  // Return cleanup function
  return () => {
    global.fetch = originalFetch;
  };
}

/**
 * Helper to test Astro components with React islands
 */
export function createTestElement(id: string) {
  const el = document.createElement("div");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

/**
 * Helper to clean up test elements
 */
export function removeTestElement(id: string) {
  const el = document.getElementById(id);
  if (el) {
    document.body.removeChild(el);
  }
}
