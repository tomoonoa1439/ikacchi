// =========================================================
//  えのぐ（SVG）: イカ・たまご・ぼうし
// =========================================================
import { FORMS } from './config.js';

const PAL = {
  baby: ['#fff0f3', '#f3b6c4'],
  child: ['#ffc6d2', '#e98aa0'],
};

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

export function squidSVG(stage, mood, form, hat) {
  const f = stage === 'adult' ? (FORMS[form] || FORMS.surume) : null;
  let [body, edge] = f ? [f.body, f.edge] : PAL[stage] || PAL.baby;
  if (mood === 'sick') [body, edge] = ['#dfe9c8', '#a9bf86'];

  const tents = [62, 74, 86, 98, 110, 122, 134].map((x, i) => {
    const len = (i === 1 || i === 5) ? 82 : 58, sway = (i - 3) * 5;
    return `<path class="tent" style="animation-delay:${-i * .23}s" d="M${x} 140 Q${x + sway - 6} ${140 + len * .55} ${x + sway} ${140 + len}" stroke="${edge}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  }).join('');

  let spots = '';
  if (stage === 'adult') spots = `<circle cx="88" cy="46" r="5" fill="${edge}" opacity=".45"/><circle cx="112" cy="60" r="4" fill="${edge}" opacity=".45"/><circle cx="96" cy="78" r="3" fill="${edge}" opacity=".45"/>`;
  if (f && f.glow) spots = [[86, 44], [114, 52], [98, 70], [76, 84], [124, 84]].map(([x, y]) => `<circle class="glowdot" cx="${x}" cy="${y}" r="4.5" fill="#7fd4ff"/>`).join('');

  const L = 82, R = 118, Y = 108;
  let eyes, mouth;
  if (mood === 'sleep') {
    eyes = [L, R].map(x => `<path d="M${x - 10} ${Y} Q${x} ${Y + 9} ${x + 10} ${Y}" stroke="#4a3a3a" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
    mouth = `<ellipse cx="100" cy="127" rx="4" ry="3" fill="#a5525f"/>`;
  } else if (mood === 'happy') {
    eyes = [L, R].map(x => `<path d="M${x - 10} ${Y + 3} Q${x} ${Y - 10} ${x + 10} ${Y + 3}" stroke="#4a3a3a" stroke-width="4.5" fill="none" stroke-linecap="round"/>`).join('');
    mouth = `<path d="M91 123 Q100 136 109 123 Z" fill="#c4566a"/>`;
  } else if (mood === 'sick') {
    eyes = [L, R].map(x => `<circle cx="${x}" cy="${Y}" r="10" fill="none" stroke="#4a3a3a" stroke-width="3"/><circle cx="${x}" cy="${Y}" r="4" fill="none" stroke="#4a3a3a" stroke-width="3"/>`).join('');
    mouth = `<path d="M92 128 q4 -4 8 0 q4 4 8 0" stroke="#4a3a3a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    const py = mood === 'sad' ? 4 : 0;
    eyes = [L, R].map(x => `<circle cx="${x}" cy="${Y}" r="13" fill="#fff"/><circle cx="${x}" cy="${Y + 2 + py}" r="8" fill="#3b2c2c"/><circle cx="${x + 3}" cy="${Y - 1 + py}" r="3" fill="#fff"/>`).join('');
    if (mood === 'sad') eyes += `<path d="M${L - 12} ${Y - 13} L${L + 8} ${Y - 19}" stroke="#4a3a3a" stroke-width="3" stroke-linecap="round"/><path d="M${R + 12} ${Y - 13} L${R - 8} ${Y - 19}" stroke="#4a3a3a" stroke-width="3" stroke-linecap="round"/>`;
    mouth = mood === 'sad'
      ? `<path d="M93 131 Q100 124 107 131" stroke="#4a3a3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
      : `<path d="M94 126 Q100 132 106 126" stroke="#4a3a3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }

  return `<svg viewBox="0 0 200 230">
    <g>${tents}</g>
    <path d="M88 34 Q36 30 44 74 Q64 62 82 66 Z" fill="${body}" stroke="${edge}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M112 34 Q164 30 156 74 Q136 62 118 66 Z" fill="${body}" stroke="${edge}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M100 6 C128 28 142 68 142 104 C142 136 124 148 100 148 C76 148 58 136 58 104 C58 68 72 28 100 6 Z" fill="${body}" stroke="${edge}" stroke-width="4"/>
    <path d="M84 30 Q92 20 100 16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
    ${spots}
    <ellipse cx="68" cy="124" rx="9" ry="5" fill="#ff7f9a" opacity=".45"/>
    <ellipse cx="132" cy="124" rx="9" ry="5" fill="#ff7f9a" opacity=".45"/>
    ${eyes}${mouth}
    ${hatSVG(hat)}
  </svg>`;
}

export function eggSVG(hatch) {
  const a = .12 + hatch / 100 * .8, s = .5 + hatch / 100 * .5;
  return `<svg viewBox="0 0 200 200">
    <ellipse cx="52" cy="140" rx="30" ry="40" fill="rgba(255,255,255,.45)" stroke="rgba(255,255,255,.9)" stroke-width="3"/>
    <ellipse cx="150" cy="146" rx="26" ry="34" fill="rgba(255,255,255,.45)" stroke="rgba(255,255,255,.9)" stroke-width="3"/>
    <ellipse cx="100" cy="110" rx="52" ry="70" fill="rgba(255,255,255,.6)" stroke="#fff" stroke-width="5"/>
    <g opacity="${a}" transform="translate(100 112) scale(${s}) translate(-100 -112)">
      <path d="M100 70 C116 82 122 104 120 122 L80 122 C78 104 84 82 100 70 Z" fill="#f7a9ba"/>
      <path d="M86 122 q-2 14 -6 22 M95 122 q0 14 -2 24 M105 122 q0 14 2 24 M114 122 q2 14 6 22" stroke="#f7a9ba" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="92" cy="108" r="4" fill="#4a3a3a"/><circle cx="108" cy="108" r="4" fill="#4a3a3a"/>
    </g>
    <ellipse cx="80" cy="70" rx="10" ry="18" fill="#fff" opacity=".7" transform="rotate(20 80 70)"/>
  </svg>`;
}
