# Testing Guidelines

## Overview

This project uses Vitest and React Testing Library for unit testing.

## Setup

All tests are configured through `vitest.config.ts` in the root directory. Test files follow the naming convention:
- `Component.test.tsx` for component tests
- `hook.test.ts` for hook tests

## Running Tests

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with the Vitest UI
- `npm run test:coverage` - Generate coverage report

## Testing Guidelines

### Component Testing

Component tests should:
1. Verify that the component renders with basic props
2. Verify that the component renders in different states (loading, error, etc.)
3. Verify that user interactions work as expected
4. Mock external dependencies when necessary

Example:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('responds to user interactions', async () => {
    render(<ComponentName />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Changed Text')).toBeInTheDocument();
  });
});
```

### Hook Testing

Hook tests should:
1. Verify that the hook initializes with expected values
2. Verify that the hook responds correctly to function calls
3. Mock external dependencies when necessary

Example:
```tsx
import { renderHook, act } from '@testing-library/react';
import { useHookName } from '../useHookName';

describe('useHookName', () => {
  it('initializes with expected values', () => {
    const { result } = renderHook(() => useHookName());
    expect(result.current.value).toBe('expected');
  });

  it('updates values when functions are called', () => {
    const { result } = renderHook(() => useHookName());
    
    act(() => {
      result.current.update('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

### Mocking

Use Vitest's mocking capabilities to isolate components:

```tsx
import { vi } from 'vitest';

// Mock a function
const mockFn = vi.fn();

// Mock a module
vi.mock('@/api/module', () => ({
  functionName: vi.fn().mockResolvedValue({ data: 'mocked data' })
}));

// Spy on a function
const spy = vi.spyOn(object, 'method');
```

### Test Utilities

The `test/test-utils.tsx` file provides useful utilities:
- `renderHook` - For testing hooks with context providers
- `createAsyncMock` - For creating asynchronous mock functions
- `setupFetchMock` - For mocking fetch requests
- `createTestElement` and `removeTestElement` - For testing Astro components with React islands 