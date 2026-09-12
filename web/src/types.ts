export interface Location {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  elevation: number;
}

export interface Edge {
  from: string;
  to: string;
  surface?: "road" | "path" | "trail";
}

export type Effort = "leisurely" | "moderate" | "brisk";

export interface RouteSegment {
  from: Location;
  to: Location;
  distanceKm: number;
  elevationChange: number;
}

export interface RoutePlan {
  waypoints: Location[];
  path: Location[];
  segments: RouteSegment[];
  totalDistanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  durationMinutes: number;
  effort: Effort;
}

export interface NetworkResponse {
  locations: Location[];
  edges: Edge[];
}
