// =========================================================
//  ver 2.0 の がめん：げい・はたけ・はじめての おもいで・しつもん・もようがえ
// =========================================================
import { G, bus, pick, dayKey } from './state.js';
import { DECOR } from './config.js';
import { ic } from './icons.js';
import { squidSVG } from './art.js';
import { dispatch } from './actions.js';
import { showModal, closeModal, say, fx, beep, eventModal } from './ui.js';
import { FIRSTS, TRICKS, CUES, learned, nextTrick, trickProg, lessonsLeft, GROW, G_STAGE, PLOTS, plotStage, plotAge, budHint, QUESTIONS } from './growth.js';
import { relOf, addRelPt } from './social.js';
import { log } from './sim.js';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const closeBtn = (t = 'とじる') => `<div class="row"><button class="btn gray" data-a="close">${t}</button></div>`;
const nm = () => G.state.name || 'イカッチ';
const dfmt = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}`; };
const mini = (S, m = 'happy') => squidSVG(S.stage === 'egg' ? 'baby' : S.stage, m, S.form, S.inv.hat, S.sp, S.sp2);

/* ---------------- おいわい（はじめての おもいで が ふえた とき）---------------- */
const toastQ = [];
let toastBusy = false;
function confetti(n = 22) {
  const sc = $('scene'), cols = ['#ff9ac0', '#ffd54a', '#7fd6f7', '#a8eba0', '#c6a8ff', '#fff'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i'); c.className = 'conf';
    c.style.left = (10 + Math.random() * 80) + '%'; c.style.background = cols[i % cols.length];
    c.style.animationDelay = (Math.random() * .3) + 's'; c.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    sc.appendChild(c); setTimeout(() => c.remove(), 2300);
  }
}
function showToast() {
  if (toastBusy || !toastQ.length) return;
  toastBusy = true;
  const f = toastQ.shift(), el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="ti">${ic('photo', 26)}</span><span><small>はじめての おもいで</small><b>${esc(f.name)}</b></span>`;
  $('scene').appendChild(el); confetti();
  beep(784, .08); setTimeout(() => beep(988, .08), 110); setTimeout(() => beep(1318, .12), 220);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => { el.remove(); toastBusy = false; showToast(); }, 3100);
}
bus.on('firstNew', f => { toastQ.push(f); setTimeout(showToast, 400); });
export function celebrate() { confetti(30); }

/* ---------------- げい ---------------- */
const CUE_SVG = {
  up:   '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#ffb3c4"/><path d="M20 30V11M11 19l9-9 9 9" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#7fd6f7"/><path d="M20 10v19M11 21l9 9 9-9" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spin: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#a8d98a"/><path d="M29 20a9 9 0 1 1-3-6.7" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M27 7v7h-7" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#ffd54a"/><path d="M20 8l3.6 7.6 8.4.9-6.2 5.7 1.7 8.2L20 26.3l-7.5 4.1 1.7-8.2L8 16.5l8.4-.9z" fill="#fff"/></svg>',
};
const pips = (n, need) => `<div class="pips">${Array.from({ length: need }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;

export function openTricks() {
  const S = G.state;
  if (S.stage === 'egg') { say('うまれてから おしえようね'); return; }
  if (S.sleeping) { say('Zzz…（ねてるよ）'); return; }
  const done = learned(S), t = nextTrick(S), left = lessonsLeft(S);
  let main = '';
  if (!t) main = `<p>ぜんぶの げいを おぼえちゃった！ ${esc(nm())}は げいの めいじん！</p>`;
  else if (t.locked) main = `<div class="trickbox"><b>つぎの げい：？？？</b><small>もうすこし おおきく なったら おしえられるよ</small></div>`;
  else {
    const prog = trickProg(S, t);
    const why = left <= 0 ? 'きょうは もう たくさん れんしゅうしたね。また あした！' : S.energy < 15 ? 'つかれてるみたい。ごはんや おひるねの あとに しよう' : '';
    main = `<div class="trickbox"><b>れんしゅう ちゅう：「${t.name}」</b><small>${t.desc}</small>${pips(prog, t.need)}
      <small>${prog >= t.need - 1 ? 'もうすこしで おぼえそう…！' : prog >= t.need / 2 ? 'だんだん わかってきた みたい' : 'まだ はじめた ばかり'}</small>
      ${why ? `<p class="note">${why}</p>` : `<button class="btn" data-a="go">${ic('wand', 18)} れんしゅう する</button>`}</div>`;
  }
  showModal(`<h3>${ic('wand', 20)} げい</h3>
    <p class="small">おてほんの あいずを よく みて、おなじ じゅんばんで おしてね。${esc(nm())}が まねして おぼえるよ</p>
    ${main}
    ${done.length ? `<h4>おぼえた げい</h4><div class="choices">${done.map(x => `<button class="choice" data-a="show" data-id="${x.id}"><span class="ic">${ic('sparkle', 22)}</span><span class="grow">${x.name}<small>${x.desc}</small></span><span class="cnt">みせて</span></button>`).join('')}</div>` : ''}
    ${closeBtn()}`, {
    go: () => runLesson(t),
    show: el => { closeModal(); dispatch('perform', { id: el.dataset.id }); },
  });
}

function runLesson(t) {
  const S = G.state, prog = trickProg(S, t);
  const len = Math.min(5, 3 + Math.floor(prog / 3));
  const seq = Array.from({ length: len }, () => pick(CUES));
  const input = [];
  const frame = (msg, cue, inputOn) => showModal(`<h3>${ic('wand', 20)} 「${t.name}」の れんしゅう</h3>
    <div class="lesson"><div class="lsq">${mini(S)}</div><div class="lcue">${cue ? CUE_SVG[cue] : ''}</div></div>
    <p>${msg}</p><div class="lseq">${seq.map((_, i) => `<i class="${i < input.length ? (input[i] === seq[i] ? 'ok' : 'ng') : ''}"></i>`).join('')}</div>
    <div class="cues">${CUES.map(c => `<button class="cue" data-a="c" data-c="${c}" ${inputOn ? '' : 'disabled'}>${CUE_SVG[c]}</button>`).join('')}</div>`, { c: press }, true);
  // おてほんを じゅんばんに みせる
  let i = 0;
  frame('おてほんを みせるよ… よく みてね', null, false);
  const show = () => {
    if (i >= seq.length) { frame('こんどは きみの ばん！ おなじ じゅんばんで おしてね', null, true); return; }
    frame(`おてほん ${i + 1} / ${seq.length}`, seq[i], false); beep(600 + CUES.indexOf(seq[i]) * 120, .1);
    i++; setTimeout(() => { frame(`おてほん ${i} / ${seq.length}`, null, false); setTimeout(show, 220); }, 680);
  };
  setTimeout(show, 700);
  function press(el) {
    const c = el.dataset.c; input.push(c); beep(600 + CUES.indexOf(c) * 120, .07);
    if (input.length < seq.length) { frame('その ちょうし！', c, true); return; }
    const acc = seq.filter((x, k) => x === input[k]).length / seq.length;
    frame(acc === 1 ? 'かんぺき！ さあ、やってみて…' : acc >= .5 ? 'だいたい あってる！ やってみて…' : 'ちょっと ちがったかも… やってみて…', null, false);
    setTimeout(() => result(dispatch('lesson', { acc })), 900);
  }
  function result(r) {
    if (!r) { closeModal(); return; }
    const S2 = G.state;
    let head, msg;
    if (r.done) { head = `${ic('party', 22)} おぼえた！`; msg = `${esc(nm())}は「${t.name}」が できるように なった！<br>いつでも「みせて」って いえるよ`; }
    else if (r.spark) { head = `${ic('sparkle', 22)} ひらめいた！`; msg = 'こつを つかんだ みたい！ いっきに すすんだよ'; }
    else if (r.ok) { head = 'できた！'; msg = pick(['じょうずに まねできた！', 'すこし できるように なってきた！', 'えへへ、ほめて〜！']); }
    else if (r.gain) { head = 'おしい…'; msg = 'できなかったけど、なにか わかってきた みたい'; }
    else { head = 'うーん…'; msg = pick(['むずかしいみたい。また こんど やろう', 'きょうは ちょっと うまく いかなかった']); }
    showModal(`<h3>${head}</h3>
      <div class="lesson"><div class="lsq ${r.ok ? 'trick-' + (r.done ? t.id : 'jump') : 'trick-shake'}">${mini(S2, r.ok ? 'happy' : 'normal')}</div></div>
      <p>${msg}</p>${pips(r.prog, t.need)}
      <div class="row">${r.done ? `<button class="btn" data-a="show">みせて もらう</button>` : ''}<button class="btn gray" data-a="back">もどる</button></div>`, {
      show: () => { closeModal(); dispatch('perform', { id: t.id }); },
      back: () => openTricks(),
    });
    if (r.done) { confetti(30); beep(784, .1); setTimeout(() => beep(1046, .1), 120); setTimeout(() => beep(1318, .16), 240); }
    else beep(r.ok ? 880 : 330, .1);
  }
}

// げいを する（シーンの イカが うごく）
bus.on('trick', id => {
  const w = document.querySelector('#pet .squid-wrap'); if (!w) return;
  const t = TRICKS.find(x => x.id === id);
  w.classList.remove(...TRICKS.map(x => 'trick-' + x.id)); void w.offsetWidth;
  w.classList.add('trick-' + id);
  if (id === 'hikari') w.classList.add('shine');
  if (id === 'sumiart') {
    const h = document.createElement('div'); h.className = 'inkheart';
    h.innerHTML = '<svg viewBox="0 0 24 24" width="54" height="54"><path d="M12 21s-7-4.4-9.3-8.6C1 9 3 5.5 6.5 5.5c2 0 3.5 1.2 5.5 3.3 2-2.1 3.5-3.3 5.5-3.3C21 5.5 23 9 21.3 12.4 19 16.6 12 21 12 21z" fill="#2b2b4a" opacity=".8"/></svg>';
    h.style.left = `calc(${G.state.pos}% + 30px)`; $('scene').appendChild(h); setTimeout(() => h.remove(), 2600);
  }
  say(`${t.name}！`); beep(880, .06); setTimeout(() => beep(1175, .08), 160);
  setTimeout(() => { w.classList.remove('trick-' + id); if (id === 'hikari') w.classList.remove('shine'); }, 1700);
});
// ひとりで れんしゅう／ともだちに みせる（main.js から よぶ）
export function trickIdle() {
  const S = G.state, done = learned(S);
  if (!done.length || S.sleeping || G.busy || G.modalOpen || S.stage === 'egg') return;
  const t = pick(done), v = G.visitor;
  if (v && Math.random() < .1) {
    bus.emit('trick', t.id);
    const you = v.card.name, r = relOf(v.card.pid);
    setTimeout(() => say(`${you}「${pick(['すごーい！', 'かっこいい！', 'おしえて〜！', 'もういっかい みせて！'])}」`), 1900);
    if (!r.kenka) addRelPt(v.card.pid, 2);
    log(`${nm()}が ${you}に「${t.name}」を みせた`);
  } else if (!v && Math.random() < .03) {
    setTimeout(() => say(pick([`みてみて！`, `れんしゅう したんだよ！`, `じょうずに なったでしょ？`])), 1800);
    bus.emit('trick', t.id);
  }
}

/* ---------------- うみの はたけ ---------------- */
const STAGE_IC = ['seed', 'sprout', 'bud', 'sparkle'];
export function openGarden() {
  const S = G.state;
  const plots = S.garden || Array(PLOTS).fill(null);
  const anyBloom = plots.some(p => plotStage(p) === 3), anyBud = plots.some(p => plotStage(p) === 2);
  const line = S.stage === 'egg' ? 'たまごの となりの ちいさな はたけ。' : anyBloom ? `${esc(nm())}「さいてる！ はやく みてみて！」` : anyBud ? `${esc(nm())}「なにが さくのかな… わくわく」` : plots.some(Boolean) ? `${esc(nm())}「おおきく なあれ〜」` : `${esc(nm())}「たねを うえてみよう！」`;
  const card = (p, i) => {
    const st = plotStage(p);
    if (st < 0) return `<div class="plot empty"><div class="pic">${ic('sprout', 34).replace('#7cc68d', '#d8cbb0')}</div><b>あいてる はたけ</b>
      <button class="btn sm" data-a="plant" data-i="${i}" ${S.inv.seeds > 0 ? '' : 'disabled'}>${ic('seed', 16)} うえる</button></div>`;
    if (st === 3) return `<div class="plot bloom"><div class="pic">${ic('sparkle', 40)}</div><b>さいた！</b><button class="btn sm" data-a="harvest" data-i="${i}">みてみる</button></div>`;
    const next = G_STAGE[st + 1][0], prev = G_STAGE[st][0], pct = Math.min(100, (plotAge(p) - prev) / (next - prev) * 100);
    const watered = p.w.includes(st);
    return `<div class="plot"><div class="pic">${ic(STAGE_IC[st], 40)}</div><b>${G_STAGE[st][1]}</b>
      <small>${st === 2 ? esc(budHint(p)) : st === 1 ? 'すくすく そだってる' : 'つちの なかで ねむってる'}</small>
      <span class="bar sm"><i style="width:${pct}%;background:var(--green)"></i></span>
      <button class="btn sm blue" data-a="water" data-i="${i}" ${watered ? 'disabled' : ''}>${ic('can', 16)} ${watered ? 'たっぷり' : 'みずやり'}</button></div>`;
  };
  const seen = S.gseen || {};
  showModal(`<h3>${ic('sprout', 20)} うみの はたけ</h3><p>${line}</p>
    <div class="plots">${plots.map(card).join('')}</div>
    <p class="note">もってる たね：${ic('seed', 16)} ${S.inv.seeds || 0}　／ たねは すなほりや おみやげで みつかるよ<br>そだつのには じかんが かかるよ。ときどき みに きてね</p>
    <h4>さいた もの ${Object.keys(seen).length} / ${GROW.length}</h4>
    <div class="gseen">${GROW.map(g => seen[g.id] ? `<span title="${g.name}">${ic(g.ic, 26)}</span>` : `<span class="unk">？</span>`).join('')}</div>
    ${closeBtn()}`, {
    plant: el => { if (dispatch('plant', { i: +el.dataset.i })) { beep(700, .06); say(pick(['なにが さくかな〜', 'おおきく なってね'])); } openGarden(); },
    water: el => { if (dispatch('water', { i: +el.dataset.i })) { beep(900, .05); setTimeout(() => beep(1100, .05), 90); } openGarden(); },
    harvest: el => {
      const r = dispatch('harvest', { i: +el.dataset.i }); if (!r) return openGarden();
      showModal(`<h3>${ic('sparkle', 22)} なにが さいたかな…</h3><div class="reveal"><div class="rv">${ic(r.g.ic, 72)}</div></div>
        <p><b>${r.g.name}</b> が さいた！${r.isNew ? '<br><em class="new">はじめて！</em>' : ''}${r.note ? `<br><small>${r.note}</small>` : ''}</p>
        <p>${esc(nm())}「${pick(['わあ…！ きれい！', 'やったー！', 'そだてて よかったね！'])}」</p>
        <div class="row"><button class="btn" data-a="back">はたけに もどる</button></div>`, { back: openGarden });
      beep(660, .08); setTimeout(() => beep(990, .1), 140); if (r.g.rare || r.isNew) setTimeout(() => confetti(26), 200);
    },
  });
}

/* ---------------- はじめての おもいで ---------------- */
export function firstsHTML(S) {
  const got = S.firsts || {}, n = FIRSTS.filter(f => got[f.id]).length;
  return `<p>${esc(nm())}の はじめての おもいで ${n} / ${FIRSTS.length}</p>
    <span class="bar"><i style="width:${n / FIRSTS.length * 100}%;background:var(--accent)"></i></span>
    <div class="firsts">${FIRSTS.map(f => { const s = got[f.id];
      return s ? `<button class="fst" data-a="fst" data-id="${f.id}"><span class="fsq st-${s.st}">${squidSVG(s.st, s.m, s.form, s.hat, s.sp, s.sp2)}</span><b>${f.name}</b><small>${dfmt(s.t)}</small></button>`
        : `<div class="fst unk"><span class="fsq">？</span><b>${f.name}</b><small>まだ</small></div>`; }).join('')}</div>`;
}
export function firstDetail(id, back) {
  const S = G.state, f = FIRSTS.find(x => x.id === id), s = S.firsts?.[id]; if (!f || !s) return;
  const d = new Date(s.t);
  showModal(`<h3>${ic('photo', 20)} ${f.name}</h3><div class="zsq hero photoframe st-${s.st}">${squidSVG(s.st, s.m, s.form, s.hat, s.sp, s.sp2)}</div>
    <p>${f.cap}</p><p class="note">${d.getFullYear()}ねん ${d.getMonth() + 1}がつ ${d.getDate()}にち</p>
    <p>${esc(nm())}「${pick(['あの ひの こと、おぼえてる？', 'なつかしいね', 'えへへ、ちょっと はずかしい'])}」</p>
    <div class="row"><button class="btn gray" data-a="back">もどる</button></div>`, { back });
}

/* ---------------- イカからの しつもん ---------------- */
export function askQuestion(q) {
  eventModal(() => {
    const S = G.state;
    if (q.confirm) {
      showModal(`<h3>${ic('ask', 22)} ${esc(nm())}から しつもん</h3><div class="zsq hero sm">${mini(S)}</div>
        <p>まえの ${esc(q.confirm.by)}から きいたんだけど… きみは「${esc(q.confirm.a)}」が すきなんでしょ？</p>
        <div class="choices"><button class="choice" data-a="yes"><span class="grow">そうだよ</span></button><button class="choice" data-a="no"><span class="grow">いまは ちがうの</span></button></div>`, {
        yes: () => { dispatch('answer', { id: q.id, a: q.confirm.a }); reply(`やっぱり！ ${q.confirm.by}が おしえてくれたんだ`); },
        no: () => { closeModal(); setTimeout(() => askQuestion({ ...q, confirm: null }), 250); },
      });
      return;
    }
    showModal(`<h3>${ic('ask', 22)} ${esc(nm())}から しつもん</h3><div class="zsq hero sm">${mini(S)}</div>
      <p>${esc(q.q)}</p><div class="choices">${q.a.map((a, i) => `<button class="choice" data-a="ans" data-i="${i}"><span class="grow">${esc(a)}</span></button>`).join('')}</div>
      <div class="row"><button class="btn gray" data-a="later">また こんどね</button></div>`, {
      ans: el => reply(dispatch('answer', { id: q.id, a: q.a[+el.dataset.i] })),
      later: () => { G.state.askDay = dayKey(); closeModal(); say('うん、また こんど きくね'); },
    });
  });
  function reply(t) { closeModal(); say(t); fx('heart'); beep(990, .06); }
}

/* ---------------- おみやげ・いっしょの ひ ---------------- */
export function showSouvenir(g) {
  eventModal(() => {
    showModal(`<h3>${ic('gift', 22)} おみやげ</h3><div class="zsq hero sm">${mini(G.state)}</div>
      <p>${esc(nm())}「るすの あいだに みつけたの！ あげる！」</p><div class="reveal"><div class="rv">${ic(g.ic, 60)}</div></div><p><b>${esc(g.name)}</b> を もらった</p>
      <div class="row"><button class="btn" data-a="close">ありがとう！</button></div>`);
    beep(880, .08); setTimeout(() => beep(1175, .1), 120);
  });
}
export function showMilestone(m) {
  eventModal(() => {
    showModal(`<h3>${ic('cal', 22)} いっしょに ${m.n}にち！</h3><div class="zsq hero sm">${mini(G.state)}</div>
      <p>${esc(nm())}「いつも きてくれて ありがとう。これからも よろしくね」</p>
      <p>おいわいに ${ic('shell', 18)} かいがら ×${m.gift} と ${ic('seed', 18)} たね を もらった</p>
      <p class="note">あいだが あいても、この かずは へらないよ</p>
      <div class="row"><button class="btn" data-a="close">うん！</button></div>`);
    setTimeout(() => confetti(34), 300);
  });
}

/* ---------------- もようがえ（じゆうに うごかす）---------------- */
let room = false, moved = false, lastMoved = null;
export const roomMode = () => room;
export function toggleRoom() {
  const S = G.state;
  if (room) return exitRoom();
  if (!S.inv.placed.length) { say('かざる ものが ないよ。ショップや はたけで てに いれよう'); return; }
  room = true; moved = false; lastMoved = null;
  $('scene').classList.add('room');
  const bar = document.createElement('div'); bar.id = 'roomBar'; bar.className = 'roombar';
  bar.innerHTML = `${ic('hand', 16)} ゆびで うごかしてね <button class="btn sm" id="roomDone">できた！</button>`;
  $('scene').appendChild(bar);
  $('roomDone').onclick = e => { e.stopPropagation(); exitRoom(); };
  document.querySelectorAll('#decor .decor').forEach(el => {
    el.onpointerdown = ev => {
      ev.preventDefault(); el.setPointerCapture(ev.pointerId); el.classList.add('drag');
      const rect = $('scene').getBoundingClientRect();
      el.onpointermove = mv => {
        const x = Math.max(3, Math.min(97, (mv.clientX - rect.left) / rect.width * 100));
        const y = Math.max(1, Math.min(34, (rect.bottom - mv.clientY) / rect.height * 100 - 4));
        el.style.left = x + '%'; el.style.bottom = y + '%'; el.dataset.x = x; el.dataset.y = y;
      };
      el.onpointerup = () => {
        el.onpointermove = null; el.classList.remove('drag');
        if (el.dataset.x) { dispatch('placeDecor', { id: el.dataset.id, x: +el.dataset.x, y: +el.dataset.y }); moved = true; lastMoved = +el.dataset.x; beep(700, .04); }
      };
    };
  });
  say('どこに おこうかな？');
}
function exitRoom() {
  room = false;
  $('scene').classList.remove('room');
  $('roomBar')?.remove();
  document.querySelectorAll('#decor .decor').forEach(el => { el.onpointerdown = null; });
  $('decor').dataset.k = '';
  dispatch('roomDone', { moved });
  if (moved) {
    const S = G.state;
    if (S.stage !== 'egg' && !S.sleeping && lastMoved != null) S.pos = Math.round(Math.max(20, Math.min(80, lastMoved)));
    setTimeout(() => say(pick(['わあ、あたらしい おへや！', 'ここ おきにいり！', 'すてき〜！ ありがとう', 'なんだか わくわく する！'])), 900);
    fx('sparkle');
  }
}
