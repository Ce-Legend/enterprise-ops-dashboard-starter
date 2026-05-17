import type { AlertItem, AssetLink, AssetNode, Scenario, ValidationRow } from "./mockData";

export interface RuleScore {
  key: string;
  label: string;
  value: number;
  why: string;
}

export interface ValidationSummary {
  rows: number;
  matched: number;
  missing: number;
  readiness: number;
  label: "Ready" | "Review" | "Blocked";
}

export function assetNameToIdMap(assets: AssetNode[]) {
  return new Map(assets.map((asset) => [asset.name, asset.id]));
}

export function impactedAssetSet(scenario: Scenario) {
  return new Set(scenario.impactedAssets);
}

export function alertsForScenario(alerts: AlertItem[], assets: AssetNode[], scenario: Scenario) {
  if (!scenario.impactedAssets.length) return alerts;

  const nameToId = assetNameToIdMap(assets);
  const impacted = impactedAssetSet(scenario);
  return alerts.filter((alert) => impacted.has(nameToId.get(alert.asset) ?? ""));
}

export function summarizeValidation(rows: ValidationRow[]): ValidationSummary {
  const totals = rows.reduce(
    (acc, row) => ({
      rows: acc.rows + row.rows,
      matched: acc.matched + row.matched,
      missing: acc.missing + row.missing,
    }),
    { rows: 0, matched: 0, missing: 0 }
  );
  const readiness = totals.rows ? Math.floor((totals.matched / totals.rows) * 100) : 0;
  const label = readiness >= 99 && totals.missing === 0 ? "Ready" : readiness >= 92 ? "Review" : "Blocked";

  return { ...totals, readiness, label };
}

export function calculateRuleScores(
  assets: AssetNode[],
  links: AssetLink[],
  alerts: AlertItem[],
  validations: ValidationRow[],
  scenario: Scenario
): RuleScore[] {
  const impacted = impactedAssetSet(scenario);
  const validation = summarizeValidation(validations);
  const criticalAssets = assets.filter((asset) => asset.status === "critical").length;
  const weakLinks = links.filter((link) => link.status !== "normal").length;
  const activeAlerts = alertsForScenario(alerts, assets, scenario);
  const criticalAlerts = activeAlerts.filter((alert) => alert.level === "critical").length;

  return [
    {
      key: "availability",
      label: "Asset availability",
      value: clampScore(100 - criticalAssets * 12 - impacted.size * 3),
      why: "critical assets and scenario impact reduce availability",
    },
    {
      key: "relationship",
      label: "Relationship confidence",
      value: clampScore(100 - weakLinks * 4),
      why: "warning and critical links lower relationship confidence",
    },
    {
      key: "alertFreshness",
      label: "Alert freshness",
      value: clampScore(92 - activeAlerts.length * 4 - criticalAlerts * 6),
      why: "more active alerts mean more review pressure",
    },
    {
      key: "reportReadiness",
      label: "Report readiness",
      value: validation.readiness,
      why: "report confidence follows source validation coverage",
    },
  ];
}

export function overallHealth(ruleScores: RuleScore[]) {
  if (!ruleScores.length) return 0;
  return Math.round(ruleScores.reduce((sum, item) => sum + item.value, 0) / ruleScores.length);
}

export function validateOpsContract(input: {
  assets: AssetNode[];
  links: AssetLink[];
  alerts: AlertItem[];
  validations: ValidationRow[];
  scenarios: Scenario[];
}) {
  const issues: string[] = [];
  const assetIds = new Set(input.assets.map((asset) => asset.id));
  const assetNames = new Set(input.assets.map((asset) => asset.name));
  const scenarioIds = new Set<string>();

  for (const asset of input.assets) {
    if (!asset.id.trim()) issues.push("asset id is required");
    if (!asset.name.trim()) issues.push(`asset ${asset.id} is missing name`);
    if (asset.score < 0 || asset.score > 100) issues.push(`asset ${asset.id} score must be 0-100`);
  }

  for (const link of input.links) {
    if (!assetIds.has(link.source)) issues.push(`link source missing asset: ${link.source}`);
    if (!assetIds.has(link.target)) issues.push(`link target missing asset: ${link.target}`);
    if (link.load < 0 || link.load > 100) issues.push(`link ${link.source}->${link.target} load must be 0-100`);
  }

  for (const alert of input.alerts) {
    if (!assetNames.has(alert.asset)) issues.push(`alert ${alert.id} references unknown asset name: ${alert.asset}`);
  }

  for (const row of input.validations) {
    if (row.rows < row.matched) issues.push(`validation ${row.source} matched rows exceed total rows`);
    if (row.rows - row.matched !== row.missing) issues.push(`validation ${row.source} missing count does not match rows - matched`);
  }

  for (const scenario of input.scenarios) {
    if (scenarioIds.has(scenario.id)) issues.push(`duplicate scenario id: ${scenario.id}`);
    scenarioIds.add(scenario.id);
    for (const assetId of scenario.impactedAssets) {
      if (!assetIds.has(assetId)) issues.push(`scenario ${scenario.id} references unknown asset: ${assetId}`);
    }
  }

  return issues;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
