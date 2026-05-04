// Feed view — shared visual atoms, re-skinned to Project Vanguard tokens.
// Adapted from blog-tracker-handoff/shared.jsx.

const feedTagColors = {
  1: { bg: 'rgba(255,75,75,.10)',   fg: 'oklch(0.42 0.14 22)' },
  2: { bg: 'rgba(255,116,79,.10)',  fg: 'oklch(0.45 0.14 45)' },
  3: { bg: 'rgba(180,100,60,.09)',  fg: 'oklch(0.44 0.12 65)' },
  4: { bg: 'rgba(100,140,80,.09)',  fg: 'oklch(0.42 0.10 140)' },
  5: { bg: 'rgba(60,110,170,.09)',  fg: 'oklch(0.40 0.12 240)' },
  6: { bg: 'rgba(130,80,180,.09)',  fg: 'oklch(0.42 0.12 300)' },
};

function FeedChipTag({ tag, size }) {
  const c = feedTagColors[tag.color] || feedTagColors[1];
  const padding = size === 'xs' ? '1px 6px' : '2px 7px';
  const fs = size === 'xs' ? 10.5 : 11;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: c.bg,
        color: c.fg,
        fontFamily: 'var(--sans)',
        fontVariantNumeric: 'tabular-nums',
        fontSize: fs,
        fontWeight: 500,
        padding,
        borderRadius: 3,
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
        letterSpacing: '.01em',
      }}
    >
      <span
        style={{
          width: 5, height: 5, borderRadius: 999,
          background: c.fg, opacity: 0.65,
        }}
      />
      {tag.name}
    </span>
  );
}

function FeedAvatar({ person, size }) {
  size = size || 22;
  const hue = person.hue;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size, height: size,
        borderRadius: 999,
        background: `hsl(${hue}, 38%, 88%)`,
        color: `hsl(${hue}, 38%, 34%)`,
        fontFamily: 'var(--sans)',
        fontWeight: 600,
        fontSize: size * 0.42,
        letterSpacing: '-0.02em',
      }}
    >
      {person.initials}
    </span>
  );
}

function FeedIcon({ name, size }) {
  size = size || 14;
  const stroke = 'currentColor';
  const sw = 1.5;
  const common = {
    width: size, height: size, viewBox: '0 0 16 16',
    fill: 'none', stroke, strokeWidth: sw,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'all':
      return (
        <svg {...common}>
          <rect x="2" y="3" width="12" height="2.5" />
          <rect x="2" y="7" width="12" height="2.5" />
          <rect x="2" y="11" width="12" height="2.5" />
        </svg>
      );
    case 'today':
      return (
        <svg {...common}>
          <rect x="2.5" y="3.5" width="11" height="10" />
          <path d="M2.5 6.5 H13.5 M5 2 V5 M11 2 V5" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...common}>
          <path d="M2.5 2.5 H7 L13.5 9 L9 13.5 L2.5 7 Z" />
          <circle cx="5" cy="5" r="0.5" fill={stroke} />
        </svg>
      );
    case 'chev-d':
      return (
        <svg {...common}><path d="M4 6 L8 10 L12 6" /></svg>
      );
    case 'chev-r':
      return (
        <svg {...common}><path d="M6 4 L10 8 L6 12" /></svg>
      );
    default:
      return <span />;
  }
}

window.feedTagColors = feedTagColors;
window.FeedChipTag = FeedChipTag;
window.FeedAvatar = FeedAvatar;
window.FeedIcon = FeedIcon;
