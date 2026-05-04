# `briefings.json` Schema Reference

`briefings.json` is the data file consumed by **vanguard-gallery** to render the SAP Community Technology Briefings website. It is produced by `tracker.py` (daily runs) and `backfill_briefings.py` (historical rebuild), then pushed to the vanguard-gallery repository on every run.

The file is a **JSON array, newest-first, capped at 30 entries**. Each element represents one briefing day (daily tracker runs) or one briefing month (backfill runs).

---

## Top-level entry object

```jsonc
{
  "id":       "mon-2026-04-27",   // "<weekday3>-YYYY-MM-DD", lowercase — stable unique key
  "weekday":  "Monday",           // full weekday name
  "iso":      "2026-04-27",       // YYYY-MM-DD — use for sorting / deduplication
  "full":     "Apr 27, 2026",     // human-readable date for display
  "title":    "…",                // headline; equals highlights[0] when AI ran, else "{n} new posts"
  "preview":  "…",                // ≤200-char teaser; equals highlights[1] when available, else title
  "reads":    "11 min",           // estimated total read time across all posts; "—" on empty days
  "posts":    3,                  // total post count
  "tags":     ["Business Data Cloud", "Datasphere"],  // short display names of sections that have posts
  "highlights": [ "…", "…", "…" ],  // full AI "What's New" bullet list ([] when AI unavailable or backfill)
  "sections": [ /* see below */ ]
}
```

### `tags` short display names

| Full tag name | Short form |
|---|---|
| SAP Business Data Cloud | Business Data Cloud |
| SAP Datasphere | Datasphere |
| SAP Analytics Cloud | Analytics Cloud |
| SAP Analytics Cloud for planning | SAC Planning |
| SAP Analytics Cloud, data modeling | SAC Modeling |

---

## `sections` array

Each element groups all posts that belong to one product area. The order mirrors the `SECTIONS` constant in `tracker.py` (BDC → Datasphere → Analytics Cloud), followed by an "Other" section when applicable.

```jsonc
{
  "name": "SAP Business Data Cloud",  // display heading
  "tags": ["SAP Business Data Cloud"], // raw Khoros tag(s) that map to this section
  "top":  [ /* post objects — full card tier */ ],
  "rest": [ /* post objects — compact row tier */ ]
}
```

- **`top`** — up to `TOP_POSTS_PER_SECTION` posts (currently **3** in daily runs, **2** in backfill). These correspond to the **full card** posts in the email: they received an AI summary and are ranked highest (newest-first within the section). Render with title, link, author, date, summary paragraph, and post-type eyebrow.
- **`rest`** — remaining posts in the section beyond the top-N, in the same newest-first order. These correspond to the **compact row** posts in the email. Render as a compact title+author+date row without a summary paragraph.
- The "Other" section (`"name": "Other", "tags": []`) appears only when posts are present that don't match any named section.

---

## Post object

### Full fields (top-tier posts)

```jsonc
{
  "title":         "Configuring Single Sign-On (SSO) with SAP BDC",
  "url":           "https://community.sap.com/t5/…/ba-p/…",
  "author":        "karthikj2",
  "date_published": "2026-04-27",    // YYYY-MM-DD
  "matching_tags": ["SAP Business Data Cloud"],
  "minutes":       5,                // estimated read time in minutes
  "summary":       "This post explains…",   // AI-generated 2–3 sentence summary (omitted if AI unavailable)
  "post_type":     "How-to"          // AI-classified type (omitted if AI unavailable)
}
```

### Compact fields (rest-tier posts)

Rest-tier post objects carry the same base fields **without** `summary` and `post_type`:

```jsonc
{
  "title":         "SAP BDC and Datasphere News in March",
  "url":           "https://community.sap.com/…",
  "author":        "kpsauer",
  "date_published": "2026-04-25",
  "matching_tags": ["SAP Business Data Cloud", "SAP Datasphere"],
  "minutes":       1
}
```

### Field reference

| Field | Type | Notes |
|---|---|---|
| `title` | string | Original SAP Community post title |
| `url` | string | Direct link to the post on community.sap.com |
| `author` | string | SAP Community username (login) |
| `date_published` | string | YYYY-MM-DD |
| `matching_tags` | string[] | All Khoros managed tags this post was found under |
| `minutes` | integer | Estimated read time; 5 min default when teaser is short |
| `summary` | string | *(top only, when AI ran)* 2–3 sentence AI summary |
| `post_type` | string | *(top only, when AI ran)* One of: `Event`, `Deep dive`, `Release`, `How-to`, `Tip`, `Article` |

`summary` and `post_type` are **absent** (not `null`) when AI summarisation was skipped. Use truthiness checks (`if post.summary`) not null checks.

---

## `highlights` array

```jsonc
"highlights": [
  "SAP BDC now supports single-tenant SSO via SAML 2.0, removing the need for separate IdP configurations.",
  "Three new Datasphere federation adapters went live, enabling direct query push-down to HANA Cloud.",
  "SAP Analytics Cloud introduces a redesigned story toolbar with one-click export to PowerPoint."
]
```

`highlights` is the full list of AI-generated "What's New" bullets for the briefing (typically 3–6 entries). It is `[]` for backfill entries and on days when `GITHUB_TOKEN` is absent.

The entry-level `title` field equals `highlights[0]` and `preview` equals `highlights[1]` (truncated to 200 chars) when the list is non-empty — so the renderer does not need to repeat that derivation.

---

## Migration notes (from the pre-May-2026 schema)

The old schema used a `body` object. That object has been **removed entirely**. Update the renderer as follows:

| Old path | New path |
|---|---|
| `entry.body.headline` | `entry.title` |
| `entry.body.sections[i].h` | `entry.sections[i].name` |
| `entry.body.sections[i].items` (strings) | `entry.sections[i].top` + `entry.sections[i].rest` (objects) |
| `entry.body.sources[j].author` | `post.author` on each post object |
| `entry.body.sources[j].title` | `post.title` on each post object |
| `entry.body.sources[j].minutes` | `post.minutes` on each post object |
| *(post URL — was not stored)* | `post.url` |
| *(post_type — was not stored in JSON)* | `post.post_type` (top-tier only, when present) |
| *(whats_new bullets 3+ — were dropped)* | `entry.highlights` |

---

## Example — full entry

```json
{
  "id": "mon-2026-04-27",
  "weekday": "Monday",
  "iso": "2026-04-27",
  "full": "Apr 27, 2026",
  "title": "SAP BDC now supports single-tenant SSO via SAML 2.0.",
  "preview": "Three new Datasphere federation adapters went live, enabling direct query push-down to HANA Cloud.",
  "reads": "16 min",
  "posts": 3,
  "tags": ["Business Data Cloud", "Datasphere"],
  "highlights": [
    "SAP BDC now supports single-tenant SSO via SAML 2.0.",
    "Three new Datasphere federation adapters went live.",
    "SAP Analytics Cloud adds one-click PowerPoint export."
  ],
  "sections": [
    {
      "name": "SAP Business Data Cloud",
      "tags": ["SAP Business Data Cloud"],
      "top": [
        {
          "title": "Configuring Single Sign-On (SSO) with SAP BDC",
          "url": "https://community.sap.com/t5/…/ba-p/123456",
          "author": "karthikj2",
          "date_published": "2026-04-27",
          "matching_tags": ["SAP Business Data Cloud"],
          "minutes": 5,
          "summary": "This post walks through SAML 2.0 configuration for SAP BDC single-tenant deployments.",
          "post_type": "How-to"
        }
      ],
      "rest": [
        {
          "title": "SAP BDC and Datasphere News in March",
          "url": "https://community.sap.com/t5/…/ba-p/789012",
          "author": "kpsauer",
          "date_published": "2026-04-25",
          "matching_tags": ["SAP Business Data Cloud", "SAP Datasphere"],
          "minutes": 1
        }
      ]
    }
  ]
}
```
