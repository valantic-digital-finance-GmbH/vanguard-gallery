# Title Filter Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a rounded search pill to the FeedView table topbar that filters visible rows by post title as the user types.

**Architecture:** All changes are confined to `docs/scripts/feed-view.jsx`. A new `FvSearchPill` component handles the pill UI. A `titleQuery` state variable in `FeedView` drives filtering in the existing `filtered` useMemo. The pill is rendered in both the desktop topbar and the mobile landscape topbar, replacing the `flex: 1` spacer in both.

**Tech Stack:** React 18 (CDN/UMD), Babel standalone, Phosphor icon font, inline styles (no CSS modules, no test framework — manual verification only)

---

## File Map

| File | Change |
|------|--------|
| `docs/scripts/feed-view.jsx` | Add `FvSearchPill` component; add `titleQuery` state + filtering; update `clearFilters`; update both topbars |

---

### Task 1: Add `FvSearchPill` component

**Files:**
- Modify: `docs/scripts/feed-view.jsx` — insert new component before `FvMobileLandscapeLayout`

- [ ] **Step 1: Insert `FvSearchPill` after the `FvMobileHeaderRow` function (around line 409)**

Find the comment `// ── Mobile components` (line ~257) and insert the new component right before `FvMobileLandscapeLayout` (look for the line `function FvMobileLandscapeLayout`). Add this complete component block immediately before it:

```jsx
function FvSearchPill({ value, onChange, placeholder }) {
  placeholder = placeholder || 'Filter by title\u2026';
  const [focused, fvSetFocused] = fvState(false);
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 6,
      flex: 1, maxWidth: 420, minWidth: 180,
      padding: '0 8px', height: 28, borderRadius: 999,
      border: `1px solid ${focused ? 'var(--accent, var(--pv-accent))' : 'var(--border)'}`,
      background: 'var(--surface-1)',
      transition: 'border-color .15s',
      cursor: 'text',
      boxSizing: 'border-box',
    }}>
      <i className="ph ph-magnifying-glass" style={{ fontSize: 13, color: 'var(--text-3)', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => fvSetFocused(true)}
        onBlur={() => fvSetFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1, minWidth: 0,
          background: 'none', border: 'none', outline: 'none',
          fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--text)',
          padding: 0,
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          tabIndex={-1}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 12, padding: '0 2px',
            display: 'inline-flex', alignItems: 'center', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          ×
        </button>
      )}
    </label>
  );
}
```

- [ ] **Step 2: Verify the component is syntactically correct**

Open the file in a browser (or check the Babel console) — if there are JSX syntax errors, the page will show a blank red error. The component should compile silently at this point (it isn't rendered yet).

- [ ] **Step 3: Commit**

```bash
git add docs/scripts/feed-view.jsx
git commit -m "feat: add FvSearchPill component (not yet wired)"
```

---

### Task 2: Add `titleQuery` state and filtering to `FeedView`

**Files:**
- Modify: `docs/scripts/feed-view.jsx` — `FeedView` function body

- [ ] **Step 1: Add `titleQuery` state**

In `FeedView`, find the block of `fvState` declarations (around line 605–616). Add the new state after `isFullscreen`:

```jsx
const [isFullscreen, setIsFullscreen]         = fvState(false);
const [titleQuery, setTitleQuery]             = fvState('');
```

- [ ] **Step 2: Add title filtering in the `filtered` memo**

Find the `filtered` useMemo (around line 678). After the `activeBoards` filter block and before the sort block, add:

```jsx
if (titleQuery.trim()) {
  const q = titleQuery.trim().toLowerCase();
  list = list.filter(p => p.title.toLowerCase().includes(q));
}
```

The surrounding context looks like:

```jsx
if (activeBoards.size > 0) {
  list = list.filter(p => p.board && activeBoards.has(p.board.name));
}
// ↑ existing — add below ↑
if (titleQuery.trim()) {
  const q = titleQuery.trim().toLowerCase();
  list = list.filter(p => p.title.toLowerCase().includes(q));
}
list = [...list];
```

- [ ] **Step 3: Add `titleQuery` to the `filtered` memo dependency array**

The memo's dependency array currently ends with `sortDir]`. Add `titleQuery`:

```jsx
}, [data, activeCollection, activeTags, activeBoards, sortKey, sortDir, titleQuery]);
```

- [ ] **Step 4: Update `clearFilters` to reset `titleQuery`**

Find `function clearFilters()`:

```jsx
function clearFilters() {
  setActiveTags(new Set());
  setActiveBoards(new Set());
  setTitleQuery('');
}
```

- [ ] **Step 5: Update "Clear filters" button visibility condition**

There are two places where `(activeTags.size > 0 || activeBoards.size > 0)` controls the "Clear filters ×" button — one in the desktop topbar and one in `FvMobileLandscapeLayout` (which uses `totalActiveFilters`). Handle the desktop topbar here:

Find (around line 874 in the desktop topbar):
```jsx
{(activeTags.size > 0 || activeBoards.size > 0) && (
  <button
    onClick={clearFilters}
```

Replace the condition:
```jsx
{(activeTags.size > 0 || activeBoards.size > 0 || titleQuery.trim().length > 0) && (
  <button
    onClick={clearFilters}
```

- [ ] **Step 6: Commit**

```bash
git add docs/scripts/feed-view.jsx
git commit -m "feat: wire titleQuery state and filtering in FeedView"
```

---

### Task 3: Render `FvSearchPill` in the desktop topbar

**Files:**
- Modify: `docs/scripts/feed-view.jsx` — desktop topbar header in `FeedView`

- [ ] **Step 1: Replace the spacer with `FvSearchPill` in the desktop topbar**

In the desktop topbar `<header>` (around line 886), find:
```jsx
<span style={{ flex: 1 }} />
```
Replace with:
```jsx
<FvSearchPill value={titleQuery} onChange={setTitleQuery} />
```

- [ ] **Step 2: Verify in browser**

Load `docs/sap-blog-tracker.html` in a browser (or live server). The table view should show a search pill in the topbar between the post count and the fullscreen button. Typing should immediately filter visible rows. Clearing should restore all rows.

- [ ] **Step 3: Commit**

```bash
git add docs/scripts/feed-view.jsx
git commit -m "feat: render FvSearchPill in desktop FeedView topbar"
```

---

### Task 4: Wire `FvSearchPill` into the mobile landscape topbar

**Files:**
- Modify: `docs/scripts/feed-view.jsx` — `FvMobileLandscapeLayout` props + topbar + `FeedView` call site

- [ ] **Step 1: Add `titleQuery` and `setTitleQuery` to `FvMobileLandscapeLayout`'s parameter list**

Find the function signature (around line 411):
```jsx
function FvMobileLandscapeLayout({
  filtered, data,
  activeCollection, setActiveCollection,
  activeTags, toggleTag,
  activeBoards, toggleBoard,
  sortKey, sortDir, handleSort,
  clearFilters,
  isFullscreen, onToggleFullscreen,
}) {
```
Replace with:
```jsx
function FvMobileLandscapeLayout({
  filtered, data,
  activeCollection, setActiveCollection,
  activeTags, toggleTag,
  activeBoards, toggleBoard,
  sortKey, sortDir, handleSort,
  clearFilters,
  titleQuery, setTitleQuery,
  isFullscreen, onToggleFullscreen,
}) {
```

- [ ] **Step 2: Update `totalActiveFilters` to count a non-empty `titleQuery`**

In `FvMobileLandscapeLayout`, find:
```jsx
const totalActiveFilters = activeTags.size + activeBoards.size;
```
Replace with:
```jsx
const totalActiveFilters = activeTags.size + activeBoards.size + (titleQuery.trim() ? 1 : 0);
```

- [ ] **Step 3: Replace the spacer with `FvSearchPill` in the mobile topbar**

In `FvMobileLandscapeLayout`'s `<header>`, find:
```jsx
<span style={{ flex: 1 }} />
```
Replace with:
```jsx
<FvSearchPill value={titleQuery} onChange={setTitleQuery} />
```

- [ ] **Step 4: Pass `titleQuery` and `setTitleQuery` at the call site in `FeedView`**

Find where `FvMobileLandscapeLayout` is rendered (around line 729):
```jsx
<FvMobileLandscapeLayout
  filtered={filtered}
  data={data}
  activeCollection={activeCollection}
  setActiveCollection={setActiveCollection}
  activeTags={activeTags}
  toggleTag={toggleTag}
  activeBoards={activeBoards}
  toggleBoard={toggleBoard}
  sortKey={sortKey}
  sortDir={sortDir}
  handleSort={handleSort}
  clearFilters={clearFilters}
  isFullscreen={isFullscreen}
  onToggleFullscreen={() => setIsFullscreen(f => !f)}
/>
```
Add the two new props:
```jsx
<FvMobileLandscapeLayout
  filtered={filtered}
  data={data}
  activeCollection={activeCollection}
  setActiveCollection={setActiveCollection}
  activeTags={activeTags}
  toggleTag={toggleTag}
  activeBoards={activeBoards}
  toggleBoard={toggleBoard}
  sortKey={sortKey}
  sortDir={sortDir}
  handleSort={handleSort}
  clearFilters={clearFilters}
  titleQuery={titleQuery}
  setTitleQuery={setTitleQuery}
  isFullscreen={isFullscreen}
  onToggleFullscreen={() => setIsFullscreen(f => !f)}
/>
```

- [ ] **Step 5: Verify in browser at mobile landscape width**

Open DevTools, set viewport to landscape mobile (e.g. 812×375). The topbar should show the search pill. Typing should filter rows. The Filters badge count should increment by 1 when a query is active.

- [ ] **Step 6: Commit**

```bash
git add docs/scripts/feed-view.jsx
git commit -m "feat: render FvSearchPill in mobile landscape FeedView topbar"
```

---

## Done

All four tasks complete. The title filter pill is live in both desktop and mobile landscape layouts, integrated with the existing filter/clear system.
