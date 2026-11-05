// =========================================================
//  画面（描画・モーダル・ミニゲーム）
// =========================================================
import { CONFIG, FOODS, HATS, DECOR, FINDS, FORMS } from './config.js';
import { G, bus, rand, pick, dayKey, isNight, timeOfDay, TOD_LABEL, save, newState } from './state.js';
import { stageInfo, stageName, bondLevel, weatherToday, baseWeight, ageYears, lifespan } from './sim.js';
import { dispatch, makeCard } from './actions.js';
import { squidSVG, eggSVG } from './art.js';
import { net, makeLink } from './net.js';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- feedback ---------------- */
let sayTimer;
export function say(text) {
  const el = $('say'); el.textContent = text; el.classList.add('show');
  clearTimeout(sayTimer); sayTimer = setTimeout(() => el.classList.remove('show'), 3200);
}
export function fx(ch, dx = 0) {
  const el = document.createElement('div'); el.className = 'fx'; el.textContent = ch;
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
  $('modal').innerHTML = html; mh = handlers; modalLock = lock; $('modalBack').classList.add('show');
}
export function closeModal() { $('modalBack').classList.remove('show'); mh = {}; modalLock = false; }
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
  showModal(`<h3>🍤 なにを あげる？</h3><div class="choices">${FOODS.map(f => {
    const n = f.price === 0 ? '∞' : (S.inv.food[f.id] || 0);
    return `<button class="choice" data-a="eat" data-id="${f.id}" ${n === 0 ? 'disabled' : ''}>
      <span class="ic">${f.ic}</span><span class="grow">${f.name}<small>${f.desc}</small></span><span class="cnt">×${n}</span></button>`;
  }).join('')}</div><p class="note">たりない ごはんは 🛍️ショップで かえるよ</p>${closeBtn('やめる')}`, {
    eat: el => { closeModal(); dispatch('feed', { id: el.dataset.id }); },
  });
}

/* ---------------- あそぶ ---------------- */
function openPlay() {
  if (G.state.energy < 15) { say('つかれてて あそべない…'); return; }
  showModal(`<h3>🎾 なにで あそぶ？</h3><div class="choices">
    <button class="choice" data-a="g1"><span class="ic">👀</span><span class="grow">どっちむく？<small>イカが むく ほうを あてよう</small></span></button>
    <button class="choice" data-a="g2"><span class="ic">🎯</span><span class="grow">スミでっぽう<small>タイミングよく スミを とばそう</small></span></button>
  </div>${closeBtn('やめる')}`, { g1: openGame, g2: openInk });
}

/* スミでっぽう：うごく ねらいが まとに かさなったら タップ */
function openInk() {
  let shot = 0, hits = 0, marks = [], raf = 0, x = 0, dir = 1, zone = 0;
  const newZone = () => { zone = 15 + Math.random() * 60; };
  const speed = () => 1.1 + shot * .35;
  function draw(msg) {
    showModal(`<h3>🎯 スミでっぽう</h3><p>${msg}</p>
      <div class="ink"><div class="zone" style="left:${zone}%"></div><div class="aim" id="aim"></div></div>
      <div class="score">${marks.join('') || '・・・'}</div>
      <div class="row"><button class="btn big" data-a="fire">🦑 スミ！</button></div>`, { fire }, true);
  }
  function loop() {
    x += dir * speed(); if (x > 100) { x = 100; dir = -1; } if (x < 0) { x = 0; dir = 1; }
    const a = $('aim'); if (a) a.style.left = x + '%';
    raf = requestAnimationFrame(loop);
  }
  function fire() {
    cancelAnimationFrame(raf);
    const ok = x >= zone - 2 && x <= zone + 14;
    shot++; if (ok) hits++; marks.push(ok ? '🎯' : '💨'); beep(ok ? 900 : 300, .08);
    if (shot < 3) { newZone(); draw(ok ? 'めいちゅう！' : 'おしい！'); raf = requestAnimationFrame(loop); return; }
    const win = hits >= 2;
    dispatch('playResult', { win });
    showModal(`<h3>${win ? '🎉 めいちゅう！' : 'またあそぼ！'}</h3><div class="score">${marks.join('')}</div>
      <p>ごきげん +${win ? 25 : 10}${win ? ' ／ 🐚+3' : ''} ／ たいじゅう −1g</p>${closeBtn()}`);
  }
  newZone(); draw('ピンクの まとに かさなったら スミ！（3かい）'); raf = requestAnimationFrame(loop);
}

/* どっちむく？ */
function openGame() {
  let round = 0, wins = 0, marks = [];
  const draw = (msg = '') => showModal(`<h3>🎾 どっちに むくかな？</h3>
    <p>${msg || 'イカが むく ほうを あてよう！（3かい）'}</p>
    <div class="score">${marks.join('') || '・・・'}</div>
    <div class="lr"><button class="btn" data-a="g" data-d="L">◀ ひだり</button><button class="btn" data-a="g" data-d="R">みぎ ▶</button></div>`, { g: guess }, true);
  function guess(el) {
    const ans = Math.random() < .5 ? 'L' : 'R', ok = el.dataset.d === ans;
    if (ok) wins++; round++; marks.push(ok ? '⭕' : '❌'); beep(ok ? 880 : 300, .08);
    const side = ans === 'L' ? 'ひだり' : 'みぎ';
    if (round < 3) return draw(ok ? `あたり！ ${side}を むいたよ` : `ざんねん、${side}でした`);
    const win = wins >= 2;
    dispatch('playResult', { win });
    showModal(`<h3>${win ? '🎉 かち！' : 'またあそぼ！'}</h3><div class="score">${marks.join('')}</div>
      <p>ごきげん +${win ? 25 : 10}${win ? ' ／ 🐚+3' : ''}</p>${closeBtn()}`);
  }
  draw();
}

/* ---------------- すなほり ---------------- */
function openDig() {
  if (!dispatch('digStart')) return;
  const cells = Array(CONFIG.dig.spots).fill(null);
  let left = CONFIG.dig.tries, msg = 'すなの やまを えらんで ほってみよう！';
  const draw = () => showModal(`<h3>⛏️ すなほり</h3><p>${msg}</p>
    <div class="dig">${cells.map((c, i) => c
      ? `<div class="spot done">${c}</div>`
      : `<button class="spot" data-a="dig" data-i="${i}" ${left ? '' : 'disabled'}></button>`).join('')}</div>
    <p class="note">のこり ${left}かい ／ てんき：${weatherToday().ic}${weatherToday().id === 'rain' || weatherToday().id === 'rainbow' ? ' レアが でやすい！' : ''}</p>
    ${left ? '' : closeBtn()}`, { dig }, left > 0);
  function dig(el) {
    const i = +el.dataset.i, r = dispatch('digSpot');
    left--;
    if (r.kind === 'shells') { cells[i] = '🐚'; msg = `かいがらを ${r.n}こ みつけた！`; beep(760, .06); }
    else if (r.kind === 'find') {
      cells[i] = r.f.ic; beep(r.f.rare >= 3 ? 1200 : 900, .12);
      msg = `「${r.f.name}」を みつけた！${'★'.repeat(r.f.rare)}${r.first ? '<br><b>ずかんに とうろく！ 🐚+2</b>' : ''}`;
    } else { cells[i] = '💨'; msg = r.text; beep(300, .06); }
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
    <div class="choice"><span class="ic">${f.ic}</span><span class="grow">${f.name}<small>${f.desc}・もってる ${S.inv.food[f.id] || 0}</small></span>
    <button class="btn sm" data-a="buy" data-k="food" data-id="${f.id}" ${S.shells < f.price ? 'disabled' : ''}>🐚${f.price}</button></div>`).join('');
  if (tab === 'hat') body = HATS.map(h => {
    const own = S.inv.hats.includes(h.id), on = S.inv.hat === h.id;
    return `<div class="choice"><span class="ic">${h.ic}</span><span class="grow">${h.name}<small>${own ? (on ? 'つけてる' : 'もってる') : 'きせかえ'}</small></span>
    ${own ? `<button class="btn sm ${on ? 'gray' : ''}" data-a="hat" data-id="${h.id}">${on ? 'はずす' : 'つける'}</button>`
          : `<button class="btn sm" data-a="buy" data-k="hat" data-id="${h.id}" ${S.shells < h.price ? 'disabled' : ''}>🐚${h.price}</button>`}</div>`;
  }).join('');
  if (tab === 'decor') body = DECOR.map(d => {
    const own = S.inv.decor.includes(d.id), on = S.inv.placed.includes(d.id);
    return `<div class="choice"><span class="ic">${d.ic}</span><span class="grow">${d.name}<small>${own ? (on ? 'おいてある' : 'しまってある') : 'もようがえ'}</small></span>
    ${own ? `<button class="btn sm ${on ? 'gray' : ''}" data-a="decor" data-id="${d.id}">${on ? 'しまう' : 'おく'}</button>`
          : `<button class="btn sm" data-a="buy" data-k="decor" data-id="${d.id}" ${S.shells < d.price ? 'disabled' : ''}>🐚${d.price}</button>`}</div>`;
  }).join('');
  showModal(`<h3>🛍️ うみのショップ</h3><p>もってる かいがら：🐚 ${S.shells}</p>
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
      return n ? `<div class="zk"><div class="zi">${f.ic}</div><b>${f.name}</b><small>${f.text}</small>
          <small>${'★'.repeat(f.rare)} ・ ×${n}</small>
          ${n > 1 ? `<button class="btn xs" data-a="sell" data-id="${f.id}">うる 🐚${f.value}</button>` : ''}</div>`
        : `<div class="zk unk"><div class="zi">？</div><b>？？？</b><small>${'★'.repeat(f.rare)}</small></div>`;
    }).join('')}</div>`;
  } else {
    body = `<p>こどもの ころの おせわで おとなの すがたが かわるよ</p><div class="choices">${Object.entries(FORMS).map(([id, f]) => `
      <div class="choice ${S.form === id ? 'cur' : ''}"><span class="swatch" style="background:${f.body};border-color:${f.edge}"></span>
      <span class="grow">${f.name}${S.form === id ? ' ← いま' : ''}<small>${f.hint}</small></span></div>`).join('')}</div>`;
  }
  if (tab === 'album') {
    body = S.album.length ? `<div class="choices">${S.album.map(a => { const f = FORMS[a.form] || FORMS.surume; return `
      <div class="choice"><span class="swatch" style="background:${f.body};border-color:${f.edge}"></span>
      <span class="grow">${a.gen}だいめ ${esc(a.name)}<small>${f.name}・${a.days}にち いきた・なかよしLv.${a.bond}・ミス${a.mistakes}</small></span></div>`; }).join('')}</div>`
      : '<p>まだ たびだった イカは いないよ<br>おとなに なって しばらくすると、ひろい うみへ たびだつよ</p>';
  }
  showModal(`<h3>📖 ずかん</h3>${tabs([['finds', 'みつけたもの'], ['forms', 'すがた'], ['album', 'アルバム']], tab)}<div class="scroll">${body}</div>${closeBtn()}`, {
    tab: el => openZukan(el.dataset.t),
    sell: el => { dispatch('sell', { id: el.dataset.id }); openZukan(); },
  });
}

/* ---------------- にっき ---------------- */
function openDiary() {
  const S = G.state, fmt = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  showModal(`<h3>📔 にっき</h3><div class="scroll log">${S.log.length ? S.log.map(l => `<div><span>${fmt(l.t)}</span>${esc(l.text)}</div>`).join('') : '<p>まだ なにも ないよ</p>'}</div>${closeBtn()}`);
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
      <div class="row"><button class="btn" data-a="shareCard">🔗 ともだちリンクを おくる</button></div>
      ${lastCode ? `<textarea id="codeOut" readonly>${esc(lastCode)}</textarea><div class="row"><button class="btn sm" data-a="copy">📋 コピー</button></div>` : ''}
      <p class="note">イカが せいちょうしたら、もういちど おくると すがたが かわるよ<br>プレイヤーID：${S.player.id}</p>`;
  }
  if (tab === 'friends') {
    body = `<p>もらった リンクは タップするだけで OK。<br>うまく いかないときは ここに はりつけてね</p>
      <textarea id="codeIn" placeholder="ともだちリンク または IKA1. コード"></textarea>
      <div class="row"><button class="btn" data-a="addF">🏠 あそびに きてもらう</button></div>
      <div class="choices">${S.friends.length ? S.friends.map(f => `
        <div class="choice"><span class="ic">🦑</span><span class="grow">${esc(f.name)}<small>${esc(f.owner || 'だれか')}の ${esc(f.title || '')}${S.friendPlay[f.pid] === dayKey() ? ' ・きょう あそんだ' : ''}</small></span>
        <button class="btn sm" data-a="inv" data-pid="${f.pid}">よぶ</button><button class="btn sm gray" data-a="rmF" data-pid="${f.pid}">×</button></div>`).join('')
        : '<p class="note">まだ ともだちは いないよ</p>'}</div>`;
  }
  if (tab === 'gift') {
    const items = [
      ...FOODS.filter(f => f.price > 0 && S.inv.food[f.id] > 0).map(f => ({ kind: 'food', id: f.id, ic: f.ic, name: f.name, n: S.inv.food[f.id] })),
      ...FINDS.filter(f => S.inv.finds[f.id] > 1).map(f => ({ kind: 'find', id: f.id, ic: f.ic, name: f.name, n: S.inv.finds[f.id] - 1 })),
    ];
    body = `<p>もちものを つつんで リンクで おくれるよ</p>
      <select id="giftItem">${items.length ? items.map(i => `<option value="${i.kind}:${i.id}">${i.ic} ${i.name}（${i.n}）</option>`).join('') : '<option value="">おくれる ものが ないよ</option>'}</select>
      <select id="giftTo"><option value="">だれでも うけとれる</option>${S.friends.map(f => `<option value="${f.pid}">${esc(f.owner || f.name)} あて</option>`).join('')}</select>
      <div class="row"><button class="btn" data-a="mkGift" ${items.length ? '' : 'disabled'}>🎁 つつんで おくる</button></div>
      ${lastCode ? `<textarea id="codeOut" readonly>${esc(lastCode)}</textarea><div class="row"><button class="btn sm" data-a="copy">📋 コピー</button></div>` : ''}
      <hr><p>もらった プレゼントリンクは タップするだけで とどくよ。<br>うまく いかないときは ここに はりつけてね</p>
      <textarea id="giftIn" placeholder="プレゼントリンク または GIFT1. コード"></textarea>
      <div class="row"><button class="btn" data-a="recv">📦 うけとる</button></div>`;
  }
  showModal(`<h3>🤝 ともだち</h3>${tabs([['card', 'リンク'], ['friends', 'ともだち'], ['gift', 'プレゼント']], tab)}<div class="scroll">${body}</div>${closeBtn()}`, {
    tab: el => { lastCode = ''; openFriends(el.dataset.t); },
    saveName: () => { dispatch('setPlayerName', { name: $('ownerName').value.trim() }); say('なまえを ほぞんしたよ'); openFriends(); },
    shareCard: async () => {
      if (!needOwnerName(S)) return;
      lastCode = makeLink('f', makeCard()); openFriends();
      await shareLink(lastCode, `${S.player.name}の イカ「${S.name || 'イカッチ'}」と ともだちに なろう！ タップしてね🦑`);
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
      await shareLink(lastCode, `イカッチの プレゼントだよ🎁（${item.name}）タップして うけとってね`);
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
  showModal(`<h3>🎉 ${isNew ? 'ともだちに なった！' : 'ともだちが きた！'}</h3>
    <p>${esc(card.owner || 'ともだち')}の「${esc(card.name)}」が あそびに きたよ</p>
    <p>あなたの リンクも おくりかえす？</p>
    <div class="row"><button class="btn" data-a="back">🔗 おくりかえす</button></div>${closeBtn('あとで')}`, {
    back: () => openFriends('card'),
  });
}
function acceptGift(gift) {
  const r = dispatch('receiveGift', { gift });
  if (r.ok) { closeModal(); say(`${gift.fromName || 'ともだち'}から ${r.item.ic}${r.item.name} が とどいた！`); }
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
    showModal(`<h3>📦 ひっこし</h3><p>「${esc(d.name || 'たまご')}」（${d.gen || 1}だいめ）の データを よみこみます。<br><b>いまの この ばしょの データは きえます。</b></p>
      <div class="row"><button class="btn gray" data-a="close">やめる</button><button class="btn" data-a="ok">ひっこす</button></div>`, {
      ok: () => { dispatch('importSave', { data: d }); closeModal(); say('ひっこし かんりょう！ また よろしくね'); },
    }, true);
  }
}

/* ---------------- ひっこし（きしゅへんこう） ---------------- */
function openMove() {
  const S = G.state;
  showModal(`<h3>📦 ひっこし</h3>
    <p>スマホを かえるときは、ひっこしリンクを じぶんに おくって、あたらしい スマホで ひらいてね。<br>アカウントは いらないよ。</p>
    <div class="row"><button class="btn" data-a="mk">📦 ひっこしリンクを つくる</button></div>
    ${lastCode ? `<textarea id="codeOut" readonly>${esc(lastCode)}</textarea><div class="row"><button class="btn sm" data-a="copy">📋 コピー</button></div>` : ''}
    <p class="note">⚠️ このリンクを ひとに わたすと、あなたの イカを コピーされちゃうよ</p>${closeBtn()}`, {
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
  const hearts = v => '❤️'.repeat(Math.round(v / 25)) + '🤍'.repeat(4 - Math.round(v / 25));
  const left = Math.max(0, lifespan() - S.ageMin);
  showModal(`<h3>🔍 しらべる</h3>
    <div class="check">
      <div><span>なまえ</span><b>${esc(S.name || 'イカッチ')}（${S.gen}だいめ）</b></div>
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
    <p class="note">💢が でたら わがまま。しかって しつけよう<br>💡が でたら でんきを けしてあげよう</p>${closeBtn()}`);
}

/* ---------------- たびだち（せだいこうたい） ---------------- */
function openTravel() {
  const S = G.state;
  if (!S.travelReady) return;
  const f = FORMS[S.form] || FORMS.surume;
  showModal(`<h3>🌊 たびだちの とき</h3>
    <p>りっぱな ${f.name}に そだった「${esc(S.name || 'イカッチ')}」は、<br>ひろい うみへ たびだつ ときが きたみたい。</p>
    <p>いままで ありがとう！<br>アルバムに のこして、つぎの たまごを うけとろう。</p>
    <p class="note">もちもの・かいがら・ともだちは そのまま。🐚+20</p>
    <div class="row"><button class="btn" data-a="go">👋 みおくる</button></div>`, {
    go: () => { const nm = S.name; dispatch('travel'); closeModal(); say(`${nm || 'イカッチ'}、げんきでね！ つぎの たまごが とどいたよ`); fx('🥚'); },
  }, true);
}

function openVisitor() {
  const v = G.visitor; if (!v) return;
  const played = G.state.friendPlay[v.card.pid] === dayKey();
  showModal(`<h3>🦑 ${esc(v.card.name)}</h3><p>${esc(v.card.owner || 'ともだち')}の ${esc(v.card.title || '')}が あそびに きてるよ！</p>
    <div class="row"><button class="btn" data-a="play" ${played ? 'disabled' : ''}>${played ? 'きょうは あそんだ' : '🎶 いっしょに あそぶ'}</button></div>
    <div class="row"><button class="btn gray" data-a="bye">👋 バイバイ</button></div>`, {
    play: () => { closeModal(); dispatch('friendPlay', { pid: v.card.pid }); },
    bye: () => { closeModal(); dispatch('sendHome'); },
  });
}

/* ---------------- なまえ・リセット ---------------- */
export function askName() {
  const S = G.state;
  if (S.stage === 'egg' || S.name) return;
  showModal(`<h3>🐣 うまれたよ！</h3><p>なまえを つけてあげよう</p>
    <input id="nameInput" maxlength="8" placeholder="イカッチ">
    <div class="row"><button class="btn" data-a="ok">けってい</button></div>`, { ok }, true);
  function ok() { S.name = ($('nameInput').value.trim() || 'イカッチ'); closeModal(); say(`ぼく ${S.name}！ よろしくね`); render(); save(); }
  $('nameInput').onkeydown = e => { if (e.key === 'Enter') ok(); };
  setTimeout(() => { try { $('nameInput').focus(); } catch (e) {} }, 50);
}
$('resetBtn').onclick = () => showModal(`<h3>🥚 さいしょから？</h3><p>いまの イカとは おわかれに なります<br>（かいがら・もちもの・ともだちも きえます）</p>
  <div class="row"><button class="btn gray" data-a="close">やめる</button><button class="btn" data-a="reset">あたらしい たまご</button></div>`, {
  reset: () => { const keep = G.state.player; G.state = newState(); G.state.player = keep; G.visitor = null; closeModal(); say('あたらしい たまごが とどいた！'); render(); save(); },
});
$('moveBtn').onclick = () => openMove();
$('speedBtn').onclick = () => { G.speed = G.speed === 1 ? 10 : G.speed === 10 ? 60 : 1; $('speedBtn').textContent = `⏩ はやさ ×${G.speed}`; };
$('soundBtn').onclick = () => { G.sound = !G.sound; $('soundBtn').textContent = G.sound ? '🔊 おと ON' : '🔈 おと OFF'; };

/* ---------------- ボタン ---------------- */
const EGG_ACTIONS = [
  { k: 'warm', ic: '♨️', t: 'あたためる' },
  { k: 'water', ic: '💧', t: 'みずかえ' },
  { k: 'talk', ic: '🎵', t: 'はなしかける' },
];
const LIFE_ACTIONS = [
  { k: 'feed', ic: '🍤', t: 'ごはん' },
  { k: 'futon', ic: '🛏️', t: 'おふとん' },
  { k: 'toilet', ic: '🚽', t: 'トイレ' },
  { k: 'clean', ic: '🧽', t: 'そうじ' },
  { k: 'play', ic: '🎾', t: 'あそぶ' },
  { k: 'scold', ic: '😤', t: 'しかる' },
  { k: 'medicine', ic: '💊', t: 'おくすり' },
  { k: 'check', ic: '🔍', t: 'しらべる' },
];
const MENU = [
  { k: 'shop', ic: '🛍️', t: 'ショップ', fn: () => openShop() },
  { k: 'dig', ic: '⛏️', t: 'すなほり', fn: openDig },
  { k: 'zukan', ic: '📖', t: 'ずかん', fn: () => openZukan() },
  { k: 'friends', ic: '🤝', t: 'ともだち', fn: () => openFriends() },
  { k: 'diary', ic: '📔', t: 'にっき', fn: openDiary },
];
$('menu').innerHTML = MENU.map(m => `<button class="mbtn" data-k="${m.k}"><span>${m.ic}</span>${m.t}</button>`).join('');
$('menu').addEventListener('click', e => { const b = e.target.closest('.mbtn'); if (b) { beep(520, .05); MENU.find(m => m.k === b.dataset.k).fn(); } });
$('actions').addEventListener('click', e => {
  const b = e.target.closest('.act'); if (!b || b.disabled) return;
  beep(520, .05);
  const k = b.dataset.k;
  if (k === 'feed') { if (G.state.sleeping) say('Zzz…（ねてるよ）'); else openFood(); }
  else if (k === 'play') { if (G.state.sleeping) say('Zzz…（ねてるよ）'); else openPlay(); }
  else if (k === 'check') openCheck();
  else dispatch(k);
});
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
  $('weather').textContent = (w.id === 'sunny' && tod === 'night') ? '🌙' : w.ic;
  $('weather').title = w.name;
  $('shells').textContent = S.shells;
  $('scene').className = `scene t-${tod} w-${w.id}`;

  // decor
  $('decor').innerHTML = DECOR.filter(x => S.inv.placed.includes(x.id)).map(x =>
    `<div class="decor ${x.glow ? 'glow' : ''}" style="left:${x.x}%;bottom:${x.y}%;font-size:${x.size}px">${x.ic}</div>`).join('');

  // pet
  const pet = $('pet');
  if (egg) {
    const e = S.egg, good = e.warmth >= CONFIG.warmRange[0] && e.warmth <= CONFIG.warmRange[1];
    if (!pet.firstChild || !pet.firstChild.classList.contains('egg-wrap')) pet.innerHTML = `<div class="egg-wrap"><div class="egg-inner"></div></div>`;
    pet.firstChild.className = ['egg-wrap', good ? 'good' : '', e.hatch > 85 ? 'near' : '', e.warmth > CONFIG.warmRange[1] ? 'hot' : good ? 'warm' : ''].join(' ');
    pet.querySelector('.egg-inner').innerHTML = eggSVG(e.hatch);
  } else {
    const m = mood(), wrap = ensureSquid(pet, 'me');
    wrap.style.width = (200 * scaleOf(S.stage, S.form)) + 'px';
    wrap.style.left = S.pos + '%';
    wrap.classList.toggle('sleeping', S.sleeping);
    wrap.classList.toggle('inbed', S.sleeping && S.lightsOff);
    wrap.classList.toggle('squirm', !S.sleeping && !G.busy && (S.bladder > 70 || S.fake));
    wrap.classList.toggle('glow', S.stage === 'adult' && !!FORMS[S.form]?.glow);
    const key = [S.stage, m, S.form, S.inv.hat].join('|');
    if (wrap.dataset.key !== key) { wrap.querySelector('.squid-inner').innerHTML = squidSVG(S.stage, m, S.form, S.inv.hat); wrap.dataset.key = key; }
  }
  pet.firstChild.onclick = () => dispatch('pet');

  // visitor
  const vh = $('visitor'), v = G.visitor;
  if (v) {
    const c = v.card, wrap = ensureSquid(vh, 'friend');
    wrap.style.width = (200 * (c.stage === 'egg' ? .4 : scaleOf(c.stage, c.form))) + 'px';
    wrap.style.left = v.pos + '%';
    wrap.classList.toggle('glow', c.stage === 'adult' && !!FORMS[c.form]?.glow);
    const key = [c.pid, c.stage, c.form, c.hat].join('|');
    if (wrap.dataset.key !== key) {
      wrap.querySelector('.squid-inner').innerHTML = c.stage === 'egg' ? eggSVG(60) : squidSVG(c.stage, 'happy', c.form, c.hat);
      wrap.querySelector('.tag').textContent = c.name;
      wrap.dataset.key = key;
    }
    wrap.onclick = openVisitor;
  } else vh.innerHTML = '';

  // need bubble
  let n = '';
  if (egg) { const e = S.egg; n = e.warmth < CONFIG.warmRange[0] ? '🥶' : e.warmth > CONFIG.warmRange[1] ? '🥵' : e.water < 30 ? '💧' : ''; }
  else if (S.travelReady) n = '🌊';
  else if (S.sleeping) n = S.lightsOff ? '' : '💡';
  else n = S.sick ? '💊' : S.bladder > 70 ? '🚽' : S.hunger < 30 ? '🍤' : S.messes.length ? '🧽' : S.fake ? '💢' : S.energy < 25 ? '💤' : S.happy < 30 ? '🎾' : '';
  // よびだし音（あたらしい よびだしが でたら ピピッ）
  if (n && n !== lastNeed && !egg) { beep(1320, .07); setTimeout(() => beep(1320, .07), 140); }
  lastNeed = n;
  $('call').classList.toggle('on', !!n && !egg);
  const need = $('need'), sc = scaleOf(S.stage, S.form);
  need.textContent = n; need.classList.toggle('show', !!n);
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
    $('petInfo').textContent = `${S.gen > 1 ? S.gen + 'だいめ・' : ''}${stageName(S)}・${ageYears(S)}さい（${age}）・${S.weight}g${S.sick ? '・びょうき' : ''}`;
    $('bond').textContent = `💗 なかよし Lv.${bondLevel()}`;
  }
  $('meters').innerHTML = egg
    ? meterHTML('🌡️ あたたかさ', S.egg.warmth, S.egg.warmth > CONFIG.warmRange[1] ? 'var(--red)' : S.egg.warmth < CONFIG.warmRange[0] ? 'var(--blue)' : 'var(--green)', CONFIG.warmRange)
      + meterHTML('💧 みずの きれいさ', S.egg.water, lv(S.egg.water))
      + meterHTML('🥚 ふか', S.egg.hatch, 'var(--accent)')
    : meterHTML('🍤 おなか', S.hunger, lv(S.hunger))
      + meterHTML('⚡ げんき', S.energy, lv(S.energy))
      + meterHTML('🚽 トイレ', S.bladder, S.bladder > 70 ? 'var(--red)' : S.bladder > 40 ? 'var(--yellow)' : 'var(--blue)')
      + meterHTML('💗 ごきげん', S.happy, lv(S.happy))
      + meterHTML('🫧 きれいさ', S.clean, lv(S.clean));

  const mode = egg ? 'egg' : 'life';
  if (actionMode !== mode) {
    actionMode = mode;
    $('actions').className = 'actions ' + (egg ? 'egg' : 'life');
    $('actions').innerHTML = (egg ? EGG_ACTIONS : LIFE_ACTIONS).map(a => `<button class="act" data-k="${a.k}"><span class="ic">${a.ic}</span><span class="t">${a.t}</span></button>`).join('');
  }
  if (!egg) {
    const q = k => document.querySelector(`.act[data-k="${k}"]`);
    q('futon').classList.toggle('on', S.sleeping);
    q('futon').querySelector('.t').textContent = S.sleeping ? (S.lightsOff ? 'おこす' : 'でんき') : 'おふとん';
    q('futon').querySelector('.ic').textContent = S.sleeping && !S.lightsOff ? '💡' : '🛏️';
    q('medicine').disabled = !S.sick;
  }
  document.querySelector('.mbtn[data-k="dig"]').disabled = egg;
}

export function decorate() {
  $('stars').innerHTML = Array.from({ length: 18 }, () => `<i style="left:${rand(2, 98)}%;top:${rand(3, 40)}%;animation-delay:${-rand(0, 3)}s"></i>`).join('');
  $('bubbles').innerHTML = Array.from({ length: 6 }, (_, i) => `<span class="bub" style="left:${rand(8, 92)}%;animation-delay:${-i * 1.2}s;animation-duration:${rand(6, 9)}s"></span>`).join('');
  $('rain').innerHTML = Array.from({ length: 40 }, () => `<i style="left:${rand(0, 100)}%;animation-delay:${-rand(0, 1)}s;animation-duration:${rand(.6, 1)}s"></i>`).join('');
}
