// =========================================================
//  たべる えんしゅつ と ミニゲーム（どっちむく？／スミでっぽう／あわキャッチ）
// =========================================================
import { G, bus, pick } from './state.js';
import { ic } from './icons.js';
import { squidSVG } from './art.js';
import { dispatch } from './actions.js';
import { showModal, closeModal, say, beep } from './ui.js';
import { voiceKey } from './story.js';

const $ = id => document.getElementById(id);
const nm = () => G.state.name || 'イカッチ';
const sq = (m = 'happy') => { const S = G.state; return squidSVG(S.stage === 'egg' ? 'baby' : S.stage, m, S.form, S.inv.hat, S.sp, S.sp2); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ================= ごはんを たべる ================= */
const FOOD_COL = { ebi: '#f6c85f', plankton: '#9fdc8c', candy: '#ff9ac0', cake: '#fff0d0' };
bus.on('eat', async ({ ic: fic, fav, hate, line }) => {
  const sc = $('scene'), S = G.state, w = document.querySelector('#pet .squid-wrap');
  if (!sc || !w) { say(line); return; }
  G.busy = true;
  const right = S.pos < 55, x = right ? Math.min(90, S.pos + 27) : Math.max(10, S.pos - 27);
  const food = document.createElement('div'); food.className = 'food-drop'; food.innerHTML = `<div class="plate"></div>${ic(fic, 54)}`;
  food.style.left = x + '%'; sc.appendChild(food);
  beep(520, .05);
  await sleep(950);                                   // ゆらゆら しずんで くる
  w.classList.add(hate ? 'eat-hate' : 'eat-lean'); w.classList.toggle('eat-left', !right);
  if (hate) { say('…う〜ん'); await sleep(700); }
  const col = FOOD_COL[fic] || '#f6c85f';
  for (let i = 0; i < 3; i++) {                        // 3くちで ぱくぱく
    w.classList.remove('chomp'); void w.offsetWidth; w.classList.add('chomp');
    await sleep(160);
    food.style.transform = `translateX(-50%) scale(${1 - (i + 1) * .3})`;
    for (let k = 0; k < 4; k++) {
      const c = document.createElement('i'); c.className = 'crumb';
      c.style.left = `calc(${x}% + ${Math.random() * 20 - 10}px)`; c.style.background = col;
      c.style.setProperty('--dx', (Math.random() * 50 - 25) + 'px'); c.style.setProperty('--dy', (-Math.random() * 30 - 10) + 'px');
      sc.appendChild(c); setTimeout(() => c.remove(), 700);
    }
    const t = document.createElement('div'); t.className = 'mogu'; t.textContent = i === 2 ? 'ごっくん' : 'もぐ';
    t.style.left = `calc(${x}% + ${i % 2 ? 18 : -18}px)`; sc.appendChild(t); setTimeout(() => t.remove(), 900);
    beep(i === 2 ? 440 : 620 + i * 60, .05);
    await sleep(380);
  }
  food.remove();
  w.classList.remove('eat-lean', 'eat-hate', 'chomp', 'eat-left');
  if (fav) {
    for (let k = 0; k < 5; k++) setTimeout(() => bus.emit('fx', 'heart', Math.random() * 60 - 30), k * 120);
    w.classList.add('yummy'); setTimeout(() => w.classList.remove('yummy'), 1200);
    beep(880, .07); setTimeout(() => beep(1175, .09), 120);
  } else if (!hate) { bus.emit('bounce'); bus.emit('fx', 'sparkle'); }
  say(line);
  G.busy = false;
  bus.emit('changed');
});

/* ================= きょうつう ================= */
function stage(title, icon, inner, foot = '') {
  showModal(`<h3>${ic(icon, 20)} ${title}</h3><div class="gstage" id="gs">${inner}</div>${foot}`, {}, true);
  return $('gs');
}
function pop(gs, text, cls = '') {
  const p = document.createElement('div'); p.className = 'gpop ' + cls; p.textContent = text;
  gs.appendChild(p); setTimeout(() => p.remove(), 900);
}
function burst(gs, x, y, cols = ['#ffd54a', '#ff9ac0', '#7fd6f7', '#fff']) {
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('i'); b.className = 'gb';
    const a = Math.PI * 2 * i / 12, d = 30 + Math.random() * 25;
    b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.background = cols[i % cols.length];
    b.style.setProperty('--tx', Math.cos(a) * d + 'px'); b.style.setProperty('--ty', Math.sin(a) * d + 'px');
    gs.appendChild(b); setTimeout(() => b.remove(), 650);
  }
}
const LINES = {
  win:  { soft: 'たのしかったね！ ありがとう', loud: 'やったー！ さいこう！ もういっかい！', tsun: 'ま、まあ きみに しては やるじゃん', shy: '…たのしかった。…また あそんでね', polite: 'すばらしかったです！', yuru: 'いえ〜い、かっちゃった〜' },
  lose: { soft: 'おしかったね。また やろう', loud: 'くやしい〜！ つぎは まけない！', tsun: 'べ、べつに くやしくないし', shy: '…ざんねん。でも たのしかった', polite: 'つぎは がんばりましょう', yuru: 'まあ、そういう ひも あるよね〜' },
};
function result(win, game, scoreHTML, extra = '') {
  dispatch('playResult', { win, game });
  const v = voiceKey(G.state.per);
  showModal(`<h3>${win ? ic('party', 22) + ' かち！' : 'ざんねん！'}</h3>
    <div class="gres ${win ? 'win' : 'lose'}"><div class="gsq">${sq(win ? 'happy' : 'normal')}</div></div>
    <div class="score">${scoreHTML}</div>${extra}
    <p>${nm()}「${(win ? LINES.win : LINES.lose)[v] || LINES.win.yuru}」</p>
    <p class="note">ごきげん +${win ? 25 : 10}${win ? ' ／ かいがら +3' : ''}</p>
    <div class="row"><button class="btn gray" data-a="close">おわる</button><button class="btn" data-a="again">もういっかい</button></div>`, {
    again: () => { closeModal(); setTimeout(() => (game === 'docchi' ? openDocchi : game === 'ink' ? openInk : openCatch)(), 150); },
  });
  if (win) {
    const box = document.querySelector('.gres');
    if (box) for (let i = 0; i < 18; i++) { const c = document.createElement('i'); c.className = 'conf'; c.style.left = Math.random() * 100 + '%'; c.style.background = ['#ff9ac0', '#ffd54a', '#7fd6f7', '#a8eba0'][i % 4]; c.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px'); c.style.setProperty('--r', (Math.random() * 600 - 300) + 'deg'); box.appendChild(c); }
    beep(784, .08); setTimeout(() => beep(988, .08), 120); setTimeout(() => beep(1318, .14), 240);
  } else beep(330, .12);
}

/* ================= どっちむく？（あっちむいて ホイ）================= */
export function openDocchi() {
  const ROUNDS = 5, NEED = 3;
  let round = 0, wins = 0, streak = 0, lock = false;
  const marks = [];
  const gs = stage('どっちむく？', 'eyes', `
    <div class="gtop"><span id="gmsg">${nm()}が むく ほうを あてよう！</span><span class="gstars" id="gstars"></span></div>
    <div class="gsquid" id="gsq">${sq()}</div><div class="gcall" id="gcall"></div>`,
    `<div class="lr"><button class="btn" data-a="L">${ic('left', 20)} ひだり</button><button class="btn" data-a="R">みぎ ${ic('right', 20)}</button></div>`);
  const stars = () => { $('gstars').innerHTML = Array.from({ length: ROUNDS }, (_, i) => `<i class="${marks[i] === 1 ? 'ok' : marks[i] === 0 ? 'ng' : ''}"></i>`).join(''); };
  stars();
  document.querySelectorAll('#modal [data-a=L], #modal [data-a=R]').forEach(b => b.onclick = () => go(b.dataset.a));
  async function go(pickDir) {
    if (lock) return; lock = true;
    document.querySelectorAll('#modal .lr .btn').forEach(b => b.disabled = true);
    const s = $('gsq'), call = $('gcall');
    const ans = Math.random() < .5 ? 'L' : 'R', feint = round >= 2 && Math.random() < .35;
    s.className = 'gsquid'; call.textContent = 'あっち むいて…'; beep(500, .05);
    s.classList.add('wiggle'); await sleep(650);
    if (feint) { s.classList.add(ans === 'L' ? 'peekR' : 'peekL'); await sleep(380); s.classList.remove('peekR', 'peekL'); await sleep(120); }
    call.textContent = 'ホイ！'; s.classList.remove('wiggle'); s.classList.add(ans === 'L' ? 'faceL' : 'faceR'); beep(900, .06);
    await sleep(500);
    const ok = pickDir === ans; round++;
    marks.push(ok ? 1 : 0);
    if (ok) {
      wins++; streak++;
      pop(gs, streak >= 2 ? `${streak}れんぞく！` : 'あたり！', 'ok'); burst(gs, gs.clientWidth / 2, 110); beep(1046, .08);
      s.classList.add('hop');
    } else {
      streak = 0; pop(gs, pick(['へへーん！', 'はずれ〜', 'ひっかかった！']), 'ng'); s.classList.add('tease'); beep(280, .1);
    }
    stars(); $('gmsg').textContent = ok ? (feint ? 'フェイントに まけなかった！' : 'よく わかったね！') : (feint ? 'フェイントだった！' : `${ans === 'L' ? 'ひだり' : 'みぎ'}でした`);
    await sleep(1000);
    s.className = 'gsquid'; call.textContent = '';
    if (wins >= NEED || round - wins > ROUNDS - NEED || round >= ROUNDS) {
      const win = wins >= NEED;
      return result(win, 'docchi', marks.map(m => ic(m ? 'circle' : 'cross', 24)).join(''));
    }
    $('gmsg').textContent = `${round + 1}かいめ！ どっちかな？`;
    document.querySelectorAll('#modal .lr .btn').forEach(b => b.disabled = false);
    lock = false;
  }
}

/* ================= スミでっぽう（およぐ さかなを ねらえ）================= */
export function openInk() {
  const SHOTS = 5, NEED = 3;
  let shot = 0, hits = 0, raf = 0, x = 10, dir = 1, t0 = performance.now(), firing = false, done = false;
  const marks = [];
  const gs = stage('スミでっぽう', 'target', `
    <div class="gtop"><span id="gmsg">さかなが まんなかに きたら スミ！</span><span class="gstars" id="gstars"></span></div>
    <div class="lane"><div class="fishT" id="fish">${ic('fish', 44)}</div><div class="aimline"></div></div>
    <div class="gsquid shooter" id="gsq">${sq()}</div>`,
    `<div class="row"><button class="btn big" data-a="fire">${ic('squid', 20)} スミ！</button></div>`);
  const stars = () => { $('gstars').innerHTML = Array.from({ length: SHOTS }, (_, i) => `<i class="${marks[i] === 1 ? 'ok' : marks[i] === 0 ? 'ng' : ''}"></i>`).join(''); };
  stars();
  const speed = () => .55 + shot * .2;
  function loop(now) {
    if (done) return;
    if (!firing) { x += dir * speed(); if (x > 92) { x = 92; dir = -1; } if (x < 8) { x = 8; dir = 1; } }
    const f = $('fish'); if (!f) return;
    f.style.left = x + '%'; f.style.transform = `translateX(-50%) translateY(${Math.sin((now - t0) / 260) * 6}px) scaleX(${dir > 0 ? -1 : 1})`;
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  document.querySelector('#modal [data-a=fire]').onclick = fire;
  async function fire() {
    if (firing || done) return; firing = true;
    const btn = document.querySelector('#modal [data-a=fire]'); btn.disabled = true;
    const s = $('gsq'); s.classList.remove('recoil'); void s.offsetWidth; s.classList.add('recoil');
    const blob = document.createElement('div'); blob.className = 'inkshot'; gs.appendChild(blob); beep(200, .07);
    firing = false;                              // さかなは とまらない
    await sleep(300);
    blob.remove();
    const ok = Math.abs(x - 50) < 8; shot++; marks.push(ok ? 1 : 0);
    const fx = gs.querySelector('.lane').offsetLeft + gs.clientWidth * x / 100;
    if (ok) {
      hits++; burst(gs, fx, 60, ['#2b2b4a', '#4a4a7a', '#fff']); pop(gs, pick(['ヒット！', 'めいちゅう！', 'おみごと！']), 'ok'); beep(1046, .08);
      const f = $('fish'); f.classList.add('hit'); setTimeout(() => f && f.classList.remove('hit'), 500);
      x = Math.random() < .5 ? 10 : 90;
    } else { burst(gs, gs.clientWidth / 2, 60, ['#2b2b4a', '#6f6f9a']); pop(gs, 'スカッ', 'ng'); beep(260, .08); }
    stars();
    if (hits >= NEED || shot - hits > SHOTS - NEED || shot >= SHOTS) {
      done = true; cancelAnimationFrame(raf);
      await sleep(700);
      return result(hits >= NEED, 'ink', marks.map(m => ic(m ? 'target' : 'poof', 24)).join(''));
    }
    $('gmsg').textContent = shot >= 3 ? 'さかなが はやく なってきた！' : 'その ちょうし！';
    await sleep(250); btn.disabled = false;
  }
}

/* ================= あわキャッチ（あたらしい ゲーム）================= */
const ITEMS = [
  { k: 'bub',  ic: 'bubbles', pt: 1, w: 50, sz: 30 },
  { k: 'ebi',  ic: 'ebi',     pt: 2, w: 22, sz: 30 },
  { k: 'star', ic: 'starfish', pt: 3, w: 8, sz: 30 },
  { k: 'jel',  ic: 'jelly',   pt: 0, w: 20, sz: 34, bad: true },
];
export function openCatch() {
  const TIME = 20, GOAL = 18;
  let px = 50, tx = 50, score = 0, left = TIME, items = [], raf = 0, last = performance.now(), spawnT = 0, stun = 0, over = false, combo = 0;
  const gs = stage('あわキャッチ', 'bubbles', `
    <div class="gtop"><span>${ic('bubbles', 16)} <b id="csc">0</b> / ${GOAL}</span><span class="ctime"><i id="ctm"></i></span></div>
    <div class="catchzone" id="cz"><div class="gsquid catcher" id="gsq">${sq()}</div><div class="chint" id="chint">ゆびで うごかして あわや エビを キャッチ！<br>クラゲに きをつけて</div></div>`,
    `<p class="note">うごかしたい ほうを タップ／スライド</p>`);
  const cz = $('cz'), me = $('gsq');
  const setT = e => { const r = cz.getBoundingClientRect(); tx = Math.max(8, Math.min(92, ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * 100)); };
  cz.onpointerdown = e => { setT(e); cz.setPointerCapture(e.pointerId); $('chint')?.remove(); };
  cz.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') setT(e); };
  function spawn() {
    const tot = ITEMS.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot, it = ITEMS[0];
    for (const x of ITEMS) { r -= x.w; if (r <= 0) { it = x; break; } }
    const el = document.createElement('div'); el.className = 'citem'; el.innerHTML = ic(it.ic, it.sz);
    const o = { it, el, x: 8 + Math.random() * 84, y: -8, v: 18 + Math.random() * 10 + (TIME - left) * 1.3 };
    cz.appendChild(el); items.push(o);
  }
  function loop(now) {
    if (over) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    left -= dt; $('ctm').style.width = Math.max(0, left / TIME * 100) + '%';
    if (stun > 0) stun -= dt; else px += (tx - px) * Math.min(1, dt * 9);
    me.style.left = px + '%'; me.classList.toggle('stun', stun > 0);
    spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = Math.max(.35, .8 - (TIME - left) * .02); }
    const H = cz.clientHeight;
    for (const o of items) {
      o.y += o.v * dt; o.el.style.left = o.x + '%'; o.el.style.top = o.y + '%';
      if (!o.gone && o.y > 70 && o.y < 90 && Math.abs(o.x - px) < 11) {
        o.gone = true; o.el.remove();
        if (o.it.bad) { stun = .9; combo = 0; pop(gs, 'ビリビリ！', 'ng'); beep(160, .15); }
        else {
          combo++; const add = o.it.pt + (combo >= 5 ? 1 : 0); score += add; $('csc').textContent = score;
          pop(gs, combo >= 5 ? `+${add} コンボ！` : `+${add}`, 'ok'); beep(700 + Math.min(combo, 8) * 60, .04);
          burst(gs, cz.offsetLeft + cz.clientWidth * o.x / 100, cz.offsetTop + H * .78, ['#fff', '#bfeaff', '#ffd54a']);
        }
      } else if (o.y > 102 && !o.gone) { o.gone = true; o.el.remove(); if (!o.it.bad) combo = 0; }
    }
    items = items.filter(o => !o.gone);
    if (left <= 0) {
      over = true; items.forEach(o => o.el.remove());
      return setTimeout(() => result(score >= GOAL, 'catch', `${ic('bubbles', 22)} ${score}こ`, `<p class="note">もくひょう ${GOAL}こ</p>`), 400);
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
}
