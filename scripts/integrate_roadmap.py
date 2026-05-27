"""Integrate SAP Roadmap Explorer into vanguard-gallery.

Extracts body content from sap-roadmap-explorer/site/index.html,
wraps it in vanguard template with header/footer, copies assets,
and generates docs/sap-roadmap.html.

Usage: python scripts/integrate_roadmap.py

Expects:
    - sap-roadmap-explorer/ checked out in current directory
    - vanguard-gallery/ is current working directory
"""

import logging
import shutil
import sys
from pathlib import Path

from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

SOURCE_HTML = Path("sap-roadmap-explorer/site/index.html")
SOURCE_STYLES = Path("sap-roadmap-explorer/site/styles")
SOURCE_SCRIPTS = Path("sap-roadmap-explorer/site/scripts")

DEST_HTML = Path("docs/sap-roadmap.html")
DEST_ASSETS = Path("docs/assets/roadmap")


def extract_body_content(source_path: Path) -> str:
    """Extract body content from source HTML.

    Args:
        source_path: Path to source HTML file.

    Returns:
        Body content as string (without <body> tags).

    Raises:
        FileNotFoundError: If source file doesn't exist.
        ValueError: If body content is empty.
    """
    if not source_path.exists():
        raise FileNotFoundError(f"Source HTML not found: {source_path}")

    html = source_path.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "lxml")

    if not soup.body:
        raise ValueError(f"No <body> tag found in {source_path}")

    body_content = soup.body.decode_contents()

    if not body_content.strip():
        raise ValueError(f"Empty body content in {source_path}")

    logger.info("Extracted %d characters from %s", len(body_content), source_path)
    return body_content


def rewrite_asset_paths(content: str) -> str:
    """Rewrite asset paths from site/ structure to docs/assets/roadmap/.

    Args:
        content: HTML content string.

    Returns:
        Content with rewritten paths.
    """
    content = content.replace('href="styles/', 'href="assets/roadmap/styles/')
    content = content.replace('src="scripts/', 'src="assets/roadmap/scripts/')

    logger.info("Rewrote asset paths")
    return content


def build_vanguard_template(roadmap_content: str) -> str:
    """Build final HTML with vanguard template wrapping roadmap content.

    Args:
        roadmap_content: Extracted and rewritten body content.

    Returns:
        Complete HTML document string.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>SAP Roadmap Tracker · Project Vanguard</title>
  <link rel="stylesheet" href="fonts/valantic-fonts.css">
  <link rel="stylesheet" href="assets/icons/phosphor.css">
  <link rel="stylesheet" href="styles/site.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/roadmap/styles/site.css">
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
</head>
<body data-screen-label="SAP Roadmap Tracker">
  <div id="header"></div>

  <main>
    <section class="pv-page-hero">
      <div class="pv-container">
        <div class="pv-page-hero-grid">
          <div>
            <span class="pv-eyebrow">Use case · live</span>
            <h1>SAP Roadmap Tracker.</h1>
            <p>Live snapshot of SAP product roadmaps across Analytics Cloud, Datasphere, and Business Data Cloud — updated daily at 03:00 UTC. Filter by product, quarter, or slipped items to track delivery changes.</p>
            <div style="margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap;">
              <a class="pv-btn pv-btn-primary" href="https://github.com/valantic-digital-finance-GmbH/sap-roadmap-explorer" target="_blank" rel="noopener noreferrer">
                <i class="ph ph-github-logo"></i> View repository
              </a>
              <a class="pv-btn pv-btn-secondary" href="index.html#use-cases">
                <i class="ph ph-arrow-left"></i> Back to all use cases
              </a>
            </div>
          </div>
          <aside class="pv-page-hero-aside" aria-label="Tracker meta">
            <div class="pv-page-hero-aside-row">
              <span class="k">STATUS</span>
              <span class="v live">Live · daily</span>
            </div>
            <div class="pv-page-hero-aside-row">
              <span class="k">CADENCE</span>
              <span class="v">Every day · 03:00 UTC</span>
            </div>
            <div class="pv-page-hero-aside-row">
              <span class="k">COVERAGE</span>
              <span class="v">3 SAP products</span>
            </div>
            <div class="pv-page-hero-aside-row">
              <span class="k">SOURCE</span>
              <span class="v">roadmaps.sap.com</span>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="pv-roadmap-viewer">
      <div class="pv-container">
        {roadmap_content}
      </div>
    </section>
  </main>

  <div id="footer"></div>

  <script type="text/babel" src="scripts/components.jsx"></script>
</body>
</html>
"""


def copy_assets(source_dir: Path, dest_dir: Path) -> None:
    """Copy asset directory to destination.

    Args:
        source_dir: Source directory path.
        dest_dir: Destination directory path.

    Raises:
        FileNotFoundError: If source directory doesn't exist.
    """
    if not source_dir.exists():
        raise FileNotFoundError(f"Source directory not found: {source_dir}")

    if dest_dir.exists():
        shutil.rmtree(dest_dir)

    shutil.copytree(source_dir, dest_dir)
    logger.info("Copied %s -> %s", source_dir, dest_dir)


def main() -> None:
    """Main integration workflow."""
    try:
        body_content = extract_body_content(SOURCE_HTML)
        body_content = rewrite_asset_paths(body_content)

        DEST_ASSETS.mkdir(parents=True, exist_ok=True)
        copy_assets(SOURCE_STYLES, DEST_ASSETS / "styles")
        copy_assets(SOURCE_SCRIPTS, DEST_ASSETS / "scripts")

        final_html = build_vanguard_template(body_content)

        DEST_HTML.parent.mkdir(parents=True, exist_ok=True)
        DEST_HTML.write_text(final_html, encoding="utf-8")
        logger.info("Generated %s (%d bytes)", DEST_HTML, len(final_html))

        if DEST_HTML.stat().st_size < 10_000:
            raise ValueError(f"Generated HTML suspiciously small: {DEST_HTML.stat().st_size} bytes")

        if not (DEST_ASSETS / "styles" / "site.css").exists():
            raise FileNotFoundError("Missing CSS after copy")

        if not (DEST_ASSETS / "scripts").exists():
            raise FileNotFoundError("Missing scripts directory after copy")

        logger.info("Integration complete ✓")

    except Exception as error:
        logger.error("Integration failed: %s", error)
        sys.exit(1)


if __name__ == "__main__":
    main()
