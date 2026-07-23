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
