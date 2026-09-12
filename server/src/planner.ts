import type { Edge, Effort, Location, RoutePlan, RouteSegment } from "./types.js";

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two coordinates in kilometres. */
export function haversineKm(a: Location, b: Location): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

interface Graph {
  byId: Map<string, Location>;
  adjacency: Map<string, { to: string; distanceKm: number; surface: string }[]>;
}

export function buildGraph(locations: Location[], edges: Edge[]): Graph {
  const byId = new Map(locations.map((loc) => [loc.id, loc]));
  const adjacency = new Map<
    string,
    { to: string; distanceKm: number; surface: string }[]
  >();
  for (const loc of locations) adjacency.set(loc.id, []);

  for (const edge of edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) {
      throw new Error(`Edge references unknown location: ${edge.from} -> ${edge.to}`);
    }
    const distanceKm = haversineKm(from, to);
    const surface = edge.surface ?? "road";
    adjacency.get(edge.from)!.push({ to: edge.to, distanceKm, surface });
    adjacency.get(edge.to)!.push({ to: edge.from, distanceKm, surface });
  }
  return { byId, adjacency };
}

/** Dijkstra shortest path (by distance) between two location ids. */
export function shortestPath(graph: Graph, startId: string, endId: string): string[] {
  if (!graph.byId.has(startId)) throw new Error(`Unknown location: ${startId}`);
  if (!graph.byId.has(endId)) throw new Error(`Unknown location: ${endId}`);
  if (startId === endId) return [startId];

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  for (const id of graph.byId.keys()) {
    dist.set(id, Infinity);
    prev.set(id, null);
  }
  dist.set(startId, 0);

  while (visited.size < graph.byId.size) {
    let current: string | null = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < best) {
        best = d;
        current = id;
      }
    }
    if (current === null) break;
    if (current === endId) break;
    visited.add(current);

    for (const neighbor of graph.adjacency.get(current) ?? []) {
      if (visited.has(neighbor.to)) continue;
      const candidate = dist.get(current)! + neighbor.distanceKm;
      if (candidate < dist.get(neighbor.to)!) {
        dist.set(neighbor.to, candidate);
        prev.set(neighbor.to, current);
      }
    }
  }

  if (dist.get(endId) === Infinity) {
    throw new Error(`No route between ${startId} and ${endId}`);
  }

  const path: string[] = [];
  let node: string | null = endId;
  while (node) {
    path.unshift(node);
    node = prev.get(node) ?? null;
  }
  return path;
}

const EFFORT_SPEED_KMH: Record<Effort, number> = {
  leisurely: 12,
  moderate: 18,
  brisk: 24,
};

/**
 * Estimate ride duration in minutes. Uses a flat-ground base speed for the
 * chosen effort plus a climbing penalty (roughly 1 minute per 10 m of ascent).
 */
export function estimateDurationMinutes(
  distanceKm: number,
  elevationGainM: number,
  effort: Effort,
): number {
  const speed = EFFORT_SPEED_KMH[effort];
  const flatMinutes = (distanceKm / speed) * 60;
  const climbMinutes = elevationGainM / 10;
  return flatMinutes + climbMinutes;
}

export interface PlanOptions {
  waypointIds: string[];
  effort?: Effort;
}

/**
 * Plan a route that visits the given waypoints in order. The first and last
 * ids are the start and finish; any ids in between are mandatory via points.
 */
export function planRoute(
  locations: Location[],
  edges: Edge[],
  options: PlanOptions,
): RoutePlan {
  const { waypointIds } = options;
  const effort = options.effort ?? "moderate";
  if (waypointIds.length < 2) {
    throw new Error("A route needs at least a start and an end location.");
  }

  const graph = buildGraph(locations, edges);
  for (const id of waypointIds) {
    if (!graph.byId.has(id)) throw new Error(`Unknown location: ${id}`);
  }

  const pathIds: string[] = [];
  for (let i = 0; i < waypointIds.length - 1; i++) {
    const leg = shortestPath(graph, waypointIds[i], waypointIds[i + 1]);
    if (i > 0) leg.shift();
    pathIds.push(...leg);
  }

  const path = pathIds.map((id) => graph.byId.get(id)!);
  const segments: RouteSegment[] = [];
  let totalDistanceKm = 0;
  let elevationGainM = 0;
  let elevationLossM = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const distanceKm = haversineKm(from, to);
    const elevationChange = to.elevation - from.elevation;
    totalDistanceKm += distanceKm;
    if (elevationChange > 0) elevationGainM += elevationChange;
    else elevationLossM += -elevationChange;
    segments.push({ from, to, distanceKm, elevationChange });
  }

  const durationMinutes = estimateDurationMinutes(
    totalDistanceKm,
    elevationGainM,
    effort,
  );

  return {
    waypoints: waypointIds.map((id) => graph.byId.get(id)!),
    path,
    segments,
    totalDistanceKm,
    elevationGainM,
    elevationLossM,
    durationMinutes,
    effort,
  };
}
