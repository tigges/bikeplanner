import { useMemo } from "react";

import type { Edge, Location, RoutePlan } from "./types.js";

interface RouteMapProps {
  locations: Location[];
  edges: Edge[];
  plan: RoutePlan | null;
  startId: string;
  endId: string;
  viaIds: string[];
  onPick: (id: string) => void;
}

const WIDTH = 720;
const HEIGHT = 520;
const PADDING = 48;

export function RouteMap({
  locations,
  edges,
  plan,
  startId,
  endId,
  viaIds,
  onPick,
}: RouteMapProps) {
  const project = useMemo(() => {
    const lats = locations.map((l) => l.lat);
    const lngs = locations.map((l) => l.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = maxLat - minLat || 1;
    const spanLng = maxLng - minLng || 1;
    return (loc: Location) => {
      const x = PADDING + ((loc.lng - minLng) / spanLng) * (WIDTH - 2 * PADDING);
      // Latitude grows northwards, but SVG y grows downwards, so invert.
      const y = PADDING + ((maxLat - loc.lat) / spanLat) * (HEIGHT - 2 * PADDING);
      return { x, y };
    };
  }, [locations]);

  const byId = useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations],
  );

  const routePoints = plan
    ? plan.path.map((loc) => project(loc))
    : [];
  const routeD = routePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const roleOf = (id: string): "start" | "end" | "via" | "plain" => {
    if (id === startId) return "start";
    if (id === endId) return "end";
    if (viaIds.includes(id)) return "via";
    return "plain";
  };

  return (
    <svg
      className="route-map"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Map of cycling landmarks and the planned route"
    >
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} rx={16} className="map-bg" />

      {edges.map((edge, i) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        const a = project(from);
        const b = project(to);
        return (
          <line
            key={`edge-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={`edge edge-${edge.surface ?? "road"}`}
          />
        );
      })}

      {plan && routePoints.length > 1 && (
        <path d={routeD} className="route-line" fill="none" />
      )}

      {locations.map((loc) => {
        const p = project(loc);
        const role = roleOf(loc.id);
        return (
          <g
            key={loc.id}
            className={`node node-${role}`}
            transform={`translate(${p.x} ${p.y})`}
            onClick={() => onPick(loc.id)}
            role="button"
            tabIndex={0}
            aria-label={`${loc.name}, elevation ${loc.elevation} metres`}
          >
            <circle r={role === "plain" ? 7 : 10} />
            <text x={12} y={4}>
              {loc.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
