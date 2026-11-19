// =========================================================
//  えのぐ（SVG）: イカ（しゅるい別）・たまご・ぼうし
// =========================================================
import { FORMS, SPECIES } from './config.js';
export const USE_PHOTO = true;   // イラストの イカを つかう（false で まえの えに もどる）

// 色を しろに ちかづける（あかちゃんは うすい いろ）
function tint(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * k));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * (1 - k)));
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
        <circle cx="80" cy="40" r="3" fill="${P.line}"/><circle cx="120" cy="46" r="2.5" fill="${P.line}"/>`;
    case 'yuki':
      return `<g stroke="${P.edge}" stroke-width="2.5" stroke-linecap="round" opacity=".8"><path d="M100 72 v18 M92 76 l16 10 M108 76 l-16 10"/></g>
        <circle cx="74" cy="92" r="3" fill="#fff" stroke="${P.line}" stroke-width="1.5"/><circle cx="128" cy="88" r="2.5" fill="#fff" stroke="${P.line}" stroke-width="1.5"/>`;
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


// ---- しゅるいごとの トレードマーク（あたま：ぼうしを かぶると かくれる ／ くび：いつも）----
function headMark(spId, hat) {
  if (hat) return '';
  switch (spId) {
    case 'momo':   // もも
      return `<g transform="translate(122 30) rotate(18)">
        <path d="M0 -14 Q14 -16 14 0 Q14 14 0 14 Q-14 14 -14 0 Q-14 -16 0 -14 Z" fill="#ffb3c4" stroke="#e98aa0" stroke-width="3"/>
        <path d="M0 -12 Q-4 0 0 12" stroke="#ef9bb0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="-4" cy="-6" rx="4" ry="2.5" fill="#fff" opacity=".7"/>
        <path d="M2 -14 Q10 -26 22 -20 Q14 -10 2 -14 Z" fill="#7cc68d" stroke="#4f9a5a" stroke-width="2.5" stroke-linejoin="round"/></g>`;
    case 'neon':   // ヘッドホン
      return `<path d="M58 96 C52 18 148 18 142 96" stroke="#3a2f7a" stroke-width="11" fill="none" stroke-linecap="round"/>
        <path d="M58 96 C52 18 148 18 142 96" stroke="#ff7af0" stroke-width="5" fill="none" stroke-linecap="round" class="neonline"/>
        <rect x="44" y="80" width="22" height="34" rx="10" fill="#262a66" stroke="#5ff3ff" stroke-width="4" class="neonline"/>
        <rect x="134" y="80" width="22" height="34" rx="10" fill="#262a66" stroke="#5ff3ff" stroke-width="4" class="neonline"/>
        <circle cx="55" cy="97" r="5" fill="#5ff3ff" class="glowdot"/><circle cx="145" cy="97" r="5" fill="#5ff3ff" class="glowdot"/>`;
    case 'sabaku': // たんけんぼうし ＋ ゴーグル
      return `<ellipse cx="100" cy="38" rx="52" ry="11" fill="#c08850" stroke="#8a5a2e" stroke-width="3"/>
        <path d="M70 37 Q71 6 100 3 Q129 6 130 37 Z" fill="#d9a66c" stroke="#8a5a2e" stroke-width="3" stroke-linejoin="round"/>
        <path d="M71 27 Q100 31 129 27 L130 35 Q100 39 70 35 Z" fill="#7a4a24"/>
        <path d="M96 28 h8" stroke="#5a3a1e" stroke-width="5" stroke-linecap="round"/>
        <circle cx="86" cy="26" r="9" fill="#bfe8f4" stroke="#5a3a1e" stroke-width="3.5"/><circle cx="114" cy="26" r="9" fill="#bfe8f4" stroke="#5a3a1e" stroke-width="3.5"/>
        <path d="M81 22 l5 -3 M109 22 l5 -3" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'yuki':   // ゆきの けっしょう
      return `<g transform="translate(116 44)" stroke="#6fb0e6" stroke-width="3.5" stroke-linecap="round">
        <path d="M0 -13 V13 M-11 -6.5 L11 6.5 M-11 6.5 L11 -6.5"/>
        <path d="M-4 -10 L0 -6 L4 -10 M-4 10 L0 6 L4 10 M-11 -1 L-7 -3.5 M11 1 L7 3.5 M-11 1 L-7 3.5 M11 -1 L7 -3.5" stroke-width="2.2"/></g>`;
    case 'hoshi':  // ほし ＋ わっか
      return `<ellipse cx="100" cy="70" rx="64" ry="13" transform="rotate(-10 100 70)" fill="none" stroke="#c9a2ff" stroke-width="3" opacity=".8"/>
        <path d="${starPath(84, 22, 13, 6)}" fill="#ffd84a" stroke="#e0a800" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="80" cy="18" r="2.5" fill="#fff" opacity=".8"/>`;
    case 'niji':   // ちいさな おうかん
      return `<g transform="translate(118 18) rotate(14) scale(.62) translate(-100 -15)">
        <path d="M76 30 L78 6 L90 20 L100 0 L110 20 L122 6 L124 30 Z" fill="#ffd54a" stroke="#d4a017" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="100" cy="22" r="4.5" fill="#ff6f9a"/><circle cx="85" cy="25" r="3.5" fill="#6cc3e0"/><circle cx="115" cy="25" r="3.5" fill="#6cc3e0"/></g>`;
  }
  return '';
}
function neckMark(spId) {
  switch (spId) {
    case 'sabaku': // バンダナ
      return `<path d="M64 136 Q100 150 136 136 L134 146 Q118 152 108 152 L100 166 L92 152 Q80 152 66 146 Z" fill="#e8813a" stroke="#b85a1e" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="132" cy="141" r="5" fill="#e8813a" stroke="#b85a1e" stroke-width="2.5"/>
        <path d="M134 144 l10 9 M134 144 l12 2" stroke="#b85a1e" stroke-width="5" stroke-linecap="round"/><path d="M134 144 l10 9 M134 144 l12 2" stroke="#e8813a" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'yuki':   // しましまマフラー
      return `<path d="M62 134 Q100 150 138 134 L140 147 Q100 163 60 147 Z" fill="#dff0fb" stroke="#6fb0e6" stroke-width="3" stroke-linejoin="round"/>
        <g stroke="#8cc4ee" stroke-width="5"><path d="M76 141 v12 M92 145 v13 M108 145 v13 M124 141 v12"/></g>
        <path d="M118 148 L114 178 L128 179 L130 148 Z" fill="#dff0fb" stroke="#6fb0e6" stroke-width="3" stroke-linejoin="round"/>
        <path d="M116 160 h13 M115 170 h13" stroke="#8cc4ee" stroke-width="4"/>`;
  }
  return '';
}
function sparkles(spId) {
  if (spId !== 'hoshi') return '';
  return [[78, 40, 2], [126, 52, 2.4], [90, 86, 1.8], [114, 96, 2], [70, 64, 1.6], [134, 82, 1.6]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9" class="glowdot"/>`).join('');
}

// ---- いろの へんか（しきそほう）：CSS の skin-○○ で みえかたが かわる ----
function chroma(P, dark) {
  const dots = [[80, 40, 4], [104, 30, 3], [118, 46, 4.5], [90, 58, 3.5], [126, 70, 3], [72, 74, 4], [108, 80, 3.5], [86, 92, 3], [124, 94, 4], [66, 96, 3]]
    .map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${dark}" style="animation-delay:${-i * .37}s"/>`).join('');
  const stripes = [36, 50, 64, 78, 92].map(y => `<path d="M${64 + (y > 60 ? -2 : 6)} ${y + 6} Q100 ${y - 6} ${136 - (y > 60 ? -2 : 6)} ${y + 6}" stroke="${dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('');
  const waves = [40, 62, 84].map((y, i) => `<path d="M62 ${y + 8} Q100 ${y - 8} 138 ${y + 8}" stroke="#ff8fb8" stroke-width="9" fill="none" stroke-linecap="round" style="animation-delay:${-i * .5}s"/>`).join('');
  const glow = `<path d="${MANTLE}" fill="none" stroke="#fff6b0" stroke-width="7" opacity=".9"/>`;
  return `<g class="chroma"><g class="c-dots">${dots}</g><g class="c-stripes">${stripes}</g><g class="c-wave">${waves}</g><g class="c-glow">${glow}</g></g>`;
}


// ---- イラストの イカ（img/sq/○○.webp）----
// eyes: めの ばしょ（がぞうの px）、lid: まぶたの いろ、hat: ぼうしを のせる ばしょ
const PHOTO = {
  momo:   { w: 360, h: 240, eyes: [[115, 120], [220, 145]], lid: ['#fdc2dc', '#fdb7d7'], hat: [150, 22] },
  neon:   { w: 360, h: 310, eyes: [[127, 145], [220, 170]], lid: ['#3842bc', '#4948ec'], hat: [200, 40] },
  sabaku: { w: 360, h: 312, eyes: [[108, 165], [200, 185]], lid: ['#fdc666', '#fec874'], hat: [200, 28] },
  yuki:   { w: 360, h: 318, eyes: [[117, 143], [222, 175]], lid: ['#e3ebfd', '#d8e4fd'], hat: [170, 40] },
  hoshi:  { w: 360, h: 303, eyes: [[120, 135], [218, 158]], lid: ['#6359fc', '#4662fa'], hat: [170, 40] },
  niji:   { w: 360, h: 304, eyes: [[112, 140], [212, 158]], lid: ['#f8befc', '#78e6fd'], hat: [150, 45] },
};
let uidN = 0;
function photoSquid(stage, mood, form, hat, spId, sp2) {
  const Q = PHOTO[spId] || PHOTO.momo, id = 'sq' + (++uidN);
  const k = 196 / Q.w, H = Q.h * k, y0 = 228 - H, x0 = 2;
  const src = `img/sq/${PHOTO[spId] ? spId : 'momo'}.webp`;
  const img = (extra = '') => `<image href="${src}" x="0" y="0" width="${Q.w}" height="${Q.h}" ${extra}/>`;
  const mix = sp2 && sp2 !== spId && SPECIES[sp2] ? SPECIES[sp2] : null;
  const f = stage === 'adult' ? (FORMS[form] || FORMS.surume) : null;
  const ink = '#2b2244';
  let over = '';
  // まざった イカ：もう かたほうの いろを うっすら かさねる
  if (mix) over += `<rect width="${Q.w}" height="${Q.h}" fill="${mix.body}" opacity=".38" mask="url(#${id})" style="mix-blend-mode:multiply"/>
    <rect width="${Q.w}" height="${Q.h}" fill="${mix.edge}" opacity=".18" mask="url(#${id})"/>`;
  if (mood === 'sick') over += `<rect width="${Q.w}" height="${Q.h}" fill="#9fcf6a" opacity=".45" mask="url(#${id})" style="mix-blend-mode:multiply"/>`;
  // かお
  const [[lx, ly], [rx, ry]] = Q.eyes;
  if (mood === 'sleep') {
    over += Q.eyes.map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="26" fill="${Q.lid[i]}"/>
      <path d="M${x - 18} ${y} Q${x} ${y + 13} ${x + 18} ${y}" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('');
  } else if (mood === 'happy') {
    over += Q.eyes.map(([x, y], i) => `<ellipse cx="${x}" cy="${y + 4}" rx="24" ry="27" fill="${Q.lid[i]}"/>
      <path d="M${x - 17} ${y + 6} Q${x} ${y - 14} ${x + 17} ${y + 6}" stroke="${ink}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`).join('');
  } else if (mood === 'sad') {
    over += `<path d="M${lx - 24} ${ly - 30} L${lx + 12} ${ly - 40}" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${rx + 24} ${ry - 30} L${rx - 12} ${ry - 40}" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${lx + 14} ${ly + 22} q-7 12 0 16 q7 -4 0 -16 Z" fill="#8fd3ff" stroke="#4aa6e0" stroke-width="2"/>`;
  } else if (mood === 'sick') {
    over += Q.eyes.map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="26" fill="${Q.lid[i]}"/>
      <path d="M${x - 14} ${y - 8} l28 16 M${x + 14} ${y - 8} l-28 16" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>`).join('')
      + `<path d="M${rx + 34} ${ry - 50} q-8 14 0 18 q8 -4 0 -18 Z" fill="#8fd3ff" stroke="#4aa6e0" stroke-width="2"/>`;
  }
  // ピカピカ タイプ
  const glow = f && f.glow ? `<g opacity=".85">${[[100, 120], [250, 140], [180, 220], [80, 230], [280, 240]].map(([x, y], i) =>
    `<circle class="glowdot" cx="${x}" cy="${y}" r="9" fill="${(SPECIES[spId] || {}).glow || '#bff0ff'}" style="animation-delay:${-i * .4}s"/>`).join('')}</g>` : '';
  const hatG = hat ? `<g transform="translate(${Q.hat[0]} ${Q.hat[1]}) scale(2.3) translate(-100 -30)">${hatSVG(hat)}</g>` : '';
  return `<svg viewBox="0 0 200 230" data-photo="1">
    <defs><mask id="${id}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="${Q.w}" height="${Q.h}">${img()}</mask></defs>
    <g transform="translate(${x0} ${y0}) scale(${k})">
      ${img('class="sqimg"')}
      <g class="chroma-ph" mask="url(#${id})" opacity=".55"><g transform="translate(-20 -40) scale(2)">${chroma(SPECIES[spId] || SPECIES.momo, '#000000')}</g></g>
      ${over}${glow}${hatG}
    </g>
  </svg>`;
}

export function squidSVG(stage, mood, form, hat, spId = 'momo', sp2 = null) {
  if (USE_PHOTO) return photoSquid(stage, mood, form, hat, spId, sp2);
  const base = SPECIES[spId] || SPECIES.momo;
  const P = { ...base };
  // まざった イカ：からだは spId、ひれ・あし・もようは sp2
  const mix = sp2 && sp2 !== spId && SPECIES[sp2] ? SPECIES[sp2] : null;
  if (mix) { P.fin = mix.fin; P.line = mix.line; P.line2 = mix.line2 || mix.line; P.edge2 = mix.edge; }
  if (stage === 'baby') { P.body = tint(base.body, spId === 'neon' ? .15 : .35); P.edge = tint(base.edge, .25); }
  if (mood === 'sick') { P.body = '#dfe9c8'; P.edge = '#a9bf86'; P.ink = '#4a3a3a'; }
  const f = stage === 'adult' ? (FORMS[form] || FORMS.surume) : null;
  const ink = P.ink;

  // あし
  const tents = [62, 74, 86, 98, 110, 122, 134].map((x, i) => {
    const len = (i === 1 || i === 5) ? 66 : 46, sway = (i - 3) * 6;
    const tsp = mix ? sp2 : spId;
    const col = tsp === 'niji' ? RAINBOW[i] : SPECIES[tsp]?.tent && mood !== 'sick' ? SPECIES[tsp].tent : tsp === 'neon' && mood !== 'sick' ? (i % 2 ? P.line : P.line2) : (mix ? P.edge2 : P.edge);
    return `<path class="tent" style="animation-delay:${-i * .23}s" d="M${x} 140 Q${x + sway - 6} ${140 + len * .55} ${x + sway} ${140 + len}" stroke="${col}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
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
    ${mood === 'sick' ? '' : pattern(mix ? sp2 : spId, mix ? { ...P, edge: P.edge2 } : P, stage, hat)}
    ${chroma(P, shade(P.edge, .3))}
    ${glowDots}
    <ellipse cx="68" cy="124" rx="9" ry="5" fill="${P.cheek}" opacity=".5"/>
    <ellipse cx="132" cy="124" rx="9" ry="5" fill="${P.cheek}" opacity=".5"/>
    ${eyes}${mouth}
    ${mood === 'sick' ? '' : sparkles(mix ? sp2 : spId)}
    ${neckMark(mix ? sp2 : spId)}
    ${headMark(spId, hat)}
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
