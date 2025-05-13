import { useState } from "react";

/**
 * A simple counter hook that demonstrates how to test hooks.
 *
 * @param initialValue - The initial value for the counter, defaults to 0
 */
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = (value = 0) => setCount(value);

  return {
    count,
    increment,
    decrement,
    reset,
  };
}
