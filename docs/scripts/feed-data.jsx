// Feed data layer — converts briefings.json into the { COLLECTIONS, TAGS, POSTS }
// shape expected by FeedView (adapted from blog-tracker-handoff/HANDOFF.md §1.5).

const TAG_SHORT = {
  'SAP Business Data Cloud':            'BDC',
  'SAP Datasphere':                     'Datasphere',
  'SAP Analytics Cloud':                'SAC',
  'SAP Analytics Cloud for planning':   'SAC Planning',
  'SAP Analytics Cloud, data modeling': 'SAC Modeling',
};

function feedHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function toPerson(name) {
  const parts = String(name || '?').trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
  return { initials, hue: feedHash(name) % 360 };
}

async function loadFeedData() {
  const briefings = await fetch('data/briefings.json')
    .then(r => r.ok ? r.json() : Promise.reject(r.status));

  // Flatten top + rest from every section, dedup by URL.
  const byUrl = new Map();
  for (const b of briefings) {
    for (const sec of (b.sections || [])) {
      for (const p of [...(sec.top || []), ...(sec.rest || [])]) {
        if (!p.url) continue;
        const existing = byUrl.get(p.url);
        if (existing) {
          existing.matching_tags = Array.from(
            new Set([...(existing.matching_tags || []), ...(p.matching_tags || [])])
          );
          if (!existing.summary   && p.summary)    existing.summary   = p.summary;
          if (!existing.post_type && p.post_type)  existing.post_type = p.post_type;
        } else {
          byUrl.set(p.url, { ...p });
        }
      }
    }
  }

  const rawPosts = Array.from(byUrl.values());

  // Build tag registry: map long names -> short display names, count occurrences.
  const tagCounts = new Map();
  for (const p of rawPosts) {
    for (const rawName of (p.matching_tags || [])) {
      const short = TAG_SHORT[rawName] || rawName;
      tagCounts.set(short, (tagCounts.get(short) ?? 0) + 1);
    }
  }
  const TAG_COLOR = {
    'BDC':          4,
    'Datasphere':   6,
    'SAC':          5,
    'SAC Planning': 5,
    'SAC Modeling': 5,
  };

  const TAGS = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      color: TAG_COLOR[name] ?? ((feedHash(name) % 6) + 1),
    }));
  const tagByName = new Map(TAGS.map(t => [t.name, t]));

  // Calendar boundaries computed once, using the user's local clock.
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const isoLocal = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayStr = isoLocal(now);
  const dayIdx = (now.getDay() + 6) % 7;   // 0 = Monday (ISO week)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayIdx);
  const weekStartStr = isoLocal(weekStart);
  const monthPrefix = todayStr.slice(0, 7); // 'YYYY-MM'

  const POSTS = rawPosts.map((p, i) => {
    const date = p.date_published || '2000-01-01';
    const tags = Array.from(
      new Set((p.matching_tags || []).map(r => TAG_SHORT[r] || r))
    )
      .map(n => tagByName.get(n))
      .filter(Boolean);
    return {
      id: p.url || `post-${i}`,
      title: p.title || '(no title)',
      url: p.url || '',
      date,
      inToday: date === todayStr,
      inWeek:  date >= weekStartStr && date <= todayStr,
      inMonth: date.startsWith(monthPrefix) && date <= todayStr,
      tags,
      author: p.author || 'Unknown',
      assignee: toPerson(p.author),
    };
  });

  // Sort POSTS newest first by ISO date string (lex == chrono for YYYY-MM-DD).
  POSTS.sort((a, b) => b.date.localeCompare(a.date));

  const COLLECTIONS = [
    { id: 'all',   name: 'All posts',  count: POSTS.length },
    { id: 'today', name: 'Today',      count: POSTS.filter(p => p.inToday).length },
    { id: 'wk',    name: 'This week',  count: POSTS.filter(p => p.inWeek).length },
    { id: 'month', name: 'This month', count: POSTS.filter(p => p.inMonth).length },
  ];

  return { COLLECTIONS, TAGS, POSTS };
}

window.loadFeedData = loadFeedData;
