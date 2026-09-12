import type { Effort, NetworkResponse, RoutePlan } from "./types.js";

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function fetchNetwork(): Promise<NetworkResponse> {
  return parse<NetworkResponse>(await fetch("/api/locations"));
}

export async function planRoute(
  waypointIds: string[],
  effort: Effort,
): Promise<RoutePlan> {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ waypointIds, effort }),
  });
  return parse<RoutePlan>(res);
}
