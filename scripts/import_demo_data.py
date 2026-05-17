#!/usr/bin/env python3
import argparse
import csv
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "docs" / "sql" / "schema.sql"
TABLES = {
    "assets": "assets.csv",
    "links": "links.csv",
    "services": "services.csv",
    "alerts": "alerts.csv",
}


def read_csv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def insert_rows(conn, table, rows):
    if not rows:
        return
    columns = list(rows[0].keys())
    placeholders = ",".join("?" for _ in columns)
    sql = f"insert into {table} ({','.join(columns)}) values ({placeholders})"
    conn.executemany(sql, [[row[col] for col in columns] for row in rows])


def validate_references(conn):
    issues = []
    for table, col in [("links", "source_asset_id"), ("links", "target_asset_id"), ("services", "source_asset_id"), ("services", "target_asset_id"), ("alerts", "asset_id")]:
        rows = conn.execute(
            f"""
            select {table}.{col}
            from {table}
            left join assets on assets.asset_id = {table}.{col}
            where assets.asset_id is null
            """
        ).fetchall()
        for row in rows:
            issues.append(f"{table}.{col} references missing asset {row[0]}")
    return issues


def main():
    parser = argparse.ArgumentParser(description="Import Excel-like CSV sheets into a demo SQLite database.")
    parser.add_argument("--input", default="examples/excel-sheets", help="folder containing assets.csv, links.csv, services.csv, alerts.csv")
    parser.add_argument("--db", default="output/demo.db", help="SQLite output path")
    args = parser.parse_args()

    input_dir = Path(args.input)
    db_path = Path(args.db)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if db_path.exists():
        db_path.unlink()

    conn = sqlite3.connect(db_path)
    conn.execute("pragma foreign_keys = on")
    conn.executescript(SCHEMA.read_text(encoding="utf-8"))

    summary = {}
    for table, filename in TABLES.items():
        rows = read_csv(input_dir / filename)
        insert_rows(conn, table, rows)
        summary[table] = len(rows)

    issues = validate_references(conn)
    if issues:
        conn.rollback()
        print(json.dumps({"db": str(db_path), "summary": summary, "issues": issues}, indent=2))
        raise SystemExit(1)

    conn.commit()
    conn.close()
    print(json.dumps({"db": str(db_path), "summary": summary, "issues": 0}, indent=2))


if __name__ == "__main__":
    main()
