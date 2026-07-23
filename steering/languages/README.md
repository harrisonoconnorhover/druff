# Language/framework steering — pending stack choice

Dander's equivalent directory holds `python.md`, `sql.md`, `terraform.md` — one file per language,
loaded on demand (conditional inclusion) rather than globally, per `CLAUDE.md`.

Druff's stack isn't chosen yet, so this directory is empty. Once it is, add
`steering/languages/<stack>.md` (conventions, testing, documentation expectations for that
stack) and reference it from the root `CLAUDE.md`'s "Language rules load on demand" section.
