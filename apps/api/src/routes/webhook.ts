import { Router } from "express";
import { handleWebhook } from "../webhooks/github.js";

const router = Router();

router.post("/", handleWebhook);

export default router;
