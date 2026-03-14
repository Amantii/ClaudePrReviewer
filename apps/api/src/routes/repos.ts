import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const repos = await prisma.repoConfig.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(repos);
  } catch (err) {
    console.error("GET /repos error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { repoFullName, installationId, ignorePaths, customInstructions, minSeverity } =
      req.body as {
        repoFullName?: string;
        installationId?: number;
        ignorePaths?: string[];
        customInstructions?: string;
        minSeverity?: string;
      };

    if (!repoFullName || !installationId) {
      res.status(400).json({ error: "repoFullName and installationId are required" });
      return;
    }

    const repo = await prisma.repoConfig.create({
      data: {
        repoFullName,
        installationId,
        ignorePaths: ignorePaths ?? [],
        customInstructions: customInstructions ?? null,
        minSeverity: (minSeverity as "critical" | "warning" | "suggestion" | "praise") ?? "suggestion",
      },
    });

    res.status(201).json(repo);
  } catch (err) {
    console.error("POST /repos error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const repoFullName = decodeURIComponent(req.params.id);
    const { enabled, ignorePaths, customInstructions, minSeverity } =
      req.body as {
        enabled?: boolean;
        ignorePaths?: string[];
        customInstructions?: string;
        minSeverity?: string;
      };

    const repo = await prisma.repoConfig.update({
      where: { repoFullName },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(ignorePaths !== undefined && { ignorePaths }),
        ...(customInstructions !== undefined && { customInstructions }),
        ...(minSeverity !== undefined && {
          minSeverity: minSeverity as "critical" | "warning" | "suggestion" | "praise",
        }),
      },
    });

    res.json(repo);
  } catch (err) {
    console.error("PATCH /repos/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const repoFullName = decodeURIComponent(req.params.id);
    await prisma.repoConfig.delete({ where: { repoFullName } });
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /repos/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
