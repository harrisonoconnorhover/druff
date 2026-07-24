import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Vitest isn't configured with `test.globals: true` (deliberately — explicit imports over
// ambient globals, per steering/languages/typescript.md's style conventions), so React Testing
// Library's usual auto-cleanup-via-detected-globals doesn't kick in on its own. Unmount after
// every test here, once, so component test files (DRUFF-3's `NodeInspector.test.tsx` and beyond)
// don't each need their own `afterEach(cleanup)` boilerplate — and so a leftover render from one
// test can't leak into the next test's query.
afterEach(() => {
  cleanup();
});

// jsdom has no `ResizeObserver` implementation. Radix primitives (e.g. the `Tooltip` used by
// DRUFF-16's `ViolationMarker`) read an element's size via it on mount, so any component test that
// renders one needs at least a no-op stub — real size measurement is irrelevant under jsdom (no
// layout engine), only that the constructor exists so the effect doesn't throw.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
