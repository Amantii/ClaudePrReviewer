import { RepoConfig } from "@pr-reviewer/shared";
import { prisma } from "../lib/prisma.js";

export async function getRepoConfig(
  repoFullName: string
): Promise<RepoConfig | null> {
  const row = await prisma.repoConfig.findUnique({ where: { repoFullName } });
  if (!row) return null;
  return {
    repoFullName: row.repoFullName,
    enabled: row.enabled,
    ignorePaths: row.ignorePaths,
    customInstructions: row.customInstructions ?? undefined,
    minSeverity: row.minSeverity as RepoConfig["minSeverity"],
  };
}
