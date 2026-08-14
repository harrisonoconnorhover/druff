import type { NextConfig } from "next";

const configuredRevision = process.env.DRUFF_SOURCE_REVISION;
const buildId =
  configuredRevision && /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(configuredRevision)
    ? configuredRevision
    : "unrecorded";

const nextConfig: NextConfig = {
  output: "export",
  generateBuildId: async () => buildId,
};

export default nextConfig;
