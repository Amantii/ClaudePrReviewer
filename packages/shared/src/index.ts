// Shared types across the monorepo

export interface PRReviewRequest {
  repoFullName: string;   // e.g. "owner/repo"
  prNumber: number;
  prTitle: string;
  prAuthor: string;
  diff: string;
  baseRef: string;
  headRef: string;
}

export interface ReviewComment {
  severity: "critical" | "warning" | "suggestion" | "praise";
  filePath?: string;
  lineNumber?: number;
  message: string;
}

export interface PRReviewResult {
  summary: string;
  score: number;          // 0-100 overall quality score
  comments: ReviewComment[];
  generatedAt: string;   // ISO timestamp
}

export interface RepoConfig {
  repoFullName: string;
  enabled: boolean;
  ignorePaths: string[];  // glob patterns to skip (e.g. "*.lock", "dist/**")
  customInstructions?: string;  // extra prompt context for this repo
  minSeverity: ReviewComment["severity"];
}
