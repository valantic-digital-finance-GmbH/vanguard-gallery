#!/usr/bin/env python3
"""Aggregate individual news JSON files into a single news.json, sorted newest-first."""
import json
import glob
import sys

SRC = "docs/data/news"
OUT = "docs/data/news.json"


def main():
    files = sorted(glob.glob(f"{SRC}/*.json"))
    if not files:
        print(f"No news files found in {SRC}", file=sys.stderr)
        sys.exit(1)

    items = []
    for path in files:
        with open(path, encoding="utf-8") as f:
            items.append(json.load(f))

    items.sort(key=lambda x: x.get("date", ""), reverse=True)

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Aggregated {len(items)} news items → {OUT}")


if __name__ == "__main__":
    main()
