import crypto from "crypto";
import { Request, Response } from "express";
import { fetchPRDiff } from "../services/github";
import { generateReview } from "../services/claude";
import { postReviewComment } from "../services/github";
import { getRepoConfig } from "../services/config";

/**
 * Verifies GitHub's HMAC-SHA256 webhook signature.
 * GitHub sends X-Hub-Signature-256 header with every webhook payload.
 */
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")}`;
  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function handleWebhook(req: Request, res: Response) {
  const signature = req.headers["x-hub-signature-256"] as string;
  const event = req.headers["x-github-event"] as string;

  // 1. Verify authenticity — reject anything that didn't come from GitHub
  if (!signature || !verifySignature(JSON.stringify(req.body), signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // 2. Only process pull_request events with action "opened" or "synchronize"
  if (event !== "pull_request") return res.status(200).send("ok");
  const { action, pull_request, repository } = req.body;
  if (!["opened", "synchronize"].includes(action)) return res.status(200).send("ok");

  const repoFullName = repository.full_name;
  const prNumber = pull_request.number;

  // 3. Check if this repo has reviews enabled in our config
  const config = await getRepoConfig(repoFullName);
  if (!config?.enabled) return res.status(200).send("ok");

  // 4. Acknowledge immediately — GitHub expects a <10s response
  res.status(200).json({ message: "Review queued" });

  // 5. Do the heavy lifting async (fetch diff → call Claude → post comment)
  try {
    const diff = await fetchPRDiff(repoFullName, prNumber, config.ignorePaths);
    const review = await generateReview({
      repoFullName,
      prNumber,
      prTitle: pull_request.title,
      prAuthor: pull_request.user.login,
      diff,
      baseRef: pull_request.base.ref,
      headRef: pull_request.head.ref,
    }, config);
    await postReviewComment(repoFullName, prNumber, review);
  } catch (err) {
    console.error(`[webhook] Failed to review PR #${prNumber} on ${repoFullName}:`, err);
  }
}
