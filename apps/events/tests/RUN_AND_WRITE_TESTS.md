# Running and Writing Tests

## How to run tests

From the **monorepo root**:

```bash
npm run test:events
```

This runs `vitest` inside the `apps/events` workspace.

---

## Writing tests

Test files live next to the component they test and follow the naming convention:

```
MyComponent.test.jsx
```

### Basic structure

```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

// Extract setup into a helper function for reuse across tests
// (it could be used inside a beforeEach function, but react-testing-library advises to do it this way)
function setupComponent() {
  render(<MyComponent prop="value" />);
}

describe('MyComponent', () => {
  it('test usecase here', () => {
    setupComponent();

    // Find component

    // Create assertions
  });
});
```

### Mock missing browser APIs

Some components use browser APIs not available in jsdom. These are mocked in `tests/mocks/windowMocks.js`.

**Example — `window.matchMedia`** (required by `PosterSlider`, which uses a carousel library):

```js
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

Add new mocks to this file (or create additional files under `tests/mocks/`) and import them in `setup.js`. Try to mock only aspects of the app that cannot be run a test environment to avoid useless or bad tests.
