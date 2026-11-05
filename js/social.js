// =========================================================
//  ともだちとの かんけい（しりあい → ともだち → なかよし → しんゆう → こいびと）
//  けんか・なかなおり・やきもち・こくはく など
//  ※ かんけいは じぶんの セーブデータの中だけで すすむ（非同期マルチ）
// =========================================================
import { G, bus, clamp, dayKey, pick } from './state.js';
import { log } from './sim.js';

export const REL = {
  shiriai:   { name: 'しりあい', hearts: 0 },
  tomodachi: { name: 'ともだち', hearts: 1 },
  nakayoshi: { name: 'なかよし', hearts: 2 },
  shinyu:    { name: 'しんゆう', hearts: 3 },
  koibito:   { name: 'こいびと', hearts: 4 },
};
const ORDER = ['shiriai', 'tomodachi', 'nakayoshi', 'shinyu', 'koibito'];
export const REL_RULE = { tomodachi: 20, nakayoshi: 50, shinyu: 80, confess: 90, talkPerDay: 5, giftPerDay: 2, kenkaMinutes: 30, sorryCooldownMin: 5 };

export const LINES = {
  shiriai:   ['はじめまして…', 'どこから きたの？', 'ここ ひろいね', 'なに して あそぶ？', 'ちょっと きんちょう する…'],
  tomodachi: ['あしたも あそぼ！', 'すなほり いっしょに しよ', 'これ みて！ かいがら ひろった', 'きのう ゆめで あったよ', 'おなか すいたね〜'],
  nakayoshi: ['ねえねえ、ないしょの はなし してもいい？', 'おそろいの ぼうし ほしいな', 'きみと いると たのしい！', 'こんど うちにも きてね', 'あの こ ちょっと こわくない？'],
  shinyu:    ['ずっと しんゆうだよ！', 'こまったら いつでも よんでね', 'きみの こと なんでも しってるよ', 'おとなに なっても あそぼうね', 'ひみつきち また いこ！'],
  koibito:   ['となりに いると ドキドキする…', 'いっしょに ゆうひ みたいな', 'きょうも あえて うれしい', 'て、つないでも いい？', 'ずっと いっしょに いようね'],
  kenka:     ['ふんっ！', 'まだ おこってるんだからね', '……', 'しらない！', 'あっち いってて'],
};
export const KENKA_REASONS = [
  'おやつの とりあいに なった', 'どっちが さきに すべるかで もめた', 'かけっこで ズルしたって いわれた',
  'ないしょの はなしを ばらしちゃった', 'からかわれて ムッとした', 'おもちゃを かしてくれなかった',
  'すなの おしろを こわしちゃった', 'じゅんばんを ぬかされた',
];
const GOOD_EVENTS = [
  'いっしょに すなの おしろを つくった！', 'ふたりで ひみつきちを みつけた！', 'おそろいの かいがらを ひろった！',
  'ふたりで ないしょの あいことばを きめた！', 'かけっこで いっしょに ゴールした！', 'ふたりで おなじ うたを うたった！',
];

export function relOf(pid) {
  const S = G.state;
  S.rel ||= {};
  return S.rel[pid] ||= { pt: 10, kenka: false, kenkaUntil: 0, lover: false, day: '', talkN: 0, giftN: 0, lastSorry: 0, asked: false };
}
export function relStage(r) {
  if (r.lover) return 'koibito';
  if (r.pt >= REL_RULE.shinyu) return 'shinyu';
  if (r.pt >= REL_RULE.nakayoshi) return 'nakayoshi';
  if (r.pt >= REL_RULE.tomodachi) return 'tomodachi';
  return 'shiriai';
}
export function daily(r) { const d = dayKey(); if (r.day !== d) { r.day = d; r.talkN = 0; r.giftN = 0; } }
export const canConfess = (r, card) => !r.lover && !r.kenka && relStage(r) === 'shinyu' && G.state.stage === 'adult' && card.stage === 'adult';

export function addRelPt(pid, n, name) {
  const r = relOf(pid), before = relStage(r);
  r.pt = clamp(r.pt + n, 0, 100);
  const after = relStage(r);
  if (after !== before) {
    const up = ORDER.indexOf(after) > ORDER.indexOf(before);
    log(up ? `${name}と ${REL[after].name}に なった！` : `${name}と ちょっと きょりが できちゃった…（${REL[after].name}）`);
    bus.emit('relchange', { pid, before, after, up, name });
  }
  return r;
}

export function startKenka(why = pick(KENKA_REASONS)) {
  const v = G.visitor; if (!v) return;
  const r = relOf(v.card.pid);
  r.kenka = true; r.kenkaUntil = Date.now() + REL_RULE.kenkaMinutes * 60000;
  addRelPt(v.card.pid, -10, v.card.name);
  G.state.happy = clamp(G.state.happy - 10);
  log(`${v.card.name}と けんかした（${why}）`);
  bus.emit('kenka', { pid: v.card.pid, name: v.card.name, why });
}

// あそびに きている あいだ 5びょうごとに よばれる
export function socialTick() {
  const v = G.visitor, S = G.state;
  if (!v || S.sleeping || S.stage === 'egg' || S.travelReady) return;
  const r = relOf(v.card.pid), name = v.card.name;
  if (r.kenka) {
    if (Date.now() > r.kenkaUntil) { r.kenka = false; log(`${name}の きげんが なおった`); bus.emit('say', `${name}「…もう おこってないよ」`); bus.emit('changed'); }
    else if (Math.random() < .08) bus.emit('say', `${name}「${pick(LINES.kenka)}」`);
    return;
  }
  if (G.busy || G.modalOpen) return;
  // けんか：きげんが わるい・おなかが すいてる・わがまま中は おこりやすい
  let p = .004 + (S.happy < 40 ? .01 : 0) + (S.fake ? .01 : 0) + (S.hunger < 30 ? .006 : 0);
  if (r.lover) p *= .5;
  if (Math.random() < p) { startKenka(); return; }
  // いい できごと（1かいの あそびに 1ど まで）
  if (!v.ev && Math.random() < .01) {
    v.ev = true;
    const t = pick(GOOD_EVENTS);
    addRelPt(v.card.pid, 3, name); S.happy = clamp(S.happy + 5);
    log(`${name}と ${t}`); bus.emit('say', `${name}と ${t}`); bus.emit('fx', 'sparkle'); bus.emit('changed');
    return;
  }
  // あいてからの こくはく
  if (!r.asked && r.pt >= REL_RULE.confess && canConfess(r, v.card) && Math.random() < .03) {
    r.asked = true; bus.emit('confess', { pid: v.card.pid, name }); return;
  }
  if (Math.random() < .05) bus.emit('say', `${name}「${pick(LINES[relStage(r)])}」`);
  if (r.lover && Math.random() < .08) bus.emit('fx', 'heart', 40);
}
