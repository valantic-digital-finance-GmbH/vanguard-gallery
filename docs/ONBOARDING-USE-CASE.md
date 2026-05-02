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

Create `.github/workflows/push-to-gallery.yml` in your repo with the content below. No edits needed.

> **Why REST API instead of `git push`?** GitHub's password authentication for git operations over HTTPS is disabled. Classic PATs also cannot use the `x-access-token:` prefix that only works for GitHub Apps. The GitHub Contents REST API (`PUT /repos/.../contents/...`) is the reliable alternative — it uses the PAT as a bearer token in the `Authorization` header and avoids git authentication entirely.

```yaml
name: Push to Vanguard Gallery

on:
  push:
    paths: ['vanguard-usecase.json']
    branches: [main]
  workflow_dispatch:

jobs:
  push-to-gallery:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Push use case data to gallery
        env:
          VANGUARD_GALLERY_PAT: ${{ secrets.VANGUARD_GALLERY_PAT }}
        run: |
          if [ -z "${VANGUARD_GALLERY_PAT}" ]; then
            echo "❌ VANGUARD_GALLERY_PAT secret is not set or not accessible"
            exit 1
          fi

          USE_CASE_ID=$(jq -r '.id' vanguard-usecase.json)
          echo "Use case ID: $USE_CASE_ID"

          TARGET_PATH="docs/data/usecases/${USE_CASE_ID}.json"

          # Get current file SHA (required by GitHub API to update an existing file)
          SHA=$(curl -s \
            -H "Authorization: token ${VANGUARD_GALLERY_PAT}" \
            -H "Accept: application/vnd.github+json" \
            "https://api.github.com/repos/valantic-digital-finance-GmbH/vanguard-gallery/contents/${TARGET_PATH}" \
            | jq -r '.sha // empty')

          CONTENT=$(base64 -w 0 vanguard-usecase.json)
          MSG="chore: update ${USE_CASE_ID} use case from source repo"

          if [ -n "$SHA" ]; then
            PAYLOAD=$(jq -n \
              --arg message "$MSG" \
              --arg content "$CONTENT" \
              --arg sha "$SHA" \
              '{message: $message, content: $content, sha: $sha}')
          else
            PAYLOAD=$(jq -n \
              --arg message "$MSG" \
              --arg content "$CONTENT" \
              '{message: $message, content: $content}')
          fi

          RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: token ${VANGUARD_GALLERY_PAT}" \
            -H "Accept: application/vnd.github+json" \
            -H "Content-Type: application/json" \
            -d "$PAYLOAD" \
            "https://api.github.com/repos/valantic-digital-finance-GmbH/vanguard-gallery/contents/${TARGET_PATH}")

          HTTP_CODE=$(echo "$RESPONSE" | tail -1)
          if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
            echo "✅ ${USE_CASE_ID}.json pushed to vanguard-gallery (HTTP $HTTP_CODE)"
          else
            echo "❌ Failed to push (HTTP $HTTP_CODE)"
            echo "$RESPONSE" | head -1
            exit 1
          fi
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
