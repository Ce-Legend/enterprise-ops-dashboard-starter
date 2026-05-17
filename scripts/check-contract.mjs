import fs from "node:fs";

const contract = JSON.parse(fs.readFileSync("examples/ops-contract.json", "utf8"));
const issues = [];
const assetIds = new Set(contract.assets.map((asset) => asset.id));
const assetNames = new Set(contract.assets.map((asset) => asset.name));
const scenarioIds = new Set();

for (const asset of contract.assets) {
  if (!asset.id) issues.push("asset id is required");
  if (!asset.name) issues.push(`asset ${asset.id} is missing name`);
  if (asset.score < 0 || asset.score > 100) issues.push(`asset ${asset.id} score must be 0-100`);
}

for (const link of contract.links) {
  if (!assetIds.has(link.source)) issues.push(`link source missing asset: ${link.source}`);
  if (!assetIds.has(link.target)) issues.push(`link target missing asset: ${link.target}`);
  if (link.load < 0 || link.load > 100) issues.push(`link ${link.source}->${link.target} load must be 0-100`);
}

for (const alert of contract.alerts) {
  if (!assetNames.has(alert.asset)) issues.push(`alert ${alert.id} references unknown asset name: ${alert.asset}`);
}

for (const row of contract.validations) {
  if (row.rows < row.matched) issues.push(`validation ${row.source} matched rows exceed total rows`);
  if (row.rows - row.matched !== row.missing) issues.push(`validation ${row.source} missing count does not match rows - matched`);
}

for (const scenario of contract.scenarios) {
  if (scenarioIds.has(scenario.id)) issues.push(`duplicate scenario id: ${scenario.id}`);
  scenarioIds.add(scenario.id);
  for (const assetId of scenario.impactedAssets) {
    if (!assetIds.has(assetId)) issues.push(`scenario ${scenario.id} references unknown asset: ${assetId}`);
  }
}

console.log(
  JSON.stringify(
    {
      assets: contract.assets.length,
      links: contract.links.length,
      alerts: contract.alerts.length,
      validations: contract.validations.length,
      scenarios: contract.scenarios.length,
      issues: issues.length,
    },
    null,
    2
  )
);

if (issues.length) {
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
