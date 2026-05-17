#!/usr/bin/env python3
import argparse
import csv
import json
import sqlite3
from pathlib import Path


def scalar(conn, sql):
    return conn.execute(sql).fetchone()[0]


def rows(conn, sql):
    conn.row_factory = sqlite3.Row
    return [dict(row) for row in conn.execute(sql).fetchall()]


def write_csv(path, items):
    if not items:
        path.write_text("", encoding="utf-8")
        return
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(items[0].keys()))
        writer.writeheader()
        writer.writerows(items)


def main():
    parser = argparse.ArgumentParser(description="Export demo statistics and report-ready CSV files from SQLite.")
    parser.add_argument("--db", default="output/demo.db", help="SQLite database path")
    parser.add_argument("--output", default="output/report", help="output folder")
    args = parser.parse_args()

    db_path = Path(args.db)
    if not db_path.exists():
        raise SystemExit(f"database not found: {db_path}. Run npm run import:demo first.")

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)

    summary = {
        "assets": scalar(conn, "select count(*) from assets"),
        "links": scalar(conn, "select count(*) from links"),
        "services": scalar(conn, "select count(*) from services"),
        "alerts": scalar(conn, "select count(*) from alerts"),
        "critical_alerts": scalar(conn, "select count(*) from alerts where level = 'critical'"),
        "warning_or_critical_links": scalar(conn, "select count(*) from links where status != 'normal'"),
    }
    status_by_region = rows(
        conn,
        """
        select region, status, count(*) as count
        from assets
        group by region, status
        order by region, status
        """,
    )
    topology_report = rows(
        conn,
        """
        select
          links.link_id,
          source.asset_name as source_asset,
          target.asset_name as target_asset,
          links.link_type,
          links.load,
          links.status
        from links
        join assets source on source.asset_id = links.source_asset_id
        join assets target on target.asset_id = links.target_asset_id
        order by links.link_id
        """,
    )
    alert_report = rows(
        conn,
        """
        select alerts.alert_id, assets.asset_name, alerts.level, alerts.message, alerts.owner, alerts.age_minutes
        from alerts
        join assets on assets.asset_id = alerts.asset_id
        order by case alerts.level when 'critical' then 1 when 'major' then 2 else 3 end, alerts.age_minutes desc
        """,
    )

    (output / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    write_csv(output / "status_by_region.csv", status_by_region)
    write_csv(output / "topology_report.csv", topology_report)
    write_csv(output / "alert_report.csv", alert_report)
    print(json.dumps({"output": str(output), "files": 4, "summary": summary}, indent=2))


if __name__ == "__main__":
    main()
