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
  ShieldCheck,
} from "lucide-react";
import { alerts, assets, links, scenarios, validations, type AlertLevel, type AssetStatus } from "./mockData";
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
  const impacted = new Set(activeScenario.impactedAssets);

  const healthScore = useMemo(() => {
    const penalty = activeScenario.id === "baseline" ? 0 : activeScenario.id === "edge-pressure" ? 9 : 5;
    const base = Math.round(assets.reduce((sum, asset) => sum + asset.score, 0) / assets.length);
    return Math.max(0, base - penalty);
  }, [activeScenario.id]);

  const visibleAlerts = scenarioId === "baseline" ? alerts : alerts.filter((alert) => impacted.has(assetIdByName(alert.asset)));

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">O</div>
          <div>
            <strong>Ops Starter</strong>
            <span>Mock To B dashboard</span>
          </div>
        </div>

        <nav className="nav">
          <a className="active" href="#overview"><LayoutDashboard size={18} /> Overview</a>
          <a href="#topology"><GitBranch size={18} /> Asset graph</a>
          <a href="#alerts"><AlertTriangle size={18} /> Alerts</a>
          <a href="#validation"><Database size={18} /> Validation</a>
          <a href="#reports"><Download size={18} /> Reports</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Enterprise Ops Dashboard Starter</h1>
            <p>Mock assets, alert grouping, health rules, and validation views for To B operations demos.</p>
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
          <Metric icon={<Activity size={18} />} label="Health score" value={`${healthScore}`} tone={healthScore < 70 ? "critical" : "normal"} />
          <Metric icon={<GitBranch size={18} />} label="Relationships" value={`${links.length}`} tone="neutral" />
          <Metric icon={<AlertTriangle size={18} />} label="Open alerts" value={`${visibleAlerts.length}`} tone={visibleAlerts.length ? "warning" : "normal"} />
          <Metric icon={<ShieldCheck size={18} />} label="Validation gaps" value={`${validations.reduce((sum, row) => sum + row.missing, 0)}`} tone="warning" />
        </section>

        <section className="two-column">
          <Panel id="topology" title="Asset relationship graph" action={activeScenario.name}>
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
              <Rule name="Asset availability" value={92} />
              <Rule name="Relationship confidence" value={88} />
              <Rule name="Alert freshness" value={74} />
              <Rule name="Report readiness" value={82} />
            </div>
          </Panel>
        </section>

        <section className="two-column lower">
          <Panel id="alerts" title="Alert triage" action={`${visibleAlerts.length} active`}>
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
            <h2>What this starter keeps from real To B work</h2>
            <p>Use one selected scenario to drive graph state, alert rows, health rules, validation messages, and report readiness. That makes a demo easier to explain and much easier to test.</p>
          </div>
          <ul>
            <li><CheckCircle2 size={18} /> Mock data only, no real business files.</li>
            <li><CheckCircle2 size={18} /> Every panel can be verified from visible state.</li>
            <li><CheckCircle2 size={18} /> Report confidence depends on source validation.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}

function assetIdByName(name: string) {
  return assets.find((asset) => asset.name === name)?.id ?? "";
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

function Rule({ name, value }: { name: string; value: number }) {
  return (
    <div className="rule">
      <span>{name}</span>
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
