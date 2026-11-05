// =========================================================
//  えのぐ（SVG）: イカ（しゅるい別）・たまご・ぼうし
// =========================================================
import { FORMS, SPECIES } from './config.js';

// 色を しろに ちかづける（あかちゃんは うすい いろ）
function tint(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * k));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
function starPath(cx, cy, R, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}
const RAINBOW = ['#ff9a9a', '#ffc98a', '#ffe38a', '#a8eba0', '#9fd8ff', '#c6a8ff', '#ffb3d9'];

// ---- ひれ（左がわ。右は 左右反転） ----
const FINS = {
  round:  'M88 34 Q36 30 44 74 Q64 62 82 66 Z',
  sharp:  'M88 34 L34 44 L56 58 L40 74 L82 66 Z',
  wide:   'M88 30 Q22 18 32 82 Q60 66 82 68 Z',
  fluffy: 'M86 36 Q62 24 50 38 Q34 42 42 56 Q34 70 54 70 Q70 76 82 66 Z',
  pointy: 'M90 32 L40 18 L58 46 L36 68 L82 66 Z',
};
const MANTLE = 'M100 6 C128 28 142 68 142 104 C142 136 124 148 100 148 C76 148 58 136 58 104 C58 68 72 28 100 6 Z';

function hatSVG(hat) {
  switch (hat) {
    case 'ribbon':
      return `<g transform="translate(120 30) rotate(18)">
        <path d="M0 0 L-20 -12 L-18 12 Z" fill="#ff6f9a" stroke="#d94a76" stroke-width="3" stroke-linejoin="round"/>
        <path d="M0 0 L20 -12 L18 12 Z" fill="#ff6f9a" stroke="#d94a76" stroke-width="3" stroke-linejoin="round"/>
        <circle r="6" fill="#ff8fb0" stroke="#d94a76" stroke-width="3"/></g>`;
    case 'straw':
      return `<ellipse cx="100" cy="30" rx="46" ry="10" fill="#f3d27a" stroke="#c9a24a" stroke-width="3"/>
        <path d="M76 29 Q78 2 100 0 Q122 2 124 29 Z" fill="#f6dc8e" stroke="#c9a24a" stroke-width="3"/>
        <path d="M77 22 Q100 26 123 22 L124 29 Q100 32 76 29 Z" fill="#e05a5a"/>`;
    case 'crown':
      return `<path d="M76 30 L78 6 L90 20 L100 0 L110 20 L122 6 L124 30 Z" fill="#ffd54a" stroke="#d4a017" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="100" cy="22" r="4" fill="#ff6f9a"/><circle cx="85" cy="25" r="3" fill="#6cc3e0"/><circle cx="115" cy="25" r="3" fill="#6cc3e0"/>`;
    case 'hachimaki':
      return `<path d="M64 64 Q100 54 136 64 L137 75 Q100 65 63 75 Z" fill="#fff" stroke="#e0506a" stroke-width="2.5"/>
        <circle cx="100" cy="63" r="5" fill="#e0506a"/>
        <path d="M136 68 l18 -10 M136 71 l20 4" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
        <path d="M136 68 l18 -10 M136 71 l20 4" stroke="#e0506a" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
    default: return '';
  }
}

// ---- しゅるいごとの もよう（からだの うえ・かおの した） ----
function pattern(spId, P, stage, hat) {
  const big = stage !== 'baby';
  switch (spId) {
    case 'neon':
      return `<path d="M76 42 Q100 30 124 42" stroke="${P.line2}" stroke-width="4" fill="none" stroke-linecap="round" class="neonline"/>
        <path d="M66 70 Q100 56 134 70" stroke="${P.line}" stroke-width="4" fill="none" stroke-linecap="round" class="neonline"/>
        ${big ? `<circle cx="100" cy="20" r="4" fill="${P.line}" class="glowdot"/>` : ''}`;
    case 'sabaku':
      return `<path d="M64 82 Q82 72 100 82 T136 82" stroke="${P.line}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M74 58 Q90 50 106 58 T126 56" stroke="${P.line}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="40" r="3" fill="${P.line}"/><circle cx="120" cy="46" r="2.5" fill="${P.line}"/>
        ${hat ? '' : `<g class="sprout"><path d="M100 10 V-12" stroke="#4f9a5a" stroke-width="11" stroke-linecap="round"/><path d="M100 10 V-12" stroke="#7cc68d" stroke-width="7" stroke-linecap="round"/>
          <path d="M100 -2 H90 V-10" stroke="#4f9a5a" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M100 -2 H90 V-10" stroke="#7cc68d" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="100" cy="-15" r="4" fill="#ff8fa8" stroke="#e2667f" stroke-width="2"/></g>`}`;
    case 'yuki':
      return `<g stroke="${P.edge}" stroke-width="2.5" stroke-linecap="round" opacity=".8"><path d="M100 72 v18 M92 76 l16 10 M108 76 l-16 10"/></g>
        <circle cx="74" cy="92" r="3" fill="#fff" stroke="${P.line}" stroke-width="1.5"/><circle cx="128" cy="88" r="2.5" fill="#fff" stroke="${P.line}" stroke-width="1.5"/>
        ${hat ? '' : `<path d="M74 34 Q78 20 88 26 Q94 12 104 22 Q112 12 118 26 Q128 22 128 36 Q100 44 74 34 Z" fill="#fff" stroke="${P.edge}" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="100" cy="16" r="6" fill="#fff" stroke="${P.edge}" stroke-width="3"/>`}`;
    case 'hoshi':
      return `<path d="${starPath(80, 50, 7, 3)}" fill="${P.line}"/><path d="${starPath(122, 66, 5, 2.2)}" fill="${P.line}"/>
        <path d="${starPath(72, 84, 4, 1.8)}" fill="${P.line}"/><path d="${starPath(130, 92, 3.5, 1.5)}" fill="${P.line}"/>
        <path d="M106 30 a12 12 0 1 0 6 22 a9 9 0 0 1 -6 -22 Z" fill="${P.line}"/>`;
    case 'niji':
      return `<path d="M68 52 Q100 34 132 52" stroke="${RAINBOW[0]}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M64 66 Q100 48 136 66" stroke="${RAINBOW[2]}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M62 80 Q100 62 138 80" stroke="${RAINBOW[3]}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M61 93 Q100 76 139 93" stroke="${RAINBOW[4]}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>`;
    default:
      return stage === 'adult' ? `<circle cx="88" cy="46" r="5" fill="${P.edge}" opacity=".45"/><circle cx="112" cy="60" r="4" fill="${P.edge}" opacity=".45"/><circle cx="96" cy="78" r="3" fill="${P.edge}" opacity=".45"/>` : '';
  }
}

export function squidSVG(stage, mood, form, hat, spId = 'momo') {
  const base = SPECIES[spId] || SPECIES.momo;
  const P = { ...base };
  if (stage === 'baby') { P.body = tint(base.body, spId === 'neon' ? .15 : .35); P.edge = tint(base.edge, .25); }
  if (mood === 'sick') { P.body = '#dfe9c8'; P.edge = '#a9bf86'; P.ink = '#4a3a3a'; }
  const f = stage === 'adult' ? (FORMS[form] || FORMS.surume) : null;
  const ink = P.ink;

  // あし
  const tents = [62, 74, 86, 98, 110, 122, 134].map((x, i) => {
    const len = (i === 1 || i === 5) ? 82 : 58, sway = (i - 3) * 5;
    const col = spId === 'niji' ? RAINBOW[i] : spId === 'neon' && mood !== 'sick' ? (i % 2 ? P.line : P.line2) : P.edge;
    return `<path class="tent" style="animation-delay:${-i * .23}s" d="M${x} 140 Q${x + sway - 6} ${140 + len * .55} ${x + sway} ${140 + len}" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  }).join('');

  // ひれ
  const finD = FINS[P.fin] || FINS.round;
  const finT = f && f.bigFin ? 'translate(100 40) scale(1.28 1.15) translate(-100 -40)' : '';
  const finL = spId === 'niji' ? RAINBOW[4] : P.body, finR = spId === 'niji' ? RAINBOW[2] : P.body;
  const fins = `<g transform="${finT}">
    <path d="${finD}" fill="${finL}" stroke="${P.edge}" stroke-width="4" stroke-linejoin="round"/>
    <path d="${finD}" transform="translate(200 0) scale(-1 1)" fill="${finR}" stroke="${P.edge}" stroke-width="4" stroke-linejoin="round"/></g>`;

  // ピカピカタイプの ひかる てん
  const glowDots = f && f.glow ? [[86, 44], [114, 52], [98, 70], [76, 84], [124, 84]].map(([x, y]) =>
    `<circle class="glowdot" cx="${x}" cy="${y}" r="4.5" fill="${base.glow || '#7fd4ff'}"/>`).join('') : '';

  // かお
  const L = 82, R = 118, Y = 108;
  let eyes, mouth;
  if (mood === 'sleep') {
    eyes = [L, R].map(x => `<path d="M${x - 10} ${Y} Q${x} ${Y + 9} ${x + 10} ${Y}" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
    mouth = `<ellipse cx="100" cy="127" rx="4" ry="3" fill="#a5525f"/>`;
  } else if (mood === 'happy') {
    eyes = [L, R].map(x => `<path d="M${x - 10} ${Y + 3} Q${x} ${Y - 10} ${x + 10} ${Y + 3}" stroke="${ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`).join('');
    mouth = `<path d="M91 123 Q100 136 109 123 Z" fill="#c4566a"/>`;
  } else if (mood === 'sick') {
    eyes = [L, R].map(x => `<circle cx="${x}" cy="${Y}" r="10" fill="none" stroke="${ink}" stroke-width="3"/><circle cx="${x}" cy="${Y}" r="4" fill="none" stroke="${ink}" stroke-width="3"/>`).join('');
    mouth = `<path d="M92 128 q4 -4 8 0 q4 4 8 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    const py = mood === 'sad' ? 4 : 0;
    const pupil = spId === 'neon' ? '#1b1d45' : '#3b2c2c';
    eyes = [L, R].map(x => `<circle cx="${x}" cy="${Y}" r="13" fill="#fff"/><circle cx="${x}" cy="${Y + 2 + py}" r="8" fill="${pupil}"/><circle cx="${x + 3}" cy="${Y - 1 + py}" r="3" fill="#fff"/>`).join('');
    if (spId === 'yuki' || spId === 'hoshi') eyes += `<path d="M${L - 11} ${Y - 7} l-6 -3 M${L - 7} ${Y - 11} l-4 -5 M${R + 11} ${Y - 7} l6 -3 M${R + 7} ${Y - 11} l4 -5" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
    if (mood === 'sad') eyes += `<path d="M${L - 12} ${Y - 13} L${L + 8} ${Y - 19}" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="M${R + 12} ${Y - 13} L${R - 8} ${Y - 19}" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
    mouth = mood === 'sad'
      ? `<path d="M93 131 Q100 124 107 131" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
      : `<path d="M94 126 Q100 132 106 126" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }

  return `<svg viewBox="0 0 200 230">
    <g>${tents}</g>
    ${fins}
    <path d="${MANTLE}" fill="${P.body}" stroke="${P.edge}" stroke-width="4"/>
    <path d="M84 30 Q92 20 100 16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="${spId === 'neon' ? .35 : .8}"/>
    ${mood === 'sick' ? '' : pattern(spId, P, stage, hat)}
    ${glowDots}
    <ellipse cx="68" cy="124" rx="9" ry="5" fill="${P.cheek}" opacity=".5"/>
    <ellipse cx="132" cy="124" rx="9" ry="5" fill="${P.cheek}" opacity=".5"/>
    ${eyes}${mouth}
    ${hatSVG(hat)}
  </svg>`;
}

export function eggSVG(hatch, spId = 'momo') {
  const P = SPECIES[spId] || SPECIES.momo;
  const a = .12 + hatch / 100 * .8, s = .5 + hatch / 100 * .5;
  const emb = tint(P.body === '#f6fbff' ? '#cfe8f7' : P.body, .1);
  return `<svg viewBox="0 0 200 200">
    <ellipse cx="52" cy="140" rx="30" ry="40" fill="rgba(255,255,255,.45)" stroke="rgba(255,255,255,.9)" stroke-width="3"/>
    <ellipse cx="150" cy="146" rx="26" ry="34" fill="rgba(255,255,255,.45)" stroke="rgba(255,255,255,.9)" stroke-width="3"/>
    <ellipse cx="100" cy="110" rx="52" ry="70" fill="rgba(255,255,255,.6)" stroke="#fff" stroke-width="5"/>
    <g opacity="${a}" transform="translate(100 112) scale(${s}) translate(-100 -112)">
      <path d="M100 70 C116 82 122 104 120 122 L80 122 C78 104 84 82 100 70 Z" fill="${emb}"/>
      <path d="M86 122 q-2 14 -6 22 M95 122 q0 14 -2 24 M105 122 q0 14 2 24 M114 122 q2 14 6 22" stroke="${emb}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="92" cy="108" r="4" fill="#4a3a3a"/><circle cx="108" cy="108" r="4" fill="#4a3a3a"/>
    </g>
    <ellipse cx="80" cy="70" rx="10" ry="18" fill="#fff" opacity=".7" transform="rotate(20 80 70)"/>
  </svg>`;
}
