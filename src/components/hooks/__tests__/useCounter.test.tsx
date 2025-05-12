import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCounter } from "../useCounter";

// This test demonstrates how to test a custom hook
describe("useCounter", () => {
  it("should initialize with default counter value (0)", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("should initialize with provided counter value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("should increment counter value", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("should decrement counter value", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it("should reset counter value", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });

  it("should reset to specific value", () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.reset(10);
    });

    expect(result.current.count).toBe(10);
  });
});
