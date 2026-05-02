#!/usr/bin/env python3
"""Aggregate individual use case JSON files into a single usecases.json for the carousel."""
import json
import glob
import sys

SRC = "docs/data/usecases"
OUT = "docs/data/usecases.json"


def main():
    files = sorted(glob.glob(f"{SRC}/*.json"))
    if not files:
        print(f"No use case files found in {SRC}", file=sys.stderr)
        sys.exit(1)

    usecases = []
    for path in files:
        with open(path, encoding="utf-8") as f:
            usecases.append(json.load(f))

    usecases.sort(key=lambda x: x.get("order", 999))

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(usecases, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Aggregated {len(usecases)} use cases → {OUT}")


if __name__ == "__main__":
    main()
