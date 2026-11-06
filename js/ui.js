// =========================================================
//  画面（描画・モーダル・ミニゲーム）
// =========================================================
import { CONFIG, FOODS, HATS, DECOR, FINDS, FORMS, SPECIES, TOOLS } from './config.js';
import { G, bus, rand, pick, dayKey, isNight, timeOfDay, TOD_LABEL, save, newState } from './state.js';
import { stageInfo, stageName, bondLevel, weatherToday, baseWeight, ageYears, lifespan, speciesOf, spName } from './sim.js';
import { dispatch, makeCard } from './actions.js';
import { squidSVG, eggSVG } from './art.js';
import { net, makeLink } from './net.js';
import { REL, REL_RULE, relOf, relStage, perOf, friendPer, compat, compatMark } from './social.js';
import { cardTraits } from './traits.js';
import { TRAITS, TKEYS, quirks, moodOf, MOODS, trend, favorite, disliked, itemName, GAME_NAMES } from './traits.js';
import { EVENT_NAMES } from './events.js';
import { kinOf, cardUid, MAX_EGGS } from './family.js';
import { writeLetter, writeDiary } from './story.js';
import { PERSONALITY } from './config.js';
import { ic, fillIcons } from './icons.js';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- feedback ---------------- */
let sayTimer;
export function say(text) {
  const el = $('say'); el.textContent = text; el.classList.add('show');
  clearTimeout(sayTimer); sayTimer = setTimeout(() => el.classList.remove('show'), 3200);
}
export function fx(ch, dx = 0) {
  const el = document.createElement('div'); el.className = 'fx'; el.innerHTML = ic(ch, 30);
  const p = G.state.stage === 'egg' ? 50 : G.state.pos;
  el.style.left = `calc(${p}% + ${dx}px)`; el.style.bottom = '52%';
  $('scene').appendChild(el); setTimeout(() => el.remove(), 1300);
}
function bounce() {
  const w = document.querySelector('#pet .squid-wrap'); if (!w) return;
  w.classList.remove('jump'); void w.offsetWidth; w.classList.add('jump');
  setTimeout(() => w.classList.remove('jump'), 1000);
}
let actx;
export function beep(f = 600, d = .08) {
  if (!G.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(.08, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, actx.currentTime + d);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + d);
  } catch (e) {}
}
bus.on('say', say); bus.on('fx', fx); bus.on('beep', beep); bus.on('bounce', bounce);
// ---- イカの のうりょく ----
bus.on('ink', () => {   // スミを はく
  const el = document.createElement('div'); el.className = 'inkcloud';
  el.style.left = (G.state.stage === 'egg' ? 50 : G.state.pos) + '%'; el.style.bottom = '18%';
  $('scene').appendChild(el); setTimeout(() => el.remove(), 2500); beep(180, .12);
});
const ability = (cls, ms) => { const w = document.querySelector('#pet .squid-wrap'); if (!w) return; w.classList.add(cls); setTimeout(() => w.classList.remove(cls), ms); };
bus.on('shine', (ms = 4000) => ability('shine', ms));   // ひかる
bus.on('camo', (ms = 6000) => ability('camo', ms));     // まわりの いろに とけこむ
bus.on('changed', () => { render(); save(); });
bus.on('hatched', live => setTimeout(askName, live ? 1200 : 0));
bus.on('travel', () => setTimeout(openTravel, 300));
bus.on('link', r => setTimeout(() => handleLink(r), 300));

/* ---------------- modal ---------------- */
let mh = {}, modalLock = false;
export function showModal(html, handlers = {}, lock = false) {
  $('modal').innerHTML = html; mh = handlers; modalLock = lock; $('modalBack').classList.add('show'); G.modalOpen = true;
}
export function closeModal() {
  $('modalBack').classList.remove('show'); mh = {}; modalLock = false; G.modalOpen = false;
  if (mq.length) setTimeout(mq.shift(), 180);
}
// できごとの おしらせは じゅんばんに だす
const mq = [];
function eventModal(fn) { if (G.modalOpen) mq.push(fn); else fn(); }
$('modal').addEventListener('click', ev => {
  const el = ev.target.closest('[data-a]'); if (!el || el.disabled) return;
  if (el.dataset.a === 'close') return closeModal();
  const h = mh[el.dataset.a]; if (h) h(el, ev);
});
$('modalBack').addEventListener('click', e => { if (e.target.id === 'modalBack' && !modalLock) closeModal(); });
const closeBtn = (t = 'とじる') => `<div class="row"><button class="btn gray" data-a="close">${t}</button></div>`;
const tabs = (list, cur) => `<div class="tabs">${list.map(([id, t]) => `<button class="tab ${id === cur ? 'on' : ''}" data-a="tab" data-t="${id}">${t}</button>`).join('')}</div>`;

// スマホなら 共有シート（LINE など）、パソコンなら コピー
async function shareLink(url, text) {
  if (navigator.share) {
    try { await navigator.share({ title: 'イカッチ', text, url }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  copyCode(url);
}
function copyCode(code) {
  const ta = $('codeOut');
  const fallback = () => { if (ta) { ta.focus(); ta.select(); } say('コードを えらんで コピーしてね'); };
  try { navigator.clipboard.writeText(code).then(() => { say('コピーしたよ！ ともだちに おくってね'); beep(880, .06); }, fallback); }
  catch (e) { fallback(); }
}

/* ---------------- ごはん ---------------- */
function openFood() {
  const S = G.state;
  showModal(`<h3>${ic('ebi', 20)} なにを あげる？</h3><div class="choices">${FOODS.map(f => {
    const n = f.price === 0 ? '∞' : (S.inv.food[f.id] || 0);
    return `<button class="choice" data-a="eat" data-id="${f.id}" ${n === 0 ? 'disabled' : ''}>
      <span class="ic">${ic(f.ic, 28)}</span><span class="grow">${f.name}<small>${f.desc}</small></span><span class="cnt">×${n}</span></button>`;
  }).join('')}</div><p class="note">たりない ごはんは ${ic('bag', 20)}ショップで かえるよ</p>${closeBtn('やめる')}`, {
    eat: el => { closeModal(); dispatch('feed', { id: el.dataset.id }); },
  });
}

/* ---------------- あそぶ ---------------- */
function openPlay() {
  if (G.state.energy < 15) { say('つかれてて あそべない…'); return; }
  showModal(`<h3>${ic('ball', 20)} なにで あそぶ？</h3><div class="choices">
    <button class="choice" data-a="g1"><span class="ic">${ic('eyes', 20)}</span><span class="grow">どっちむく？<small>イカが むく ほうを あてよう</small></span></button>
    <button class="choice" data-a="g2"><span class="ic">${ic('target', 20)}</span><span class="grow">スミでっぽう<small>タイミングよく スミを とばそう</small></span></button>
  </div>${closeBtn('やめる')}`, { g1: openGame, g2: openInk });
}

/* スミでっぽう：うごく ねらいが まとに かさなったら タップ */
function openInk() {
  let shot = 0, hits = 0, marks = [], raf = 0, x = 0, dir = 1, zone = 0;
  const newZone = () => { zone = 15 + Math.random() * 60; };
  const speed = () => 1.1 + shot * .35;
  function draw(msg) {
    showModal(`<h3>${ic('target', 20)} スミでっぽう</h3><p>${msg}</p>
      <div class="ink"><div class="zone" style="left:${zone}%"></div><div class="aim" id="aim"></div></div>
      <div class="score">${marks.join('') || '・・・'}</div>
      <div class="row"><button class="btn big" data-a="fire">${ic('squid', 20)} スミ！</button></div>`, { fire }, true);
  }
  function loop() {
    x += dir * speed(); if (x > 100) { x = 100; dir = -1; } if (x < 0) { x = 0; dir = 1; }
    const a = $('aim'); if (a) a.style.left = x + '%';
    raf = requestAnimationFrame(loop);
  }
  function fire() {
    cancelAnimationFrame(raf);
    const ok = x >= zone - 2 && x <= zone + 14;
    shot++; if (ok) hits++; marks.push(ok ? ic('target', 26) : ic('poof', 26)); beep(ok ? 900 : 300, .08);
    if (shot < 3) { newZone(); draw(ok ? 'めいちゅう！' : 'おしい！'); raf = requestAnimationFrame(loop); return; }
    const win = hits >= 2;
    dispatch('playResult', { win, game: 'ink' });
    showModal(`<h3>${win ? ic('party', 22) + ' めいちゅう！' : 'またあそぼ！'}</h3><div class="score">${marks.join('')}</div>
      <p>ごきげん +${win ? 25 : 10}${win ? ' ／ かいがら+3' : ''} ／ たいじゅう −1g</p>${closeBtn()}`);
  }
  newZone(); draw('ピンクの まとに かさなったら スミ！（3かい）'); raf = requestAnimationFrame(loop);
}

/* どっちむく？ */
function openGame() {
  let round = 0, wins = 0, marks = [];
  const draw = (msg = '') => showModal(`<h3>${ic('ball', 20)} どっちに むくかな？</h3>
    <p>${msg || 'イカが むく ほうを あてよう！（3かい）'}</p>
    <div class="score">${marks.join('') || '・・・'}</div>
    <div class="lr"><button class="btn" data-a="g" data-d="L">${ic('left', 20)} ひだり</button><button class="btn" data-a="g" data-d="R">みぎ ${ic('right', 20)}</button></div>`, { g: guess }, true);
  function guess(el) {
    const ans = Math.random() < .5 ? 'L' : 'R', ok = el.dataset.d === ans;
    if (ok) wins++; round++; marks.push(ok ? ic('circle', 26) : ic('cross', 26)); beep(ok ? 880 : 300, .08);
    const side = ans === 'L' ? 'ひだり' : 'みぎ';
    if (round < 3) return draw(ok ? `あたり！ ${side}を むいたよ` : `ざんねん、${side}でした`);
    const win = wins >= 2;
    dispatch('playResult', { win, game: 'docchi' });
    showModal(`<h3>${win ? ic('party', 22) + ' かち！' : 'またあそぼ！'}</h3><div class="score">${marks.join('')}</div>
      <p>ごきげん +${win ? 25 : 10}${win ? ' ／ かいがら+3' : ''}</p>${closeBtn()}`);
  }
  draw();
}

/* ---------------- すなほり ---------------- */
function openDig() {
  if (!dispatch('digStart')) return;
  const cells = Array(CONFIG.dig.spots).fill(null);
  let left = CONFIG.dig.tries, msg = 'すなの やまを えらんで ほってみよう！';
  const draw = () => showModal(`<h3>${ic('shovel', 20)} すなほり</h3><p>${msg}</p>
    <div class="dig">${cells.map((c, i) => c
      ? `<div class="spot done">${c}</div>`
      : `<button class="spot" data-a="dig" data-i="${i}" ${left ? '' : 'disabled'}></button>`).join('')}</div>
    <p class="note">のこり ${left}かい ／ てんき：${ic(weatherToday().ic, 16)}${weatherToday().name}${weatherToday().id === 'rain' || weatherToday().id === 'rainbow' ? ' レアが でやすい！' : ''}</p>
    ${left ? '' : closeBtn()}`, { dig }, left > 0);
  function dig(el) {
    const i = +el.dataset.i, r = dispatch('digSpot');
    left--;
    if (r.kind === 'shells') { cells[i] = ic('shell', 40); msg = `かいがらを ${r.n}こ みつけた！`; beep(760, .06); }
    else if (r.kind === 'find') {
      cells[i] = ic(r.f.ic, 40); beep(r.f.rare >= 3 ? 1200 : 900, .12);
      msg = `${r.treasure ? 'たからの ちずの ばしょだ！ ' : ''}「${r.f.name}」を みつけた！${'★'.repeat(r.f.rare)}${r.first ? '<br><b>ずかんに とうろく！ かいがら+2</b>' : ''}`;
    } else { cells[i] = ic('poof', 40); msg = r.text; beep(300, .06); }
    draw();
  }
  draw();
}

/* ---------------- ショップ ---------------- */
let shopTab = 'food';
function openShop(tab = shopTab) {
  shopTab = tab;
  const S = G.state;
  let body = '';
  if (tab === 'food') body = FOODS.filter(f => f.price > 0).map(f => `
    <div class="choice"><span class="ic">${ic(f.ic, 28)}</span><span class="grow">${f.name}<small>${f.desc}・もってる ${S.inv.food[f.id] || 0}</small></span>
    <button class="btn sm" data-a="buy" data-k="food" data-id="${f.id}" ${S.shells < f.price ? 'disabled' : ''}>${ic('shell', 20)}${f.price}</button></div>`).join('');
  if (tab === 'hat') body = HATS.map(h => {
    const own = S.inv.hats.includes(h.id), on = S.inv.hat === h.id;
    return `<div class="choice"><span class="ic">${ic(h.ic, 28)}</span><span class="grow">${h.name}<small>${own ? (on ? 'つけてる' : 'もってる') : 'きせかえ'}</small></span>
    ${own ? `<button class="btn sm ${on ? 'gray' : ''}" data-a="hat" data-id="${h.id}">${on ? 'はずす' : 'つける'}</button>`
          : `<button class="btn sm" data-a="buy" data-k="hat" data-id="${h.id}" ${S.shells < h.price ? 'disabled' : ''}>${ic('shell', 20)}${h.price}</button>`}</div>`;
  }).join('');
  if (tab === 'decor') body = DECOR.map(d => {
    const own = S.inv.decor.includes(d.id), on = S.inv.placed.includes(d.id);
    return `<div class="choice"><span class="ic">${ic(d.ic, 28)}</span><span class="grow">${d.name}<small>${own ? (on ? 'おいてある' : 'しまってある') : 'もようがえ'}</small></span>
    ${own ? `<button class="btn sm ${on ? 'gray' : ''}" data-a="decor" data-id="${d.id}">${on ? 'しまう' : 'おく'}</button>`
          : `<button class="btn sm" data-a="buy" data-k="decor" data-id="${d.id}" ${S.shells < d.price ? 'disabled' : ''}>${ic('shell', 20)}${d.price}</button>`}</div>`;
  }).join('');
  if (tab === 'tool') body = TOOLS.map(t => {
    const n = S.inv.tools[t.id] || 0;
    return `<div class="choice"><span class="ic">${ic(t.ic, 28)}</span><span class="grow">${t.name}<small>${t.desc}・もってる ${n}</small></span>
    <span class="btncol"><button class="btn sm" data-a="buy" data-k="tool" data-id="${t.id}" ${S.shells < t.price ? 'disabled' : ''}>${ic('shell', 20)}${t.price}</button>
    ${n ? `<button class="btn sm blue" data-a="use" data-id="${t.id}">つかう</button>` : ''}</span></div>`;
  }).join('');
  showModal(`<h3>${ic('bag', 20)} うみのショップ</h3><p>もってる かいがら：${ic('shell', 20)} ${S.shells}</p>
    ${tabs([['food', 'ごはん'], ['hat', 'きせかえ'], ['decor', 'もようがえ'], ['tool', 'どうぐ']], tab)}
    <div class="choices scroll">${body}</div>${closeBtn()}`, {
    tab: el => openShop(el.dataset.t),
    buy: el => { dispatch('buy', { kind: el.dataset.k, id: el.dataset.id }); openShop(); },
    hat: el => { dispatch('equipHat', { id: el.dataset.id }); openShop(); },
    decor: el => { dispatch('toggleDecor', { id: el.dataset.id }); openShop(); },
    use: el => useToolUI(el.dataset.id),
  });
}

// たまごポケットに たまごが あれば、どの たまごを むかえるか えらぶ
function chooseEgg(done, cancel) {
  const S = G.state, box = S.eggBox || [];
  if (!box.length) return done(null);
  showModal(`<h3>${ic('egg', 22)} どの たまごを むかえる？</h3>
    <div class="choices scroll">${box.map(e => `<button class="choice" data-a="pick" data-id="${e.id}"><span class="eggmini">${eggSVG(60, e.sp)}</span>
      <span class="grow">${esc(e.parents.map(p => p.name).join(' と '))}の たまご<small>${e.from === 'friend' ? esc(e.fromName || 'ともだち') + 'から あずかった' : 'ふたりの たまご'}</small></span></button>`).join('')}
      <button class="choice" data-a="pick" data-id=""><span class="eggmini">${eggSVG(30, 'momo')}</span><span class="grow">うみからの たまご<small>${S.stage === 'egg' ? 'あたらしい たまご' : esc(S.name || 'イカッチ') + 'の こども'}</small></span></button></div>
    ${cancel ? `<div class="row"><button class="btn gray" data-a="cancel">やめる</button></div>` : ''}`, {
    pick: el => done(el.dataset.id || null), cancel: () => cancel && cancel(),
  }, true);
}

function useToolUI(id) {
  const S = G.state;
  if (S.paused) { say('ストップちゅうは つかえないよ'); return; }
  if (id === 'sandglass') { closeModal(); dispatch('useTool', { id }); return; }
  if (id === 'newegg') {
    const nm = esc(S.name || 'イカッチ');
    showModal(`<h3>${ic('egg', 22)} あたらしい たまごを むかえる？</h3>
      ${S.stage === 'egg' ? '<p>いまの たまごと とりかえるよ</p>' : `<div class="zsq hero">${squidSVG(S.stage, 'sad', S.form, S.inv.hat, S.sp, S.sp2)}</div>
      <p>${nm}を うみに かえして、あたらしい たまごを むかえます。<br><b>${nm}には もう あえなく なるよ。</b></p>
      <p class="note">かいがら・もちもの・ともだち・ずかんは そのまま。${nm}は アルバムに のこるよ</p>`}
      <div class="row"><button class="btn gray" data-a="back">やめる</button><button class="btn" data-a="go">${ic('egg', 16)} むかえる</button></div>`, {
      back: () => openShop('tool'),
      go: () => chooseEgg(eggId => { closeModal(); dispatch('useTool', { id, eggId }); render(); save(); }, () => openShop('tool')),
    }, true);
  }
}

/* ---------------- ずかん ---------------- */
let zukanTab = 'finds';
function openZukan(tab = zukanTab) {
  zukanTab = tab;
  const S = G.state;
  let body;
  if (tab === 'finds') {
    const got = FINDS.filter(f => S.inv.finds[f.id]).length;
    body = `<p>あつめた かず ${got} / ${FINDS.length}</p><div class="zukan">${FINDS.map(f => {
      const n = S.inv.finds[f.id] || 0;
      return n ? `<div class="zk"><div class="zi">${ic(f.ic, 34)}</div><b>${f.name}</b><small>${f.text}</small>
          <small>${'★'.repeat(f.rare)} ・ ×${n}</small>
          ${n > 1 ? `<button class="btn xs" data-a="sell" data-id="${f.id}">うる ${ic('shell', 20)}${f.value}</button>` : ''}</div>`
        : `<div class="zk unk"><div class="zi">？</div><b>？？？</b><small>${'★'.repeat(f.rare)}</small></div>`;
    }).join('')}</div>`;
  } else {
    const seen = S.seenSp || [];
    body = `<p>たまごから どの イカが うまれるかは おたのしみ！ あつめた しゅるい ${seen.length} / ${Object.keys(SPECIES).length}</p>
      <div class="zukan">${Object.entries(SPECIES).map(([id, sp]) => seen.includes(id)
        ? `<div class="zk"><div class="zsq">${squidSVG('child', 'happy', null, null, id)}</div><b>${sp.name}${sp.rare ? ' <em class="rare">レア</em>' : ''}</b><small>${sp.desc}</small></div>`
        : `<div class="zk unk"><div class="zsq sil">${squidSVG('child', 'normal', null, null, id)}</div><b>？？？</b><small>${sp.rare ? 'めったに うまれない らしい…' : 'まだ であって いない'}</small></div>`).join('')}</div>
      <hr><p>おとなの タイプ</p><div class="choices">${Object.entries(FORMS).map(([id, f]) => (S.seenForm || []).includes(id) || S.form === id
        ? `<div class="choice ${S.form === id ? 'cur' : ''}"><span class="grow">${f.name}${S.form === id ? ' ← いま' : ''}</span></div>`
        : `<div class="choice unk"><span class="grow">？？？<small>どう そだつと なれるのかな</small></span></div>`).join('')}</div>`;
  }
  if (tab === 'per') {
    const seen = S.seenPer || [];
    body = `<p>であった せいかく ${seen.length} / ${Object.keys(PERSONALITY).length}</p><div class="choices">${Object.entries(PERSONALITY).map(([id, p]) => seen.includes(id)
      ? `<div class="choice ${S.per === id && perKnown(S) ? 'cur' : ''}"><span class="grow">${p.name}${S.per === id && perKnown(S) ? ' ← いま' : ''}<small>${p.desc}</small></span></div>`
      : `<div class="choice unk"><span class="grow">？？？<small>まだ であって いない せいかく</small></span></div>`).join('')}</div>`;
  }
  if (tab === 'event') {
    const seen = S.seenEv || {};
    body = `<p>いままでに であった ハプニング ${Object.keys(seen).length} / ${Object.keys(EVENT_NAMES).length}</p><div class="choices">${Object.entries(EVENT_NAMES).map(([id, n]) => seen[id]
      ? `<div class="choice"><span class="ic">${ic({ tako: 'tako', fisher: 'hook', shark: 'shark', star: 'sparkle', bottle: 'bottle', jelly: 'jelly', map: 'map', crabs: 'crab', diver: 'camera', lost: 'pearl', whale: 'whale', wave: 'wave' }[id], 28)}</span><span class="grow">${n}<small>${seen[id]}かい</small></span></div>`
      : `<div class="choice unk"><span class="ic">？</span><span class="grow">？？？<small>まだ であって いない</small></span></div>`).join('')}</div>`;
  }
  if (tab === 'album') {
    body = S.album.length ? `<div class="choices">${S.album.map(a => { const f = FORMS[a.form] || FORMS.surume, sp = speciesOf(a.sp); return `
      <button class="choice" data-a="alb" data-i="${S.album.indexOf(a)}"><span class="asq">${squidSVG('adult', 'happy', a.form, a.hat, a.sp || 'momo', a.sp2)}</span>
      <span class="grow">${a.gen}だいめ ${esc(a.name)}<small>${(f.prefix ? f.prefix + ' ' : '') + sp.name}・${a.release ? 'うみに かえした・' : ''}${a.days}にち いっしょに いた${a.letter ? '・てがみ あり' : ''}</small></span></button>`; }).join('')}</div>`
      : '<p>まだ たびだった イカは いないよ<br>おとなに なって しばらくすると、ひろい うみへ たびだつよ</p>';
  }
  showModal(`<h3>${ic('book', 20)} ずかん</h3>${tabs([['finds', 'もの'], ['forms', 'すがた'], ['per', 'せいかく'], ['event', 'できごと'], ['album', 'アルバム']], tab)}<div class="scroll">${body}</div>${closeBtn()}`, {
    tab: el => openZukan(el.dataset.t),
    alb: el => openAlbumEntry(+el.dataset.i),
    sell: el => { dispatch('sell', { id: el.dataset.id }); openZukan(); },
  });
}

function openAlbumEntry(i) {
  const a = G.state.album[i]; if (!a) return;
  const dkFmt = dk => { const [y, m, d] = dk.split('-'); return `${m}/${d}`; };
  showModal(`<h3>${ic('book', 20)} ${a.gen}だいめ ${esc(a.name)}</h3>
    <div class="zsq hero">${squidSVG('adult', 'happy', a.form, a.hat, a.sp || 'momo', a.sp2)}</div>
    <div class="scroll">
      <div class="check">
        <div><span>すがた</span><b>${esc(spName(a.sp || 'momo', a.sp2))}</b></div>
        ${a.per ? `<div><span>せいかく</span><b>${perOf(a.per).name}</b></div>` : ''}
        ${a.parents?.length ? `<div><span>おや</span><b>${esc(a.parents.map(p => p.name).join(' と '))}</b></div>` : ''}
        ${a.lovers?.length ? `<div><span>こいびと</span><b>${esc(a.lovers.join('・'))}</b></div>` : ''}
        ${a.kids?.length ? `<div><span>こども</span><b>${a.kids.length}にん</b></div>` : ''}
        <div><span>いっしょに いた</span><b>${a.days}にち</b></div>
      </div>
      ${a.letter ? `<h4>のこした てがみ</h4><div class="letter">${esc(a.letter).replace(/\n/g, '<br>')}</div>` : ''}
      ${a.diary?.length ? `<h4>にっき</h4>${a.diary.map(d => `<div class="dpage"><b>${dkFmt(d.dk)}</b><div>${esc(d.text).replace(/\n/g, '<br>')}</div></div>`).join('')}` : ''}
    </div>
    <div class="row"><button class="btn gray" data-a="back">もどる</button></div>`, { back: () => openZukan('album') });
}

/* ---------------- にっき ---------------- */
let diaryTab = 'squid';
function openDiary(tab = diaryTab) {
  diaryTab = tab;
  const S = G.state, fmt = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const dkFmt = dk => { const [y, m, d] = dk.split('-'); return `${m}がつ ${d}にち`; };
  const body = tab === 'squid'
    ? ((S.diary || []).length ? S.diary.map(d => `<div class="dpage"><b>${dkFmt(d.dk)}</b><div>${esc(d.text).replace(/\n/g, '<br>')}</div></div>`).join('')
      : `<p>${S.stage === 'egg' ? 'うまれたら にっきを かくよ' : 'にっきは 1にちの おわりに イカが じぶんで かくよ。<br>あしたに なったら よんでみてね'}</p>`)
    : `<div class="log">${S.log.length ? S.log.map(l => `<div><span>${fmt(l.t)}</span>${esc(l.text)}</div>`).join('') : '<p>まだ なにも ないよ</p>'}</div>`;
  showModal(`<h3>${ic('diary', 20)} にっき</h3>${tabs([['squid', `${esc(S.name || 'イカ')}の にっき`], ['log', 'きろく']], tab)}<div class="scroll">${body}</div>${closeBtn()}`, {
    tab: el => openDiary(el.dataset.t),
  });
}

/* ---------------- かんけい ---------------- */
const relHearts = r => { const n = REL[relStage(r)].hearts; return n ? ic('heart', 13).repeat(n) : ''; };
function relBadge(pid) {
  const r = relOf(pid), st = relStage(r);
  return `<span class="rel rel-${st}">${REL[st].name}${relHearts(r)}${r.kenka ? ' <em>けんかちゅう</em>' : ''}</span>`;
}
function nextInfo(r) {
  const st = relStage(r);
  const next = st === 'shiriai' ? ['ともだち', REL_RULE.tomodachi] : st === 'tomodachi' ? ['なかよし', REL_RULE.nakayoshi] : st === 'nakayoshi' ? ['しんゆう', REL_RULE.shinyu] : null;
  return next ? `つぎは「${next[0]}」` : st === 'shinyu' ? 'おとなに なると…？' : 'ラブラブ';
}

/* ---------------- ともだち（リンクで かんたん） ---------------- */
let friendTab = 'card', lastCode = '';
function needOwnerName(S) {
  const el = $('ownerName'); const nm = el ? el.value.trim() : S.player.name;
  if (nm !== S.player.name) dispatch('setPlayerName', { name: nm });
  if (!S.player.name) { say('さきに あなたの なまえを いれてね'); return false; }
  return true;
}
function openFriends(tab = friendTab) {
  friendTab = tab;
  const S = G.state;
  let body = '';
  if (tab === 'card') {
    body = `<p>ともだちリンクを LINE などで おくろう。<br>あいてが タップするだけで ともだちに なれるよ！</p>
      <label class="lbl">あなたの なまえ</label>
      <div class="inrow"><input id="ownerName" maxlength="10" value="${esc(S.player.name)}" placeholder="なまえ"><button class="btn sm" data-a="saveName">ほぞん</button></div>
      <div class="row"><button class="btn" data-a="shareCard">${ic('link', 20)} ともだちリンクを おくる</button></div>
      ${lastCode ? `<textarea id="codeOut" readonly>${esc(lastCode)}</textarea><div class="row"><button class="btn sm" data-a="copy">${ic('clip', 20)} コピー</button></div>` : ''}
      <p class="note">イカが せいちょうしたら、もういちど おくると すがたが かわるよ<br>プレイヤーID：${S.player.id}</p>`;
  }
  if (tab === 'friends') {
    body = `<p>もらった リンクは タップするだけで OK。<br>うまく いかないときは ここに はりつけてね</p>
      <textarea id="codeIn" placeholder="ともだちリンク または IKA1. コード"></textarea>
      <div class="row"><button class="btn" data-a="addF">${ic('house', 20)} あそびに きてもらう</button></div>
      <div class="choices">${S.friends.length ? S.friends.map(f => `
        <div class="choice"><span class="ic">${ic('squid', 20)}</span><span class="grow">${esc(f.name)} ${relBadge(f.pid)}<small>${esc(f.owner || 'だれか')}の ${esc(f.title || '')}${S.friendPlay[f.pid] === dayKey() ? ' ・きょう あそんだ' : ''}</small></span>
        <button class="btn sm" data-a="inv" data-pid="${f.pid}">よぶ</button><button class="btn sm gray" data-a="rmF" data-pid="${f.pid}">×</button></div>`).join('')
        : '<p class="note">まだ ともだちは いないよ</p>'}</div>`;
  }
  if (tab === 'gift') {
    const items = [
      ...FOODS.filter(f => f.price > 0 && S.inv.food[f.id] > 0).map(f => ({ kind: 'food', id: f.id, ic: f.ic, name: f.name, n: S.inv.food[f.id] })),
      ...FINDS.filter(f => S.inv.finds[f.id] > 1).map(f => ({ kind: 'find', id: f.id, ic: f.ic, name: f.name, n: S.inv.finds[f.id] - 1 })),
    ];
    body = `<p>もちものを つつんで リンクで おくれるよ</p>
      <select id="giftItem">${items.length ? items.map(i => `<option value="${i.kind}:${i.id}">${i.name}（${i.n}）</option>`).join('') : '<option value="">おくれる ものが ないよ</option>'}</select>
      <select id="giftTo"><option value="">だれでも うけとれる</option>${S.friends.map(f => `<option value="${f.pid}">${esc(f.owner || f.name)} あて</option>`).join('')}</select>
      <div class="row"><button class="btn" data-a="mkGift" ${items.length ? '' : 'disabled'}>${ic('gift', 20)} つつんで おくる</button></div>
      ${lastCode ? `<textarea id="codeOut" readonly>${esc(lastCode)}</textarea><div class="row"><button class="btn sm" data-a="copy">${ic('clip', 20)} コピー</button></div>` : ''}
      <hr><p>もらった プレゼントリンクは タップするだけで とどくよ。<br>うまく いかないときは ここに はりつけてね</p>
      <textarea id="giftIn" placeholder="プレゼントリンク または GIFT1. コード"></textarea>
      <div class="row"><button class="btn" data-a="recv">${ic('box', 20)} うけとる</button></div>`;
  }
  showModal(`<h3>${ic('friends', 20)} ともだち</h3>${tabs([['card', 'リンク'], ['friends', 'ともだち'], ['gift', 'プレゼント']], tab)}<div class="scroll">${body}</div>${closeBtn()}`, {
    tab: el => { lastCode = ''; openFriends(el.dataset.t); },
    saveName: () => { dispatch('setPlayerName', { name: $('ownerName').value.trim() }); say('なまえを ほぞんしたよ'); openFriends(); },
    shareCard: async () => {
      if (!needOwnerName(S)) return;
      lastCode = makeLink('f', makeCard()); openFriends();
      await shareLink(lastCode, `${S.player.name}の イカ「${S.name || 'イカッチ'}」と ともだちに なろう！ タップしてね`);
    },
    copy: () => copyCode(lastCode),
    addF: async () => {
      try { const card = await net.lookupFriend($('codeIn').value); acceptFriend(card); }
      catch (e) { say(e.message); beep(260, .1); }
    },
    inv: el => { dispatch('inviteFriend', { pid: el.dataset.pid }); closeModal(); },
    rmF: el => { dispatch('removeFriend', { pid: el.dataset.pid }); openFriends(); },
    mkGift: async () => {
      const [kind, id] = $('giftItem').value.split(':'); if (!id) return;
      const gift = dispatch('makeGift', { kind, id, to: $('giftTo').value });
      if (!gift) return;
      lastCode = makeLink('g', gift); save(); openFriends('gift');
      const item = (kind === 'food' ? FOODS : FINDS).find(x => x.id === id);
      await shareLink(lastCode, `イカッチの プレゼントだよ（${item.name}）タップして うけとってね`);
    },
    recv: async () => {
      try { acceptGift(await net.receiveGift($('giftIn').value)); }
      catch (e) { say(e.message); beep(260, .1); }
    },
  });
}

function acceptFriend(card) {
  const S = G.state;
  const isNew = !S.friends.some(f => f.pid === card.pid);
  if (!dispatch('addFriend', { card })) return;
  dispatch('inviteFriend', { pid: card.pid });
  showModal(`<h3>${ic('party', 22)} ${isNew ? 'ともだちに なった！' : 'ともだちが きた！'}</h3>
    <p>${esc(card.owner || 'ともだち')}の「${esc(card.name)}」が あそびに きたよ</p>
    <p>あなたの リンクも おくりかえす？</p>
    <div class="row"><button class="btn" data-a="back">${ic('link', 20)} おくりかえす</button></div>${closeBtn('あとで')}`, {
    back: () => openFriends('card'),
  });
}
function acceptGift(gift) {
  const r = dispatch('receiveGift', { gift });
  if (r.ok) { closeModal(); say(`${gift.fromName || 'ともだち'}から ${r.item.name} が とどいた！`); }
  else { say(r.msg); beep(260, .1); }
}

// URL の #f= #g= #m= で ひらかれたとき
export function handleLink(r) {
  if (r.kind === 'f') {
    if (!r.data || !r.data.pid) return say('リンクが よめなかった');
    acceptFriend(r.data);
  }
  if (r.kind === 'g') acceptGift(r.data);
  if (r.kind === 'e') {
    const res = dispatch('receiveEgg', { data: r.data });
    if (!res.ok) { say(res.msg); beep(260, .1); return; }
    const e = res.egg;
    showModal(`<h3>${ic('egg', 22)} たまごを あずかった！</h3>
      <div class="pair">${e.parents.map(p => squidSVG('adult', 'happy', null, null, p.sp || 'momo', p.sp2)).join('')}</div>
      <p>${esc(r.data.fromName || 'ともだち')}から、${esc(e.parents.map(p => p.name).join(' と '))}の たまごが とどいたよ。</p>
      <p class="note">「かけいず」の たまごポケットに しまったよ。<br>いまの イカが たびだったら、この たまごを むかえられるよ</p>${closeBtn()}`);
  }
  if (r.kind === 'm') {
    const d = r.data;
    showModal(`<h3>${ic('box', 20)} ひっこし</h3><p>「${esc(d.name || 'たまご')}」（${d.gen || 1}だいめ）の データを よみこみます。<br><b>いまの この ばしょの データは きえます。</b></p>
      <div class="row"><button class="btn gray" data-a="close">やめる</button><button class="btn" data-a="ok">ひっこす</button></div>`, {
      ok: () => { dispatch('importSave', { data: d }); closeModal(); say('ひっこし かんりょう！ また よろしくね'); },
    }, true);
  }
}

/* ---------------- ひっこし（きしゅへんこう） ---------------- */
function openMove() {
  const S = G.state;
  showModal(`<h3>${ic('box', 20)} ひっこし</h3>
    <p>スマホを かえるときは、ひっこしリンクを じぶんに おくって、あたらしい スマホで ひらいてね。<br>アカウントは いらないよ。</p>
    <div class="row"><button class="btn" data-a="mk">${ic('box', 20)} ひっこしリンクを つくる</button></div>
    ${lastCode ? `<textarea id="codeOut" readonly>${esc(lastCode)}</textarea><div class="row"><button class="btn sm" data-a="copy">${ic('clip', 20)} コピー</button></div>` : ''}
    <p class="note">${ic('alert', 20)} このリンクを ひとに わたすと、あなたの イカを コピーされちゃうよ</p>${closeBtn()}`, {
    mk: async () => {
      const data = { ...S, log: S.log.slice(0, 10) };
      lastCode = makeLink('m', data); openMove();
      await shareLink(lastCode, 'イカッチの ひっこしリンク（じぶん用）');
    },
    copy: () => copyCode(lastCode),
  });
}

/* ---------------- しらべる（たまごっちの ステータス画面） ---------------- */
// せいかくは あかちゃんの うちは まだ わからない
const perKnown = S => S.stage !== 'baby' && S.stage !== 'egg';
const perName = S => perKnown(S) ? perOf(S.per).name : 'まだ わからない';

function openCheck() {
  const S = G.state, base = baseWeight(S.stage), over = S.weight - base;
  const hearts = v => ic('heart', 16).repeat(Math.round(v / 25)) + ic('heartEmpty', 16).repeat(4 - Math.round(v / 25));
  showModal(`<h3>${ic('search', 20)} しらべる</h3>
    <div class="scroll"><div class="check">
      <div><span>なまえ</span><b>${esc(S.name || 'イカッチ')}（${S.gen}だいめ）</b></div>
      <div><span>しゅるい</span><b>${spName(S.sp, S.sp2)}</b></div>
      <div class="perbox"><span>せいかく</span><b>${perName(S)}</b>${perKnown(S) ? `<small>${perOf(S.per).desc}</small>
        <div class="tags">${quirks(S.tr).map(q => `<em class="qtag">${q.name}</em>`).join('')}</div>` : '<small>どんな こに なるかな？</small>'}
        <small>いまの きぶん：<b>${MOODS[moodOf(S)] || ''}</b></small>
        <button class="btn sm" data-a="mind">${ic('heart', 16)} こころを のぞく</button></div>
      <div><span>すがた</span><b>${stageName(S)}</b></div>
      <div><span>ねんれい</span><b>${ageYears(S)}さい</b></div>
      <div><span>たいじゅう</span><b>${S.weight.toFixed(0)}g ${over > 10 ? '<em>ふとりぎみ</em>' : ''}</b></div>
      <div><span>おなか</span><b>${hearts(S.hunger)}</b></div>
      <div><span>ごきげん</span><b>${hearts(S.happy)}</b></div>
      <div><span>しつけ</span><b><span class="bar sm"><i style="width:${S.discipline}%;background:var(--accent)"></i></span></b></div>
      <div><span>なかよし</span><b>Lv.${bondLevel()}</b></div>
    </div></div>${closeBtn()}`, { mind: openMind });
}

/* ---------------- こころ（すうじは みせない。ようすから かんじとる） ---------------- */
const TREND_WORDS = {
  kind: ['やさしく なってきた', 'ちょっと つめたく なった'], genki: ['げんきが でてきた', 'おとなしく なってきた'],
  sunao: ['すなおに なってきた', 'いうことを きかなく なってきた'], yuki: ['ゆうきが でてきた', 'こわがりに なってきた'],
  kouki: ['いろんな ことに きょうみしんしん', 'あまり きょうみを しめさなく なった'], amae: ['あまえんぼうに なってきた', 'ひとりでも へいきに なってきた'],
  kui: ['よく たべるように なった', 'しょくよくが へってきた'], kirei: ['きれいずきに なってきた', 'ちらかしても へいきに なってきた'],
};
function openMind() {
  const S = G.state;
  const known = perKnown(S);
  const sense = TKEYS.map(k => ({ k, d: trend(k) })).filter(x => Math.abs(x.d) >= 6).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 2);
  const likeRow = (cat, label) => {
    const f = favorite(cat), h = disliked(cat);
    return `<div><span>${label}</span><b>${f ? `<em class="qtag up">すき：${itemName(cat, f)}</em>` : ''}${h ? `<em class="qtag dn">にがて：${itemName(cat, h)}</em>` : ''}${!f && !h ? '<small>？？？</small>' : ''}</b></div>`;
  };
  const best = [...S.friends].sort((a, b) => (S.rel?.[b.pid]?.pt || 0) - (S.rel?.[a.pid]?.pt || 0))[0];
  const fmt = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}`; };
  showModal(`<h3>${ic('heart', 22)} ${esc(S.name || 'イカッチ')}の こころ</h3>
    <div class="scroll">
      <div class="zsq hero">${squidSVG(S.stage, moodOf(S) === 'ukiuki' ? 'happy' : 'normal', S.form, S.inv.hat, S.sp, S.sp2)}</div>
      <div class="mindtop"><b class="ptype">${perName(S)}</b>${known ? `<small>${perOf(S.per).desc}</small>
        <div class="tags">${quirks(S.tr).map(q => `<em class="qtag">${q.name}</em>`).join('')}</div>` : '<small>まだ ちいさくて どんな こか わからない</small>'}</div>
      ${known && sense.length ? `<p class="feel">${sense.map(x => `さいきん、${TREND_WORDS[x.k][x.d > 0 ? 0 : 1]} きがする…`).join('<br>')}</p>` : ''}
      <div class="check">
        <div><span>いまの きぶん</span><b>${MOODS[moodOf(S)] || ''}</b></div>
        ${likeRow('food', 'たべもの')}${likeRow('game', 'あそび')}${likeRow('hat', 'ぼうし')}
        ${best ? `<div><span>いちばんの ともだち</span><b>${esc(best.name)}</b></div>` : ''}
        ${S.parent ? `<div><span>おや</span><b>${esc(S.parent.name)}</b></div>` : ''}
      </div>
      <h4>おもいで</h4>
      <div class="log mini mem">${(S.mem || []).length ? S.mem.slice(0, 10).map(m => `<div><span>${fmt(m.t)}</span>${esc(m.text)}</div>`).join('') : '<div>まだ おもいでは ないよ</div>'}</div>
      <p class="note">こころの なかは だれにも わからない。<br>ようすを よく みて、かんじとってね</p>
    </div>${closeBtn()}`);
}
bus.on('perreveal', () => setTimeout(() => eventModal(() => {
  const S = G.state, p = perOf(S.per);
  showModal(`<h3>${ic('sparkle', 22)} どんな こか わかってきた！</h3>
    <div class="zsq hero">${squidSVG(S.stage, 'happy', S.form, S.inv.hat, S.sp, S.sp2)}</div>
    <p>${esc(S.name || 'イカッチ')}は…<br><b class="big">${p.name}</b> みたい！</p><p class="note">${p.desc}</p>${closeBtn()}`);
  fx('sparkle'); beep(990, .1);
}), 200));
bus.on('perchange', d => setTimeout(() => eventModal(() => {
  const S = G.state;
  if (!perKnown(S)) return;
  showModal(`<h3>${ic('sparkle', 22)} せいかくが かわった！</h3>
    <div class="zsq hero">${squidSVG(S.stage === 'egg' ? 'baby' : S.stage, 'happy', S.form, S.inv.hat, S.sp, S.sp2)}</div>
    <p>さいきんの ${esc(S.name || 'イカッチ')}は…<br><b>${PERSONALITY[d.from]?.name || ''}</b> → <b class="big">${PERSONALITY[d.to].name}</b></p>
    <p class="note">${PERSONALITY[d.to].desc}</p>${closeBtn()}`);
  fx('sparkle'); beep(990, .1);
}), 400));

/* ---------------- ふたりの たまご ---------------- */
bus.on('coupleEgg', d => setTimeout(() => eventModal(() => {
  const S = G.state, v = G.visitor;
  showModal(`<h3>${ic('egg', 22)} ふたりの たまごが うまれた！</h3>
    <div class="pair love">${squidSVG(S.stage, 'happy', S.form, S.inv.hat, S.sp, S.sp2)}<span class="eggmini big">${eggSVG(70, d.egg.sp)}</span>${v ? squidSVG(v.card.stage, 'happy', v.card.form, v.card.hat, v.card.sp || 'momo', v.card.sp2) : ''}</div>
    <p>${esc(S.name || 'イカッチ')}と ${esc(d.name)}の あいだに、ちいさな たまごが…！</p>
    <p class="note">たまごは「かけいず」の たまごポケットに しまったよ。<br>つぎの せだいで むかえるか、${esc(d.name)}の おうちに たくそう</p>
    <div class="row"><button class="btn gray" data-a="close">とじる</button><button class="btn" data-a="tree">${ic('tree', 18)} かけいずを みる</button></div>`, { tree: openTree });
  fx('heart'); fx('egg', 30); beep(880, .1); setTimeout(() => beep(1180, .14), 160);
}), 300));

/* ---------------- かけいず ---------------- */
const DEPTH_NAME = { 1: 'おや', 2: 'おじいちゃん・おばあちゃん', 3: 'ひいおじいちゃん・ひいおばあちゃん', 4: 'ごせんぞさま' };
function node(p, label, cls = '') {
  return `<div class="tnode ${cls}"><div class="tsq">${p.stage === 'egg' ? eggSVG(50, p.sp) : squidSVG(p.stage || 'adult', 'happy', p.form || null, p.hat || null, p.sp || 'momo', p.sp2)}</div><b>${esc(p.name || '？')}</b>${label ? `<small>${label}</small>` : ''}</div>`;
}
function openTree() {
  const S = G.state;
  const byDepth = {};
  for (const [u, d] of Object.entries(S.anc || {})) (byDepth[d] ||= []).push({ ...(S.names?.[u] || { name: '？' }), uid: u });
  const depths = Object.keys(byDepth).map(Number).sort((a, b) => b - a);
  const lover = S.friends.find(f => S.rel?.[f.pid]?.lover);
  const kin = S.friends.map(f => ({ f, k: kinOf(f) })).filter(x => x.k);
  const box = S.eggBox || [];
  showModal(`<h3>${ic('tree', 22)} かけいず</h3>
    <div class="scroll tree">
      ${depths.map(d => `<div class="tgen"><span class="tlbl">${DEPTH_NAME[d] || 'ごせんぞさま'}</span><div class="trow">${byDepth[d].map(p => node(p, p.owner && p.owner !== S.player.name ? esc(p.owner) + 'の いえ' : '')).join('')}</div></div><div class="tline"></div>`).join('')}
      <div class="tgen me"><span class="tlbl">いま</span><div class="trow">
        ${node({ name: S.name || (S.stage === 'egg' ? 'たまご' : 'イカッチ'), stage: S.stage, form: S.form, hat: S.inv.hat, sp: S.sp, sp2: S.sp2 }, `${S.gen}だいめ`, 'self')}
        ${lover ? `<span class="tlove">${ic('heart', 20)}</span>${node({ ...lover, stage: lover.stage }, 'こいびと')}` : ''}
      </div></div>
      ${(S.kids || []).length ? `<div class="tline"></div><div class="tgen"><span class="tlbl">こども</span><div class="trow">${S.kids.map(k => node({ name: k.given ? 'たくした たまご' : 'たまご', stage: 'egg', sp: k.sp }, k.given ? esc(k.with) + 'の いえへ' : 'ポケットに')).join('')}</div></div>` : ''}
      <h4>たまごポケット（${box.length} / ${MAX_EGGS}）</h4>
      ${box.length ? `<div class="choices">${box.map(e => `<div class="choice"><span class="eggmini">${eggSVG(60, e.sp)}</span><span class="grow">${esc(e.parents.map(p => p.name).join(' と '))}の たまご<small>${e.from === 'friend' ? esc(e.fromName || 'ともだち') + 'から あずかった' : 'つぎの せだいで むかえられるよ'}</small></span>
        ${e.from === 'mine' ? `<button class="btn sm" data-a="give" data-id="${e.id}">${ic('link', 14)} たくす</button>` : ''}</div>`).join('')}</div>`
        : '<p class="note">こいびとどうしに なると、まれに ふたりの たまごが うまれるよ</p>'}
      <h4>しんせき</h4>
      ${kin.length ? `<div class="choices">${kin.map(({ f, k }) => `<div class="choice"><span class="asq">${squidSVG(f.stage === 'egg' ? 'baby' : f.stage, 'happy', f.form, f.hat, f.sp || 'momo', f.sp2)}</span><span class="grow">${esc(f.name)}<small>${esc(f.owner || '')}の いえの ${k}</small></span></div>`).join('')}</div>`
        : '<p class="note">ともだちの いえに しんせきが いると、ここに でるよ</p>'}
      ${S.album.length ? `<h4>れきだいの イカ</h4><div class="trow wrap">${S.album.slice(0, 12).map(a => node({ ...a, stage: 'adult' }, `${a.gen}だいめ${a.lovers?.length ? '・こいびと ' + esc(a.lovers[0]) : ''}`)).join('')}</div>` : ''}
    </div>${closeBtn()}`, {
    give: async el => {
      const pkg = dispatch('giveEgg', { id: el.dataset.id }); if (!pkg) return;
      const url = makeLink('e', pkg); save();
      showModal(`<h3>${ic('egg', 22)} たまごを たくす</h3><p>この リンクを ともだちに おくってね。<br>ともだちの いえで そだてて もらえるよ</p>
        <textarea id="codeOut" readonly>${esc(url)}</textarea><div class="row"><button class="btn sm" data-a="copy">${ic('clip', 16)} コピー</button></div>${closeBtn()}`, { copy: () => copyCode(url) });
      await shareLink(url, `${pkg.egg.parents.map(p => p.name).join('と')}の たまごだよ。そだててね`);
    },
  });
}

/* ---------------- うみの ハプニング ---------------- */
bus.on('happening', ev => setTimeout(() => eventModal(() => {
  const S = G.state;
  $('actor').className = 'actor a-' + ev.actor; $('actor').innerHTML = ic(ev.actor, 64);
  let done = false;
  const finish = helped => {
    if (done) return; done = true;
    clearTimeout(timer);
    const r = ev.resolve(helped);
    showModal(`<h3>${ic(r.icon, 22)} ${r.good ? 'よかった！' : 'あらら…'}</h3>
      <div class="pair">${squidSVG(S.stage, r.good ? 'happy' : 'sad', S.form, S.inv.hat, S.sp, S.sp2)}<span class="evic">${ic(ev.actor, 56)}</span></div>
      <p>${esc(r.text).replace(/\n/g, '<br>')}</p>${closeBtn()}`);
    $('actor').className = 'actor'; $('actor').innerHTML = '';
    beep(r.good ? 880 : 260, .12); render(); save();
  };
  showModal(`<h3>${ic(ev.actor, 24)} ${esc(ev.title)}</h3>
    <div class="pair">${squidSVG(S.stage, 'normal', S.form, S.inv.hat, S.sp, S.sp2)}<span class="evic bob">${ic(ev.actor, 56)}</span></div>
    <p>${esc(ev.intro)}</p>
    ${ev.help ? `<div class="row"><button class="btn big" data-a="help">${esc(ev.help.label)}</button></div><div class="qte"><i style="animation-duration:${ev.help.ms}ms"></i></div>
`
    : `<p class="note">${esc(S.name || 'イカッチ')}は どうするかな…</p>`}`, { help: () => finish(true) }, true);
  beep(660, .08); setTimeout(() => beep(520, .08), 120);
  const timer = setTimeout(() => finish(false), ev.help ? ev.help.ms : 2600);
}), 200));

/* ---------------- たびだち（せだいこうたい） ---------------- */
function openTravel() {
  const S = G.state;
  if (!S.travelReady) return;
  const letter = writeLetter();
  showModal(`<h3>${ic('wave', 20)} たびだちの とき</h3>
    <div class="zsq hero">${squidSVG(S.stage, 'happy', S.form, S.inv.hat, S.sp, S.sp2)}</div>
    <p>りっぱな ${stageName(S)}に そだった「${esc(S.name || 'イカッチ')}」は、ひろい うみへ たびだつ ときが きたみたい。</p>
    <p>${esc(S.name || 'イカッチ')}から てがみが あるよ</p>
    <div class="row"><button class="btn" data-a="read">${ic('letter', 18)} てがみを よむ</button></div>`, {
    read: () => showModal(`<h3>${ic('letter', 22)} てがみ</h3><div class="scroll"><div class="letter">${esc(letter).replace(/\n/g, '<br>')}</div></div>
      <p class="note">てがみは アルバムから いつでも よめるよ。もちもの・かいがら・ともだちは そのまま</p>
      <div class="row"><button class="btn" data-a="go">${ic('hand', 20)} みおくる</button></div>`, {
      go: () => chooseEgg(eggId => {
        const nm = S.name; dispatch('travel', { eggId, letter }); closeModal();
        say(`${nm || 'イカッチ'}、げんきでね！ ${eggId ? 'ふたりの たまごを むかえたよ' : 'つぎの たまごが とどいたよ'}`); fx('egg'); render(); save();
      }),
    }, true),
  }, true);
}

function openVisitor() {
  const v = G.visitor; if (!v) return;
  const S = G.state, pid = v.card.pid, r = relOf(pid), st = relStage(r);
  const me = S.name || 'イカッチ', you = v.card.name;
  const recent = S.log.filter(l => l.text.includes(you)).slice(0, 4);
  const doing = r.kenka ? 'けんかちゅう… おたがい そっぽを むいている'
    : S.sleeping ? `${me}は ねている`
    : S.friendPlay[pid] === dayKey() ? 'きょうは もう いっぱい あそんだ。のんびり ちゅう'
    : r.lover ? 'ふたりで よりそって いる' : 'なにして あそぶか かんがえてる みたい';
  showModal(`<h3>${ic('squid', 20)} ${esc(you)}</h3>
    <p>${esc(v.card.owner || 'ともだち')}の ${esc(v.card.title || '')}</p>
    <div class="pair">${squidSVG(S.stage, r.kenka ? 'sad' : 'happy', S.form, S.inv.hat, S.sp, S.sp2)}${squidSVG(v.card.stage, r.kenka ? 'sad' : 'happy', v.card.form, v.card.hat, v.card.sp || 'momo', v.card.sp2)}</div>
    <div class="pers"><span>${esc(me)}<b>${perName(S)}</b></span><span>${esc(you)}<b>${v.card.stage === 'baby' ? 'まだ わからない' : perOf(friendPer(v.card)).name}</b></span></div>
    <div class="relbox">${relBadge(pid)}</div>
    <p class="${r.kenka ? 'kenka' : ''}">いま：${doing}</p>
    ${recent.length ? `<div class="log mini">${recent.map(l => `<div>${esc(l.text)}</div>`).join('')}</div>` : ''}
    <div class="row"><button class="btn gray" data-a="bye">${ic('hand', 18)} かえってもらう</button><button class="btn" data-a="close">みまもる</button></div>`, {
    bye: () => { closeModal(); dispatch('sendHome'); },
  });
}

// ---- かんけいの イベント（えらぶ ボタンは なし。けっかを みまもるだけ）----
const pairOf = (m1, m2) => { const S = G.state, v = G.visitor; return `<div class="pair">${squidSVG(S.stage, m1, S.form, S.inv.hat, S.sp, S.sp2)}${v ? squidSVG(v.card.stage, m2, v.card.form, v.card.hat, v.card.sp || 'momo', v.card.sp2) : ''}</div>`; };
bus.on('kenka', d => setTimeout(() => eventModal(() => {
  showModal(`<h3>${ic('angry', 22)} けんかに なっちゃった！</h3>
    <p>${esc(G.state.name || 'イカッチ')}と ${esc(d.name)}は ${esc(d.why)}…</p>${pairOf('sad', 'sad')}
    <p>ふたりは どうするかな…？ みまもろう</p>
${closeBtn('みまもる')}`);
  beep(220, .2); setTimeout(() => beep(180, .25), 200);
}), 200));
bus.on('makeup', d => setTimeout(() => eventModal(() => {
  showModal(`<h3>${ic('heart', 22)} なかなおり できた！</h3>${pairOf('happy', 'happy')}
    <p>${esc(d.from)}「…さっきは ごめんね」<br>${esc(d.to)}「ううん、こっちこそ ごめん！」</p>
${closeBtn()}`);
  fx('heart'); fx('sparkle', 30); beep(880, .1);
}), 200));
bus.on('confess', d => setTimeout(() => eventModal(() => {
  showModal(`<h3>${ic('heart', 22)} ドキドキ…</h3>${pairOf('normal', 'normal')}
    <p>${esc(d.from)}が もじもじ しながら…<br>「あのね… ずっと いっしょに いたいな。<br>こいびとに なってくれる？」</p><p class="note">${esc(d.to)}の こたえは…</p>`, {}, true);
  setTimeout(() => {
    if (d.ok) {
      showModal(`<h3>${ic('heart', 22)} こいびとに なった！</h3><div class="love">${pairOf('happy', 'happy')}</div>
        <p>${esc(d.to)}「…うん！ わたしも ずっと そう おもってた」</p><p class="note">ふたりは ラブラブ！ これからも なかよくね</p>${closeBtn()}`);
      fx('heart'); fx('heart', 34); fx('sparkle', -30); beep(880, .1); setTimeout(() => beep(1180, .14), 140);
    } else {
      showModal(`<h3>${ic('sweat', 22)} ざんねん…</h3>${pairOf('sad', 'normal')}
        <p>${esc(d.to)}「ごめんね… まだ しんゆうで いたいな」</p>${closeBtn()}`);
      beep(300, .15);
    }
    render(); save();
  }, 2600);
}), 200));
bus.on('relchange', d => {
  if (!d.up) return;
  const msg = { tomodachi: 'ともだちに なった！', nakayoshi: 'なかよしに なった！', shinyu: 'しんゆうに なった！', koibito: 'こいびとに なった！' }[d.after];
  if (!msg) return;
  setTimeout(() => eventModal(() => {
    const v = G.visitor, S = G.state;
    showModal(`<h3>${ic(d.after === 'koibito' ? 'heart' : 'party', 22)} ${esc(d.name)}と ${msg}</h3>
      ${v ? `<div class="pair ${d.after === 'koibito' ? 'love' : ''}">${squidSVG(S.stage, 'happy', S.form, S.inv.hat, S.sp, S.sp2)}${squidSVG(v.card.stage, 'happy', v.card.form, v.card.hat, v.card.sp || 'momo', v.card.sp2)}</div>` : ''}
      <p>${{ tomodachi: 'いっしょに あそぶのが たのしく なってきた！', nakayoshi: 'ないしょの はなしも できる なかに なったよ', shinyu: 'なにが あっても みかたで いてくれる、たいせつな ともだち！', koibito: 'ふたりは ラブラブ！ これからも なかよくね' }[d.after]}</p>${closeBtn()}`);
    fx('heart'); fx(d.after === 'koibito' ? 'heart' : 'sparkle', 34); beep(880, .1); setTimeout(() => beep(1180, .14), 140);
  }), 250);
});


/* ---------------- なまえ・リセット ---------------- */
export function askName() {
  const S = G.state;
  if (S.stage === 'egg' || S.name) return;
  showModal(`<h3>${ic('chick', 20)} ${spName(S.sp, S.sp2)}が うまれたよ！</h3>${speciesOf(S.sp).rare ? '<p><b class="rare">まぼろしの レアイカ！</b></p>' : ''}<div class="zsq hero">${squidSVG('baby', 'happy', null, null, S.sp, S.sp2)}</div><p>${S.sp2 && S.sp2 !== S.sp ? `${esc((S.parents || []).map(p => p.name).join(' と '))}の こども。ふたりの いいところを まぜた すがた！` : speciesOf(S.sp).desc}<br>${S.parent ? `おやの ${esc(S.parent.name)}に にてるかな？<br>` : ''}どんな こに そだつかな？<br>なまえを つけてあげよう</p>
    <input id="nameInput" maxlength="8" placeholder="イカッチ">
    <div class="row"><button class="btn" data-a="ok">けってい</button></div>`, { ok }, true);
  function ok() { S.name = ($('nameInput').value.trim() || 'イカッチ'); closeModal(); say(`ぼく ${S.name}！ よろしくね`); render(); save(); }
  $('nameInput').onkeydown = e => { if (e.key === 'Enter') ok(); };
  setTimeout(() => { try { $('nameInput').focus(); } catch (e) {} }, 50);
}
$('moveBtn').onclick = () => openMove();
$('stopBtn').onclick = () => {
  if (G.state.paused) return dispatch('resume');
  showModal(`<h3>${ic('pause', 22)} ストップする？</h3>
    <p>がっこうや りょこうで おせわが できない ときに つかってね。</p>
    <div class="check">
      <div><span>おなか・トイレ・げんき</span><b>へらない</b></div>
      <div><span>せいちょう・じゅみょう</span><b>とまる</b></div>
      <div><span>おせわミス</span><b>つかない</b></div>
      <div><span>アプリを とじている あいだ</span><b>とまったまま</b></div>
    </div>
    <p class="note">ストップちゅうは おせわも できないよ。「さいかいする」で もとに もどるよ</p>
    <div class="row"><button class="btn gray" data-a="close">やめる</button><button class="btn" data-a="stop">${ic('pause', 16)} ストップ</button></div>`, {
    stop: () => { closeModal(); dispatch('pause'); },
  });
};
$('resumeBtn').onclick = () => dispatch('resume');
$('soundBtn').onclick = () => { G.sound = !G.sound; $('soundBtn').innerHTML = G.sound ? `${ic('sound', 12)} おと ON` : `${ic('mute', 12)} おと OFF`; };

fillIcons();
/* ---------------- ボタン ---------------- */
const EGG_ACTIONS = [
  { k: 'warm', ic: 'flame', t: 'あたためる' },
  { k: 'water', ic: 'drop', t: 'みずかえ' },
  { k: 'talk', ic: 'note', t: 'はなしかける' },
];
const LIFE_ACTIONS = [
  { k: 'feed', ic: 'ebi', t: 'ごはん' },
  { k: 'futon', ic: 'bed', t: 'おふとん' },
  { k: 'toilet', ic: 'toilet', t: 'トイレ' },
  { k: 'clean', ic: 'sponge', t: 'そうじ' },
  { k: 'play', ic: 'ball', t: 'あそぶ' },
  { k: 'scold', ic: 'angry', t: 'しかる' },
  { k: 'medicine', ic: 'pill', t: 'おくすり' },
  { k: 'check', ic: 'search', t: 'しらべる' },
];
const MENU = [
  { k: 'shop', ic: 'bag', t: 'ショップ', fn: () => openShop() },
  { k: 'dig', ic: 'shovel', t: 'すなほり', fn: openDig },
  { k: 'zukan', ic: 'book', t: 'ずかん', fn: () => openZukan() },
  { k: 'friends', ic: 'friends', t: 'ともだち', fn: () => openFriends() },
  { k: 'tree', ic: 'tree', t: 'かけいず', fn: openTree },
  { k: 'diary', ic: 'diary', t: 'にっき', fn: () => openDiary() },
];
$('menu').innerHTML = MENU.map(m => `<button class="mbtn" data-k="${m.k}"><span>${ic(m.ic, 22)}</span>${m.t}</button>`).join('');
$('menu').addEventListener('click', e => { const b = e.target.closest('.mbtn'); if (!b) return; beep(520, .05); if (G.state.paused && ['dig', 'friends'].includes(b.dataset.k)) { say('ストップちゅうだよ。さいかいしてね'); return; } MENU.find(m => m.k === b.dataset.k).fn(); });
$('actions').addEventListener('click', e => {
  const b = e.target.closest('.act'); if (!b || b.disabled) return;
  beep(520, .05);
  if (G.state.paused && b.dataset.k !== 'check') { say('ストップちゅうだよ。さいかいしてね'); return; }
  const k = b.dataset.k;
  if (k === 'feed') { if (G.state.sleeping) say('Zzz…（ねてるよ）'); else openFood(); }
  else if (k === 'play') { if (G.state.sleeping) say('Zzz…（ねてるよ）'); else openPlay(); }
  else if (k === 'check') openCheck();
  else dispatch(k);
});
$('vchip').onclick = () => { beep(620, .05); openVisitor(); };
$('messes').addEventListener('click', e => { const m = e.target.closest('.mess'); if (m) dispatch('cleanOne', { i: +m.dataset.i }); });

/* ---------------- 描画 ---------------- */
// きぶん → からだの いろ・もよう（もじを みなくても きもちが わかる）
const SKIN = { ukiuki: 'ukiuki', wakuwaku: 'wakuwaku', dokidoki: 'dokidoki', iraira: 'iraira', kowai: 'kowai', shonbori: 'shonbori',
  samishii: 'samishii', harapeko: 'harapeko', nemunemu: 'nemu', suya: 'nemu', kamatte: 'kamatte' };
export function mood(S = G.state) {
  if (S.sleeping) return 'sleep';
  if (S.sick) return 'sick';
  if (S.happy < 30 || S.hunger < 20) return 'sad';
  if (S.happy > 70 && S.hunger > 40) return 'happy';
  return 'normal';
}
function meterHTML(label, val, color, band) {
  const b = band ? `<span class="band" style="left:${band[0]}%;width:${band[1] - band[0]}%"></span>` : '';
  return `<div class="meter"><label><span>${label}</span><span>${Math.round(val)}</span></label><div class="bar">${b}<i style="width:${val}%;background:${color}"></i></div></div>`;
}
const lv = v => v > 60 ? 'var(--green)' : v > 30 ? 'var(--yellow)' : 'var(--red)';
const scaleOf = (stage, form) => stage === 'egg' ? .75 : stageInfo(stage).scale * (stage === 'adult' && FORMS[form]?.big ? 1.15 : 1);

function ensureSquid(host, cls) {
  if (!host.firstChild || !host.firstChild.classList.contains('squid-wrap'))
    host.innerHTML = `<div class="squid-wrap ${cls}"><div class="squid-inner"></div><div class="blanket"></div><div class="tag"></div></div>`;
  return host.firstChild;
}

let actionMode = '', lastNeed = '';
export function render() {
  const S = G.state, egg = S.stage === 'egg', w = weatherToday(), tod = timeOfDay();
  const d = new Date();
  $('clock').textContent = `${TOD_LABEL[tod]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  $('weather').innerHTML = ic((w.id === 'sunny' && tod === 'night') ? 'moon' : w.ic, 16);
  $('weather').title = w.name;
  $('shells').textContent = S.shells;
  const left = (S.boostUntil || 0) - Date.now(), bp = $('boost');
  if (left > 0 && !S.paused) { const sec = Math.ceil(left / 1000); bp.innerHTML = `${ic('sandglass', 13)} ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; bp.classList.add('on'); }
  else if (S.paused && S.boostLeft > 0) { bp.innerHTML = `${ic('sandglass', 13)} とまってる`; bp.classList.add('on'); }
  else bp.classList.remove('on');
  $('scene').className = `scene t-${tod} w-${w.id}`;

  // decor
  $('decor').innerHTML = DECOR.filter(x => S.inv.placed.includes(x.id)).map(x =>
    `<div class="decor ${x.glow ? 'glow' : ''}" style="left:${x.x}%;bottom:${x.y}%">${ic(x.ic, x.size + 6)}</div>`).join('');

  // pet
  const pet = $('pet');
  if (egg) {
    const e = S.egg, good = e.warmth >= CONFIG.warmRange[0] && e.warmth <= CONFIG.warmRange[1];
    if (!pet.firstChild || !pet.firstChild.classList.contains('egg-wrap')) pet.innerHTML = `<div class="egg-wrap"><div class="egg-inner"></div></div>`;
    pet.firstChild.className = ['egg-wrap', good ? 'good' : '', e.hatch > 85 ? 'near' : '', e.warmth > CONFIG.warmRange[1] ? 'hot' : good ? 'warm' : ''].join(' ');
    pet.querySelector('.egg-inner').innerHTML = eggSVG(e.hatch, S.sp);
  } else {
    const m = mood(), wrap = ensureSquid(pet, 'me');
    wrap.style.width = (200 * scaleOf(S.stage, S.form)) + 'px';
    wrap.style.left = S.pos + '%';
    wrap.classList.toggle('sleeping', S.sleeping);
    wrap.classList.toggle('inbed', S.sleeping && S.lightsOff);
    wrap.classList.toggle('squirm', !S.sleeping && !G.busy && (S.bladder > 70 || S.fake));
    wrap.classList.toggle('glow', S.stage === 'adult' && !!FORMS[S.form]?.glow);
    wrap.dataset.sp = S.sp;
    wrap.dataset.skin = SKIN[moodOf(S)] || '';
    const key = [S.stage, m, S.form, S.inv.hat, S.sp, S.sp2].join('|');
    if (wrap.dataset.key !== key) { wrap.querySelector('.squid-inner').innerHTML = squidSVG(S.stage, m, S.form, S.inv.hat, S.sp, S.sp2); wrap.dataset.key = key; }
  }
  pet.firstChild.onclick = () => {
    // かくれんぼ中に みつけたら
    if (G.hideUntil > Date.now()) { G.hideUntil = 0; const w = document.querySelector('#pet .squid-wrap'); if (w) w.classList.remove('camo'); dispatch('foundHide'); return; }
    dispatch('pet');
  };
  if (perKnown(S)) { S.seenPer ||= []; if (!S.seenPer.includes(S.per)) S.seenPer.push(S.per); }

  // ストップ
  $('pauseOv').classList.toggle('on', !!S.paused);
  $('scene').classList.toggle('paused', !!S.paused);
  const sb = $('stopBtn');
  if (sb.dataset.p !== String(!!S.paused)) { sb.dataset.p = String(!!S.paused); sb.innerHTML = S.paused ? `${ic('play', 12)} さいかい` : `${ic('pause', 12)} ストップ`; sb.classList.toggle('on', !!S.paused); }
  document.querySelectorAll('.act').forEach(b => b.classList.toggle('frozen', !!S.paused && b.dataset.k !== 'check'));

  // visitor
  const vh = $('visitor'), v = G.visitor;
  if (v) {
    const c = v.card, wrap = ensureSquid(vh, 'friend');
    wrap.style.width = (200 * (c.stage === 'egg' ? .4 : scaleOf(c.stage, c.form))) + 'px';
    wrap.style.left = v.pos + '%';
    wrap.classList.toggle('glow', c.stage === 'adult' && !!FORMS[c.form]?.glow);
    wrap.dataset.sp = c.sp || 'momo';
    const rk = relOf(c.pid); wrap.dataset.skin = rk.kenka ? 'iraira' : rk.lover ? 'dokidoki' : 'ukiuki';
    const rr = relOf(c.pid), vm = rr.kenka ? 'sad' : 'happy';
    const key = [c.pid, c.stage, c.form, c.hat, c.sp, vm, relStage(rr)].join('|');
    if (wrap.dataset.key !== key) {
      wrap.querySelector('.squid-inner').innerHTML = c.stage === 'egg' ? eggSVG(60, c.sp) : squidSVG(c.stage, vm, c.form, c.hat, c.sp || 'momo', c.sp2);
      wrap.querySelector('.tag').innerHTML = `${esc(c.name)}${rr.kenka ? ic('angry', 11) : relHearts(rr).replace(/width="13" height="13"/g, 'width="10" height="10"')}`;
      wrap.dataset.key = key;
    }
    wrap.onclick = openVisitor;
    const chip = $('vchip'), rr2 = relOf(c.pid);
    chip.innerHTML = `${ic('squid', 14)} ${esc(c.name)} ${rr2.kenka ? ic('angry', 12) : relHearts(rr2).replace(/width="13" height="13"/g, 'width="11" height="11"')}`;
    chip.classList.add('show');
  } else { vh.innerHTML = ''; $('vchip').classList.remove('show'); }

  // need bubble
  let n = '';
  if (egg) { const e = S.egg; n = e.warmth < CONFIG.warmRange[0] ? 'cold' : e.warmth > CONFIG.warmRange[1] ? 'hot' : e.water < 30 ? 'drop' : ''; }
  else if (S.travelReady) n = 'wave';
  else if (S.sleeping) n = S.lightsOff ? '' : 'bulb';
  else n = S.sick ? 'pill' : S.bladder > 70 ? 'toilet' : S.hunger < 30 ? 'ebi' : S.messes.length ? 'sponge' : S.fake ? 'angry' : S.energy < 25 ? 'zzz' : S.happy < 30 ? 'ball' : '';
  // よびだし音（あたらしい よびだしが でたら ピピッ）
  if (n && n !== lastNeed && !egg) { beep(1320, .07); setTimeout(() => beep(1320, .07), 140); }
  lastNeed = n;
  $('call').classList.toggle('on', !!n && !egg);
  const need = $('need'), sc = scaleOf(S.stage, S.form);
  if (need.dataset.n !== n) { need.innerHTML = n ? ic(n, 26) : ''; need.dataset.n = n; } need.classList.toggle('show', !!n);
  need.style.left = `calc(${egg ? 50 : S.pos}% + ${40 * sc + 10}px)`;
  need.style.bottom = `calc(13% + ${200 * sc}px)`;

  $('messes').innerHTML = S.messes.map((m, i) => `<div class="mess" data-i="${i}" style="left:${m.x}%"></div>`).join('');
  $('dark').classList.toggle('on', !egg && S.sleeping && S.lightsOff);

  // status
  if (egg) {
    $('petName').textContent = 'イカのたまご';
    $('petInfo').textContent = S.egg.hatch > 85 ? 'もうすぐ うまれそう…！' : 'あたためて ふかそう';
    $('bond').textContent = '';
  } else {
    $('petName').textContent = S.name || 'イカッチ';
    const age = S.ageMin < 60 ? `${Math.floor(S.ageMin)}ふん` : `${Math.floor(S.ageMin / 60)}じかん`;
    $('petInfo').textContent = `${S.gen > 1 ? S.gen + 'だいめ・' : ''}${stageName(S)}・${ageYears(S)}さい（${age}）・${S.weight}g・${perKnown(S) ? perOf(S.per).name + '・' : ''}きぶん：${MOODS[moodOf(S)] || ''}`;
    $('bond').innerHTML = `${ic('heart', 13)} なかよし Lv.${bondLevel()}`;
  }
  $('meters').innerHTML = egg
    ? meterHTML(ic('thermo', 14) + ' あたたかさ', S.egg.warmth, S.egg.warmth > CONFIG.warmRange[1] ? 'var(--red)' : S.egg.warmth < CONFIG.warmRange[0] ? 'var(--blue)' : 'var(--green)', CONFIG.warmRange)
      + meterHTML(ic('drop', 14) + ' みずの きれいさ', S.egg.water, lv(S.egg.water))
      + meterHTML(ic('egg', 14) + ' ふか', S.egg.hatch, 'var(--accent)')
    : meterHTML(ic('ebi', 14) + ' おなか', S.hunger, lv(S.hunger))
      + meterHTML(ic('bolt', 14) + ' げんき', S.energy, lv(S.energy))
      + meterHTML(ic('toilet', 14) + ' トイレ', S.bladder, S.bladder > 70 ? 'var(--red)' : S.bladder > 40 ? 'var(--yellow)' : 'var(--blue)')
      + meterHTML(ic('heart', 14) + ' ごきげん', S.happy, lv(S.happy))
      + meterHTML(ic('bubbles', 14) + ' きれいさ', S.clean, lv(S.clean));

  const mode = egg ? 'egg' : 'life';
  if (actionMode !== mode) {
    actionMode = mode;
    $('actions').className = 'actions ' + (egg ? 'egg' : 'life');
    $('actions').innerHTML = (egg ? EGG_ACTIONS : LIFE_ACTIONS).map(a => `<button class="act" data-k="${a.k}"><span class="ic">${ic(a.ic, 26)}</span><span class="t">${a.t}</span></button>`).join('');
  }
  if (!egg) {
    const q = k => document.querySelector(`.act[data-k="${k}"]`);
    q('futon').classList.toggle('on', S.sleeping);
    q('futon').querySelector('.t').textContent = S.sleeping ? (S.lightsOff ? 'おこす' : 'でんき') : 'おふとん';
    { const fi = S.sleeping && !S.lightsOff ? 'bulb' : 'bed'; const el = q('futon').querySelector('.ic'); if (el.dataset.n !== fi) { el.innerHTML = ic(fi, 26); el.dataset.n = fi; } }
    q('medicine').disabled = !S.sick;
  }
  document.querySelector('.mbtn[data-k="dig"]').disabled = egg;
}

export function decorate() {
  $('stars').innerHTML = Array.from({ length: 18 }, () => `<i style="left:${rand(2, 98)}%;top:${rand(3, 40)}%;animation-delay:${-rand(0, 3)}s"></i>`).join('');
  $('bubbles').innerHTML = Array.from({ length: 6 }, (_, i) => `<span class="bub" style="left:${rand(8, 92)}%;animation-delay:${-i * 1.2}s;animation-duration:${rand(6, 9)}s"></span>`).join('');
  $('rain').innerHTML = Array.from({ length: 40 }, () => `<i style="left:${rand(0, 100)}%;animation-delay:${-rand(0, 1)}s;animation-duration:${rand(.6, 1)}s"></i>`).join('');
}
