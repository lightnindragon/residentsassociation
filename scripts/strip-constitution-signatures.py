"""
Drop the last page of the constitution PDF (signature page — scanned, no extractable text).

Source: RA docs/Culcheth & Glazebury RA Constitution .pdf
Output: public/documents/culcheth-glazebury-ra-constitution.pdf

Requires: pip install pypdf
Run from repo root: python scripts/strip-constitution-signatures.py
"""
from __future__ import annotations

import glob
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RA_GLOB = str(ROOT / "RA docs" / "*Constitution*.pdf")
OUT = ROOT / "public" / "documents" / "culcheth-glazebury-ra-constitution.pdf"


def main() -> None:
    try:
        from pypdf import PdfReader, PdfWriter
    except ImportError:
        print("Install pypdf: pip install pypdf", file=sys.stderr)
        sys.exit(1)

    matches = sorted(glob.glob(RA_GLOB))
    if not matches:
        print("No constitution PDF found under RA docs/", file=sys.stderr)
        sys.exit(1)
    src = Path(matches[0])
    reader = PdfReader(str(src))
    n = len(reader.pages)
    if n < 2:
        print(f"Expected at least 2 pages, got {n}; aborting.", file=sys.stderr)
        sys.exit(1)

    writer = PdfWriter()
    for i in range(n - 1):
        writer.add_page(reader.pages[i])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "wb") as f:
        writer.write(f)

    print(f"Wrote {OUT} ({n - 1} pages, removed last of {n}) from {src.name}")


if __name__ == "__main__":
    main()
