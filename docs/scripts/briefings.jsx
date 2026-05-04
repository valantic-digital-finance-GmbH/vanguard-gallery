// SAP Blog Tracker — briefing accordion
const { useState, useRef, useEffect } = React;

// Seed data — shown instantly while the live JSON loads (or if fetch fails)
const BRIEFINGS_SEED = [
  {
    id: 'mon-2026-04-27',
    weekday: 'Monday',
    iso: '2026-04-27',
    full: 'Apr 27, 2026',
    title: 'The blog provides a detailed guide on implementing Single Sign-On (SSO) for SAP Datasphere using SAP Cloud Identity Services.',
    preview: 'The blog highlights key features and enhancements introduced in the March releases of SAP Datasphere and SAP Business Data Cloud.',
    reads: '11 min',
    posts: 3,
    tags: ['Business Data Cloud', 'Datasphere'],
    highlights: [],
    sections: [
      {
        name: 'SAP Business Data Cloud',
        tags: ['SAP Business Data Cloud'],
        top: [
          {
            title: 'Provisioning of Business Data Cloud : SAP Hana Cloud',
            url: 'https://community.sap.com/t5/technology-blog-posts-by-sap/provisioning-of-business-data-cloud-sap-hana-cloud/ba-p/14382155',
            author: 'ShreyasriB',
            date_published: '2026-04-27',
            matching_tags: ['SAP Business Data Cloud'],
            minutes: 5,
          },
          {
            title: 'SAP Business Data Cloud and Datasphere News in March',
            url: 'https://community.sap.com/t5/technology-blog-posts-by-sap/sap-business-data-cloud-and-datasphere-news-in-march/ba-p/14368704',
            author: 'kpsauer',
            date_published: '2026-04-08',
            matching_tags: ['SAP Datasphere', 'SAP Business Data Cloud'],
            minutes: 1,
            summary: 'The blog highlights key features and enhancements introduced in the March releases of SAP Datasphere and SAP Business Data Cloud.',
            post_type: 'Release',
          },
        ],
        rest: [],
      },
      {
        name: 'SAP Datasphere',
        tags: ['SAP Datasphere'],
        top: [
          {
            title: 'Configuring Single Sign-On (SSO) for SAP Datasphere using SAP Cloud Identity Services (IAS)',
            url: 'https://community.sap.com/t5/technology-blog-posts-by-sap/configuring-single-sign-on-sso-for-sap-datasphere-using-sap-cloud-identity/ba-p/14375113',
            author: 'karthikj2',
            date_published: '2026-04-15',
            matching_tags: ['SAP Datasphere'],
            minutes: 5,
            summary: 'The blog provides a detailed guide on implementing Single Sign-On (SSO) for SAP Datasphere using SAP Cloud Identity Services, focusing on leveraging SAP Identity Authentication Service (IAS) in integration with OKTA.',
            post_type: 'How-to',
          },
        ],
        rest: [],
      },
    ],
  },
  {
    id: 'thu-2026-03-19',
    weekday: 'Thursday',
    iso: '2026-03-19',
    full: 'Mar 19, 2026',
    title: 'The blog explains how to use the SAP Business Data Cloud Capacity Unit Estimator for SAP BDC Connect for Databricks.',
    preview: 'The blog explains how to use the SAP Business Data Cloud Capacity Unit Estimator for SAP BDC Connect for Databricks.',
    reads: '5 min',
    posts: 1,
    tags: ['Business Data Cloud'],
    highlights: [],
    sections: [
      {
        name: 'SAP Business Data Cloud',
        tags: ['SAP Business Data Cloud'],
        top: [
          {
            title: 'How to use SAP Business Data Cloud Capacity Unit Estimator for SAP BDC Connect for Databricks?',
            url: 'https://community.sap.com/t5/technology-blog-posts-by-sap/how-to-use-sap-business-data-cloud-capacity-unit-estimator-for-sap-bdc/ba-p/14353832',
            author: 'FernandaFroelich',
            date_published: '2026-03-19',
            matching_tags: ['SAP Business Data Cloud'],
            minutes: 5,
            summary: 'The blog explains how to use the SAP Business Data Cloud Capacity Unit Estimator for SAP BDC Connect for Databricks, providing guidance on sizing your setup to plan effectively and optimize your data-sharing architecture.',
            post_type: 'How-to',
          },
        ],
        rest: [],
      },
    ],
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

function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PostCard({ p, variant }) {
  const compact = variant === 'compact';
  return (
    <div className={'pv-brief-post' + (compact ? ' is-compact' : '')}>
      {!compact && p.post_type && (
        <span className="pv-brief-post-eyebrow">{p.post_type}</span>
      )}
      <a href={p.url} target="_blank" rel="noopener" className="pv-brief-post-title">
        {p.title}
      </a>
      <span className="pv-brief-post-byline">
        {p.author} · {fmtDate(p.date_published)} · {p.minutes} min
      </span>
      {!compact && p.summary && (
        <p className="pv-brief-post-summary">{p.summary}</p>
      )}
    </div>
  );
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

  const sections = b.sections || [];

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
              {(b.tags || []).map(t => <span key={t}>{t}</span>)}
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
              {(b.highlights || []).length > 0 && (
                <>
                  <h4>What's new</h4>
                  <ul>{b.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
                </>
              )}
              {sections.map(s => (
                <div key={s.name} className="pv-brief-section">
                  <h4>{s.name}</h4>
                  {(s.top || []).map(p => <PostCard key={p.url} p={p} variant="full" />)}
                  {(s.rest || []).map(p => <PostCard key={p.url} p={p} variant="compact" />)}
                </div>
              ))}
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

  useEffect(() => {
    setOpenId(id => id ?? briefings[0]?.id);
  }, [briefings]);

  const metaLabel = `Showing ${briefings.length} briefings · last issued today, 07:00 CET`;

  return (
    <div>
      <div className="pv-briefing-toolbar">
        <div className="pv-toolbar-meta">{metaLabel}</div>
      </div>

      <div className="pv-briefing-list" role="list">
        {briefings.map(b => (
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
