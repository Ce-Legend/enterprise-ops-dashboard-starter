export type AssetStatus = "normal" | "warning" | "critical";
export type AlertLevel = "minor" | "major" | "critical";

export interface AssetNode {
  id: string;
  name: string;
  group: string;
  x: number;
  y: number;
  status: AssetStatus;
  score: number;
}

export interface AssetLink {
  source: string;
  target: string;
  load: number;
  status: AssetStatus;
}

export interface AlertItem {
  id: string;
  asset: string;
  level: AlertLevel;
  message: string;
  owner: string;
  age: string;
}

export interface ValidationRow {
  source: string;
  rows: number;
  matched: number;
  missing: number;
  note: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  impactedAssets: string[];
}

export const assets: AssetNode[] = [
  { id: "hub-east", name: "East Hub", group: "Core", x: 14, y: 34, status: "normal", score: 92 },
  { id: "hub-west", name: "West Hub", group: "Core", x: 82, y: 35, status: "warning", score: 78 },
  { id: "edge-1", name: "Edge A1", group: "Edge", x: 30, y: 18, status: "normal", score: 88 },
  { id: "edge-2", name: "Edge B2", group: "Edge", x: 66, y: 18, status: "critical", score: 54 },
  { id: "zone-1", name: "Zone 12", group: "Access", x: 27, y: 66, status: "normal", score: 84 },
  { id: "zone-2", name: "Zone 18", group: "Access", x: 58, y: 72, status: "warning", score: 73 },
  { id: "zone-3", name: "Zone 24", group: "Access", x: 75, y: 59, status: "normal", score: 86 },
];

export const links: AssetLink[] = [
  { source: "hub-east", target: "edge-1", load: 42, status: "normal" },
  { source: "hub-east", target: "zone-1", load: 64, status: "normal" },
  { source: "hub-east", target: "zone-2", load: 82, status: "warning" },
  { source: "hub-west", target: "edge-2", load: 91, status: "critical" },
  { source: "hub-west", target: "zone-2", load: 77, status: "warning" },
  { source: "hub-west", target: "zone-3", load: 48, status: "normal" },
  { source: "edge-1", target: "edge-2", load: 57, status: "normal" },
];

export const alerts: AlertItem[] = [
  {
    id: "A-1042",
    asset: "Edge B2",
    level: "critical",
    message: "Primary route unavailable, fallback path active",
    owner: "NOC",
    age: "18m",
  },
  {
    id: "A-1037",
    asset: "West Hub",
    level: "major",
    message: "Sustained utilization above policy threshold",
    owner: "Capacity",
    age: "46m",
  },
  {
    id: "A-1028",
    asset: "Zone 18",
    level: "minor",
    message: "Telemetry freshness check missed one cycle",
    owner: "Data",
    age: "1h 12m",
  },
];

export const validations: ValidationRow[] = [
  { source: "asset_inventory.csv", rows: 1280, matched: 1266, missing: 14, note: "14 rows need location mapping" },
  { source: "relationship_map.csv", rows: 4382, matched: 4382, missing: 0, note: "all endpoints matched" },
  { source: "events_today.csv", rows: 213, matched: 207, missing: 6, note: "6 events waiting for rule owner" },
];

export const scenarios: Scenario[] = [
  {
    id: "baseline",
    name: "Baseline",
    description: "Normal monitoring view with current alerts and health score.",
    impactedAssets: [],
  },
  {
    id: "edge-pressure",
    name: "Edge Pressure",
    description: "Highlights one edge asset, related alerts, and downstream services.",
    impactedAssets: ["edge-2", "hub-west", "zone-2"],
  },
  {
    id: "data-gap",
    name: "Data Gap",
    description: "Shows how missing source rows affect validation and report confidence.",
    impactedAssets: ["zone-1", "zone-2"],
  },
];
