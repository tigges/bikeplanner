import { useEffect, useMemo, useState } from "react";

import { fetchNetwork, planRoute } from "./api.js";
import { RouteMap } from "./RouteMap.js";
import type { Edge, Effort, Location, RoutePlan } from "./types.js";

const EFFORTS: { value: Effort; label: string; hint: string }[] = [
  { value: "leisurely", label: "Leisurely", hint: "~12 km/h" },
  { value: "moderate", label: "Moderate", hint: "~18 km/h" },
  { value: "brisk", label: "Brisk", hint: "~24 km/h" },
];

function formatDuration(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

export function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [viaIds, setViaIds] = useState<string[]>([]);
  const [effort, setEffort] = useState<Effort>("moderate");
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNetwork()
      .then(({ locations, edges }) => {
        setLocations(locations);
        setEdges(edges);
        if (locations.length >= 2) {
          setStartId(locations[0].id);
          setEndId(locations[locations.length - 1].id);
        }
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const byId = useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations],
  );

  async function handlePlan() {
    setError(null);
    setLoading(true);
    try {
      const waypointIds = [startId, ...viaIds, endId];
      const result = await planRoute(waypointIds, effort);
      setPlan(result);
    } catch (err) {
      setPlan(null);
      setError(err instanceof Error ? err.message : "Failed to plan route.");
    } finally {
      setLoading(false);
    }
  }

  function toggleVia(id: string) {
    if (id === startId || id === endId) return;
    setViaIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }

  function handleMapPick(id: string) {
    // Clicking a node cycles it through start -> end -> via -> none.
    if (startId === "") return setStartId(id);
    if (id === startId) {
      setStartId("");
      return;
    }
    if (endId === "") return setEndId(id);
    if (id === endId) {
      setEndId("");
      return;
    }
    toggleVia(id);
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-mark" aria-hidden>🚲</div>
        <div>
          <h1>bikeplanner</h1>
          <p>Plan a scenic city ride between landmarks with distance, time and climb estimates.</p>
        </div>
      </header>

      <main className="layout">
        <section className="panel controls">
          <label className="field">
            <span>Start</span>
            <select value={startId} onChange={(e) => setStartId(e.target.value)}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Finish</span>
            <select value={endId} onChange={(e) => setEndId(e.target.value)}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="field">
            <legend>Via (optional)</legend>
            <div className="chips">
              {locations
                .filter((l) => l.id !== startId && l.id !== endId)
                .map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    className={`chip ${viaIds.includes(l.id) ? "chip-on" : ""}`}
                    onClick={() => toggleVia(l.id)}
                  >
                    {l.name}
                  </button>
                ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Effort</legend>
            <div className="effort-row">
              {EFFORTS.map((e) => (
                <button
                  type="button"
                  key={e.value}
                  className={`effort ${effort === e.value ? "effort-on" : ""}`}
                  onClick={() => setEffort(e.value)}
                >
                  <strong>{e.label}</strong>
                  <span>{e.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <button
            className="plan-btn"
            onClick={handlePlan}
            disabled={loading || !startId || !endId || startId === endId}
          >
            {loading ? "Planning…" : "Plan route"}
          </button>

          {startId === endId && startId !== "" && (
            <p className="warn">Start and finish must be different.</p>
          )}
          {error && <p className="error">{error}</p>}

          {plan && (
            <div className="stats">
              <div className="stat">
                <span className="stat-value">{plan.totalDistanceKm.toFixed(1)} km</span>
                <span className="stat-label">Distance</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatDuration(plan.durationMinutes)}</span>
                <span className="stat-label">Est. time</span>
              </div>
              <div className="stat">
                <span className="stat-value">↑ {Math.round(plan.elevationGainM)} m</span>
                <span className="stat-label">Climb</span>
              </div>
              <div className="stat">
                <span className="stat-value">↓ {Math.round(plan.elevationLossM)} m</span>
                <span className="stat-label">Descent</span>
              </div>
            </div>
          )}
        </section>

        <section className="panel map-panel">
          <RouteMap
            locations={locations}
            edges={edges}
            plan={plan}
            startId={startId}
            endId={endId}
            viaIds={viaIds}
            onPick={handleMapPick}
          />
          <p className="map-hint">Click a landmark on the map to set start, finish, then via points.</p>
        </section>

        {plan && (
          <section className="panel directions">
            <h2>Turn-by-turn</h2>
            <ol>
              {plan.path.map((loc, i) => (
                <li key={`${loc.id}-${i}`}>
                  <strong>{loc.name}</strong>
                  {i < plan.segments.length && (
                    <span className="leg">
                      {plan.segments[i].distanceKm.toFixed(2)} km ·{" "}
                      {plan.segments[i].elevationChange >= 0 ? "↑" : "↓"}
                      {Math.abs(Math.round(plan.segments[i].elevationChange))} m to{" "}
                      {byId.get(plan.segments[i].to.id)?.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}
