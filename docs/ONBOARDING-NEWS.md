# Publishing a news item to the Vanguard Gallery

This guide walks you through adding a news item to the [Vanguard Gallery](https://valantic-digital-finance-gmbh.github.io/vanguard-gallery/) homepage. News items appear as compact, headline-only cards in the **Latest news** section. Once merged to `main`, the card appears on the site within a minute.

---

## How it works

```
Your news item file                    Vanguard Gallery repo
──────────────────────────────         ──────────────────────────────────────
docs/data/news/<id>.json (added)
       │
       ▼
PR merged to main
       │
       ▼
aggregate-news.yml runs
       │
       ▼
docs/data/news.json (rebuilt, sorted newest-first)
       │
       ▼
GitHub Pages redeploys (~60 s)
       │
       ▼
Your card is live ✓
```

---

## Step 1 — Create your news item file

Copy [`docs/templates/vanguard-news.template.json`](templates/vanguard-news.template.json) to `docs/data/news/` and rename it to `<your-id>.json`. The filename must match the `id` field.

| Field | Required | Description |
|---|:---:|---|
| `id` | ✅ | Unique kebab-case slug — used as the filename (e.g. `rfp-copilot-launch`). |
| `date` | ✅ | ISO 8601 date string (`YYYY-MM-DD`). Items are sorted newest-first by this field. |
| `tag` | ✅ | Short category badge. See [tag conventions](#tag-conventions) below. |
| `title` | ✅ | The headline **is** the story — write it so no body text is needed. Max ~120 characters. End with a full stop. |
| `href` | optional | URL the card links to. Use a full `https://` URL for external links (opens in new tab), or a relative path like `sap-blog-tracker.html` for internal gallery pages. If omitted the card is non-interactive. |

**Minimal working example:**

```json
{
  "id": "rfp-copilot-launch",
  "date": "2026-05-10",
  "tag": "Release",
  "title": "RFP Copilot ships — first-draft turnaround cut from 9 days to 36 hours.",
  "href": "https://github.com/valantic-digital-finance-GmbH/rfp-copilot"
}
```

---

## Step 2 — Open a pull request

Unlike use cases (which are pushed automatically from their own repos), news items are added directly to the gallery repo.

1. Create a branch: `git checkout -b news/<your-id>`
2. Add your file to `docs/data/news/<your-id>.json`
3. Open a pull request to `main`

On merge, `aggregate-news.yml` runs automatically and rebuilds `docs/data/news.json`. The site reflects your item within ~60 seconds.

---

## Tag conventions

Use one of these four values to keep the news feed consistent:

| Tag | When to use |
|---|---|
| `Release` | A tool shipped, entered beta, or hit a production milestone. |
| `Update` | A meaningful change to an existing tool or the gallery itself. |
| `Field note` | A real-world result or observation from using a tool with a client. |
| `Talk` | A presentation, demo, or public appearance related to the project. |

---

## Updating a news item

Edit the file in `docs/data/news/<id>.json` and open a new pull request. Merging to `main` triggers the same aggregation pipeline.

---

## Questions?

Open an issue in the [vanguard-gallery repo](https://github.com/valantic-digital-finance-gmbh/vanguard-gallery/issues) or reach out to the Vanguard team on Slack.
