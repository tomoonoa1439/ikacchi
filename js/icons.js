// =========================================================
//  イカッチ オリジナルアイコン（SVG）
//  機種ごとの絵文字を使わず、どの端末でも同じ絵になるようにする
//  使い方：ic('squid', 24) → <svg ...>
// =========================================================
const O = '#5b4632';
const s = `stroke="${O}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;

function star(cx, cy, R, r, fill, extra = s) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
  }
  return `<path d="${d}Z" fill="${fill}" ${extra}/>`;
}
const shell = (fill, rib) => `<path d="M16 27C9 27 4 22 3 15 8 6 24 6 29 15c-1 7-6 12-13 12z" fill="${fill}" ${s}/>
  <path d="M16 27V9M16 27 9 11M16 27l7-16M16 27 5 15M16 27l11-12" stroke="${rib}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M12 27h8l-1 3h-6z" fill="${fill}" ${s}/>`;
const heartPath = 'M16 28S3 20 3 11a6.5 6.5 0 0 1 13-2 6.5 6.5 0 0 1 13 2c0 9-13 17-13 17z';
const thermo = `<rect x="13" y="3" width="6" height="18" rx="3" fill="#fff" ${s}/><circle cx="16" cy="24" r="5" fill="#f07b6b" ${s}/><rect x="14.6" y="9" width="2.8" height="13" fill="#f07b6b"/>`;
const drop = `<path d="M16 3c5 7 9 12 9 17a9 9 0 0 1-18 0c0-5 4-10 9-17z" fill="#8fd3f4" ${s}/><path d="M12 19a4 4 0 0 0 3 5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const speaker = `<path d="M4 12h5l7-6v20l-7-6H4z" fill="#f6c85f" ${s}/>`;
const wave = `<path d="M2 20c4-6 8-6 10 0s8 6 10 0 6-6 8-2" fill="none" stroke="#6cc3e0" stroke-width="3" stroke-linecap="round"/>
  <path d="M2 26c4-4 8-4 10 0s8 4 10 0 6-4 8-1" fill="none" stroke="#a8e0f0" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 13c1-5 6-8 11-6-3 0-5 2-5 5 2-2 5-1 6 1" fill="none" stroke="#6cc3e0" stroke-width="2.6" stroke-linecap="round"/>`;

const P = {
  squid: `<path d="M10 9 3 12l5 4M22 9l7 3-5 4" fill="#ff9fb3" ${s}/>
    <path d="M16 2C21 7 24 12 24 18c0 4-3 6-8 6s-8-2-8-6c0-6 3-11 8-16z" fill="#ff9fb3" ${s}/>
    <path d="M11 23c-1 3-2 5-4 6M14 24c0 3-1 5-2 6M18 24c0 3 1 5 2 6M21 23c1 3 2 5 4 6" fill="none" stroke="#e98aa0" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="13" cy="17" r="1.8" fill="${O}"/><circle cx="19" cy="17" r="1.8" fill="${O}"/>`,
  alert: `<circle cx="16" cy="16" r="13" fill="#ff6f7f"/><rect x="14.3" y="7" width="3.4" height="12" rx="1.7" fill="#fff"/><circle cx="16" cy="23.5" r="2" fill="#fff"/>`,
  sun: `<path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l3 3M23 23l3 3M26 6l-3 3M9 23l-3 3" stroke="#f2a93b" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="16" r="7" fill="#ffd54a" stroke="#f2a93b" stroke-width="2"/>`,
  moon: `<path d="M20 4a12 12 0 1 0 8 19A10 10 0 0 1 20 4z" fill="#ffe38a" stroke="#d9b54a" stroke-width="2" stroke-linejoin="round"/>`,
  cloud: `<path d="M9 25h15a6 6 0 0 0 0-12 8 8 0 0 0-15-1 6.5 6.5 0 0 0 0 13z" fill="#fff" ${s}/>`,
  rain: `<path d="M9 19h14a5 5 0 0 0 0-10 7 7 0 0 0-13-1 5.5 5.5 0 0 0-1 11z" fill="#e3e8f0" ${s}/><path d="M11 23l-2 4M17 23l-2 4M23 23l-2 4" stroke="#6cc3e0" stroke-width="2.4" stroke-linecap="round"/>`,
  rainbow: `<g fill="none" stroke-width="3.2" stroke-linecap="round"><path d="M3 25a13 13 0 0 1 26 0" stroke="#ff8a8a"/><path d="M7 25a9 9 0 0 1 18 0" stroke="#ffd36b"/><path d="M11 25a5 5 0 0 1 10 0" stroke="#7fcf8f"/></g>`,
  shell: shell('#ffd9c2', '#e9a98a'),
  sakura: shell('#ffc6d2', '#ef8fa6'),
  hotate: shell('#f6dcae', '#cfa565'),
  fast: `<path d="M4 8l11 8-11 8zM16 8l11 8-11 8z" fill="#6cc3e0" ${s}/>`,
  sound: `${speaker}<path d="M21 11a7 7 0 0 1 0 10M24.5 8a11 11 0 0 1 0 16" fill="none" ${s}/>`,
  mute: `${speaker}<path d="M21 12l7 8M28 12l-7 8" fill="none" ${s}/>`,
  box: `<path d="M4 11l12-5 12 5v13l-12 5-12-5z" fill="#e9c38f" ${s}/><path d="M4 11l12 5 12-5M16 16v13" fill="none" ${s}/><path d="M10 8.5l12 5v4" fill="none" stroke="#c79a5c" stroke-width="2"/>`,
  egg: `<ellipse cx="16" cy="17.5" rx="10" ry="12.5" fill="#fff6e6" ${s}/><ellipse cx="12" cy="12" rx="2.5" ry="4" fill="#fff" transform="rotate(20 12 12)"/>`,
  chick: `<circle cx="16" cy="12" r="7" fill="#ffd54a" ${s}/><circle cx="14" cy="11" r="1.2" fill="${O}"/><circle cx="18" cy="11" r="1.2" fill="${O}"/><path d="M15 13.5h2l-1 1.6z" fill="#f2a93b"/>
    <path d="M6 18a10 10 0 0 0 20 0l-3 2-3-3-4 3-4-3-3 3z" fill="#fff6e6" ${s}/>`,
  flame: `<path d="M16 3c2 6 9 9 9 17a9 9 0 0 1-18 0c0-5 3-7 4-11 1 3 2 4 3 4 0-4 0-7 2-10z" fill="#ff8a4c" ${s}/><path d="M16 17c2 2 4 3 4 6a4 4 0 0 1-8 0c0-2 2-3 4-6z" fill="#ffd54a"/>`,
  cold: `<g stroke="#6cc3e0" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M16 3v26M4.7 9.5l22.6 13M4.7 22.5l22.6-13"/><path d="M12 5l4 3 4-3M12 27l4-3 4 3"/></g>`,
  hot: thermo, thermo,
  bolt: `<path d="M18 2 6 18h8l-2 12 12-16h-8z" fill="#ffd54a" ${s}/>`,
  drop, sweat: drop,
  note: `<path d="M12 24V7l14-3v16" fill="none" ${s} stroke-width="2.4"/><ellipse cx="9" cy="24" rx="4" ry="3" fill="#ff8fa8" ${s}/><ellipse cx="23" cy="21" rx="4" ry="3" fill="#ff8fa8" ${s}/>`,
  sparkle: `<path d="M16 2c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11z" fill="#ffd54a" stroke="#f2a93b" stroke-width="1.6" stroke-linejoin="round"/><path d="M26 22c.5 2.5 1.5 3.5 4 4-2.5.5-3.5 1.5-4 4-.5-2.5-1.5-3.5-4-4 2.5-.5 3.5-1.5 4-4z" fill="#ffe38a"/>`,
  bubbles: `<circle cx="12" cy="18" r="8" fill="#d9f3fb" ${s}/><circle cx="23" cy="10" r="5" fill="#d9f3fb" ${s}/><circle cx="24" cy="23" r="3" fill="#d9f3fb" ${s}/><path d="M8 15a4 4 0 0 1 4-3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  pill: `<g transform="rotate(-40 16 16)"><rect x="5" y="10.5" width="22" height="11" rx="5.5" fill="#fff" ${s}/><path d="M16 10.5h5.5a5.5 5.5 0 0 1 0 11H16z" fill="#ff8fa8" ${s}/></g>`,
  heart: `<path d="${heartPath}" fill="#ff6f8f" ${s}/><path d="M8 10a3 3 0 0 1 3-3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`,
  heartEmpty: `<path d="${heartPath}" fill="#f3e6d3" stroke="#d9c3a3" stroke-width="2" stroke-linejoin="round"/>`,
  party: `<path d="M4 28l6-18 12 12z" fill="#ffd54a" ${s}/><path d="M7 19l6 6M8.5 14.5l9 9" stroke="#ff8fa8" stroke-width="2"/><circle cx="20" cy="6" r="2" fill="#6cc3e0"/><circle cx="27" cy="12" r="2" fill="#7cc68d"/><path d="M14 4l2 3M24 18l4 1M22 9l3-3" stroke="#ff6f8f" stroke-width="2.4" stroke-linecap="round"/>`,
  gift: `<rect x="4" y="12" width="24" height="16" rx="2" fill="#ff8fa8" ${s}/><rect x="3" y="8" width="26" height="6" rx="2" fill="#ffb3c4" ${s}/><path d="M16 8v20" stroke="#ffd54a" stroke-width="4"/><path d="M16 8c-3-6-9-5-7-1 1 2 5 1 7 1zM16 8c3-6 9-5 7-1-1 2-5 1-7 1z" fill="#ffd54a" ${s}/>`,
  bulb: `<path d="M16 3a9 9 0 0 0-5 16c1 1 1.5 2.5 1.5 4h7c0-1.5.5-3 1.5-4a9 9 0 0 0-5-16z" fill="#ffe38a" ${s}/><rect x="12" y="23" width="8" height="6" rx="2" fill="#c9ced8" ${s}/><path d="M14 13l2 3 2-3" stroke="#f2a93b" stroke-width="1.8" fill="none"/>`,
  ebi: `<path d="M6 24C4 16 10 6 20 7c5 1 7 5 5 9" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M6 24C4 16 10 6 20 7c5 1 7 5 5 9" fill="none" stroke="#f6c85f" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="11" cy="13" r="1" fill="#d99b2b"/><circle cx="17" cy="9" r="1" fill="#d99b2b"/><circle cx="8" cy="19" r="1" fill="#d99b2b"/><path d="M5 24l-2 6 6-3z" fill="#ff8a5c" ${s}/>`,
  plankton: `<path d="M8 22c-2-6 3-13 11-12 5 1 6 5 4 8" fill="none" stroke="#ff9a7a" stroke-width="5" stroke-linecap="round"/><circle cx="21" cy="12" r="1.3" fill="${O}"/><path d="M8 22l-4 4 6-1z" fill="#ff9a7a"/><circle cx="26" cy="25" r="2" fill="#a8e6c2"/><circle cx="20" cy="27" r="1.5" fill="#a8e6c2"/>`,
  candy: `<path d="M9 16 3 10v12zM23 16l6-6v12z" fill="#ffb3c4" ${s}/><circle cx="16" cy="16" r="7.5" fill="#ff8fa8" ${s}/><path d="M12 13a5 5 0 0 1 7 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  cake: `<path d="M4 27V17l23-8v18z" fill="#fff3dc" ${s}/><path d="M4 17l23-8v5L4 22z" fill="#ff9fb3" ${s}/><circle cx="20" cy="8" r="3" fill="#fff" ${s}/>`,
  bag: `<path d="M6 11h20l-2 17H8z" fill="#ff8fa8" ${s}/><path d="M11 13V9a5 5 0 0 1 10 0v4" fill="none" ${s}/>`,
  ball: `<circle cx="16" cy="16" r="12" fill="#d7ec5a" ${s}/><path d="M6 9c6 3 6 11 0 14M26 9c-6 3-6 11 0 14" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`,
  eyes: `<ellipse cx="10" cy="16" rx="6" ry="8" fill="#fff" ${s}/><ellipse cx="22" cy="16" rx="6" ry="8" fill="#fff" ${s}/><circle cx="11" cy="17" r="3" fill="${O}"/><circle cx="23" cy="17" r="3" fill="${O}"/>`,
  target: `<circle cx="16" cy="16" r="13" fill="#fff" ${s}/><circle cx="16" cy="16" r="9" fill="#ff8fa8"/><circle cx="16" cy="16" r="5" fill="#fff"/><circle cx="16" cy="16" r="2" fill="#ff6f8f"/>`,
  poof: `<g fill="#ece7dc" stroke="#bfb6a3" stroke-width="2"><circle cx="11" cy="18" r="6"/><circle cx="20" cy="15" r="7"/><circle cx="23" cy="22" r="4"/></g>`,
  left: `<path d="M22 5 8 16l14 11z" fill="#fff"/>`,
  right: `<path d="M10 5l14 11-14 11z" fill="#fff"/>`,
  circle: `<circle cx="16" cy="16" r="11" fill="none" stroke="#f07b6b" stroke-width="4.5"/>`,
  cross: `<path d="M7 7l18 18M25 7 7 25" stroke="#6c9bd2" stroke-width="4.5" stroke-linecap="round"/>`,
  shovel: `<path d="M27 5 15 17" stroke="#b98552" stroke-width="3.6" stroke-linecap="round"/><path d="M23.5 3.5l5 5" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M13 14l5 5-6 7c-2 2-6 2-7 0s-2-5 0-7z" fill="#c9ced8" ${s}/>`,
  book: `<path d="M16 8c-4-3-9-3-13-2v20c4-1 9-1 13 2 4-3 9-3 13-2V6c-4-1-9-1-13 2z" fill="#fff" ${s}/><path d="M16 8v20" ${s}/><path d="M6 11c3-.5 5 0 7 1M6 15c3-.5 5 0 7 1M19 12c2-1 4-1.5 7-1M19 16c2-1 4-1.5 7-1" stroke="#7cc68d" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  diary: `<rect x="6" y="3" width="21" height="26" rx="3" fill="#ffb36b" ${s}/><rect x="10" y="8" width="13" height="7" rx="1.5" fill="#fff"/><path d="M4 9h4M4 16h4M4 23h4" ${s}/>`,
  link: `<path d="M11 15l-3 3a4.5 4.5 0 0 0 6 6l3-3M21 17l3-3a4.5 4.5 0 0 0-6-6l-3 3" fill="none" stroke="#6cc3e0" stroke-width="3.2" stroke-linecap="round"/><path d="M13 19l6-6" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>`,
  clip: `<rect x="10" y="9" width="16" height="20" rx="3" fill="#fff" ${s}/><path d="M7 23V6a3 3 0 0 1 3-3h11" fill="none" ${s}/>`,
  house: `<path d="M7 13v15h18V13" fill="#ffd9a8" ${s}/><path d="M4 15 16 4l12 11" fill="none" ${s} stroke-width="2.4"/><rect x="13" y="19" width="6" height="9" fill="#ff8fa8" ${s}/>`,
  friends: `<path d="M11 7c4 4 6 8 6 12 0 3-2 5-6 5s-6-2-6-5c0-4 2-8 6-12z" fill="#ff9fb3" ${s}/><path d="M21 10c4 4 6 8 6 12 0 3-2 5-6 5s-6-2-6-5c0-4 2-8 6-12z" fill="#8fd3f4" ${s}/>
    <circle cx="9" cy="18" r="1.2" fill="${O}"/><circle cx="13" cy="18" r="1.2" fill="${O}"/><circle cx="19" cy="21" r="1.2" fill="${O}"/><circle cx="23" cy="21" r="1.2" fill="${O}"/>
    <path d="M16 7s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z" fill="#ff6f8f"/>`,
  search: `<circle cx="13" cy="13" r="8.5" fill="#e3f5fb" ${s} stroke-width="2.6"/><path d="M19.5 19.5 28 28" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`,
  angry: `<path d="M5 12.5Q12 12.5 12 5M20 5Q20 12.5 27 12.5M27 19.5Q20 19.5 20 27M12 27Q12 19.5 5 19.5" stroke="#f0506a" stroke-width="3.6" fill="none" stroke-linecap="round"/>`,
  wave, hand: wave,
  bed: `<rect x="3" y="15" width="26" height="9" rx="3" fill="#9fd3e6" ${s}/><rect x="5" y="11" width="9" height="6" rx="3" fill="#fff" ${s}/><path d="M3 24v4M29 24v4" ${s}/>`,
  toilet: `<rect x="7" y="3" width="14" height="9" rx="2" fill="#fff" ${s}/><path d="M5 13h22c0 6-4 10-9 10h-4c-5 0-9-4-9-10z" fill="#fff" ${s}/><path d="M11 23l-1 6h12l-1-6" fill="#e3eef2" ${s}/><rect x="4" y="12" width="24" height="3" rx="1.5" fill="#bfe6ef" ${s}/>`,
  sponge: `<rect x="4" y="12" width="24" height="15" rx="4" fill="#ffd54a" ${s}/><circle cx="10" cy="18" r="1.8" fill="#e6b52e"/><circle cx="17" cy="22" r="2" fill="#e6b52e"/><circle cx="22" cy="17" r="1.5" fill="#e6b52e"/><circle cx="9" cy="7" r="3" fill="#d9f3fb" ${s}/><circle cx="17" cy="5" r="2" fill="#d9f3fb" ${s}/>`,
  zzz: `<g fill="#6f8de0" font-family="'M PLUS Rounded 1c',sans-serif" font-weight="800"><text x="3" y="27" font-size="17">Z</text><text x="15" y="18" font-size="12">z</text><text x="23" y="11" font-size="9">z</text></g>`,
  card: `<rect x="3" y="7" width="26" height="18" rx="3" fill="#fff" ${s}/><circle cx="10" cy="14" r="3" fill="#ff9fb3"/><path d="M6.5 21a3.5 3.5 0 0 1 7 0M17 12h8M17 17h6" ${s} fill="none"/>`,
  // ---- きせかえ ----
  hachimaki: `<path d="M3 13c8-4 18-4 26 0v6c-8-4-18-4-26 0z" fill="#fff" ${s}/><circle cx="16" cy="13.5" r="3" fill="#f0506a"/><path d="M27 16l3 7M27 16l-1 8" ${s}/>`,
  ribbon: `<path d="M16 16 4 8v16zM16 16l12-8v16z" fill="#ff6f9a" ${s}/><circle cx="16" cy="16" r="4" fill="#ff8fb0" ${s}/>`,
  straw: `<ellipse cx="16" cy="22" rx="14" ry="5" fill="#f3d27a" ${s}/><path d="M8 21c0-9 4-14 8-14s8 5 8 14" fill="#f6dc8e" ${s}/><path d="M8.5 17c5 2 10 2 15 0v3c-5 2-10 2-15 0z" fill="#e05a5a"/>`,
  crown: `<path d="M4 25 5 8l7 8 4-10 4 10 7-8 1 17z" fill="#ffd54a" stroke="#c99a1a" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="20" r="2.4" fill="#ff6f9a"/><circle cx="9" cy="21" r="1.6" fill="#6cc3e0"/><circle cx="23" cy="21" r="1.6" fill="#6cc3e0"/>`,
  // ---- もようがえ ----
  starfish: star(16, 17, 14, 6, '#ff9a6a') + `<circle cx="13" cy="15" r="1" fill="#fff"/><circle cx="18" cy="14" r="1" fill="#fff"/><circle cx="16" cy="19" r="1" fill="#fff"/>`,
  rock: `<path d="M4 25c0-7 4-13 11-14 8-1 13 5 13 11 0 2-1 3-3 3z" fill="#b9b3a8" ${s}/><path d="M11 16c2-2 4-2.5 6-2.5" stroke="#d8d3ca" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  coral: `<path d="M15 29v-9c0-3-3-4-5-7s-1-6 0-8M15 20c0-2 3-3 4-6s0-6 2-8M15 23c-3-1-7-1-9-4M19 14c2 0 5-1 6-4" fill="none" stroke="${O}" stroke-width="6" stroke-linecap="round"/>
    <path d="M15 29v-9c0-3-3-4-5-7s-1-6 0-8M15 20c0-2 3-3 4-6s0-6 2-8M15 23c-3-1-7-1-9-4M19 14c2 0 5-1 6-4" fill="none" stroke="#ff7f91" stroke-width="3.4" stroke-linecap="round"/>`,
  lantern: `<rect x="12.5" y="2" width="7" height="3" rx="1" fill="${O}"/><ellipse cx="16" cy="16" rx="10" ry="11" fill="#f05a4a" ${s}/><path d="M9 10h14M6.5 16h19M9 22h14" stroke="#c9403a" stroke-width="1.6"/><rect x="12.5" y="26" width="7" height="3" rx="1" fill="${O}"/>`,
  chest: `<rect x="4" y="13" width="24" height="14" rx="2" fill="#c98b4f" ${s}/><path d="M4 14c0-6 4-9 12-9s12 3 12 9z" fill="#d99a5c" ${s}/><rect x="13" y="12" width="6" height="7" rx="1" fill="#ffd54a" ${s}/>`,
  // ---- ずかん ----
  stone: `<ellipse cx="16" cy="18" rx="12" ry="9" fill="#c9c4bb" ${s}/><ellipse cx="12" cy="15" rx="4" ry="2" fill="#e3dfd8"/>`,
  crab: `<path d="M7 15c-3-1-4-5-2-7l2 3 1-4c3 1 3 5 1 7M25 15c3-1 4-5 2-7l-2 3-1-4c-3 1-3 5-1 7" fill="#f05a4a" ${s}/><path d="M8 23l-3 4M11 25l-2 4M24 23l3 4M21 25l2 4" ${s}/>
    <ellipse cx="16" cy="19" rx="10" ry="7" fill="#f05a4a" ${s}/><circle cx="13" cy="17" r="1.5" fill="${O}"/><circle cx="19" cy="17" r="1.5" fill="${O}"/>`,
  glass: `<path d="M8 4h16l5 8-13 17L3 12z" fill="#9fe3c9" ${s}/><path d="M3 12h26M11 4l5 8 5-8M16 12v17" fill="none" stroke="#5fb8a2" stroke-width="1.6"/>`,
  starsand: star(11, 12, 8, 3.5, '#ffd54a', `stroke="#d9a520" stroke-width="1.6" stroke-linejoin="round"`) + star(23, 20, 6, 2.6, '#ffe38a', `stroke="#d9a520" stroke-width="1.6" stroke-linejoin="round"`) + star(10, 25, 4, 1.8, '#ffe38a', `stroke="#d9a520" stroke-width="1.4" stroke-linejoin="round"`),
  bottle: `<path d="M13 4h6v5c4 2 6 5 6 9v8a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3v-8c0-4 2-7 6-9z" fill="#bfe8dc" ${s}/><rect x="12.5" y="2" width="7" height="4" rx="1" fill="#c98b4f" ${s}/><rect x="11" y="15" width="10" height="9" rx="1" fill="#fff6e6" stroke="#d9c3a3" stroke-width="1.5"/>`,
  pearl: `<circle cx="16" cy="17" r="11" fill="#fdfbff" ${s}/><circle cx="12" cy="13" r="3.5" fill="#fff"/><path d="M8 22a10 10 0 0 0 14 3" stroke="#e5d9f2" stroke-width="2" fill="none"/>`,
  coin: `<circle cx="16" cy="16" r="12" fill="#ffd54a" stroke="#c99a1a" stroke-width="2"/><circle cx="16" cy="16" r="8" fill="none" stroke="#e6b52e" stroke-width="2"/><path d="M16 11v10" stroke="#c99a1a" stroke-width="2.4" stroke-linecap="round"/>`,
  scale: `<path d="M16 3c8 4 12 11 12 17a12 12 0 0 1-24 0c0-6 4-13 12-17z" fill="#c6a8ff" ${s}/><path d="M16 9c5 3 8 8 8 12a8 8 0 0 1-16 0c0-4 3-9 8-12z" fill="#9fd8ff"/><path d="M16 15c3 2 4 4 4 6a4 4 0 0 1-8 0c0-2 1-4 4-6z" fill="#a8eba0"/>`,
};

export const ICONS = Object.keys(P);
export function ic(name, size = 20, cls = '') {
  const inner = P[name];
  if (!inner) return '';
  return `<svg class="ico ${cls}" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" focusable="false">${inner}</svg>`;
}
// HTML の data-ic="name" を アイコンに おきかえる
export function fillIcons(root = document) {
  root.querySelectorAll('[data-ic]').forEach(el => { el.innerHTML = ic(el.dataset.ic, +(el.dataset.s || 18)); });
}
