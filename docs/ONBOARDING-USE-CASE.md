# Publishing your tool to the Vanguard Gallery

This guide walks you through getting your tool's card to appear in the use-case carousel on the [Vanguard Gallery](https://valantic-digital-finance-gmbh.github.io/vanguard-gallery/) site. Once set up, any change you push to `vanguard-usecase.json` in your repo flows through automatically — no manual steps on the gallery side.

---

## How it works

```
Your repo                              Vanguard Gallery repo
──────────────────────────────         ──────────────────────────────────────
vanguard-usecase.json (edited)
       │
       ▼
GitHub Action (push-to-gallery.yml)
       │  pushes file via PAT
       ▼
docs/data/usecases/<your-id>.json  →  aggregate-usecases.yml runs
                                       │
                                       ▼
                                   docs/data/usecases.json (rebuilt)
                                       │
                                       ▼
                                   GitHub Pages redeploys (~60 s)
                                       │
                                       ▼
                                   Your card is live ✓
```

---

## Step 1 — Create `vanguard-usecase.json`

Copy [`docs/templates/vanguard-usecase.template.json`](templates/vanguard-usecase.template.json) to the **root of your repo** and rename it to `vanguard-usecase.json`. Then fill in every required field:

| Field | Required | Description |
|---|:---:|---|
| `id` | ✅ | Unique kebab-case identifier (e.g. `rfp-copilot`). Used as the filename. |
| `order` | ✅ | Integer display position in the carousel (lower = earlier). Use multiples of 10. |
| `title` | ✅ | Short display name (e.g. `RFP Copilot`). |
| `tag` | ✅ | Category badge on the card (e.g. `Sales enablement`). |
| `icon` | ✅ | Phosphor icon class — browse at [phosphoricons.com](https://phosphoricons.com) (e.g. `ph-file-text`). |
| `repo` | ✅ | Full GitHub URL to your repo. The card links here. |
| `description` | ✅ | 1–2 sentences, max ~200 characters. |
| `benefits` | ✅ | Exactly **3** short bullet strings. Start with a verb or a number. |
| `stack` | ✅ | Tech stack string, items separated by ` · ` (e.g. `Claude · Python · Slack`). |
| `image` | optional | URL to a preview image/screenshot. Recommended size: **800 × 600 px**. Host it inside your own repo under a `docs/` folder and use the raw GitHub URL: `https://raw.githubusercontent.com/<org>/<repo>/main/docs/preview.png`. If omitted, a generated SVG illustration is used instead. |
| `palette` | optional | Custom SVG art colours (`{ "bg": "#hex", "shape": "#hex", "accent": "#hex" }`). Only used when `image` is absent. |
| `art` | optional | Named SVG template fallback. Valid values: `sap`, `rfp`, `process`, `meeting`, `forecast`, `contract`. |
| `href` | optional | Internal gallery page path. Leave out unless your tool has a dedicated page inside the gallery site. |

**Minimal working example:**

```json
{
  "id": "rfp-copilot",
  "order": 20,
  "title": "RFP Copilot",
  "tag": "Sales enablement",
  "icon": "ph-file-text",
  "repo": "https://github.com/valantic/rfp-copilot",
  "description": "A retrieval-augmented assistant that drafts the first 80 % of any RFP response from a curated library of past wins.",
  "benefits": [
    "Cuts first-draft turnaround from 9 days to 36 hours",
    "Cites every claim back to its source proposal",
    "Locked behind SSO with full audit trail"
  ],
  "stack": "Claude · pgvector · Next.js"
}
```

---

## Step 2 — Add the gallery PAT as a secret

The GitHub Action in your repo needs write access to the gallery repo. Contact the Vanguard Gallery maintainer to receive the `VANGUARD_GALLERY_PAT` value, then add it as a repository secret:

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VANGUARD_GALLERY_PAT`
4. Value: *(provided by gallery maintainer)*

> The PAT is a **fine-grained token** scoped only to the `vanguard-gallery` repository with `Contents: Read and Write` permission. It cannot access any other repository.

---

## Step 3 — Add the push workflow

Create `.github/workflows/push-to-gallery.yml` in your repo with the content below. No edits needed except to replace `<your-tool-id>` in the commit message if you like a cleaner history.

```yaml
name: Push to Vanguard Gallery

on:
  push:
    paths: ['vanguard-usecase.json']
    branches: [main]

jobs:
  push-to-gallery:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Push use case data to gallery
        run: |
          USE_CASE_ID=$(jq -r '.id' vanguard-usecase.json)

          git config --global user.email "vanguard-gallery-bot@valantic.com"
          git config --global user.name "Vanguard Gallery Bot"

          git clone https://x-access-token:${{ secrets.VANGUARD_GALLERY_PAT }}@github.com/valantic-digital-finance-gmbh/vanguard-gallery.git /tmp/gallery

          cp vanguard-usecase.json /tmp/gallery/docs/data/usecases/${USE_CASE_ID}.json

          cd /tmp/gallery
          git add docs/data/usecases/${USE_CASE_ID}.json
          git diff --cached --quiet || git commit -m "chore: update ${USE_CASE_ID} use case from source repo"
          git push origin main
```

---

## Step 4 — Push and verify

1. Commit both `vanguard-usecase.json` and `.github/workflows/push-to-gallery.yml` to `main`.
2. The `push-to-gallery` Action runs automatically.
3. Within ~2 minutes the gallery site rebuilds and your card appears in the carousel.

To check: open the gallery site and look for your card. If it doesn't appear after 5 minutes, check the **Actions** tab in both your repo and the gallery repo for error logs.

---

## Updating your card

Edit `vanguard-usecase.json` and push to `main`. That's it — the pipeline picks up the change automatically.

---

## Questions?

Open an issue in the [vanguard-gallery repo](https://github.com/valantic-digital-finance-gmbh/vanguard-gallery/issues) or reach out to the Vanguard team on Slack.
