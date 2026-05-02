// Project Vanguard — Use case carousel
const { useState, useEffect, useRef, useCallback } = React;

const USE_CASES_SEED = [
  {
    id: 'sap-blog-tracker',
    title: 'SAP Blog Tracker',
    tag: 'Knowledge ops',
    icon: 'ph-newspaper-clipping',
    href: 'sap-blog-tracker.html',
    repo: 'https://github.com/valantic/sap-blog-tracker',
    description: 'A daily morning briefing that summarises every newly published SAP blog post worth reading — delivered in one calm, ordered digest.',
    benefits: [
      'Replaces 60+ minutes of manual scanning each morning',
      'Surfaces only what is relevant to active engagements',
      'Consistent voice across analysts and consultants',
    ],
    stack: 'GPT-4o · Python · Slack',
    art: 'sap',
    isInternalPage: true,
  },
  {
    id: 'rfp-copilot',
    title: 'RFP Copilot',
    tag: 'Sales enablement',
    icon: 'ph-file-text',
    repo: 'https://github.com/valantic/rfp-copilot',
    description: 'A retrieval-augmented assistant that drafts the first 80% of any client RFP response from a curated library of past wins.',
    benefits: [
      'Cuts first-draft turnaround from 9 days to 36 hours',
      'Cites every claim back to its source proposal',
      'Locked behind SSO with full audit trail',
    ],
    stack: 'Claude · pgvector · Next.js',
    art: 'rfp',
  },
  {
    id: 'process-cartographer',
    title: 'Process Cartographer',
    tag: 'Operations',
    icon: 'ph-graph',
    repo: 'https://github.com/valantic/process-cartographer',
    description: 'Turn raw SAP transaction logs into a navigable process map — the parts that matter, not the parts that exist.',
    benefits: [
      'Variant analysis on 12M+ events in under 4 minutes',
      'Highlights rework loops costing more than €50k / yr',
      'Exports clean BPMN for the transformation team',
    ],
    stack: 'DuckDB · Polars · D3',
    art: 'process',
  },
  {
    id: 'meeting-recall',
    title: 'Meeting Recall',
    tag: 'Productivity',
    icon: 'ph-microphone',
    repo: 'https://github.com/valantic/meeting-recall',
    description: 'Private, on-device transcription and structured recall for client workshops — searchable by decision, owner, or action.',
    benefits: [
      'Runs entirely on-device — no audio leaves the laptop',
      'Decision log auto-syncs to Confluence',
      'Multilingual: DE, EN, FR out of the box',
    ],
    stack: 'Whisper · Llama · Tauri',
    art: 'meeting',
  },
  {
    id: 'forecast-bench',
    title: 'Forecast Bench',
    tag: 'Data science',
    icon: 'ph-chart-line-up',
    repo: 'https://github.com/valantic/forecast-bench',
    description: 'A reproducible benchmarking harness for demand forecasting — pit your candidate models against industry baselines on real client topologies.',
    benefits: [
      'One YAML file from spec to leaderboard',
      'Built-in coverage for retail, automotive, energy',
      'Surfaces hidden distribution shift before deployment',
    ],
    stack: 'Prefect · MLflow · Streamlit',
    art: 'forecast',
  },
  {
    id: 'contract-radar',
    title: 'Contract Radar',
    tag: 'Legal & risk',
    icon: 'ph-shield-check',
    repo: 'https://github.com/valantic/contract-radar',
    description: 'Reads supplier contracts the way a senior counsel would — flags off-market terms, expiring SLAs, and indemnity gaps in plain language.',
    benefits: [
      'Reviews a 60-page MSA in under 90 seconds',
      'Flags reviewed by counsel auto-train the model',
      'Ships with an EU AI Act compliance report',
    ],
    stack: 'Claude · LangGraph · Postgres',
    art: 'contract',
  },
];

// ─── Fetch hook — loads live data, keeps seed as fallback ────────────────
function useUseCases() {
  const [items, setItems] = useState(USE_CASES_SEED);
  useEffect(() => {
    fetch('data/usecases.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setItems)
      .catch(() => {});
  }, []);
  return items;
}

// ─── Card art (cohesive, restrained — no stock images) ───────────────────
function CardArt({ uc }) {
  if (uc.image) {
    return <img src={uc.image} alt={uc.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>;
  }

  const kind = uc.art;
  const defaultPalettes = {
    sap:      { bg: '#f3efe7', shape: '#d4c8a5', accent: '#100c2a' },
    rfp:      { bg: '#eef0f3', shape: '#bfc6d1', accent: '#1a4fd6' },
    process:  { bg: '#f1ebe7', shape: '#e0c3b3', accent: '#ff4b4b' },
    meeting:  { bg: '#ecefe9', shape: '#bfc8b3', accent: '#193773' },
    forecast: { bg: '#f4ecec', shape: '#dcc0c0', accent: '#ff744f' },
    contract: { bg: '#ebeef0', shape: '#c2cad2', accent: '#100c2a' },
  };
  const p = (uc.palette && uc.palette.bg) ? uc.palette : (defaultPalettes[kind] || defaultPalettes.sap);

  if (kind === 'sap') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{width:'100%', height:'100%'}}>
        <rect width="400" height="300" fill={p.bg}/>
        <g transform="translate(60 50)">
          {[0,1,2,3,4].map(i => (
            <rect key={i} x="0" y={i*38} width={i % 2 ? 220 : 280} height="6" rx="2" fill={p.shape} opacity={1 - i * 0.13}/>
          ))}
          <rect x="0" y="-32" width="120" height="14" rx="3" fill={p.accent} opacity=".85"/>
        </g>
        <circle cx="340" cy="240" r="38" fill={p.accent} opacity=".10"/>
        <circle cx="340" cy="240" r="14" fill={p.accent}/>
      </svg>
    );
  }
  if (kind === 'rfp') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{width:'100%', height:'100%'}}>
        <rect width="400" height="300" fill={p.bg}/>
        <g transform="translate(70 40)">
          <rect x="0" y="0" width="200" height="240" rx="6" fill="#fff" stroke={p.shape}/>
          <rect x="20" y="28" width="100" height="8" fill={p.accent} opacity=".6"/>
          {[0,1,2,3,4,5].map(i => (
            <rect key={i} x="20" y={56 + i*22} width={[160,140,150,130,150,120][i]} height="4" fill={p.shape}/>
          ))}
          <rect x="120" y="0" width="120" height="160" rx="6" fill={p.accent} opacity=".10" transform="translate(60 30)"/>
        </g>
      </svg>
    );
  }
  if (kind === 'process') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{width:'100%', height:'100%'}}>
        <rect width="400" height="300" fill={p.bg}/>
        <g fill="none" stroke={p.shape} strokeWidth="2">
          <path d="M40 220 C 100 220, 100 80, 200 80 S 300 220, 360 80"/>
          <path d="M40 80 C 110 130, 200 200, 360 220" strokeDasharray="3 5"/>
        </g>
        {[
          [60, 200], [160, 100], [240, 160], [320, 100], [340, 220]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="6" fill={i === 2 ? p.accent : p.accent} opacity={i === 2 ? 1 : .35}/>
        ))}
        <circle cx="240" cy="160" r="14" fill="none" stroke={p.accent} strokeWidth="1.5" opacity=".4"/>
      </svg>
    );
  }
  if (kind === 'meeting') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{width:'100%', height:'100%'}}>
        <rect width="400" height="300" fill={p.bg}/>
        <g transform="translate(40 130)">
          {Array.from({length: 36}, (_, i) => {
            const h = 20 + Math.abs(Math.sin(i * 0.7)) * 60;
            return <rect key={i} x={i*9} y={-h/2} width="3" height={h} rx="1.5" fill={i > 8 && i < 28 ? p.accent : p.shape}/>;
          })}
        </g>
        <circle cx="320" cy="80" r="32" fill="#fff" stroke={p.shape}/>
        <rect x="316" y="64" width="8" height="20" rx="4" fill={p.accent}/>
        <path d="M312 88 v4 a8 8 0 0 0 16 0 v-4" fill="none" stroke={p.accent} strokeWidth="2"/>
      </svg>
    );
  }
  if (kind === 'forecast') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{width:'100%', height:'100%'}}>
        <rect width="400" height="300" fill={p.bg}/>
        <g transform="translate(40 60)">
          <path d="M0 160 L 60 130 L 120 140 L 180 90 L 240 100 L 300 50" fill="none" stroke={p.accent} strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M0 160 L 60 130 L 120 140 L 180 90 L 240 100 L 300 50 L 300 180 L 0 180 Z" fill={p.accent} opacity=".10"/>
          <path d="M300 50 L 320 70 L 320 30" fill={p.accent} opacity=".4"/>
          {[0,1,2,3,4,5].map(i => (
            <line key={i} x1="0" x2="320" y1={i*32} y2={i*32} stroke={p.shape} strokeDasharray="2 4" opacity=".5"/>
          ))}
        </g>
      </svg>
    );
  }
  if (kind === 'contract') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{width:'100%', height:'100%'}}>
        <rect width="400" height="300" fill={p.bg}/>
        <g transform="translate(140 50)">
          <path d="M60 0 L 0 30 L 0 90 C 0 130, 30 170, 60 200 C 90 170, 120 130, 120 90 L 120 30 Z"
                fill="#fff" stroke={p.shape} strokeWidth="1.5"/>
          <path d="M40 100 L 56 116 L 86 80" fill="none" stroke={p.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
    );
  }
  return <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{width:'100%', height:'100%'}}><rect width="400" height="300" fill={p.bg}/></svg>;
}

// ─── Carousel ────────────────────────────────────────────────────────────
function UseCaseCarousel() {
  const useCases = useUseCases();
  const trackRef = useRef(null);
  const wrapRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);

  // Recompute visible cards based on viewport
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w <= 720) setVisible(1);
      else if (w <= 1100) setVisible(2);
      else setVisible(3);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const maxIndex = Math.max(0, useCases.length - visible);
  const safeIndex = Math.min(index, maxIndex);

  // Translate based on first card width + gap
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const compute = () => {
      const track = trackRef.current;
      if (!track) return;
      const first = track.children[0];
      if (!first) return;
      const cardW = first.getBoundingClientRect().width;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '24');
      setOffset(safeIndex * (cardW + gap));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [safeIndex, visible]);

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * .8 && rect.bottom > window.innerHeight * .2;
      if (!inView) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [maxIndex]);

  // Touch / drag
  const dragRef = useRef({ active: false, startX: 0, startIdx: 0 });
  const onPointerDown = (e) => {
    dragRef.current = { active: true, startX: e.clientX, startIdx: safeIndex };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add('is-dragging');
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    const track = trackRef.current;
    const first = track?.children[0];
    if (!first) return;
    const cardW = first.getBoundingClientRect().width;
    const dx = e.clientX - d.startX;
    const moved = Math.round(-dx / (cardW * 0.5));
    const target = Math.max(0, Math.min(maxIndex, d.startIdx + moved));
    if (target !== safeIndex) setIndex(target);
  };
  const onPointerUp = (e) => {
    dragRef.current.active = false;
    e.currentTarget.classList.remove('is-dragging');
  };

  const progress = maxIndex === 0 ? 1 : (safeIndex / maxIndex);
  const fillWidth = `${((visible / useCases.length) * 100) + (progress * (1 - visible / useCases.length) * 100)}%`;

  return (
    <section className="pv-showcase" id="use-cases" ref={wrapRef}>
      <div className="pv-container">
        <div className="pv-showcase-head">
          <div>
            <span className="pv-eyebrow">Use cases</span>
            <h2>Working tools, in production today.</h2>
          </div>
          <div className="pv-showcase-controls" role="group" aria-label="Carousel navigation">
            <button className="pv-ctrl-btn" onClick={prev} disabled={safeIndex === 0} aria-label="Previous use case">
              <i className="ph ph-arrow-left"></i>
            </button>
            <button className="pv-ctrl-btn" onClick={next} disabled={safeIndex === maxIndex} aria-label="Next use case">
              <i className="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>

        <div className="pv-carousel" aria-roledescription="carousel">
          <div className="pv-carousel-track-wrap">
            <div
              ref={trackRef}
              className="pv-carousel-track"
              style={{ transform: `translateX(${-offset}px)` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {useCases.map((uc, i) => (
                <a key={uc.id}
                   className="pv-uc-card"
                   href={uc.repo}
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label={`${uc.title} — opens GitHub repository in new tab`}
                   onDragStart={e => e.preventDefault()}>
                  <div className="pv-uc-media">
                    <CardArt uc={uc}/>
                    <span className="pv-uc-media-tag">
                      <i className={`ph ${uc.icon}`}></i> {uc.tag}
                    </span>
                    <span className="pv-uc-media-repo" aria-hidden="true">
                      <i className="ph ph-github-logo"></i>
                    </span>
                  </div>
                  <div className="pv-uc-body">
                    <h3>{uc.title}</h3>
                    <p className="pv-uc-desc">{uc.description}</p>
                    <ul className="pv-uc-benefits">
                      {uc.benefits.map((b, j) => (
                        <li key={j}><i className="ph ph-check"></i><span>{b}</span></li>
                      ))}
                    </ul>
                    <div className="pv-uc-foot">
                      <span className="pv-uc-stack">{uc.stack}</span>
                      <span className="pv-uc-cta">
                        View repo <i className="ph ph-arrow-up-right"></i>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="pv-carousel-foot">
            <div className="pv-pag-track" role="presentation">
              <div className="pv-pag-fill" style={{ width: fillWidth }}></div>
            </div>
            <div className="pv-pag-info" aria-live="polite">
              <span className="pv-pag-current">{String(safeIndex + 1).padStart(2,'0')}</span>
              <span>/ {String(useCases.length).padStart(2,'0')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { UseCaseCarousel, USE_CASES_SEED, CardArt });
