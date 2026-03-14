import Anthropic from "@anthropic-ai/sdk";
import { PRReviewRequest, PRReviewResult, RepoConfig } from "@pr-reviewer/shared";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env automatically

const SYSTEM_PROMPT = `You are an expert code reviewer. Your job is to review GitHub pull request diffs and provide structured, actionable feedback.

Focus on:
- Bugs and logic errors (critical)
- Security vulnerabilities (critical)
- Performance issues (warning)
- Code style and maintainability (suggestion)
- Good patterns worth acknowledging (praise)

Be direct and specific. Reference exact lines when possible. Avoid generic advice.`;

function buildUserPrompt(req: PRReviewRequest, config: RepoConfig): string {
  const customContext = config.customInstructions
    ? `\n\nAdditional context for this repo: ${config.customInstructions}`
    : "";

  return `Review this pull request:

**Title:** ${req.prTitle}
**Author:** ${req.prAuthor}
**Branch:** ${req.headRef} → ${req.baseRef}
${customContext}

**Diff:**
\`\`\`diff
${req.diff}
\`\`\`

Respond with a JSON object matching this exact shape:
{
  "summary": "2-3 sentence overview of the PR and your overall take",
  "score": <integer 0-100>,
  "comments": [
    {
      "severity": "critical" | "warning" | "suggestion" | "praise",
      "filePath": "<file path or null>",
      "lineNumber": <number or null>,
      "message": "<actionable feedback>"
    }
  ]
}`;
}

export async function generateReview(
  req: PRReviewRequest,
  config: RepoConfig
): Promise<PRReviewResult> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(req, config) }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip markdown code fences if Claude wraps JSON in them
  const jsonText = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(jsonText);

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
  };
}
