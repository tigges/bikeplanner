export interface Location {
  id: string;
  name: string;
  description: string;
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
  /** Elevation above sea level in metres. */
  elevation: number;
}

export interface Edge {
  from: string;
  to: string;
  /**
   * Optional surface hint used to nudge the estimated cycling speed.
   * "path" and "trail" are slower than regular roads.
   */
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
