from __future__ import annotations

import importlib.util
import shutil
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = REPO_ROOT / "scripts" / "integrate_roadmap.py"
WORKSPACE = REPO_ROOT / "tests" / "_workspace" / "integrate_roadmap"


def load_module():
    spec = importlib.util.spec_from_file_location("integrate_roadmap", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


@pytest.fixture(autouse=True)
def clean_workspace():
    if WORKSPACE.exists():
        shutil.rmtree(WORKSPACE)
    WORKSPACE.mkdir(parents=True)
    yield
    if WORKSPACE.exists():
        shutil.rmtree(WORKSPACE)


def test_extract_body_content_returns_inner_body_html():
    module = load_module()
    source = WORKSPACE / "source.html"
    source.write_text(
        "<html><body><div class='content'>Roadmap</div><script src='scripts/app.js'></script></body></html>",
        encoding="utf-8",
    )

    body_content = module.extract_body_content(source)

    assert "<div class=\"content\">Roadmap</div>" in body_content
    assert "<script src=\"scripts/app.js\"></script>" in body_content
    assert "<body" not in body_content


def test_rewrite_asset_paths_updates_styles_and_scripts():
    module = load_module()

    content = '<link rel="stylesheet" href="styles/site.css"><script src="scripts/app.js"></script>'

    rewritten = module.rewrite_asset_paths(content)

    assert 'href="assets/roadmap/styles/site.css"' in rewritten
    assert 'src="assets/roadmap/scripts/app.js"' in rewritten


def test_main_generates_html_and_copies_assets():
    module = load_module()
    source_root = WORKSPACE / "sap-roadmap-explorer" / "site"
    styles_dir = source_root / "styles"
    scripts_dir = source_root / "scripts"
    styles_dir.mkdir(parents=True)
    scripts_dir.mkdir(parents=True)

    large_body = "<div>Roadmap content</div>" * 500
    (source_root / "index.html").write_text(
        f"<html><body><link rel=\"stylesheet\" href=\"styles/site.css\">{large_body}<script src=\"scripts/app.js\"></script></body></html>",
        encoding="utf-8",
    )
    (styles_dir / "site.css").write_text("body { color: #123456; }", encoding="utf-8")
    (scripts_dir / "app.js").write_text("console.log('roadmap');", encoding="utf-8")

    module.SOURCE_HTML = source_root / "index.html"
    module.SOURCE_STYLES = styles_dir
    module.SOURCE_SCRIPTS = scripts_dir
    module.DEST_HTML = WORKSPACE / "docs" / "sap-roadmap.html"
    module.DEST_ASSETS = WORKSPACE / "docs" / "assets" / "roadmap"

    module.main()

    output_html = module.DEST_HTML.read_text(encoding="utf-8")
    assert "SAP Roadmap Tracker · Project Vanguard" in output_html
    assert 'href="assets/roadmap/styles/site.css"' in output_html
    assert 'src="assets/roadmap/scripts/app.js"' in output_html
    assert (module.DEST_ASSETS / "styles" / "site.css").exists()
    assert (module.DEST_ASSETS / "scripts" / "app.js").exists()
    assert module.DEST_HTML.stat().st_size > 10_000
