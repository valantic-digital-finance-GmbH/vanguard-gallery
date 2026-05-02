// Project Vanguard — News section component
const { useState, useEffect } = React;

const NEWS_SEED = [
  {
    id: "artifex",
    date: "2026-04-28",
    tag: "Release",
    title: "artifex ships — SAP DataSphere modelling from human-readable markdown.",
    href: "https://github.com/valantic-digital-finance-GmbH/artifex"
  },
  {
    id: "sap-blog-tracker",
    date: "2026-04-21",
    tag: "Release",
    title: "SAP Blog Tracker hits production — daily Mon–Fri briefings now live.",
    href: "sap-blog-tracker.html"
  },
  {
    id: "vanguard-gallery",
    date: "2026-04-14",
    tag: "Update",
    title: "Vanguard Gallery goes live — the team's AI showcase is now public.",
    href: "https://github.com/valantic-digital-finance-GmbH/vanguard-gallery"
  },
  {
    id: "sharepoint-watch",
    date: "2026-04-07",
    tag: "Release",
    title: "SharePoint Watch deployed — daily M365 storage snapshots with anomaly alerts.",
    href: "https://github.com/valantic-digital-finance-GmbH/sharepoint-watch"
  }
];

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d))
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function useNews() {
  const [items, setItems] = useState(NEWS_SEED);
  useEffect(() => {
    fetch('data/news.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setItems)
      .catch(() => {});
  }, []);
  return items;
}

function NewsCard({ item }) {
  const isExternal = item.href && item.href.startsWith('http');
  const hasLink = Boolean(item.href);
  const cardClass = 'pv-news-card' + (hasLink ? '' : ' pv-news-card--static');

  const inner = (
    <>
      <div className="pv-news-meta">
        <span className="pv-news-tag">{item.tag}</span>
        <span>{formatDate(item.date)}</span>
      </div>
      <h3>{item.title}</h3>
      {hasLink && (
        <span className="pv-news-arrow" aria-hidden="true">
          <i className={isExternal ? 'ph ph-arrow-up-right' : 'ph ph-arrow-right'}></i>
        </span>
      )}
    </>
  );

  if (!hasLink) {
    return <div className={cardClass}>{inner}</div>;
  }
  if (isExternal) {
    return (
      <a className={cardClass} href={item.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <a className={cardClass} href={item.href}>
      {inner}
    </a>
  );
}

function NewsSection() {
  const items = useNews();
  return (
    <section className="pv-section pv-section-soft" id="news">
      <div className="pv-container">
        <div className="pv-section-head">
          <div>
            <span className="pv-eyebrow">Latest news</span>
            <h2>What the team is shipping this month.</h2>
          </div>
        </div>
        <div className="pv-news-grid">
          {items.map(item => <NewsCard key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { NewsSection, NEWS_SEED });
