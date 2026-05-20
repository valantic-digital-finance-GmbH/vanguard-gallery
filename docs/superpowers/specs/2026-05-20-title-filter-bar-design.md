# Title Filter Bar — Design Spec

**Date:** 2026-05-20  
**Feature:** Search pill to filter blog post titles in the FeedView table

---

## Overview

Add a real-time title search input to the topbar of the `FeedView` table component. The input is styled as a rounded pill (Option B) with a magnifying-glass icon. It filters the visible rows as the user types, narrowing post titles by case-insensitive substring match. It appears in both the desktop layout and the mobile landscape layout.

---

## State

A single new state variable `titleQuery` (string, default `""`) is added to `FeedView`. It is passed as a prop (`titleQuery`, `setTitleQuery`) to `FvMobileLandscapeLayout`.

---

## Filtering

In the `filtered` useMemo inside `FeedView`, after existing collection / tag / board filters, add:

```js
if (titleQuery.trim()) {
  const q = titleQuery.trim().toLowerCase();
  list = list.filter(p => p.title.toLowerCase().includes(q));
}
```

`titleQuery` participates in `clearFilters()` — it is reset to `""` alongside tags and boards. The "Clear filters ×" button appears whenever `activeTags.size > 0 || activeBoards.size > 0 || titleQuery.trim()`.

---

## Component: `FvSearchPill`

A small self-contained component rendered inside both topbar headers.

**Props:** `value`, `onChange` (called with the new string), `placeholder` (default `"Filter by title…"`)

**Structure:** `<label>` containing a `ph-magnifying-glass` icon, an `<input type="text">`, and a conditional `×` clear button (shown when `value` is non-empty).

**Styles (inline, matching codebase conventions):**
- Container: `display: flex; align-items: center; gap: 6px; flex: 1; max-width: 420px; min-width: 180px; padding: 0 8px; height: 28px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface-1); transition: border-color .15s`
- On focus-within: border-color shifts to `var(--accent, var(--pv-accent))`
- Icon: `ph ph-magnifying-glass`, font-size 13, color `var(--text-3)`
- Input: `flex: 1; background: none; border: none; outline: none; font-family: var(--sans); font-size: 12.5px; color: var(--text); min-width: 0`
- Clear button: appears when `value !== ""`, `×` character, styled like the existing "Clear filters ×" button

---

## Placement

### Desktop topbar (line ~886 in `feed-view.jsx`)

Replace:
```jsx
<span style={{ flex: 1 }} />
```
With:
```jsx
<FvSearchPill value={titleQuery} onChange={setTitleQuery} />
```

### Mobile landscape topbar (`FvMobileLandscapeLayout`, line ~458)

Same replacement in `FvMobileLandscapeLayout`'s header. Props `titleQuery` and `setTitleQuery` are added to `FvMobileLandscapeLayout`'s parameter list and forwarded from `FeedView`.

---

## Clear filters integration

`clearFilters` in `FeedView` gains `setTitleQuery("")`. The "Clear filters ×" button's visibility condition expands to include `titleQuery.trim().length > 0`.

---

## No new files

All changes are confined to `docs/scripts/feed-view.jsx`.
