import assert from "node:assert/strict";
import test from "node:test";
import {
  explicitBuildProvenance,
  requireExplicitBuildProvenance,
  resolveBuildProvenance,
} from "./build-provenance.mjs";

const REVISION = "a".repeat(40);

test("build provenance uses HEAD only for a clean worktree", () => {
  const cleanCalls = [];
  const clean = resolveBuildProvenance({
    environment: {},
    runGit(args) {
      cleanCalls.push(args.join(" "));
      if (args[0] === "status") return "";
      if (args[0] === "rev-parse") return REVISION;
      if (args[0] === "show") return "1700000000";
      throw new Error("unexpected Git command");
    },
  });
  assert.deepEqual(clean, { source_revision: REVISION, source_date_epoch: 1_700_000_000 });
  assert.deepEqual(cleanCalls, [
    "status --porcelain=v1 --untracked-files=normal",
    "rev-parse --verify HEAD",
    "show -s --format=%ct HEAD",
  ]);

  let dirtyCalls = 0;
  const dirty = resolveBuildProvenance({
    environment: {},
    runGit() {
      dirtyCalls += 1;
      return "M staged-source.ts";
    },
  });
  assert.deepEqual(dirty, { source_revision: "unrecorded", source_date_epoch: 0 });
  assert.equal(dirtyCalls, 1);
});

test("explicit build provenance is paired, validated, and independent of Git", () => {
  const environment = {
    DRUFF_SOURCE_REVISION: REVISION,
    SOURCE_DATE_EPOCH: "1700000000",
  };
  assert.deepEqual(explicitBuildProvenance(environment), {
    source_revision: REVISION,
    source_date_epoch: 1_700_000_000,
  });
  assert.deepEqual(
    resolveBuildProvenance({
      environment,
      runGit() {
        throw new Error("explicit provenance must not read Git");
      },
    }),
    { source_revision: REVISION, source_date_epoch: 1_700_000_000 },
  );
  assert.throws(
    () => explicitBuildProvenance({ DRUFF_SOURCE_REVISION: REVISION }),
    /revision and source epoch together/,
  );
  assert.throws(() => requireExplicitBuildProvenance({}), /must receive the resolved/);
});
