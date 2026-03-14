import express from "express";
import { captureRawBody } from "./middleware/rawBody.js";
import webhookRouter from "./routes/webhook.js";
import reposRouter from "./routes/repos.js";

const app = express();

app.use(express.json({ verify: captureRawBody }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/webhook", webhookRouter);
app.use("/repos", reposRouter);

const port = process.env.PORT ?? 3001;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
