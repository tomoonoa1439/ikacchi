// =========================================================
//  ver 2.0「ハマる しくみ」
//  ---------------------------------------------------------
//  げい（じぶんで おしえて できるように なる）
//  はじめての おもいで（その子だけの アルバム）
//  うみの はたけ（なにが さくかは おたのしみ）
//  イカからの しつもん（あなたの ことを おぼえる）
//  いっしょに すごした ひ（へらない きろく）
//  おみやげ・やすもうね
//  ※ 確率や しくみは がめんに ださない
// =========================================================
import { G, bus, clamp, pick, rand, dayKey, hour } from './state.js';
import { FOODS, DECOR, FINDS } from './config.js';
import { nudge, remember, like, traitMul } from './traits.js';
import { log, addBond, weatherToday } from './sim.js';

const say = t => bus.emit('say', t);
const fx = (c, d) => bus.emit('fx', c, d);
const beep = (f, d) => bus.emit('beep', f, d);
const STAGE_ORDER = { egg: 0, baby: 1, child: 2, teen: 2, adult: 3 };
const myName = () => G.state.name || 'イカッチ';

/* ====================== はじめての おもいで ====================== */
export const FIRSTS = [
  { id: 'hatch',  name: 'うまれた ひ',             cap: 'たまごから「ぱかっ」と うまれた' },
  { id: 'name',   name: 'なまえを もらった',       cap: 'すてきな なまえを つけて もらった' },
  { id: 'meal',   name: 'はじめての ごはん',       cap: 'はじめて たべた ごはんの あじ' },
  { id: 'pet',    name: 'はじめての なでなで',     cap: 'あったかい てで なでて もらった' },
  { id: 'play',   name: 'はじめての あそび',       cap: 'いっしょに あそんだ はじめての ひ' },
  { id: 'win',    name: 'はじめての かち',         cap: 'ゲームで はじめて かった！' },
  { id: 'bed',    name: 'はじめての おふとん',     cap: 'おふとんで ぐっすり ねむれた' },
  { id: 'toilet', name: 'ひとりで トイレ',         cap: 'ひとりで トイレが できた' },
  { id: 'dig',    name: 'はじめての たからさがし', cap: 'すなの なかから たからものを みつけた' },
  { id: 'hat',    name: 'はじめての おしゃれ',     cap: 'あたらしい ぼうしを かぶってみた' },
  { id: 'child',  name: 'こどもに なった ひ',      cap: 'すこし おおきく なった' },
  { id: 'adult',  name: 'おとなに なった ひ',      cap: 'りっぱな おとなに なった' },
  { id: 'trick',  name: 'はじめての げい',         cap: 'れんしゅうして げいを おぼえた' },
  { id: 'friend', name: 'はじめての ともだち',     cap: 'ともだちが できた' },
  { id: 'visit',  name: 'ともだちが きた ひ',      cap: 'ともだちが あそびに きてくれた' },
  { id: 'kenka',  name: 'はじめての けんか',       cap: 'ちょっと けんか しちゃった' },
  { id: 'makeup', name: 'はじめての なかなおり',   cap: 'ごめんねが いえた' },
  { id: 'lover',  name: 'はじめての こい',         cap: 'だいすきな あいてが できた' },
  { id: 'hide',   name: 'かくれんぼ',              cap: 'かくれていたら みつけて もらえた' },
  { id: 'event',  name: 'はじめての ハプニング',   cap: 'うみで びっくりする ことが あった' },
  { id: 'diary',  name: 'はじめての にっき',       cap: 'はじめて にっきを かいた' },
  { id: 'answer', name: 'はじめての おしゃべり',   cap: 'きみの ことを ひとつ しれた' },
  { id: 'bloom',  name: 'はじめての はな',         cap: 'はたけで はじめて なにかが さいた' },
  { id: 'room',   name: 'はじめての もようがえ',   cap: 'おへやが すこし かわった' },
  { id: 'gift',   name: 'はじめての おみやげ',     cap: 'るすの あいだに おみやげを みつけた' },
  { id: 'day7',   name: 'いっしょに 7にち',        cap: '7にち いっしょに すごした' },
];
const SILENT = ['hatch', 'name'];
export function snap(S, m = 'happy') { return { t: Date.now(), st: S.stage === 'egg' ? 'baby' : S.stage, sp: S.sp, sp2: S.sp2 || null, hat: S.inv.hat || null, form: S.form || null, m }; }
export function first(id, m) {
  const S = G.state;
  if (!S || S.stage === 'egg' && id !== 'hatch') return false;
  S.firsts ||= {};
  if (S.firsts[id]) return false;
  const f = FIRSTS.find(x => x.id === id); if (!f) return false;
  S.firsts[id] = snap(S, m || (id === 'bed' ? 'sleep' : 'happy'));
  if (!SILENT.includes(id)) bus.emit('firstNew', f);
  return true;
}
bus.on('first', (id, m) => first(id, m));

/* ====================== げい ====================== */
export const TRICKS = [
  { id: 'kururin', name: 'くるりん',       need: 5,  min: 'baby',  desc: 'その ばで くるっと 1かいてん' },
  { id: 'jump',    name: 'ジャンプ',       need: 6,  min: 'baby',  desc: 'ぴょーんと たかく とびあがる' },
  { id: 'ojigi',   name: 'おじぎ',         need: 6,  min: 'child', desc: 'ぺこりと ごあいさつ' },
  { id: 'dance',   name: 'イカダンス',     need: 8,  min: 'child', desc: 'あしを ふりふり おどる' },
  { id: 'sumiart', name: 'すみアート',     need: 9,  min: 'child', desc: 'すみで ハートを えがく' },
  { id: 'hikari',  name: 'ひかりの あいず', need: 10, min: 'adult', desc: 'からだを ピカッと ひからせる' },
];
export const CUES = ['up', 'down', 'spin', 'star'];
const stageOK = (S, min) => (STAGE_ORDER[S.stage] || 0) >= (STAGE_ORDER[min] || 0);
export const learned = (S = G.state) => TRICKS.filter(t => (S.tricks?.[t.id] || 0) >= t.need);
// いま おしえられる げい（ひとつずつ じゅんばんに）
export function nextTrick(S = G.state) {
  for (const t of TRICKS) {
    if ((S.tricks?.[t.id] || 0) >= t.need) continue;
    return stageOK(S, t.min) ? t : { ...t, locked: true };
  }
  return null;
}
export function trickProg(S, t) {
  S.tricks ||= {};
  if (S.tricks[t.id] == null) S.tricks[t.id] = 1;   // やる気の ぶん、さいしょから すこし すすんでいる
  return S.tricks[t.id];
}
export function lessonsLeft(S = G.state) { const d = S.trickDay || {}; return d.dk === dayKey() ? Math.max(0, 3 - d.n) : 3; }
// れんしゅう 1かい ぶんの けっか（acc: おてほんを どれだけ まねできたか 0〜1）
export function lesson(acc) {
  const S = G.state, t = nextTrick(S);
  if (!t || t.locked) return null;
  if (S.trickDay?.dk !== dayKey()) S.trickDay = { dk: dayKey(), n: 0 };
  S.trickDay.n++;
  S.energy = clamp(S.energy - 6); S.hunger = clamp(S.hunger - 3);
  const m = traitMul(S.tr), tr = S.tr;
  let p = .35 + acc * .4 + (tr.sunao - 50) / 300 + (tr.genki - 50) / 400 + (S.happy - 50) / 400 - (S.energy < 25 ? .2 : 0);
  p = clamp(p, .12, .92);
  const ok = Math.random() < p, spark = ok && acc === 1 && Math.random() < .22;
  const before = trickProg(S, t);
  let gain = ok ? (spark ? 2 : 1) : (Math.random() < .25 ? 1 : 0);
  S.tricks[t.id] = Math.min(t.need, before + gain);
  S.happy = clamp(S.happy + (ok ? 6 : 1)); addBond(ok ? 2 : 1);
  nudge(ok ? { yuki: .8, sunao: .5 } : { yuki: m.refuse > 1.2 ? -.3 : .2 });
  const done = S.tricks[t.id] >= t.need;
  if (done) {
    nudge({ yuki: 2, sunao: 1, kouki: .5 }); addBond(3); S.shells += 5;
    log(`げい「${t.name}」を おぼえた！`); remember(`「${t.name}」を おぼえた`, 3);
    first('trick');
  }
  return { t, ok, spark, gain, done, prog: S.tricks[t.id] };
}
export function perform(id) {
  const S = G.state, t = TRICKS.find(x => x.id === id);
  if (!t || (S.tricks?.[id] || 0) < t.need) return false;
  bus.emit('trick', id);
  if (Date.now() - (G.lastShow || 0) > 20000) { S.happy = clamp(S.happy + 3); G.lastShow = Date.now(); }
  return true;
}

/* ====================== うみの はたけ ====================== */
export const GROW = [
  { id: 'shrimp',     name: 'エビ ×3',          w: 22, hint: 'みどりいろの つぼみ',    give: S => { S.inv.food.shrimp = (S.inv.food.shrimp || 0) + 3; }, ic: 'ebi' },
  { id: 'snack',      name: 'うみのおやつ ×2',  w: 16, hint: 'あまい におい',          give: S => { S.inv.food.snack = (S.inv.food.snack || 0) + 2; }, ic: 'candy' },
  { id: 'shells',     name: 'かいがら ×12',     w: 18, hint: 'しろい つぼみ',          give: S => { S.shells += 12; }, ic: 'shell' },
  { id: 'seeds',      name: 'なぞの たね ×2',   w: 12, hint: 'つぶつぶの つぼみ',      give: S => { S.inv.seeds = (S.inv.seeds || 0) + 2; }, ic: 'seed' },
  { id: 'seaflower',  name: 'うみのはな',       w: 9,  hint: 'ピンクの つぼみ',        decor: true, ic: 'seaflower' },
  { id: 'kelp',       name: 'ゆらゆらコンブ',   w: 8,  hint: 'ながい はっぱが のびてる', decor: true, ic: 'kelp' },
  { id: 'glowshroom', name: 'ひかるキノコ',     w: 7,  hint: 'ぼんやり ひかってる',    decor: true, ic: 'glowshroom' },
  { id: 'cake',       name: 'しんじゅケーキ',   w: 5,  hint: 'あまくて いい におい',   give: S => { S.inv.food.cake = (S.inv.food.cake || 0) + 1; }, ic: 'cake' },
  { id: 'rbflower',   name: 'にじいろのはな',   w: 3,  hint: 'にじいろに キラキラ',    decor: true, ic: 'rbflower', rare: true },
];
export const G_STAGE = [[0, 'たね'], [30, 'め'], [150, 'つぼみ'], [360, 'さいた']];
export const PLOTS = 3;
function rollGrow() {
  const wet = ['rain', 'rainbow'].includes(weatherToday().id);
  const list = GROW.map(g => ({ g, w: g.w * (g.rare && wet ? 3 : 1) })), tot = list.reduce((a, x) => a + x.w, 0);
  let r = Math.random() * tot;
  for (const x of list) { r -= x.w; if (r <= 0) return x.g.id; }
  return 'shrimp';
}
export function plotAge(p, S = G.state) { return (S.gmin || 0) - p.t0 + (p.bonus || 0); }
export function plotStage(p, S = G.state) { if (!p) return -1; const a = plotAge(p, S); let s = 0; G_STAGE.forEach(([m], i) => { if (a >= m) s = i; }); return s; }
export function plant(i) {
  const S = G.state;
  S.garden ||= Array(PLOTS).fill(null);
  if (S.garden[i]) return false;
  if (!(S.inv.seeds > 0)) { say('たねを もってないよ'); return false; }
  S.inv.seeds--;
  S.garden[i] = { id: rollGrow(), t0: S.gmin || 0, bonus: 0, w: [] };
  nudge({ kind: .4, kouki: .4 });
  return true;
}
export function water(i) {
  const S = G.state, p = S.garden?.[i]; if (!p) return false;
  const st = plotStage(p);
  if (st >= 3) return false;
  if (p.w.includes(st)) { say('もう おみず たっぷりだよ'); return false; }
  p.w.push(st); p.bonus = (p.bonus || 0) + 40;
  nudge({ kind: .5, kirei: .2 });
  return true;
}
export function harvest(i) {
  const S = G.state, p = S.garden?.[i]; if (!p || plotStage(p) < 3) return null;
  const g = GROW.find(x => x.id === p.id) || GROW[0];
  S.garden[i] = null;
  let note = '';
  if (g.decor) {
    if (S.inv.decor.includes(g.id)) { S.shells += 15; note = 'もう もってるから、かいがら ×15 に なった'; }
    else { S.inv.decor.push(g.id); S.inv.placed.push(g.id); note = 'おへやに かざったよ'; }
  } else g.give(S);
  S.gseen ||= {}; const isNew = !S.gseen[g.id]; S.gseen[g.id] = (S.gseen[g.id] || 0) + 1;
  log(`はたけで「${g.name}」が さいた！`);
  if (g.rare) remember(`はたけに ${g.name}が さいた`, 2);
  nudge({ kouki: .6, kind: .3 }); S.happy = clamp(S.happy + 6);
  first('bloom');
  return { g, note, isNew };
}
export const budHint = p => (GROW.find(x => x.id === p.id) || GROW[0]).hint;

/* ====================== イカからの しつもん ====================== */
export const QUESTIONS = [
  { id: 'color',  q: 'ねえねえ、すきな いろって なに？', a: ['あか', 'あお', 'きいろ', 'みどり'],
    ref: a => [`きみの すきな ${a}いろの かいがら、みつけたら とっておくね`, `${a}いろを みると、きみの こと おもいだすんだ`] },
  { id: 'season', q: 'どの きせつが いちばん すき？', a: ['はる', 'なつ', 'あき', 'ふゆ'],
    ref: a => [`${a}が すきって いってたよね。ぼくも すきに なってきた`, `はやく ${a}に ならないかなあ`] },
  { id: 'time',   q: 'きみって あさがた？ よるがた？', a: ['あさがた', 'よるがた'],
    ref: a => [a === 'あさがた' ? 'あさがたの きみに あわせて、はやおき してみたよ' : 'よるがたの きみを まってたら、よふかし しちゃった'] },
  { id: 'food',   q: 'きみの すきな たべものって なに？', a: ['あまいもの', 'からいもの', 'しょっぱいもの', 'くだもの'],
    ref: a => [`${a}って どんな あじ？ こんど おしえてね`, `${a}の ゆめを みちゃった`] },
  { id: 'animal', q: 'りくの いきもので すきなのは？', a: ['いぬ', 'ねこ', 'とり', 'うさぎ'],
    ref: a => [`${a}って どんな いきもの？ いつか あってみたいな`, `${a}の まね、してみた！ …にてた？`] },
  { id: 'life',   q: 'ふだんは なにを しているの？', a: ['がっこう', 'しごと', 'おうち', 'ひみつ'],
    ref: a => [a === 'がっこう' ? 'がっこうって たのしい？ ぼくも いってみたい' : a === 'しごと' ? 'おしごと いつも おつかれさま' : a === 'おうち' ? 'おうちで なにして すごしてるの？' : 'ひみつの こと、いつか おしえてね'] },
  { id: 'sea',    q: 'うみと そら、どっちが すき？', a: ['うみ', 'そら'],
    ref: a => [a === 'うみ' ? 'うみが すきって いってくれて うれしかったな' : 'そらって どんな ところ？ いつか みてみたいな'] },
  { id: 'myname', q: 'ぼくの なまえ、きにいってる？', a: ['だいすき', 'まあまあ'],
    ref: a => [a === 'だいすき' ? 'なまえを よばれると うれしいんだ' : 'もっと なまえに にあう イカに なるね'] },
  { id: 'fun',    q: 'いっしょに なにを するのが すき？', a: ['ゲーム', 'なでなで', 'すなほり'],
    ref: a => [`${a}するの、ぼくも すき！`, `また ${a} しようね`] },
  { id: 'feel',   q: 'きょう、げんき？', a: ['げんき！', 'ふつう', 'ちょっと つかれた'], again: 3,
    ref: () => [] },
];
const REPLY = {
  feel: a => a === 'げんき！' ? 'よかった！ ぼくも げんきに なっちゃう' : a === 'ふつう' ? 'ふつうの ひも だいじだよね。のんびり いこ' : 'むりしないでね。ぼくは ここで まってるから',
  myname: a => a === 'だいすき' ? 'えへへ…！ うれしい！' : 'そっかあ。もっと にあう イカに なるね',
  default: a => pick([`${a}なんだ！ おぼえておくね`, `へえ〜、${a}！ ひとつ きみの こと しれた`, `${a}かあ。いいね！`]),
};
// きいても いい しつもんを えらぶ（null なら きかない）
export function pickQuestion(S = G.state) {
  if (S.stage === 'egg' || S.sleeping || S.sick || S.happy < 40 || S.ageMin < 8) return null;
  if (S.askDay === dayKey()) return null;
  S.ans ||= {}; S.pans ||= {};
  const open = QUESTIONS.filter(q => {
    const a = S.ans[q.id]; if (!a) return true;
    return q.again && (Date.now() - a.t) / 864e5 >= q.again;
  });
  if (!open.length) return null;
  const q = pick(open);
  // まえの イカが きいた ことが あれば「きいたよ」と たしかめる
  const prev = S.pans[q.id];
  if (prev && !S.ans[q.id] && !q.again) return { ...q, confirm: prev };
  return q;
}
export function answer(qid, a) {
  const S = G.state, q = QUESTIONS.find(x => x.id === qid);
  S.askDay = dayKey();
  S.ans ||= {}; S.pans ||= {};
  S.ans[qid] = { a, t: Date.now() };
  if (qid !== 'feel') S.pans[qid] = { a, by: myName(), t: Date.now() };
  S.happy = clamp(S.happy + 5); addBond(2); nudge({ amae: .3, kind: .3 });
  if (qid === 'fun') { const map = { ゲーム: ['game', 'docchi'], すなほり: ['game', 'dig'] }; if (map[a]) like(...map[a], 1); }
  if (qid !== 'feel') { log(`${myName()}に「${a}」って おしえた`); remember(`きみが ${a}が すきって しった`, 1); }
  first('answer');
  return (REPLY[qid] || REPLY.default)(a);
}
// いつか ふと いう ひとこと
export function refLine(S = G.state) {
  const ids = Object.keys(S.ans || {}).filter(id => id !== 'feel');
  if (!ids.length) return null;
  const id = pick(ids), q = QUESTIONS.find(x => x.id === id);
  const lines = q ? q.ref(S.ans[id].a) : [];
  return lines.length ? pick(lines) : null;
}
// おかえりの ひとことに そえる
export function lifeGreet(S = G.state) {
  const a = (S.ans?.life || S.pans?.life)?.a; if (!a) return '';
  const h = hour(), wd = new Date().getDay();
  if (h < 15 || h > 21 || wd === 0 || wd === 6) return '';
  return a === 'がっこう' ? 'がっこう おつかれさま！' : a === 'しごと' ? 'おしごと おつかれさま！' : '';
}

/* ====================== いっしょに すごした ひ ====================== */
export const MILESTONES = [3, 7, 14, 30, 50, 100, 150, 200, 365];
// 1にちに 1かい（ひが かわって はじめて ひらいた とき）。へることは ない
export function countDay() {
  const S = G.state;
  S.pdays = (S.pdays || 0) + 1;
  if (S.stage !== 'egg') S.days = (S.days || 0) + 1;
  if ((S.days || 0) >= 7) first('day7');
  if (MILESTONES.includes(S.pdays)) {
    const gift = 5 + Math.min(45, S.pdays);
    S.shells += gift; S.inv.seeds = (S.inv.seeds || 0) + 1;
    log(`イカッチと すごした ひが ${S.pdays}にちに なった！`);
    return { n: S.pdays, gift };
  }
  return null;
}

/* ====================== おみやげ ====================== */
export function souvenir(mins) {
  const S = G.state;
  if (S.stage === 'egg' || S.travelReady || mins < 60) return null;
  if (Math.random() > (mins >= 360 ? .7 : .45)) return null;
  const r = Math.random();
  let g;
  if (r < .4) { S.inv.seeds = (S.inv.seeds || 0) + 1; g = { ic: 'seed', name: 'なぞの たね' }; }
  else if (r < .7) { const n = 3 + Math.floor(rand(0, 6)); S.shells += n; g = { ic: 'shell', name: `かいがら ×${n}` }; }
  else if (r < .9) { const pool = FINDS.filter(f => f.rare === 1); const f = pick(pool); S.inv.finds[f.id] = (S.inv.finds[f.id] || 0) + 1; g = { ic: f.ic, name: f.name }; }
  else { S.inv.food.snack = (S.inv.food.snack || 0) + 1; g = { ic: 'candy', name: 'うみのおやつ' }; }
  log(`るすの あいだに ${myName()}が「${g.name}」を みつけてきた`);
  first('gift');
  return g;
}

/* ====================== やすもうね ====================== */
// ながく あそんでいる とき・よるおそい ときに、やさしく こえを かける（とめは しない）
export function restCheck(activeSec) {
  const S = G.state;
  if (S.stage === 'egg' || G.modalOpen) return null;
  if (activeSec === 40 * 60) return pick(['ねえ、め つかれてない？ すこし やすけい しよ', 'ちょっと のびーって しよう！ ぼくも のびー', 'ずっと いっしょで うれしい。でも おめめ やすめてね']);
  const h = hour(), nk = dayKey(new Date(Date.now() - 6 * 3600e3));
  if (activeSec > 20 && (h >= 23 || h < 4) && S.nightNote !== nk) { S.nightNote = nk; return pick(['もう おそい じかんだよ。また あした あそぼ？', 'ふわぁ… よるおそいね。いっしょに ねよ？']); }
  return null;
}

/* ====================== はじめて ひらいた とき・ひきつぎ ====================== */
export function initGrowth() {
  const S = G.state;
  S.garden ||= Array(PLOTS).fill(null);
  if (S.inv.seeds == null) S.inv.seeds = 2;           // さいしょに 2つ もらえる
  S.inv.pos ||= {};
  if (!S.firsts) {
    S.firsts = {};
    if (S.stage !== 'egg') {   // まえからの イカは、わかる ことだけ さきに うめておく
      S.firsts.hatch = { ...snap(S), t: S.bornAt || Date.now(), st: 'baby' };
      if (S.name) S.firsts.name = { ...snap(S), t: S.bornAt || Date.now(), st: 'baby' };
      if (STAGE_ORDER[S.stage] >= 2) S.firsts.child = { ...snap(S), st: 'child' };
      if (S.stage === 'adult') S.firsts.adult = snap(S);
    }
  }
  if (S.pdays == null) S.pdays = 1;
  if (S.days == null) S.days = S.stage === 'egg' ? 0 : 1;
}
