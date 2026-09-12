import cors from "cors";
import express from "express";

import { edges, locations } from "./locations.js";
import { planRoute } from "./planner.js";
import type { Effort } from "./types.js";

const app = express();
app.use(cors());
app.use(express.json());

const VALID_EFFORTS: Effort[] = ["leisurely", "moderate", "brisk"];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", locations: locations.length, edges: edges.length });
});

app.get("/api/locations", (_req, res) => {
  res.json({ locations, edges });
});

app.post("/api/plan", (req, res) => {
  const body = req.body ?? {};
  const waypointIds: unknown = body.waypointIds;
  const effort: unknown = body.effort;

  if (!Array.isArray(waypointIds) || !waypointIds.every((id) => typeof id === "string")) {
    return res.status(400).json({ error: "waypointIds must be an array of strings." });
  }
  if (waypointIds.length < 2) {
    return res.status(400).json({ error: "Select at least a start and an end location." });
  }
  if (effort !== undefined && !VALID_EFFORTS.includes(effort as Effort)) {
    return res.status(400).json({ error: `effort must be one of ${VALID_EFFORTS.join(", ")}.` });
  }

  try {
    const plan = planRoute(locations, edges, {
      waypointIds,
      effort: (effort as Effort) ?? "moderate",
    });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed to plan route." });
  }
});

const PORT = Number(process.env.PORT ?? 3001);

// Only listen when run directly (not when imported by tests).
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  app.listen(PORT, () => {
    console.log(`bikeplanner API listening on http://localhost:${PORT}`);
  });
}

export { app };
