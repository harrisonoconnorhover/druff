# Security Steering — NON-NEGOTIABLE

> Every agent MUST read and obey this before writing code. Violations are automatic PR-review
> failures.
>
> **Status: draft, ported from Dander's `steering/01-security.md`.** Rules 1, 3, and 4 below are
> universal defaults safe to keep as-is. Rule 2 is a placeholder — it depends on how Druff talks
> to Dander (or any backend), which isn't decided yet.

## 1. Secrets: zero hardcoding, ever

- **NEVER** write a secret, key, password, token, connection string, or credential literal into
  source, config, tests, fixtures, comments, or commit messages. Not even a placeholder that
  looks real. Not even "temporarily."
- **Frontend-specific:** anything that ships in a client-side bundle is public, full stop —
  never put a real secret, API key, or credential in code that gets built and shipped to the
  browser. If a call needs a secret, it goes through a backend (Dander or a backend-for-frontend),
  never directly from client code.
- `.env` is git-ignored. `.env.example` (keys only, empty values) IS committed and kept in sync.
- If you need a new secret/config value, add its **key** to `.env.example` and reference it in
  `steering`/docs — never its value.

## 2. Auth / backend integration — TBD

Placeholder pending a decision: how does Druff authenticate to Dander (or whatever it talks to)?
Once decided, replace this section with the concrete strategy (e.g. short-lived tokens from a
backend-for-frontend, OAuth2 PKCE for a browser SPA, session cookies). Whatever it is:
- No long-lived credential ever lives in browser storage (`localStorage`/`sessionStorage`) —
  prefer short-lived tokens and httpOnly cookies.
- Never roll a custom crypto/token scheme — use a maintained library.

## 3. Data sensitivity

- Treat any Dander-sourced data (HR/comp/customer/PII per Dander's `steering/01-security.md`) as
  sensitive by default in the UI too: no sensitive data in client-side logs, error messages,
  analytics/telemetry events, or committed fixtures/screenshots.
- When mocking API responses for tests/fixtures, scrub values before committing them to the repo.

## 4. Dependencies

- Pin dependencies (commit the lockfile). Review new frontend deps for what they run at
  install/build time (postinstall scripts are a common supply-chain vector) and what they phone
  home to at runtime.

## Quick self-check before any commit

- [ ] No literal secret anywhere in the diff (grep the diff for keys/tokens/passwords).
- [ ] Nothing sensitive ends up in a client-visible bundle, log, fixture, or screenshot.
- [ ] New secret/config keys added to `.env.example` (names only).
- [ ] Lockfile updated alongside any dependency change.
