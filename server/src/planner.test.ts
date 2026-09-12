import assert from "node:assert/strict";
import { test } from "node:test";

import { edges, locations } from "./locations.js";
import { haversineKm, planRoute, shortestPath, buildGraph } from "./planner.js";

test("haversine distance is symmetric and non-negative", () => {
  const [a, b] = locations;
  const ab = haversineKm(a, b);
  const ba = haversineKm(b, a);
  assert.ok(ab > 0);
  assert.ok(Math.abs(ab - ba) < 1e-9);
});

test("shortest path connects start and end", () => {
  const graph = buildGraph(locations, edges);
  const path = shortestPath(graph, "ferry-building", "golden-gate-bridge");
  assert.equal(path[0], "ferry-building");
  assert.equal(path[path.length - 1], "golden-gate-bridge");
});

test("planRoute returns a coherent plan with stats", () => {
  const plan = planRoute(locations, edges, {
    waypointIds: ["ferry-building", "golden-gate-bridge"],
    effort: "moderate",
  });
  assert.ok(plan.path.length >= 2);
  assert.equal(plan.path[0].id, "ferry-building");
  assert.equal(plan.path[plan.path.length - 1].id, "golden-gate-bridge");
  assert.ok(plan.totalDistanceKm > 0);
  assert.ok(plan.durationMinutes > 0);
  assert.equal(plan.segments.length, plan.path.length - 1);
});

test("planRoute honours mandatory via waypoints", () => {
  const plan = planRoute(locations, edges, {
    waypointIds: ["ferry-building", "twin-peaks", "golden-gate-bridge"],
  });
  const visitedIds = plan.path.map((l) => l.id);
  assert.ok(visitedIds.includes("twin-peaks"));
});

test("brisk effort is faster than leisurely for the same route", () => {
  const brisk = planRoute(locations, edges, {
    waypointIds: ["ferry-building", "golden-gate-bridge"],
    effort: "brisk",
  });
  const leisurely = planRoute(locations, edges, {
    waypointIds: ["ferry-building", "golden-gate-bridge"],
    effort: "leisurely",
  });
  assert.ok(brisk.durationMinutes < leisurely.durationMinutes);
});

test("unknown location is rejected", () => {
  assert.throws(() =>
    planRoute(locations, edges, { waypointIds: ["ferry-building", "atlantis"] }),
  );
});
