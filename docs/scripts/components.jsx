// Project Vanguard — shared components
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ─── Brand mark + avatar ──────────────────────────────────────────────────
function VanguardBrand({ active, onHomeClick }) {
  return (
    <a className="pv-brand" href="index.html" onClick={onHomeClick} aria-label="Project Vanguard — Home">
      <span className="pv-brand-avatar" role="img" aria-label="Project Vanguard avatar"></span>
      <span className="pv-brand-text">
        <span className="pv-brand-name">Project Vanguard</span>
        <span className="pv-brand-by">An <span className="v">valantic</span> AI initiative</span>
      </span>
    </a>
  );
}

// ─── Header / Nav ─────────────────────────────────────────────────────────
function Header({ active }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'sap', label: 'SAP Blog Tracker', href: 'sap-blog-tracker.html' },
  ];

  return (
    <header className={"pv-header" + (scrolled ? " is-scrolled" : "")}>
      <div className="pv-header-inner">
        <VanguardBrand />
        <nav className="pv-nav" aria-label="Primary">
          {items.map(it => (
            <a key={it.id} href={it.href}
               className={"pv-nav-link" + (active === it.id ? " is-active" : "")}
               aria-current={active === it.id ? "page" : undefined}>
              {it.label}
            </a>
          ))}
        </nav>
        <a className="pv-header-cta"
           href="https://github.com/" target="_blank" rel="noopener noreferrer"
           aria-label="View on GitHub">
          <i className="ph ph-github-logo"></i>
          GitHub
        </a>
      </div>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="pv-footer">
      <div className="pv-container">
        <div className="pv-footer-top">
          <div>
            <div className="pv-footer-brand">
              <span className="pv-footer-avatar" role="img" aria-label="Project Vanguard"></span>
              <div className="pv-footer-brand-text">
                <span className="pv-footer-brand-name">Project Vanguard</span>
                <span className="pv-footer-brand-by">An valantic AI initiative</span>
              </div>
            </div>
            <p>A working showcase of the AI use cases the Vanguard team has shipped — from first prototype to production-grade tooling.</p>
          </div>
          <div className="pv-footer-cols">
            <div className="pv-footer-col">
              <div className="pv-footer-col-title">Explore</div>
              <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="sap-blog-tracker.html">SAP Blog Tracker</a></li>
                <li><a href="#use-cases">Use cases</a></li>
                <li><a href="#news">Latest news</a></li>
              </ul>
            </div>
            <div className="pv-footer-col">
              <div className="pv-footer-col-title">Connect</div>
              <ul>
                <li><a href="https://github.com/valantic-digital-finance-GmbH" target="_blank" rel="noopener noreferrer">GitHub <i className="ph ph-arrow-up-right"></i></a></li>
                <li><a href="#">Internal portal</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pv-footer-bottom">
          <span>© 2026 Project Vanguard · A valantic initiative</span>
          <span className="pv-valantic-mark">Built by the Vanguard team · Düsseldorf</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { VanguardBrand, Header, Footer });
