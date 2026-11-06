// =========================================================
//  イカの「こころ」
//  ---------------------------------------------------------
//  ・8つの パラメータ（0〜100）… かかわりかたで いくらでも かわる
//  ・せいかくの タイプ（19しゅるい）… パラメータが いちばん ちかい タイプ
//  ・くせ（とくちょう）… とびぬけた パラメータ
//  ・きぶん … いまの じょうたいで きまる
//  ・すき／きらい … たべもの・あそび・ぼうしを けいけんで おぼえる
//  ・おもいで … たいせつな できごとを おぼえていて、ときどき おもいだす
//  ・ひとりあそび … ひまな とき、せいかくに あわせて じぶんで うごく
//  ・こどもほど かわりやすい ／ つぎの せだいに すこし うけつがれる
// =========================================================
import { G, bus, clamp, rand, pick, isNight, hashStr } from './state.js';
import { PERSONALITY, FOODS, HATS } from './config.js';
import { missLine, dreamLine } from './memory.js';

export const TRAITS = {
  kind:  { short: 'やさしさ', name: 'やさしさ',     color: '#ff8fa8', hi: 'やさしい',       lo: 'ちょっと いじわる' },
  genki: { short: 'げんき', name: 'げんき',       color: '#f6c85f', hi: 'げんきいっぱい', lo: 'のんびりや' },
  sunao: { short: 'すなおさ', name: 'すなおさ',     color: '#7cc68d', hi: 'すなお',         lo: 'はんこうき' },
  yuki:  { short: 'ゆうき', name: 'ゆうき',       color: '#6cc3e0', hi: 'ゆうかん',       lo: 'こわがり' },
  kouki: { short: 'こうきしん', name: 'こうきしん',   color: '#b28ce0', hi: 'こうきしん おうせい', lo: 'しんちょう' },
  amae:  { short: 'あまえ', name: 'あまえ',       color: '#ffb36b', hi: 'さみしがり',     lo: 'ひとりでも へいき' },
  kui:   { short: 'くいしん', name: 'くいしんぼう', color: '#e98a5c', hi: 'くいしんぼう',   lo: 'しょうしょく' },
  kirei: { short: 'きれい', name: 'きれいずき',   color: '#5fb8a2', hi: 'きれいずき',     lo: 'ちらかしや' },
};
export const TKEYS = Object.keys(TRAITS);
const OLD_PRESET = {
  yasashii: { kind: 75, sunao: 65 }, genki: { genki: 78, yuki: 62 }, hazukashi: { yuki: 22, amae: 60 },
  ijippari: { kind: 40, sunao: 22, yuki: 55 }, mypace: {}, shikkari: { sunao: 75, yuki: 70 },
  ottori: { kind: 70, genki: 32 }, amaenbo: { kind: 70, sunao: 30, amae: 75 }, wanpaku: { genki: 78, sunao: 28 },
};

export function fillTraits(t = {}) { const o = {}; for (const k of TKEYS) o[k] = typeof t[k] === 'number' ? t[k] : 50; return o; }
export const randomTraits = () => Object.fromEntries(TKEYS.map(k => [k, Math.round(rand(38, 62))]));
export const presetTraits = per => fillTraits(OLD_PRESET[per] || {});
// おやの せいかくが 3わり うけつがれる
export const inheritTraits = parent => Object.fromEntries(TKEYS.map(k => [k, Math.round((parent?.[k] ?? 50) * .3 + rand(38, 62) * .7)]));

// ---------- ひみつの たいしつ（1ぴきずつ ちがう。だれにも みえない）----------
//   sens: その パラメータの かわりやすさ  contrary: あまのじゃくな パラメータ（さかさに うごく）
//   bias: せいかくの タイプへの なりやすさ
export function newGene() {
  const sens = Object.fromEntries(TKEYS.map(k => [k, Math.round(rand(.3, 2) * 100) / 100]));
  const contrary = Math.random() < .4 ? pick(TKEYS) : null;
  const bias = Object.fromEntries(Object.keys(PERSONALITY).map(id => [id, Math.round(rand(-160, 160))]));
  return { sens, contrary, bias };
}

// ---------- せいかくの タイプ ----------
function typeScore(t, p) {
  const ks = Object.keys(p);
  let sum = 0;
  for (const k of ks) sum += (t[k] - p[k]) ** 2;
  return -sum / ks.length;
}
export function perLabel(t, current = null, gene = null) {
  let best = 'mypace', bs = -Infinity;
  for (const [id, def] of Object.entries(PERSONALITY)) {
    const sc = typeScore(t, def.p) + (id === current ? 60 : 0) + (gene?.bias?.[id] || 0);   // いまの タイプは すこし つよい（ころころ かわらない）
    if (sc > bs) { bs = sc; best = id; }
  }
  return best;
}
// くせ：とびぬけた パラメータ（つよい じゅんに 3つ）
export function quirks(t) {
  return TKEYS.map(k => ({ k, d: t[k] - 50 })).filter(x => Math.abs(x.d) >= 24)
    .sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 3)
    .map(x => ({ k: x.k, up: x.d > 0, name: x.d > 0 ? TRAITS[x.k].hi : TRAITS[x.k].lo }));
}

// ---------- パラメータ → ゲームへの えいきょう（ばいりつ） ----------
export function traitMul(raw) {
  const t = fillTraits(raw);
  const k = t.kind / 100, g = t.genki / 100, s = t.sunao / 100, y = t.yuki / 100;
  const c = t.kouki / 100, a = t.amae / 100, f = t.kui / 100, cl = t.kirei / 100;
  return {
    kenka: .4 + (1 - s) * .7 + (1 - k) * .4 + g * .2,   // けんかの しやすさ
    sorry: .4 + s * .8 + k * .5,                         // じぶんから あやまる
    forgive: .5 + k * .7 + s * .2,                       // ゆるす
    share: Math.max(.2, .3 + k * 1.5 - f * .4),          // おすそわけ（くいしんぼうは にがて）
    confess: .3 + y * 1.4,                               // こくはくの ゆうき
    accept: .6 + k * .6,                                 // こくはくを うけいれる
    talk: .4 + (g + y) / 2 * 1.1,                        // おしゃべり
    play: .4 + g * 1.4,                                  // あそびに さそう
    fake: (1.6 - s * 1.2) * (.7 + a * .6),               // わがままの でやすさ
    refuse: 1.6 - s * 1.3,                               // ごはんを いやがる
    hunger: .8 + f * .5,                                 // おなかの へりかた
    weight: .8 + f * .6,                                 // ふとりやすさ
    energy: .8 + g * .4,                                 // つかれやすさ
    dirt: .5 + cl * 1.0,                                 // よごれが いや
    lonely: a,                                           // さみしがり
    rare: .8 + c * .6,                                   // すなほりで レアを みつける
    joy: .7 + g * .6,                                    // あそびの たのしさ
    newFriend: .7 + c * .6,                              // あたらしい ともだちと なかよく なる はやさ
  };
}

// ---------- かかわりで パラメータを うごかす ----------
const SPEED = .55;
const PLASTIC = { baby: 1.5, child: 1, adult: .55 };   // こどもほど かわりやすい
export function nudge(d, live = true) {
  const S = G.state;
  if (!S || S.stage === 'egg' || !S.tr) return;
  const before = S.per, pl = PLASTIC[S.stage] || 1;
  for (const k in d) {
    if (!(k in S.tr)) continue;
    const v = S.tr[k], dir = Math.sign(d[k]), away = (v - 50) * dir > 0;
    const f = away ? Math.max(.3, 1 - Math.abs(v - 50) / 70) : 1;
    const g = S.gene || {}, sens = g.sens?.[k] ?? 1, flip = g.contrary === k ? -.6 : 1;
    // おなじ かかわりでも、ひと つ ひとつ すこし ちがう（きまぐれな こころ）
    const noise = .6 + Math.random() * .8;
    S.tr[k] = Math.round(clamp(v + d[k] * f * SPEED * pl * sens * flip * noise) * 10) / 10;
  }
  const next = perLabel(S.tr, before, S.gene);
  if (next !== before) {
    S.per = next;
    if (S.stage === 'baby') return;   // あかちゃんの うちは ないしょ
    const from = PERSONALITY[before]?.name || '？', to = PERSONALITY[next].name;
    S.log.unshift({ t: Date.now(), text: `せいかくが「${from}」から「${to}」に かわった` });
    remember(`「${to}」に なった`, 2);
    if (live) bus.emit('perchange', { from: before, to: next });
  }
}
// 1じかん（ゲームの じかん）ごとに きろく → へんかの やじるし
export function snapshot() {
  const S = G.state; if (!S || !S.tr || S.stage === 'egg') return;
  S.trHist ||= [];
  const last = S.trHist[S.trHist.length - 1];
  if (last && S.ageMin - last.a < 60) return;
  S.trHist.push({ a: Math.floor(S.ageMin), tr: { ...S.tr } });
  if (S.trHist.length > 48) S.trHist.shift();
}
export function trend(k) {
  const S = G.state, h = (S.trHist || []).filter(x => S.ageMin - x.a <= 1440);
  if (!h.length) return 0;
  return S.tr[k] - h[0].tr[k];
}

// ともだちの パラメータ（むかしの カードにも たいおう）
export function cardTraits(card) {
  if (card.tr) return fillTraits(card.tr);
  if (card.per && OLD_PRESET[card.per]) return fillTraits(OLD_PRESET[card.per]);
  const h = hashStr(String(card.pid || 'x'));
  return Object.fromEntries(TKEYS.map((k, i) => [k, 30 + ((h >> (i * 3)) % 41)]));
}

// ---------- きぶん ----------
export const MOODS = {
  ukiuki: 'うきうき', futsu: 'ふつう', shonbori: 'しょんぼり', iraira: 'イライラ', dokidoki: 'ドキドキ',
  harapeko: 'はらぺこ', nemunemu: 'ねむねむ', samishii: 'さみしい', kamatte: 'かまってほしい',
  guai: 'ぐあいが わるい', suya: 'すやすや', stop: 'ストップちゅう', kowai: 'こわい', wakuwaku: 'わくわく',
};
export const idleMin = S => S.ageMin - (S.lastTouch ?? S.ageMin);
export function moodOf(S = G.state) {
  if (!S || S.stage === 'egg') return null;
  if (S.paused) return 'stop';
  if (S.sleeping) return 'suya';
  if (S.sick) return 'guai';
  const v = G.visitor, r = v && S.rel ? S.rel[v.card.pid] : null;
  if (r && r.kenka) return 'iraira';
  if (r && r.lover) return 'dokidoki';
  if (S.fake) return 'kamatte';
  if (S.hunger < 25) return 'harapeko';
  if (S.energy < 25) return 'nemunemu';
  if (S.tr.amae > 60 && idleMin(S) > 20) return 'samishii';
  if (S.tr.yuki < 35 && isNight() && !S.lightsOff) return 'kowai';
  if (S.happy < 30) return S.tr.sunao < 40 ? 'iraira' : 'shonbori';
  if (v) return 'wakuwaku';
  if (S.happy > 80) return 'ukiuki';
  return 'futsu';
}

// ---------- すき／きらい ----------
export const GAME_NAMES = { docchi: 'どっちむく？', ink: 'スミでっぽう', dig: 'すなほり' };
const itemName = (cat, id) => cat === 'food' ? FOODS.find(x => x.id === id)?.name : cat === 'hat' ? HATS.find(x => x.id === id)?.name : GAME_NAMES[id];
export function like(cat, id, d) {
  const S = G.state;
  S.likes ||= { food: {}, game: {}, hat: {} };
  const m = S.likes[cat] ||= {};
  const before = m[id] || 0;
  m[id] = clamp(before + d, -10, 10);
  const name = itemName(cat, id);
  if (before < 3 && m[id] >= 3) { remember(`${name}が だいすきに なった`, 1); bus.emit('say', `${name}、だいすきに なっちゃった！`); }
  if (before > -3 && m[id] <= -3) remember(`${name}が きらいに なった`, 1);
}
export function favorite(cat, S = G.state) {
  const m = S.likes?.[cat] || {}; let best = null, bv = 2.99;
  for (const id in m) if (m[id] > bv) { bv = m[id]; best = id; }
  return best;
}
export function disliked(cat, S = G.state) {
  const m = S.likes?.[cat] || {}; let w = null, wv = -2.99;
  for (const id in m) if (m[id] < wv) { wv = m[id]; w = id; }
  return w;
}
export { itemName };

// ---------- おもいで ----------
export function remember(text, w = 1) {
  const S = G.state; if (!S) return;
  S.mem ||= [];
  S.mem.unshift({ t: Date.now(), text, w });
  if (S.mem.length > 16) {   // たいせつな ものを のこす（おもさ ＋ あたらしさ）
    S.mem.sort((x, y) => (y.w * 2 + y.t / 1e12) - (x.w * 2 + x.t / 1e12));
    S.mem.length = 16;
    S.mem.sort((x, y) => y.t - x.t);
  }
}

// ---------- ひとりあそび（ひまな とき、せいかくに あわせて じぶんで うごく）----------
const say = t => bus.emit('say', t);
const fx = (c, d) => bus.emit('fx', c, d);
let weatherNow = () => 'sunny';
export function setWeatherFn(f) { weatherNow = f; }
const BEHAVIORS = [
  { id: 'sing',     w: t => .4 + t.genki / 150 + t.kind / 250, run: S => { say(pick(['ふんふ〜ん♪', 'ら〜ららら〜♪', 'うみの うた〜♪'])); fx('note'); S.happy = clamp(S.happy + 1); } },
  { id: 'exercise', w: t => t.genki / 70, run: S => { say(pick(['いち、に！ いち、に！', 'たいそう たいそう！', 'ジャンプ！'])); bus.emit('bounce'); S.energy = clamp(S.energy - 1); } },
  { id: 'search',   w: t => t.kouki / 60, run: S => {
      if (Math.random() < .12 + S.tr.kouki / 600) { S.shells += 1; say('あっ、かいがら みつけた！'); fx('shell'); nudge({ kouki: .3 }); }
      else say(pick(['なにか ないかな〜', 'この すなの した あやしい…', 'くんくん…'])); } },
  { id: 'tidy',     w: (t, S) => S.messes.length && t.kirei >= 60 ? t.kirei / 35 : 0, run: S => {
      S.messes.pop(); if (!S.messes.length) S.clean = Math.max(S.clean, 80);
      say('よごれてるの きになる… じぶんで おそうじ！'); fx('bubbles'); nudge({ kirei: .3 });
      S.log.unshift({ t: Date.now(), text: 'じぶんで おそうじ した' }); } },
  { id: 'sneak',    w: (t, S) => S.inv.food.snack > 0 && t.kui >= 65 && t.sunao < 55 ? t.kui / 70 : 0, run: S => {
      S.inv.food.snack--; S.hunger = clamp(S.hunger + 5); S.weight += 2; S.happy = clamp(S.happy + 6);
      say('…（こっそり つまみぐい）もぐもぐ'); fx('candy'); nudge({ kui: .4, sunao: -.3 });
      S.log.unshift({ t: Date.now(), text: 'おやつを つまみぐい した' }); } },
  { id: 'daze',     w: t => (100 - t.genki) / 130, run: () => say(pick(['ぼ〜…', 'くも、うごいてる…', 'なんにも しない じかん…'])) },
  { id: 'mirror',   w: (t, S) => S.inv.hat ? .6 : 0, run: S => {
      const h = S.inv.hat, v = S.likes?.hat?.[h] || 0, name = itemName('hat', h);
      if (v <= -3) { say(`この ${name}、ちょっと いや…`); S.happy = clamp(S.happy - 2); }
      else { say(v >= 3 ? `${name}、やっぱり さいこう！` : `${name}、にあうかな？`); like('hat', h, S.happy > 60 ? .5 : -.2); } } },
  { id: 'favfood',  w: (t, S) => favorite('food', S) ? .3 + t.kui / 120 : t.kui > 70 ? .5 : 0, run: S => {
      const id = favorite('food', S); say(id ? `${itemName('food', id)}… たべたいな〜` : 'なにか おいしいもの たべたいな'); } },
  { id: 'lonely',   w: (t, S) => t.amae > 60 && idleMin(S) > 20 ? 1.5 : 0, run: S => {
      say(pick(['…だれか あそんで くれないかな', 'ねえ… どこ？', 'さみしいよ〜'])); if (!S.fake && Math.random() < S.tr.amae / 150) { S.fake = true; S.fakeT = 0; } } },
  { id: 'friend',   w: (t, S) => S.friends.length ? .4 + t.amae / 200 : 0, run: S => {
      const t = missLine(S); if (t) say(t); } },
  { id: 'memory',   w: (t, S) => S.mem?.length ? .35 : 0, run: S => { const m = pick(S.mem.slice(0, 8)); say(`${m.text}…　なつかしいな`); } },
  { id: 'explore',  w: t => t.kouki / 90 + t.yuki / 180, run: S => { S.pos = Math.round(rand(14, 86)); say(pick(['あっちに なにか ありそう！', 'たんけん たんけん！', 'こっちは なにが あるかな？'])); } },
  { id: 'scared',   w: (t, S) => t.yuki < 35 && (isNight() || weatherNow() === 'rain') ? .9 : 0, run: S => { say(pick(['…くらいの ちょっと こわい', 'いまの おと なに…？', 'そばに いてね…'])); S.happy = clamp(S.happy - 1); } },
  { id: 'proud',    w: t => t.yuki > 70 ? .5 : 0, run: () => say(pick(['ぼく、けっこう つよいんだよ！', 'なんでも かかってこい！', 'こわいもの なんて ないもん'])) },
  { id: 'hide',     w: t => .25 + t.kouki / 300 + (100 - t.yuki) / 400, run: S => {   // まわりの いろに とけこんで かくれんぼ
      G.hideUntil = Date.now() + 9000; bus.emit('camo', 9000);
      say(pick(['かくれんぼ しよ！ どこでしょう？', 'すなの いろに なっちゃお…', 'さがしてみて〜'])); } },
  { id: 'shine',    w: (t, S) => isNight() ? .6 + t.genki / 200 : .12, run: S => {
      bus.emit('shine', 4500); say(pick(['ぴかー！', 'ひかって みた！', 'みて みて、きれいでしょ'])); S.happy = clamp(S.happy + 2); } },
  { id: 'inkart',   w: t => t.sunao < 40 || t.genki > 70 ? .35 : .08, run: S => {
      bus.emit('ink'); say(pick(['スミで おえかき〜', 'ぷしゅっ！', 'スミ、どこまで とぶかな'])); } },
  { id: 'chatter',  w: () => .7, run: S => say(pick(PERSONALITY[S.per]?.lines || PERSONALITY.mypace.lines)) },
];

let cd = 3, dcd = 14;
export function idleTick() {
  const S = G.state;
  // ねごと：ねている あいだ ときどき ゆめを みる
  if (S && S.sleeping && !S.paused && !G.modalOpen && !G.busy && S.stage !== 'egg' && --dcd <= 0) { dcd = 14 + Math.floor(Math.random() * 16); if (Math.random() < .55) say(dreamLine(S)); }
  if (!S || S.stage === 'egg' || S.sleeping || S.paused || S.travelReady || G.busy || G.modalOpen || G.visitor) return;
  snapshot();
  if (--cd > 0) return;
  cd = 9 + Math.floor(Math.random() * 9);   // 45〜90びょうに 1かい
  const t = S.tr;
  const opts = BEHAVIORS.map(b => ({ b, w: Math.max(0, b.w(t, S)) })).filter(x => x.w > 0);
  let r = Math.random() * opts.reduce((a, x) => a + x.w, 0);
  for (const x of opts) { r -= x.w; if (r <= 0) { x.b.run(S); bus.emit('changed'); return; } }
}
