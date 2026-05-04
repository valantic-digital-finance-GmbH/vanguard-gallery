// Feed view component — sidebar + table for the "All posts" tab.
// Adapted from blog-tracker-handoff/artboard-sidebar.jsx.
// Uses Project Vanguard tokens via .pv-feed CSS-var scope.

const {
  useState: fvState,
  useMemo: fvMemo,
  useEffect: fvEffect,
  useRef: fvRef,
} = React;

function FvColResizer({ onResize, onStart, onEnd, vertical }) {
  const startRef = fvRef(null);
  function handleMouseDown(e) {
    e.preventDefault(); e.stopPropagation();
    startRef.current = vertical ? e.clientY : e.clientX;
    onStart && onStart();
    function move(ev) {
      const cur = vertical ? ev.clientY : ev.clientX;
      onResize(cur - startRef.current);
      startRef.current = cur;
    }
    function up() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      onEnd && onEnd();
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }
  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        ...(vertical
          ? { left: 0, right: 0, bottom: -3, height: 6, cursor: 'row-resize' }
          : { top: 0, bottom: 0, right: -3, width: 6, cursor: 'col-resize' }),
        zIndex: 5,
      }}
      onMouseEnter={e => { const b = e.currentTarget.querySelector('div'); if (b) b.style.background = 'var(--accent, var(--pv-accent))'; }}
      onMouseLeave={e => { const b = e.currentTarget.querySelector('div'); if (b) b.style.background = 'transparent'; }}
    >
      <div style={{
        position: 'absolute',
        ...(vertical
          ? { left: 0, right: 0, top: '50%', height: 1, transform: 'translateY(-50%)' }
          : { top: 0, bottom: 0, left: '50%', width: 1, transform: 'translateX(-50%)' }),
        background: 'transparent', transition: 'background .12s',
      }} />
    </div>
  );
}

function FvSidebarItem({ icon, label, count, active, onClick, indent }) {
  indent = indent || 0;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%',
        padding: `5px 8px 5px ${8 + indent * 16}px`,
        background: active ? 'var(--surface-2)' : 'transparent',
        border: 'none', borderRadius: 4, cursor: 'pointer',
        color: active ? 'var(--text)' : 'var(--text-2)',
        fontFamily: 'var(--sans)', fontSize: 12.5,
        fontWeight: active ? 500 : 400,
        textAlign: 'left', height: 26,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-1)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ color: active ? 'var(--text)' : 'var(--text-3)', display: 'inline-flex' }}>
        {typeof icon === 'string' ? <FeedIcon name={icon} size={14} /> : icon}
      </span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {count != null && (
        <span style={{ fontFamily: 'var(--sans)', fontVariantNumeric: 'tabular-nums', fontSize: 10.5, color: 'var(--text-3)' }}>
          {count}
        </span>
      )}
    </button>
  );
}

function FvSidebarSection({ title, children, defaultOpen }) {
  defaultOpen = defaultOpen !== false;
  const [open, setOpen] = fvState(defaultOpen);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 8px', height: 22,
        color: 'var(--text-3)', fontFamily: 'var(--sans)', fontSize: 11,
        fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase',
      }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', color: 'inherit',
            cursor: 'pointer', padding: 0, font: 'inherit',
            letterSpacing: 'inherit', textTransform: 'inherit',
          }}
        >
          <span style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }}>
            <FeedIcon name="chev-d" size={11} />
          </span>
          {title}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function fvFormatDate(hoursAgo) {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}

function FvFeedRow({ post, isSelected, onSelect, gridTemplate }) {
  return (
    <div
      className="feed-row"
      onClick={() => {
        if (post.url) window.open(post.url, '_blank', 'noopener,noreferrer');
        if (onSelect) onSelect();
      }}
      style={{
        display: 'grid', gridTemplateColumns: gridTemplate,
        gap: 14, alignItems: 'center', padding: '0 16px',
        height: 38, borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        background: isSelected ? 'var(--surface-1)' : 'transparent',
        color: 'var(--text)',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-1)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{
        fontFamily: 'var(--sans)', fontVariantNumeric: 'tabular-nums',
        fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.02em',
      }}>
        {fvFormatDate(post.hoursAgo)}
      </span>
      <span className="post-title-link" style={{
        fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 450,
        color: 'var(--text)', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {post.title}
      </span>
      <span style={{ display: 'flex', gap: 4, overflow: 'hidden' }}>
        {post.tags.slice(0, 3).map(t => <FeedChipTag key={t.name} tag={t} size="xs" />)}
        {post.tags.length > 3 && (
          <span style={{
            fontFamily: 'var(--sans)', fontVariantNumeric: 'tabular-nums',
            fontSize: 10.5, color: 'var(--text-3)', alignSelf: 'center',
          }}>
            +{post.tags.length - 3}
          </span>
        )}
      </span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--text-2)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        <FeedAvatar person={post.assignee} size={18} />
        {post.author}
      </span>
    </div>
  );
}

function FvSortArrows({ active, dir }) {
  const upActive = active && dir === 'asc';
  const dnActive = active && dir === 'desc';
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, marginLeft: 4, verticalAlign: 'middle' }}>
      <svg width="7" height="4" viewBox="0 0 7 4" style={{ display: 'block' }}>
        <path d="M3.5 0 L7 4 L0 4 Z" fill={upActive ? 'var(--text)' : 'var(--text-3)'} opacity={upActive ? 1 : 0.45} />
      </svg>
      <svg width="7" height="4" viewBox="0 0 7 4" style={{ display: 'block' }}>
        <path d="M0 0 L7 0 L3.5 4 Z" fill={dnActive ? 'var(--text)' : 'var(--text-3)'} opacity={dnActive ? 1 : 0.45} />
      </svg>
    </span>
  );
}

function FvHeaderRow({ gridTemplate, onResize, setResizing, sortKey, sortDir, onSort }) {
  const cellStyle = {
    fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 500,
    color: 'var(--text-3)', letterSpacing: '0.02em', textTransform: 'uppercase',
    position: 'relative', display: 'inline-flex', alignItems: 'center',
    cursor: 'pointer', userSelect: 'none', height: '100%',
  };
  const cols = [
    { key: 'date',   label: 'date',   resizable: true  },
    { key: 'title',  label: 'title',  resizable: true  },
    { key: 'tags',   label: 'tags',   resizable: true  },
    { key: 'author', label: 'author', resizable: false },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: gridTemplate,
      gap: 14, alignItems: 'center', padding: '0 16px', height: 30,
      borderBottom: '1px solid var(--border)', background: 'var(--surface-0)',
      position: 'sticky', top: 0, zIndex: 2,
    }}>
      {cols.map(c => {
        const isActive = sortKey === c.key;
        return (
          <span key={c.key} onClick={() => onSort(c.key)}
            style={{ ...cellStyle, color: isActive ? 'var(--text)' : 'var(--text-3)' }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-2)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            {c.label}
            <FvSortArrows active={isActive} dir={sortDir} />
            {c.resizable && (
              <FvColResizer
                onResize={d => onResize(c.key, d)}
                onStart={() => setResizing(true)}
                onEnd={() => setResizing(false)}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function FeedView() {
  const [data, setData]       = fvState(null);
  const [error, setError]     = fvState(null);
  const [activeCollection, setActiveCollection] = fvState('all');
  const [activeTags, setActiveTags]             = fvState(() => new Set());
  const [sortKey, setSortKey]                   = fvState('date');
  const [sortDir, setSortDir]                   = fvState('desc');
  const [selectedId, setSelectedId]             = fvState(null);
  const [sidebarW, setSidebarW]                 = fvState(232);
  const [colWidths, setColWidths]               = fvState({ date: 60, title: 0, tags: 220, author: 140 });
  const [isResizing, setIsResizing]             = fvState(false);
  const [isFullscreen, setIsFullscreen]         = fvState(false);

  fvEffect(() => {
    window.loadFeedData()
      .then(d => { setData(d); })
      .catch(() => setError('Couldn\'t load posts — try reloading the page.'));
  }, []);

  fvEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setIsFullscreen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'date' ? 'desc' : 'asc');
    }
  }

  function handleColResize(key, delta) {
    setColWidths(prev => {
      const next = { ...prev };
      if (key === 'date')  next.date   = Math.max(40, Math.min(160, prev.date + delta));
      if (key === 'title') next.tags   = Math.max(80, Math.min(500, prev.tags - delta));
      if (key === 'tags')  next.author = Math.max(80, Math.min(360, prev.author - delta));
      return next;
    });
  }

  const gridTemplate = `${colWidths.date}px 1fr ${colWidths.tags}px ${colWidths.author}px`;

  function toggleTag(name) {
    setActiveTags(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const filtered = fvMemo(() => {
    if (!data) return [];
    let list = data.POSTS;
    if (activeCollection === 'today') list = list.filter(p => p.hoursAgo < 24);
    if (activeCollection === 'wk')    list = list.filter(p => p.hoursAgo < 168);
    if (activeCollection === 'month') list = list.filter(p => p.hoursAgo < 720);
    if (activeTags.size > 0) {
      list = list.filter(p => p.tags.some(t => activeTags.has(t.name)));
    }
    list = [...list];
    const cmp = (() => {
      if (sortKey === 'date')   return (a, b) => a.hoursAgo - b.hoursAgo;
      if (sortKey === 'title')  return (a, b) => a.title.localeCompare(b.title);
      if (sortKey === 'author') return (a, b) => a.author.localeCompare(b.author);
      if (sortKey === 'tags')   return (a, b) => (a.tags[0]?.name || '').localeCompare(b.tags[0]?.name || '');
      return () => 0;
    })();
    list.sort(cmp);
    if (sortKey === 'date') { if (sortDir === 'desc') list.reverse(); }
    else if (sortDir === 'desc') list.reverse();
    return list;
  }, [data, activeCollection, activeTags, sortKey, sortDir]);

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontFamily: 'var(--sans)', fontSize: 13 }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontFamily: 'var(--sans)', fontSize: 13 }}>
        Loading posts…
      </div>
    );
  }

  const { COLLECTIONS, TAGS, POSTS } = data;

  const mainGrid = (
    <div style={{
      display: 'grid', gridTemplateColumns: `${sidebarW}px 1fr`,
      height: '100%', background: 'var(--surface-0)', color: 'var(--text)',
      fontFamily: 'var(--sans)', fontSize: 13,
      cursor: isResizing ? 'col-resize' : 'auto',
      userSelect: isResizing ? 'none' : 'auto',
    }}>
      {/* Sidebar */}
      <aside style={{
        borderRight: '1px solid var(--border)', background: 'var(--surface-bg)',
        padding: '10px 8px', display: 'flex', flexDirection: 'column',
        overflowY: 'auto', position: 'relative',
      }}>
        <FvColResizer
          onResize={d => setSidebarW(w => Math.max(160, Math.min(420, w + d)))}
          onStart={() => setIsResizing(true)}
          onEnd={() => setIsResizing(false)}
        />
        {/* Workspace mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px' }}>
          <span style={{
            width: 22, height: 22, borderRadius: 4,
            background: 'var(--pv-gradient)',
            color: 'white', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700,
          }}>v</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>valantic · sap</span>
        </div>

        <FvSidebarSection title="Collections" defaultOpen={true}>
          {COLLECTIONS.map(c => (
            <FvSidebarItem
              key={c.id}
              icon={c.id === 'all' ? 'all' : 'today'}
              label={c.name}
              count={c.count}
              active={activeCollection === c.id}
              onClick={() => setActiveCollection(c.id)}
            />
          ))}
        </FvSidebarSection>

        <FvSidebarSection title={`Tags · ${TAGS.length}`}>
          {TAGS.map(t => (
            <button key={t.name} onClick={() => toggleTag(t.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '4px 8px',
                background: activeTags.has(t.name) ? 'var(--surface-2)' : 'transparent',
                border: 'none', borderRadius: 4, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <FeedChipTag tag={t} size="xs" />
              <span style={{ flex: 1 }} />
              <span style={{ fontFamily: 'var(--sans)', fontVariantNumeric: 'tabular-nums', fontSize: 10.5, color: 'var(--text-3)' }}>
                {t.count}
              </span>
            </button>
          ))}
        </FvSidebarSection>

        <div style={{ flex: 1 }} />
      </aside>

      {/* Main */}
      <section style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', borderBottom: '1px solid var(--border)', height: 44,
        }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {COLLECTIONS.find(c => c.id === activeCollection)?.name || 'All posts'}
          </span>
          <span style={{ fontFamily: 'var(--sans)', fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--text-3)' }}>
            {filtered.length}
          </span>
          {activeTags.size > 0 && (
            <button
              onClick={() => setActiveTags(new Set())}
              style={{
                fontFamily: 'var(--sans)', fontSize: 11.5,
                color: 'var(--pv-accent)', background: 'none', border: 'none',
                cursor: 'pointer', padding: '2px 4px',
              }}
            >
              Clear filters ×
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button
            onClick={() => setIsFullscreen(f => !f)}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-3)', fontSize: 16, padding: '2px 4px', borderRadius: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <i className={isFullscreen ? 'ph ph-arrows-in' : 'ph ph-arrows-out'}></i>
          </button>
        </header>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <FvHeaderRow
            gridTemplate={gridTemplate}
            onResize={handleColResize}
            setResizing={setIsResizing}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
          {filtered.map(p => (
            <FvFeedRow
              key={p.id}
              post={p}
              isSelected={selectedId === p.id}
              onSelect={() => setSelectedId(p.id)}
              gridTemplate={gridTemplate}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{
              padding: '40px 16px', textAlign: 'center',
              fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text-3)',
            }}>
              No posts match the current filter.
            </div>
          )}
        </div>

        {/* Status bar */}
        <footer style={{
          borderTop: '1px solid var(--border)', padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 14, height: 28,
          fontFamily: 'var(--sans)', fontVariantNumeric: 'tabular-nums',
          fontSize: 10.5, color: 'var(--text-3)',
        }}>
          <span>{filtered.length} posts</span>
          <span style={{ flex: 1 }} />
          <span>valantic · SAP Blog Tracker</span>
        </footer>
      </section>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="pv-feed" style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        borderRadius: 0, border: 'none',
      }}>
        {mainGrid}
      </div>
    );
  }

  return mainGrid;
}

window.FeedView = FeedView;
