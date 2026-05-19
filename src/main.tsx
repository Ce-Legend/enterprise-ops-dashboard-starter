import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  Download,
  GitBranch,
  LayoutDashboard,
  ListFilter,
  Sheet,
  ShieldCheck,
} from "lucide-react";
import { alerts, assets, links, scenarios, validations, type AlertLevel, type AssetStatus } from "./mockData";
import { alertsForScenario, calculateRuleScores, impactedAssetSet, overallHealth, summarizeValidation } from "./opsPatterns";
import "./styles.css";

const statusLabels: Record<AssetStatus, string> = {
  normal: "Normal",
  warning: "Watch",
  critical: "Critical",
};

const levelLabels: Record<AlertLevel, string> = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
};

function App() {
  const [scenarioId, setScenarioId] = useState("baseline");
  const activeScenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const impacted = impactedAssetSet(activeScenario);
  const ruleScores = useMemo(
    () => calculateRuleScores(assets, links, alerts, validations, activeScenario),
    [activeScenario]
  );
  const healthScore = overallHealth(ruleScores);
  const validationSummary = summarizeValidation(validations);
  const visibleAlerts = alertsForScenario(alerts, assets, activeScenario);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">O</div>
          <div>
            <strong>Data Platform</strong>
            <span>Excel to topology</span>
          </div>
        </div>

        <nav className="nav">
          <a className="active" href="#overview"><LayoutDashboard size={18} /> Overview</a>
          <a href="#import"><Sheet size={18} /> Import</a>
          <a href="#topology"><GitBranch size={18} /> Topology</a>
          <a href="#alerts"><AlertTriangle size={18} /> Status</a>
          <a href="#validation"><Database size={18} /> Validation</a>
          <a href="#reports"><Download size={18} /> Reports</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Data Visualization Management Platform Starter</h1>
            <p>Excel-like sheets, SQLite storage, topology graph, status markers, statistics, and report export in one small demo.</p>
          </div>
          <div className="scenario-control">
            <ListFilter size={16} />
            <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
              ))}
            </select>
          </div>
        </header>

        <section id="overview" className="metrics-grid">
          <Metric icon={<Sheet size={18} />} label="Source sheets" value="4" tone="neutral" />
          <Metric icon={<GitBranch size={18} />} label="Topology links" value={`${links.length}`} tone="neutral" />
          <Metric icon={<Activity size={18} />} label="Health score" value={`${healthScore}`} tone={healthScore < 70 ? "critical" : "normal"} />
          <Metric icon={<ShieldCheck size={18} />} label="Report readiness" value={`${validationSummary.readiness}%`} tone={validationSummary.readiness < 98 ? "warning" : "normal"} />
        </section>

        <section id="import" className="import-band">
          <div>
            <h2>Import pipeline</h2>
            <p>Use CSV exports from Excel as the demo input, normalize them into SQLite tables, then let the UI and report scripts read the same data.</p>
          </div>
          <ol>
            <li><span>1</span><code>assets.csv</code> for nodes</li>
            <li><span>2</span><code>links.csv</code> for topology</li>
            <li><span>3</span><code>services.csv</code> for business mapping</li>
            <li><span>4</span><code>alerts.csv</code> for status markers</li>
          </ol>
        </section>

        <section className="two-column">
          <Panel id="topology" title="Relationship / topology graph" action={activeScenario.name}>
            <div className="graph-canvas" aria-label="Mock asset relationship graph">
              <svg viewBox="0 0 100 90" role="img">
                {links.map((link) => {
                  const source = assets.find((asset) => asset.id === link.source);
                  const target = assets.find((asset) => asset.id === link.target);
                  if (!source || !target) return null;
                  const isImpacted = impacted.has(source.id) || impacted.has(target.id);
                  return (
                    <line
                      key={`${link.source}-${link.target}`}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      className={`edge ${link.status} ${isImpacted ? "impacted" : ""}`}
                    />
                  );
                })}
                {assets.map((asset) => {
                  const isImpacted = impacted.has(asset.id);
                  return (
                    <g key={asset.id} className={`node ${asset.status} ${isImpacted ? "impacted" : ""}`}>
                      <circle cx={asset.x} cy={asset.y} r={isImpacted ? 4.8 : 4.1} />
                      <text x={asset.x} y={asset.y + 8.6}>{asset.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="scenario-note">
              <strong>{activeScenario.name}</strong>
              <span>{activeScenario.description}</span>
            </div>
          </Panel>

          <Panel title="Health rules" action={`${healthScore}/100`}>
            <div className="health-ring" style={{ "--score": `${healthScore}%` } as React.CSSProperties}>
              <div>
                <strong>{healthScore}</strong>
                <span>overall</span>
              </div>
            </div>
            <div className="rule-list">
              {ruleScores.map((rule) => (
                <Rule key={rule.key} name={rule.label} value={rule.value} why={rule.why} />
              ))}
            </div>
          </Panel>
        </section>

        <section className="two-column lower">
          <Panel id="alerts" title="Status and alert triage" action={`${visibleAlerts.length} active`}>
            <div className="table">
              {visibleAlerts.map((alert) => (
                <div className="table-row" key={alert.id}>
                  <span className={`level ${alert.level}`}>{levelLabels[alert.level]}</span>
                  <strong>{alert.asset}</strong>
                  <span>{alert.message}</span>
                  <em>{alert.owner} · {alert.age}</em>
                </div>
              ))}
              {!visibleAlerts.length && <EmptyState />}
            </div>
          </Panel>

          <Panel id="validation" title="Source validation" action="mock files">
            <div className="validation-list">
              {validations.map((row) => (
                <div className="validation-row" key={row.source}>
                  <div>
                    <strong>{row.source}</strong>
                    <span>{row.note}</span>
                  </div>
                  <div className="bar" aria-label={`${row.matched} matched rows`}>
                    <i style={{ width: `${(row.matched / row.rows) * 100}%` }} />
                  </div>
                  <em>{row.matched}/{row.rows}</em>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section id="reports" className="report-band">
          <div>
            <h2>Reusable platform path</h2>
            <p>Excel sheets become database rows, database rows become topology and status views, and the same rows generate statistics and exportable reports.</p>
          </div>
          <ul>
            <li><CheckCircle2 size={18} /> Import demo sheets: <code>npm run import:demo</code>.</li>
            <li><CheckCircle2 size={18} /> Export statistics: <code>npm run export:report</code>.</li>
            <li><CheckCircle2 size={18} /> Source check: <code>npm run check:contract</code>.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <article className={`metric ${tone}`}>
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Panel({ id, title, action, children }: { id?: string; title: string; action: string; children: React.ReactNode }) {
  return (
    <section id={id} className="panel">
      <header>
        <h2>{title}</h2>
        <span>{action}</span>
      </header>
      {children}
    </section>
  );
}

function Rule({ name, value, why }: { name: string; value: number; why: string }) {
  return (
    <div className="rule">
      <span title={why}>{name}</span>
      <div><i style={{ width: `${value}%` }} /></div>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <BarChart3 size={22} />
      <span>No alerts for this scenario.</span>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
