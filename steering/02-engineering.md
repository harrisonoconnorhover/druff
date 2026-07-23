# Engineering Steering — cross-cutting principles

> Language-agnostic rules for how we design and build. Language/framework specifics live in
> `languages/` once the stack is chosen (none exist yet — see `steering/00-project-overview.md`).
>
> Ported from Dander's `steering/02-engineering.md`; the data-platform-specific section
> (idempotent pipeline writes/watermarks) was dropped as not applicable here.

## Design: interfaces/contracts first, providers behind them

- Depend on **abstractions** — a typed data-layer contract, a service interface — not a concrete
  backend/vendor directly. If Druff talks to Dander's API, that call goes through one seam so a
  mock/fixture backend can stand in for tests and local dev.
- Favor **composition over inheritance**. Keep interfaces/contracts small. Depend on abstractions.
- Single Responsibility per component/module. Open for extension without modifying callers.

## Config-driven over code-driven

- Where a new view/behavior is genuinely just data (labels, field lists, validation rules mirrored
  from Dander's schema), keep it declarative rather than hardcoding it into components.

## Error handling & observability

- Fail loud with actionable context; never swallow exceptions silently.
- **Never** put secrets or sensitive row/record data in logs, error messages, or telemetry.
- Structured, traceable errors — a user-facing error should be actionable, not a stack trace.

## Testing

- Business logic (data transforms, validation against Dander's schema, state management) is
  unit-tested.
- No network in unit tests — mock the Dander API/any backend; fixtures carry **no** real/sensitive
  data.
- A change without tests for its logic is incomplete. PR-review checks this.

## Version control & tickets

- Small, focused commits with imperative messages (`Add graph canvas zoom controls`).
- Work is tracked as tickets in `tickets/` (see `tickets/README.md`). Every code change traces
  to a ticket; the ticket's acceptance criteria are the definition of done.
- Never commit generated secrets, state, or `.env`.

## Dependency & borrow-vs-build

- Undifferentiated plumbing (routing, forms, date-picking, …) may lean on a vetted library.
- Pin versions; minimize surface area; justify every new dependency.
