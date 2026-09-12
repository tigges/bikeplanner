import type { Edge, Location } from "./types.js";

/**
 * A small, self-contained network of San Francisco cycling landmarks.
 * Coordinates and elevations are approximate real-world values, which keeps
 * the demo meaningful (SF hills produce real elevation gain) without relying
 * on any external map/tile/geocoding service.
 */
export const locations: Location[] = [
  {
    id: "ferry-building",
    name: "Ferry Building",
    description: "Waterfront market hall and ferry terminal on the Embarcadero.",
    lat: 37.7955,
    lng: -122.3937,
    elevation: 3,
  },
  {
    id: "union-square",
    name: "Union Square",
    description: "Central shopping plaza in downtown San Francisco.",
    lat: 37.788,
    lng: -122.4075,
    elevation: 30,
  },
  {
    id: "coit-tower",
    name: "Coit Tower",
    description: "Art-deco tower atop Telegraph Hill with bay views.",
    lat: 37.8024,
    lng: -122.4058,
    elevation: 84,
  },
  {
    id: "fishermans-wharf",
    name: "Fisherman's Wharf",
    description: "Historic waterfront district and pier.",
    lat: 37.808,
    lng: -122.4177,
    elevation: 5,
  },
  {
    id: "ghirardelli-square",
    name: "Ghirardelli Square",
    description: "Former chocolate factory turned marketplace.",
    lat: 37.8059,
    lng: -122.4229,
    elevation: 6,
  },
  {
    id: "fort-mason",
    name: "Fort Mason",
    description: "Waterfront park and cultural center.",
    lat: 37.806,
    lng: -122.43,
    elevation: 12,
  },
  {
    id: "palace-of-fine-arts",
    name: "Palace of Fine Arts",
    description: "Monumental rotunda and lagoon in the Marina.",
    lat: 37.8029,
    lng: -122.4484,
    elevation: 5,
  },
  {
    id: "presidio",
    name: "Presidio",
    description: "Forested former army post with cycling trails.",
    lat: 37.7989,
    lng: -122.4662,
    elevation: 90,
  },
  {
    id: "golden-gate-bridge",
    name: "Golden Gate Bridge",
    description: "Iconic suspension bridge and welcome center.",
    lat: 37.8199,
    lng: -122.4783,
    elevation: 75,
  },
  {
    id: "alamo-square",
    name: "Alamo Square",
    description: "Hilltop park famed for the Painted Ladies.",
    lat: 37.7764,
    lng: -122.4346,
    elevation: 45,
  },
  {
    id: "golden-gate-park",
    name: "Golden Gate Park",
    description: "Large urban park with dedicated bike paths.",
    lat: 37.7694,
    lng: -122.4862,
    elevation: 60,
  },
  {
    id: "twin-peaks",
    name: "Twin Peaks",
    description: "Steep double summit with panoramic city views.",
    lat: 37.7544,
    lng: -122.4477,
    elevation: 276,
  },
  {
    id: "mission-dolores",
    name: "Mission Dolores",
    description: "Oldest surviving building in San Francisco.",
    lat: 37.7642,
    lng: -122.4269,
    elevation: 25,
  },
];

/**
 * Bidirectional connections approximating a rideable street/path network.
 * Distances are derived from coordinates at runtime, so only topology lives here.
 */
export const edges: Edge[] = [
  { from: "ferry-building", to: "union-square", surface: "road" },
  { from: "ferry-building", to: "coit-tower", surface: "road" },
  { from: "coit-tower", to: "fishermans-wharf", surface: "road" },
  { from: "union-square", to: "coit-tower", surface: "road" },
  { from: "fishermans-wharf", to: "ghirardelli-square", surface: "path" },
  { from: "ghirardelli-square", to: "fort-mason", surface: "path" },
  { from: "fort-mason", to: "palace-of-fine-arts", surface: "path" },
  { from: "palace-of-fine-arts", to: "presidio", surface: "road" },
  { from: "presidio", to: "golden-gate-bridge", surface: "trail" },
  { from: "palace-of-fine-arts", to: "golden-gate-bridge", surface: "path" },
  { from: "presidio", to: "golden-gate-park", surface: "trail" },
  { from: "golden-gate-park", to: "twin-peaks", surface: "road" },
  { from: "golden-gate-park", to: "alamo-square", surface: "road" },
  { from: "alamo-square", to: "mission-dolores", surface: "road" },
  { from: "mission-dolores", to: "twin-peaks", surface: "road" },
  { from: "alamo-square", to: "union-square", surface: "road" },
  { from: "mission-dolores", to: "union-square", surface: "road" },
  { from: "twin-peaks", to: "presidio", surface: "trail" },
];
