// =========================================================
//  画面（描画・モーダル・ミニゲーム）
// =========================================================
import { CONFIG, FOODS, HATS, DECOR, FINDS, FORMS, SPECIES } from './config.js';
import { G, bus, rand, pick, dayKey, isNight, timeOfDay, TOD_LABEL, save, newState } from './state.js';
import { stageInfo, stageName, bondLevel, weatherToday, baseWeight, ageYears, lifespan, speciesOf } from './sim.js';
import { dispatch, makeCard } from './actions.js';
import { squidSVG, eggSVG } from './art.js';
import { net, makeLink } from './net.js';
import { REL, REL_RULE, relOf, relStage, perOf, friendPer, compat, compatMark } from './social.js';
import { cardTraits } from './traits.js';
import { TRAITS, TKEYS, quirks, moodOf, MOODS, trend, favorite, disliked, itemName, GAME_NAMES } from './traits.js';
import { EVENT_NAMES } from './events.js';
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
  showModal(`<h3>${ic('bag', 20)} うみのショップ</h3><p>もってる かいがら：${ic('shell', 20)} ${S.shells}</p>
    ${tabs([['food', 'ごはん'], ['hat', 'きせかえ'], ['decor', 'もようがえ']], tab)}
    <div class="choices scroll">${body}</div>${closeBtn()}`, {
    tab: el => openShop(el.dataset.t),
    buy: el => { dispatch('buy', { kind: el.dataset.k, id: el.dataset.id }); openShop(); },
    hat: el => { dispatch('equipHat', { id: el.dataset.id }); openShop(); },
    decor: el => { dispatch('toggleDecor', { id: el.dataset.id }); openShop(); },
  });
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
      <hr><p>おとなの タイプは こどもの ころの おせわで きまるよ</p><div class="choices">${Object.entries(FORMS).map(([id, f]) => `
      <div class="choice ${S.form === id ? 'cur' : ''}"><span class="grow">${f.name}${f.prefix ? `（${f.prefix}〜）` : ''}${S.form === id ? ' ← いま' : ''}<small>${f.hint}</small></span></div>`).join('')}</div>`;
  }
  if (tab === 'event') {
    const seen = S.seenEv || {};
    body = `<p>いままでに であった ハプニング ${Object.keys(seen).length} / ${Object.keys(EVENT_NAMES).length}</p><div class="choices">${Object.entries(EVENT_NAMES).map(([id, n]) => seen[id]
      ? `<div class="choice"><span class="ic">${ic({ tako: 'tako', fisher: 'hook', shark: 'shark', star: 'sparkle', bottle: 'bottle', jelly: 'jelly', map: 'map', crabs: 'crab', diver: 'camera', lost: 'pearl', whale: 'whale', wave: 'wave' }[id], 28)}</span><span class="grow">${n}<small>${seen[id]}かい</small></span></div>`
      : `<div class="choice unk"><span class="ic">？</span><span class="grow">？？？<small>まだ であって いない</small></span></div>`).join('')}</div>`;
  }
  if (tab === 'album') {
    body = S.album.length ? `<div class="choices">${S.album.map(a => { const f = FORMS[a.form] || FORMS.surume, sp = speciesOf(a.sp); return `
      <div class="choice"><span class="asq">${squidSVG('adult', 'happy', a.form, a.hat, a.sp || 'momo')}</span>
      <span class="grow">${a.gen}だいめ ${esc(a.name)}<small>${(f.prefix ? f.prefix + ' ' : '') + sp.name}・${a.days}にち いきた・なかよしLv.${a.bond}・ミス${a.mistakes}</small></span></div>`; }).join('')}</div>`
      : '<p>まだ たびだった イカは いないよ<br>おとなに なって しばらくすると、ひろい うみへ たびだつよ</p>';
  }
  showModal(`<h3>${ic('book', 20)} ずかん</h3>${tabs([['finds', 'もの'], ['forms', 'すがた'], ['event', 'できごと'], ['album', 'アルバム']], tab)}<div class="scroll">${body}</div>${closeBtn()}`, {
    tab: el => openZukan(el.dataset.t),
    sell: el => { dispatch('sell', { id: el.dataset.id }); openZukan(); },
  });
}

/* ---------------- にっき ---------------- */
function openDiary() {
  const S = G.state, fmt = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  showModal(`<h3>${ic('diary', 20)} にっき</h3><div class="scroll log">${S.log.length ? S.log.map(l => `<div><span>${fmt(l.t)}</span>${esc(l.text)}</div>`).join('') : '<p>まだ なにも ないよ</p>'}</div>${closeBtn()}`);
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
function openCheck() {
  const S = G.state, base = baseWeight(S.stage), over = S.weight - base;
  const hearts = v => ic('heart', 16).repeat(Math.round(v / 25)) + ic('heartEmpty', 16).repeat(4 - Math.round(v / 25));
  const left = Math.max(0, lifespan() - S.ageMin);
  showModal(`<h3>${ic('search', 20)} しらべる</h3>
    <div class="scroll"><div class="check">
      <div><span>なまえ</span><b>${esc(S.name || 'イカッチ')}（${S.gen}だいめ）</b></div>
      <div><span>しゅるい</span><b>${speciesOf(S.sp).name}</b></div>
      <div class="perbox"><span>せいかく</span><b>${perOf(S.per).name}</b><small>${perOf(S.per).desc}</small>
        <div class="tags">${quirks(S.tr).map(q => `<em class="qtag ${q.up ? 'up' : 'dn'}">${q.name}</em>`).join('') || '<em class="qtag">とくに なし</em>'}</div>
        <small>いまの きぶん：<b>${MOODS[moodOf(S)] || ''}</b></small>
        <button class="btn sm" data-a="mind">${ic('heart', 16)} こころを のぞく</button></div>
      <div><span>すがた</span><b>${stageName(S)}</b></div>
      <div><span>ねんれい</span><b>${ageYears(S)}さい <small>（うまれて ${S.ageMin < 60 ? Math.floor(S.ageMin) + 'ふん' : (S.ageMin / 60).toFixed(1) + 'じかん'}）</small></b></div>
      <div><span>たいじゅう</span><b>${S.weight}g ${over > 10 ? '<em>ふとりぎみ</em>' : ''}</b></div>
      <div><span>おなか</span><b>${hearts(S.hunger)}</b></div>
      <div><span>ごきげん</span><b>${hearts(S.happy)}</b></div>
      <div><span>しつけ</span><b><span class="bar sm"><i style="width:${S.discipline}%;background:var(--accent)"></i></span> ${S.discipline}%</b></div>
      <div><span>なかよし</span><b>Lv.${bondLevel()}</b></div>
      <div><span>おせわミス</span><b>${S.mistakes}かい</b></div>
      ${S.stage === 'child' ? `<div><span>こども期の きろく</span><b><small>おせわ${S.care.good}・ミス${S.care.bad}・ごはん${S.care.feed}・あそび${S.care.play}</small></b></div>` : ''}
      ${S.stage === 'adult' ? `<div><span>たびだちまで</span><b>あと ${(left / 60).toFixed(1)}じかん</b></div>` : ''}
    </div>
    <p class="note">${ic('angry', 20)}が でたら わがまま。しかって しつけよう<br>${ic('bulb', 20)}が でたら でんきを けしてあげよう</p></div>${closeBtn()}`, { perHelp: openPerHelp, mind: openMind });
}

/* ---------------- こころ（レーダーチャート・すききらい・おもいで） ---------------- */
function radarSVG(t, prev) {
  const N = TKEYS.length, cx = 150, cy = 112, R0 = 76;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [cx + Math.cos(a) * R0 * v / 100, cy + Math.sin(a) * R0 * v / 100]; };
  const ring = v => TKEYS.map((_, i) => pt(i, v).join(',')).join(' ');
  const poly = tt => TKEYS.map((k, i) => pt(i, tt[k]).map(n => n.toFixed(1)).join(',')).join(' ');
  return `<svg viewBox="0 0 300 228" class="radar">
    ${[25, 50, 75, 100].map(v => `<polygon points="${ring(v)}" fill="${v === 100 ? '#fff' : 'none'}" stroke="#e3d3b3" stroke-width="1.2"/>`).join('')}
    ${TKEYS.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, 100)[0]}" y2="${pt(i, 100)[1]}" stroke="#efe2c5"/>`).join('')}
    ${prev ? `<polygon points="${poly(prev)}" fill="none" stroke="#bba987" stroke-width="1.5" stroke-dasharray="3 3"/>` : ''}
    <polygon points="${poly(t)}" fill="rgba(255,143,168,.35)" stroke="#e2667f" stroke-width="2.2" stroke-linejoin="round"/>
    ${TKEYS.map((k, i) => { const [x, y] = pt(i, 122); return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${TRAITS[k].color}" font-family="inherit">${TRAITS[k].short}</text>`; }).join('')}
  </svg>`;
}
function openMind() {
  const S = G.state, p = perOf(S.per);
  const hist = (S.trHist || []).filter(x => S.ageMin - x.a <= 1440);
  const prev = hist.length ? hist[0].tr : null;
  const arrows = TKEYS.map(k => ({ k, d: trend(k) })).filter(x => Math.abs(x.d) >= 2).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 4);
  const likeRow = (cat, label) => {
    const f = favorite(cat), h = disliked(cat);
    return `<div><span>${label}</span><b>${f ? `<em class="qtag up">すき：${itemName(cat, f)}</em>` : ''}${h ? `<em class="qtag dn">きらい：${itemName(cat, h)}</em>` : ''}${!f && !h ? '<small>まだ わからない</small>' : ''}</b></div>`;
  };
  const best = [...S.friends].sort((a, b) => (S.rel?.[b.pid]?.pt || 0) - (S.rel?.[a.pid]?.pt || 0))[0];
  const fmt = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}`; };
  showModal(`<h3>${ic('heart', 22)} ${esc(S.name || 'イカッチ')}の こころ</h3>
    <div class="scroll">
      <div class="mindtop"><b class="ptype">${p.name}</b><small>${p.desc}</small>
        <div class="tags">${quirks(S.tr).map(q => `<em class="qtag ${q.up ? 'up' : 'dn'}">${q.name}</em>`).join('')}</div></div>
      ${radarSVG(S.tr, prev)}
      <p class="note">${prev ? 'てんせんは 1にち まえの こころ' : 'じかんが たつと へんかが みえるよ'}</p>
      ${arrows.length ? `<div class="arrows">${arrows.map(a => `<span class="${a.d > 0 ? 'up' : 'dn'}">${TRAITS[a.k].name} ${a.d > 0 ? 'アップ' : 'ダウン'}</span>`).join('')}</div>` : ''}
      <div class="check">
        <div><span>いまの きぶん</span><b>${MOODS[moodOf(S)] || ''}</b></div>
        ${likeRow('food', 'たべもの')}${likeRow('game', 'あそび')}${likeRow('hat', 'ぼうし')}
        ${best ? `<div><span>いちばんの ともだち</span><b>${esc(best.name)}</b></div>` : ''}
        ${S.parent ? `<div><span>おや</span><b>${esc(S.parent.name)}（${perOf(S.parent.per).name}）</b></div>` : ''}
        <div class="trowbox">${TKEYS.map(k => `<div class="trow"><i>${TRAITS[k].name}</i><span class="bar sm"><i style="width:${S.tr[k]}%;background:${TRAITS[k].color}"></i></span><em>${Math.round(S.tr[k])}</em></div>`).join('')}</div>
      </div>
      <h4>おもいで</h4>
      <div class="log mini mem">${(S.mem || []).length ? S.mem.slice(0, 10).map(m => `<div><span>${fmt(m.t)}</span>${'★'.repeat(Math.min(3, m.w))} ${esc(m.text)}</div>`).join('') : '<div>まだ おもいでは ないよ</div>'}</div>
    </div>
    <div class="row"><button class="btn gray" data-a="help">そだてかたの ヒント</button><button class="btn" data-a="close">とじる</button></div>`, { help: openPerHelp });
}

function openPerHelp() {
  const rows = [
    ['なでる', 'やさしさ・ゆうき・あまえ アップ'], ['あそぶ', 'げんき アップ（かつと ゆうき、ちがう あそびで こうきしん）'],
    ['すなほり・かいもの・あたらしい ともだち', 'こうきしん アップ'], ['わがままを しかる・トイレ・はやね', 'すなおさ アップ'],
    ['よごれを すぐ おそうじ', 'きれいずき アップ（おそいと ちらかしやに）'], ['おなかいっぱいでも たべさせる・おやつ', 'くいしんぼう アップ'],
    ['わがまま中に おやつ・なでる', 'すなおさ ダウン・あまえ アップ'], ['りふじんに しかる', 'すなおさ・ゆうき・やさしさ ダウン'],
    ['ほうっておく（おせわミス）', 'ゆうき・やさしさ ダウン'], ['ながい あいだ るす', 'あまえ・ゆうき ダウン（ひとりがすきに）'],
    ['ともだちと なかなおり・おすそわけ', 'やさしさ アップ'], ['ハプニングで にげる・たすける', 'ゆうき・やさしさ アップ（こわい めに あうと ダウン）'],
  ];
  showModal(`<h3>${ic('heart', 22)} そだてかたの ヒント</h3>
    <p>せいかくは あなたの かかわりかたで どんどん かわるよ。<br>あかちゃんの ころほど かわりやすく、おとなに なると かわりにくい</p>
    <div class="scroll"><div class="check helpgrid">${rows.map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>
    <h4>せいかくの タイプ（${Object.keys(PERSONALITY).length}しゅるい）</h4>
    <div class="choices">${Object.values(PERSONALITY).map(p => `<div class="choice"><span class="grow">${p.name}<small>${p.desc} ／ ${p.hint}</small></span></div>`).join('')}</div></div>
    <div class="row"><button class="btn gray" data-a="back">もどる</button></div>`, { back: openMind });
}
bus.on('perchange', d => setTimeout(() => eventModal(() => {
  const S = G.state;
  showModal(`<h3>${ic('sparkle', 22)} せいかくが かわった！</h3>
    <div class="zsq hero">${squidSVG(S.stage === 'egg' ? 'baby' : S.stage, 'happy', S.form, S.inv.hat, S.sp)}</div>
    <p>さいきんの ${esc(S.name || 'イカッチ')}は…<br><b>${PERSONALITY[d.from]?.name || ''}</b> → <b class="big">${PERSONALITY[d.to].name}</b></p>
    <p class="note">${PERSONALITY[d.to].desc}</p>${closeBtn()}`);
  fx('sparkle'); beep(990, .1);
}), 400));

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
      <div class="pair">${squidSVG(S.stage, r.good ? 'happy' : 'sad', S.form, S.inv.hat, S.sp)}<span class="evic">${ic(ev.actor, 56)}</span></div>
      <p>${esc(r.text).replace(/\n/g, '<br>')}</p>${closeBtn()}`);
    $('actor').className = 'actor'; $('actor').innerHTML = '';
    beep(r.good ? 880 : 260, .12); render(); save();
  };
  showModal(`<h3>${ic(ev.actor, 24)} ${esc(ev.title)}</h3>
    <div class="pair">${squidSVG(S.stage, 'normal', S.form, S.inv.hat, S.sp)}<span class="evic bob">${ic(ev.actor, 56)}</span></div>
    <p>${esc(ev.intro)}</p>
    ${ev.help ? `<div class="row"><button class="btn big" data-a="help">${esc(ev.help.label)}</button></div><div class="qte"><i style="animation-duration:${ev.help.ms}ms"></i></div>
      <p class="note">${esc(S.name || 'イカッチ')}が いうことを きくかは せいかく しだい</p>`
    : `<p class="note">${esc(S.name || 'イカッチ')}は どうするかな…</p>`}`, { help: () => finish(true) }, true);
  beep(660, .08); setTimeout(() => beep(520, .08), 120);
  const timer = setTimeout(() => finish(false), ev.help ? ev.help.ms : 2600);
}), 200));

/* ---------------- たびだち（せだいこうたい） ---------------- */
function openTravel() {
  const S = G.state;
  if (!S.travelReady) return;
  showModal(`<h3>${ic('wave', 20)} たびだちの とき</h3>
    <p>りっぱな ${stageName(S)}に そだった「${esc(S.name || 'イカッチ')}」は、<br>ひろい うみへ たびだつ ときが きたみたい。</p>
    <p>いままで ありがとう！<br>アルバムに のこして、つぎの たまごを うけとろう。</p>
    <p class="note">もちもの・かいがら・ともだちは そのまま。${ic('shell', 20)}+20</p>
    <div class="row"><button class="btn" data-a="go">${ic('hand', 20)} みおくる</button></div>`, {
    go: () => { const nm = S.name; dispatch('travel'); closeModal(); say(`${nm || 'イカッチ'}、げんきでね！ つぎの たまごが とどいたよ`); fx('egg'); },
  }, true);
}

function openVisitor() {
  const v = G.visitor; if (!v) return;
  const S = G.state, pid = v.card.pid, r = relOf(pid), st = relStage(r);
  const me = S.name || 'イカッチ', you = v.card.name;
  const meter = st === 'koibito' ? 100 : st === 'shinyu' ? Math.min(100, (r.pt - 80) * 5) : st === 'nakayoshi' ? (r.pt - 50) / 30 * 100 : st === 'tomodachi' ? (r.pt - 20) / 30 * 100 : r.pt / 20 * 100;
  const recent = S.log.filter(l => l.text.includes(you)).slice(0, 4);
  const doing = r.kenka ? 'けんかちゅう… おたがい そっぽを むいている'
    : S.sleeping ? `${me}は ねている`
    : S.friendPlay[pid] === dayKey() ? 'きょうは もう いっぱい あそんだ。のんびり ちゅう'
    : r.lover ? 'ふたりで よりそって いる' : 'なにして あそぶか かんがえてる みたい';
  showModal(`<h3>${ic('squid', 20)} ${esc(you)}</h3>
    <p>${esc(v.card.owner || 'ともだち')}の ${esc(v.card.title || '')}</p>
    <div class="pair">${squidSVG(S.stage, r.kenka ? 'sad' : 'happy', S.form, S.inv.hat, S.sp)}${squidSVG(v.card.stage, r.kenka ? 'sad' : 'happy', v.card.form, v.card.hat, v.card.sp || 'momo')}</div>
    <div class="pers"><span>${esc(me)}<b>${perOf(S.per).name}</b></span><span>${esc(you)}<b>${perOf(friendPer(v.card)).name}</b></span></div>
    ${(() => { const c = compatMark(compat(S.tr, cardTraits(v.card))); return `<p class="compat ${c.cls}">あいしょう：<b>${c.mark}</b></p>`; })()}
    <div class="relbox">${relBadge(pid)}<div class="bar sm"><i style="width:${meter}%;background:var(--accent)"></i></div><small>${nextInfo(r)}</small></div>
    <p class="${r.kenka ? 'kenka' : ''}">いま：${doing}</p>
    ${recent.length ? `<div class="log mini">${recent.map(l => `<div>${esc(l.text)}</div>`).join('')}</div>` : ''}
    <p class="note">なにを するかは イカたちが じぶんで きめるよ。<br>ごきげんや しつけが いいと、けんかしにくく、すなおに あやまれる</p>
    <div class="row"><button class="btn gray" data-a="bye">${ic('hand', 18)} かえってもらう</button><button class="btn" data-a="close">みまもる</button></div>`, {
    bye: () => { closeModal(); dispatch('sendHome'); },
  });
}

// ---- かんけいの イベント（えらぶ ボタンは なし。けっかを みまもるだけ）----
const pairOf = (m1, m2) => { const S = G.state, v = G.visitor; return `<div class="pair">${squidSVG(S.stage, m1, S.form, S.inv.hat, S.sp)}${v ? squidSVG(v.card.stage, m2, v.card.form, v.card.hat, v.card.sp || 'momo') : ''}</div>`; };
bus.on('kenka', d => setTimeout(() => eventModal(() => {
  showModal(`<h3>${ic('angry', 22)} けんかに なっちゃった！</h3>
    <p>${esc(G.state.name || 'イカッチ')}と ${esc(d.name)}は ${esc(d.why)}…</p>${pairOf('sad', 'sad')}
    <p>ふたりは どうするかな…？ みまもろう</p>
    <p class="note">ごきげんが よくて しつけが できていると、じぶんから あやまれるかも</p>${closeBtn('みまもる')}`);
  beep(220, .2); setTimeout(() => beep(180, .25), 200);
}), 200));
bus.on('makeup', d => setTimeout(() => eventModal(() => {
  showModal(`<h3>${ic('heart', 22)} なかなおり できた！</h3>${pairOf('happy', 'happy')}
    <p>${esc(d.from)}「…さっきは ごめんね」<br>${esc(d.to)}「ううん、こっちこそ ごめん！」</p>
    <p class="note">なかなおりして まえより なかよしに なったみたい</p>${closeBtn()}`);
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
        <p>${esc(d.to)}「ごめんね… まだ しんゆうで いたいな」</p><p class="note">もっと なかよしに なったら、また チャンスが あるかも</p>${closeBtn()}`);
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
      ${v ? `<div class="pair ${d.after === 'koibito' ? 'love' : ''}">${squidSVG(S.stage, 'happy', S.form, S.inv.hat, S.sp)}${squidSVG(v.card.stage, 'happy', v.card.form, v.card.hat, v.card.sp || 'momo')}</div>` : ''}
      <p>${{ tomodachi: 'いっしょに あそぶのが たのしく なってきた！', nakayoshi: 'ないしょの はなしも できる なかに なったよ', shinyu: 'なにが あっても みかたで いてくれる、たいせつな ともだち！', koibito: 'ふたりは ラブラブ！ これからも なかよくね' }[d.after]}</p>${closeBtn()}`);
    fx('heart'); fx(d.after === 'koibito' ? 'heart' : 'sparkle', 34); beep(880, .1); setTimeout(() => beep(1180, .14), 140);
  }), 250);
});


/* ---------------- なまえ・リセット ---------------- */
export function askName() {
  const S = G.state;
  if (S.stage === 'egg' || S.name) return;
  showModal(`<h3>${ic('chick', 20)} ${speciesOf(S.sp).name}が うまれたよ！</h3>${speciesOf(S.sp).rare ? '<p><b class="rare">まぼろしの レアイカ！</b></p>' : ''}<div class="zsq hero">${squidSVG('baby', 'happy', null, null, S.sp)}</div><p>${speciesOf(S.sp).desc}<br>${S.parent ? `おやの ${esc(S.parent.name)}に すこし にてるかも？<br>` : ''}いまの せいかくは「${perOf(S.per).name}」みたい（そだてかたで かわるよ）<br>なまえを つけてあげよう</p>
    <input id="nameInput" maxlength="8" placeholder="イカッチ">
    <div class="row"><button class="btn" data-a="ok">けってい</button></div>`, { ok }, true);
  function ok() { S.name = ($('nameInput').value.trim() || 'イカッチ'); closeModal(); say(`ぼく ${S.name}！ よろしくね`); render(); save(); }
  $('nameInput').onkeydown = e => { if (e.key === 'Enter') ok(); };
  setTimeout(() => { try { $('nameInput').focus(); } catch (e) {} }, 50);
}
$('resetBtn').onclick = () => showModal(`<h3>${ic('egg', 20)} さいしょから？</h3><p>いまの イカとは おわかれに なります<br>（かいがら・もちもの・ともだちも きえます）</p>
  <div class="row"><button class="btn gray" data-a="close">やめる</button><button class="btn" data-a="reset">あたらしい たまご</button></div>`, {
  reset: () => { const keep = G.state.player; G.state = newState(); G.state.player = keep; G.visitor = null; closeModal(); say('あたらしい たまごが とどいた！'); render(); save(); },
});
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
$('speedBtn').onclick = () => { G.speed = G.speed === 1 ? 10 : G.speed === 10 ? 60 : 1; $('speedBtn').innerHTML = `${ic('fast', 12)} はやさ ×${G.speed}`; };
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
  { k: 'diary', ic: 'diary', t: 'にっき', fn: openDiary },
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
    const key = [S.stage, m, S.form, S.inv.hat, S.sp].join('|');
    if (wrap.dataset.key !== key) { wrap.querySelector('.squid-inner').innerHTML = squidSVG(S.stage, m, S.form, S.inv.hat, S.sp); wrap.dataset.key = key; }
  }
  pet.firstChild.onclick = () => dispatch('pet');

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
    const rr = relOf(c.pid), vm = rr.kenka ? 'sad' : 'happy';
    const key = [c.pid, c.stage, c.form, c.hat, c.sp, vm, relStage(rr)].join('|');
    if (wrap.dataset.key !== key) {
      wrap.querySelector('.squid-inner').innerHTML = c.stage === 'egg' ? eggSVG(60, c.sp) : squidSVG(c.stage, vm, c.form, c.hat, c.sp || 'momo');
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
    $('petInfo').textContent = `${S.gen > 1 ? S.gen + 'だいめ・' : ''}${stageName(S)}・${ageYears(S)}さい（${age}）・${S.weight}g・${perOf(S.per).name}・きぶん：${MOODS[moodOf(S)] || ''}`;
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
