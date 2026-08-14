import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REVISION = /^(?:unrecorded|[0-9a-f]{40}(?:[0-9a-f]{24})?)$/;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseEpoch(value) {
  if (typeof value !== "string" || !/^(?:0|[1-9][0-9]*)$/.test(value)) return null;
  const epoch = Number(value);
  return Number.isSafeInteger(epoch) ? epoch : null;
}

export function explicitBuildProvenance(environment = process.env) {
  const revision = environment.DRUFF_SOURCE_REVISION;
  const epochText = environment.SOURCE_DATE_EPOCH;
  const hasRevision = typeof revision === "string" && revision.length > 0;
  const hasEpoch = typeof epochText === "string" && epochText.length > 0;
  if (!hasRevision && !hasEpoch) return null;
  if (!hasRevision || !hasEpoch || !REVISION.test(revision)) {
    throw new Error("Build provenance requires a valid revision and source epoch together");
  }
  const epoch = parseEpoch(epochText);
  if (epoch === null) throw new Error("Build provenance source epoch is invalid");
  return { source_revision: revision, source_date_epoch: epoch };
}

function runRepositoryGit(args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

export function resolveBuildProvenance({
  environment = process.env,
  runGit = runRepositoryGit,
} = {}) {
  const explicit = explicitBuildProvenance(environment);
  if (explicit) return explicit;

  try {
    if (runGit(["status", "--porcelain=v1", "--untracked-files=normal"]) !== "") {
      return { source_revision: "unrecorded", source_date_epoch: 0 };
    }
    const revision = runGit(["rev-parse", "--verify", "HEAD"]);
    const epoch = parseEpoch(runGit(["show", "-s", "--format=%ct", "HEAD"]));
    if (!REVISION.test(revision) || revision === "unrecorded" || epoch === null) {
      return { source_revision: "unrecorded", source_date_epoch: 0 };
    }
    return { source_revision: revision, source_date_epoch: epoch };
  } catch {
    return { source_revision: "unrecorded", source_date_epoch: 0 };
  }
}

export function requireExplicitBuildProvenance(environment = process.env) {
  const provenance = explicitBuildProvenance(environment);
  if (!provenance) {
    throw new Error("Static artifact generation must receive the resolved build provenance");
  }
  return provenance;
}
