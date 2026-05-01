// SAP Blog Tracker — briefing accordion
const { useState, useRef, useEffect, useCallback } = React;

// Seed data — shown instantly while the live JSON loads (or if fetch fails)
const BRIEFINGS_SEED = [
  {
    id: 'fri-2026-04-24',
    weekday: 'Friday',
    iso: '2026-04-24',
    full: 'Apr 24, 2026',
    title: 'BTP runtime pricing changes and a fresh CAP graph preview steal the week.',
    preview: 'SAP confirmed Q3 pricing adjustments for BTP runtimes, plus a new CAP graph preview ships with full GraphQL parity.',
    reads: '4 min',
    posts: 11,
    tags: ['BTP', 'CAP', 'S/4HANA', 'Datasphere'],
    body: {
      headline: 'A heavier-than-usual Friday: pricing news on BTP runtimes, a CAP graph preview that closes the GraphQL gap, and three Datasphere posts worth pulling forward.',
      sections: [
        {
          h: 'Pricing & licensing',
          items: [
            'BTP runtime metering shifts from monthly true-up to weekly on July 1 — affects all consumption-based contracts. Action: review forecast against new cadence before May 30.',
            'Free-tier credits for AI Core trials extended through 2026, but capped at €200 per developer.',
          ],
        },
        {
          h: 'Platform & developer experience',
          items: [
            'CAP graph preview ships in @sap/cds 7.9 — supports nested GraphQL, federation, and the @restrict directive at field level.',
            'Fiori elements gets a new "responsive table chip mode" — useful for any list with >12 columns on tablet.',
          ],
        },
        {
          h: 'Data & analytics',
          items: [
            'Datasphere replication flow throughput numbers, three case write-ups, and a candid post on cost surprises in cross-region pulls.',
            'A long-form on Joule grounding inside Datasphere — first official guidance on what context lands in the model.',
          ],
        },
      ],
      sources: [
        { author: 'Christian Lechner', title: 'CAP graph preview is ready', minutes: 6 },
        { author: 'Volker Buzek', title: 'Datasphere — 90 days in', minutes: 9 },
        { author: 'Sven Kannengiesser', title: 'BTP metering: what to model now', minutes: 5 },
      ],
    },
  },
  {
    id: 'thu-2026-04-23',
    weekday: 'Thursday',
    iso: '2026-04-23',
    full: 'Apr 23, 2026',
    title: 'Joule grounding gets concrete: a step-by-step from the Joule architecture team.',
    preview: 'Architecture team publishes the first end-to-end guide on grounding Joule with private CAP services.',
    reads: '3 min',
    posts: 8,
    tags: ['Joule', 'CAP', 'AI'],
    body: {
      headline: 'A quieter day, anchored by an unusually concrete piece from the Joule architecture team on grounding strategies that respect tenant isolation.',
      sections: [
        {
          h: 'AI & Joule',
          items: [
            'Recommended pattern: expose grounding through a CAP service that already enforces row-level security — Joule inherits the same predicate.',
            'Worked example using S/4HANA business partner data — including the prompt-shaping snippet most teams will need to copy.',
          ],
        },
        {
          h: 'Integration',
          items: [
            'A short post on Event Mesh quotas under load — answers a question several of our delivery teams have been asking.',
            'Cloud Integration: new "trace once, replay" mode for production debugging.',
          ],
        },
      ],
      sources: [
        { author: 'Sebastian Steinhauer', title: 'Grounding Joule, properly', minutes: 11 },
        { author: 'DJ Adams', title: 'Event Mesh under real load', minutes: 5 },
      ],
    },
  },
  {
    id: 'wed-2026-04-22',
    weekday: 'Wednesday',
    iso: '2026-04-22',
    full: 'Apr 22, 2026',
    title: 'A wave of S/4HANA 2025 cutover stories — what worked, what stalled.',
    preview: 'Three independent posts share the same lesson: data validation timelines were the binding constraint, not technical migration.',
    reads: '5 min',
    posts: 13,
    tags: ['S/4HANA', 'Migration', 'BTP'],
    body: {
      headline: 'Three independent S/4HANA 2025 cutover write-ups, all converging on the same lesson — data validation, not technical migration, was the binding constraint.',
      sections: [
        {
          h: 'S/4HANA 2025 cutovers',
          items: [
            'Mid-market manufacturer (Bavaria): 14-month programme, 4 weeks slipped on master data cleansing alone.',
            'Insurance carrier: ran their pre-cutover validation as a Vanguard-style daily briefing — interesting pattern to lift.',
            'Energy utility: chose brownfield over greenfield late, the candid post-mortem is worth the read.',
          ],
        },
        {
          h: 'BTP & infra',
          items: [
            'Two posts on Steampunk dispatch performance — modest but real wins.',
            'Kyma 1.4 reaches GA on BTP — Helm chart support quietly improved.',
          ],
        },
      ],
      sources: [
        { author: 'Marian Zeis', title: 'Brownfield, late and lucky', minutes: 8 },
        { author: 'Anke Heimbach', title: 'A daily-briefing approach to validation', minutes: 6 },
        { author: 'Mike Doyle', title: 'Steampunk dispatch — what we measured', minutes: 4 },
      ],
    },
  },
  {
    id: 'tue-2026-04-21',
    weekday: 'Tuesday',
    iso: '2026-04-21',
    full: 'Apr 21, 2026',
    title: 'Fiori elements adds a long-requested filter pattern; quiet on the data side.',
    preview: 'Object-page filter chips are finally first-class. Two short Datasphere notes round out a quieter day.',
    reads: '2 min',
    posts: 6,
    tags: ['Fiori', 'UX', 'Datasphere'],
    body: {
      headline: 'A short day. The Fiori elements team finally promotes the filter-chip pattern to first-class — small, but a UX paper-cut many of our teams have been routing around.',
      sections: [
        {
          h: 'Fiori & UX',
          items: [
            'Filter chips on object pages now support multi-value, ranges, and a clean "applied state" reset.',
            'Companion blog has a working sample we can reuse in the SuccessFactors extension we are scoping.',
          ],
        },
        {
          h: 'Datasphere',
          items: [
            'Two short notes on replication flow tuning — useful but incremental.',
          ],
        },
      ],
      sources: [
        { author: 'Sergio Guerrero', title: 'Filter chips, finally', minutes: 4 },
        { author: 'Witalij Rudnicki', title: 'Replication flow tuning', minutes: 3 },
      ],
    },
  },
  {
    id: 'mon-2026-04-20',
    weekday: 'Monday',
    iso: '2026-04-20',
    full: 'Apr 20, 2026',
    title: 'A loud Monday: SAP Sapphire pre-announcements and a new BTP region.',
    preview: 'Sapphire teasers focus on Joule + agents, plus a São Paulo BTP region opens in May.',
    reads: '6 min',
    posts: 14,
    tags: ['Sapphire', 'BTP', 'Joule', 'Agents'],
    body: {
      headline: 'Heaviest Monday in a month. Sapphire teasers dominate, with a clear bias toward Joule and agentic patterns. A new São Paulo BTP region also opens — relevant for two of our LATAM accounts.',
      sections: [
        {
          h: 'Sapphire 2026 — what is signalled',
          items: [
            'Joule "agents" — the framing has shifted from chat to bounded autonomy with explicit tool inventories.',
            'A native Joule SDK for ABAP Cloud is mentioned in three independent posts; expect a beta announcement at the keynote.',
            'Build Code (the AI-paired developer surface) is being repositioned as a default, not an opt-in.',
          ],
        },
        {
          h: 'Infrastructure',
          items: [
            'BTP region: São Paulo opens in May 2026 — applications can pre-register from May 6.',
            'Cloud Identity Services: a slightly clearer story on multi-tenant trust chains.',
          ],
        },
      ],
      sources: [
        { author: 'Thomas Jung', title: 'What I am watching at Sapphire', minutes: 7 },
        { author: 'Markus Tolksdorf', title: 'Joule agents — a developer view', minutes: 9 },
        { author: 'Rui Nogueira', title: 'BTP São Paulo: dates and shape', minutes: 4 },
      ],
    },
  },
];

function useBriefings() {
  const [briefings, setBriefings] = useState(BRIEFINGS_SEED);
  useEffect(() => {
    fetch('data/briefings.json')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => { if (Array.isArray(data) && data.length) setBriefings(data); })
      .catch(() => { /* keep seed data on any error */ });
  }, []);
  return briefings;
}

function Briefing({ b, isOpen, onToggle }) {
  const headerRef = useRef(null);
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const all = Array.from(document.querySelectorAll('.pv-briefing-summary'));
      const idx = all.indexOf(e.currentTarget);
      const next = e.key === 'ArrowDown' ? Math.min(all.length - 1, idx + 1) : Math.max(0, idx - 1);
      all[next]?.focus();
    }
    if (e.key === 'Home') { e.preventDefault(); document.querySelector('.pv-briefing-summary')?.focus(); }
    if (e.key === 'End')  { e.preventDefault(); const all = document.querySelectorAll('.pv-briefing-summary'); all[all.length-1]?.focus(); }
  };

  return (
    <div className={"pv-briefing" + (isOpen ? " is-open" : "")}>
      <h3 style={{margin:0}}>
        <button
          ref={headerRef}
          className="pv-briefing-summary"
          aria-expanded={isOpen}
          aria-controls={`brief-${b.id}`}
          id={`btn-${b.id}`}
          onClick={onToggle}
          onKeyDown={onKey}>
          <div className="pv-brief-date">
            <span className="day">{b.weekday}</span>
            <span className="full">{b.full}</span>
          </div>
          <div className="pv-brief-main">
            <h3>{b.title}</h3>
            <p className="preview">{b.preview}</p>
            <div className="pv-brief-tags">
              {b.tags.map(t => <span key={t}>{t}</span>)}
            </div>
          </div>
          <span className="pv-brief-toggle" aria-hidden="true">
            <i className="ph ph-plus"></i>
          </span>
        </button>
      </h3>

      <div className="pv-brief-detail" role="region" id={`brief-${b.id}`} aria-labelledby={`btn-${b.id}`}>
        <div className="pv-brief-detail-inner">
          <div className="pv-brief-content">
            <aside className="pv-brief-rail" aria-hidden="true">
              <div className="pv-rail-row">
                <span className="k">Read</span>
                <span className="v">{b.reads}</span>
              </div>
              <div className="pv-rail-row">
                <span className="k">Posts</span>
                <span className="v">{b.posts} reviewed</span>
              </div>
              <div className="pv-rail-row">
                <span className="k">Issued</span>
                <span className="v">07:00 CET</span>
              </div>
            </aside>
            <div className="pv-brief-body">
              <p style={{fontSize:'17px', color:'var(--pv-text)'}}>{b.body.headline}</p>
              {b.body.sections.map((s, i) => (
                <div key={i}>
                  <h4>{s.h}</h4>
                  <ul>
                    {s.items.map((it, j) => <li key={j}>{it}</li>)}
                  </ul>
                </div>
              ))}
              <div className="pv-brief-sources">
                <strong>Sources reviewed</strong> ·{' '}
                {b.body.sources.map((s, i) => (
                  <span key={i}>
                    {i > 0 && ' · '}
                    {s.author}, "{s.title}" ({s.minutes} min)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefingLog() {
  const briefings = useBriefings();
  const [openId, setOpenId] = useState(briefings[0]?.id);
  const [filter, setFilter] = useState('week');

  // Keep openId in sync when briefings update from the live fetch
  useEffect(() => {
    setOpenId(id => id ?? briefings[0]?.id);
  }, [briefings]);

  const list = briefings;
  return (
    <div>
      <div className="pv-briefing-toolbar">
        <div className="pv-toolbar-meta">
          Showing {list.length} briefings · last issued today, 07:00 CET
        </div>
        <div className="pv-toolbar-actions" role="group" aria-label="Filter range">
          {[
            { id: 'week', label: 'This week' },
            { id: 'month', label: 'This month' },
            { id: 'all', label: 'All time' },
          ].map(f => (
            <button key={f.id}
              className={"pv-toolbar-btn" + (filter === f.id ? " is-active" : "")}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pv-briefing-list" role="list">
        {list.map(b => (
          <Briefing
            key={b.id}
            b={b}
            isOpen={openId === b.id}
            onToggle={() => setOpenId(openId === b.id ? null : b.id)}
          />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { BriefingLog, BRIEFINGS: BRIEFINGS_SEED });
