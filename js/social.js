// =========================================================
//  ともだちとの かんけい（しりあい → ともだち → なかよし → しんゆう → こいびと）
//  けんか・なかなおり・やきもち・こくはく など
//  ※ ふるまいは ぜんぶ イカ自身が きめる（プレイヤーは みまもるだけ）。
//    せいかく ＋ そのときの きげん・しつけ（＝そだてかた）で かわる
//  ※ かんけいは じぶんの セーブデータの中だけで すすむ（非同期マルチ）
// =========================================================
import { G, bus, clamp, dayKey, pick, hashStr } from './state.js';
import { log, addBond } from './sim.js';
import { PERSONALITY } from './config.js';
import { traitMul, cardTraits, nudge, perLabel } from './traits.js';

export const REL = {
  shiriai:   { name: 'しりあい', hearts: 0 },
  tomodachi: { name: 'ともだち', hearts: 1 },
  nakayoshi: { name: 'なかよし', hearts: 2 },
  shinyu:    { name: 'しんゆう', hearts: 3 },
  koibito:   { name: 'こいびと', hearts: 4 },
};
const ORDER = ['shiriai', 'tomodachi', 'nakayoshi', 'shinyu', 'koibito'];
export const REL_RULE = { tomodachi: 20, nakayoshi: 50, shinyu: 80, confess: 90, talkPerDay: 5, kenkaMinutes: 30 };
export const perOf = id => PERSONALITY[id] || PERSONALITY.mypace;
export const friendPer = card => perLabel(cardTraits(card));
const myMul = () => traitMul(G.state.tr);
const yourMul = card => traitMul(cardTraits(card));

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
const PLAYS = ['かけっこ', 'すなあそび', 'かくれんぼ', 'おにごっこ', 'かいがら さがし', 'なわとび'];
const REPLY = {
  shiriai: ['う、うん…', 'よろしくね', 'そうなんだ〜'], tomodachi: ['いいよ！', 'あはは！', 'ほんと？ すごい！'],
  nakayoshi: ['だれにも いわないよ', 'ぼくも そう おもってた！', 'えへへ'], shinyu: ['もちろん！', 'ずっと いっしょだよ', 'さすが しんゆう！'],
  koibito: ['…うん', 'てれるなあ', 'わたしも だよ'],
};
const GOOD_EVENTS = [
  'いっしょに すなの おしろを つくった！', 'ふたりで ひみつきちを みつけた！', 'おそろいの かいがらを ひろった！',
  'ふたりで ないしょの あいことばを きめた！', 'かけっこで いっしょに ゴールした！', 'ふたりで おなじ うたを うたった！',
];

export function relOf(pid) {
  const S = G.state;
  S.rel ||= {};
  return S.rel[pid] ||= { pt: 10, kenka: false, kenkaUntil: 0, lover: false, day: '', talkN: 0, shareDay: '', askDay: '' };
}
export function relStage(r) {
  if (r.lover) return 'koibito';
  if (r.pt >= REL_RULE.shinyu) return 'shinyu';
  if (r.pt >= REL_RULE.nakayoshi) return 'nakayoshi';
  if (r.pt >= REL_RULE.tomodachi) return 'tomodachi';
  return 'shiriai';
}
export function daily(r) { const d = dayKey(); if (r.day !== d) { r.day = d; r.talkN = 0; } }
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
  G.state.happy = clamp(G.state.happy - 10); nudge({ sunao: -.6 });
  log(`${v.card.name}と けんかした（${why}）`);
  bus.emit('kenka', { pid: v.card.pid, name: v.card.name, why });
}

const say = t => bus.emit('say', t);
const later = (ms, f) => setTimeout(f, ms);

// ---- なかなおり（どちらかが ごめんねを いう → あいてが ゆるすか きめる）----
function makeUp(meSays) {
  const v = G.visitor, S = G.state, r = relOf(v.card.pid);
  const me = S.name || 'イカッチ', you = v.card.name;
  const [from, to] = meSays ? [me, you] : [you, me];
  const listener = meSays ? yourMul(v.card) : myMul();
  const ok = Math.random() < .75 * listener.forgive + (relStage(r) === 'shinyu' || r.lover ? .15 : 0);
  if (!ok) { v.sorryCool = 12; say(`${from}「…ごめんね」　${to}「…まだ ゆるさないもん」`); log(`${from}が あやまったけど、${to}は まだ おこってる`); return; }
  r.kenka = false;
  addRelPt(v.card.pid, 15, you); addBond(1);
  nudge(meSays ? { kind: 1.5, sunao: 1.5 } : { kind: 1 });
  log(`${from}が ごめんねって いえて、${to}と なかなおりした`);
  bus.emit('makeup', { from, to });
}

// ---- こくはく（あいての きもち ＋ せいかくで こたえが きまる）----
function confession(meFirst) {
  const v = G.visitor, S = G.state, r = relOf(v.card.pid);
  const me = S.name || 'イカッチ', you = v.card.name;
  const [from, to] = meFirst ? [me, you] : [you, me];
  const listener = meFirst ? yourMul(v.card) : myMul();
  r.askDay = dayKey();
  const ok = Math.random() < clamp((r.pt - 80) / 20, 0, 1) * listener.accept + .1;
  if (ok) { r.lover = true; nudge({ yuki: 3, kind: 1.5 }); log(`${from}が ${to}に こくはくして、こいびとに なった`); }
  else { addRelPt(v.card.pid, -2, you); if (meFirst) nudge({ yuki: -2 }); log(`${from}が ${to}に こくはくしたけど「しんゆうで いたいな」って いわれた`); }
  bus.emit('confess', { from, to, ok });
}

function playTogether() {
  const v = G.visitor, S = G.state, pid = v.card.pid;
  const me = S.name || 'イカッチ', you = v.card.name, game = pick(PLAYS);
  S.friendPlay[pid] = dayKey();
  S.happy = clamp(S.happy + 15); S.energy = clamp(S.energy - 8); S.shells += 3; addBond(2);
  addRelPt(pid, 8, you); nudge({ genki: 1.5, kind: .5 });
  log(`${me}と ${you}が ${game}を して あそんだ`);
  say(`${me}と ${you}が ${game}を して あそんでる！`); bus.emit('fx', 'note'); bus.emit('fx', 'heart', 30); bus.emit('beep', 880, .08);
}

// あそびに きている あいだ 5びょうごとに よばれる。ぜんぶ イカたちが じぶんで きめる
export function socialTick() {
  const v = G.visitor, S = G.state;
  if (!v || S.sleeping || S.stage === 'egg' || S.travelReady) return;
  v.t = (v.t || 0) + 1;
  const pid = v.card.pid, r = relOf(pid), me = S.name || 'イカッチ', you = v.card.name;
  const P1 = myMul(), P2 = yourMul(v.card);
  daily(r);
  if (G.busy || G.modalOpen) return;

  if (r.kenka) {
    if (Date.now() > r.kenkaUntil) { r.kenka = false; log(`じかんが たって ${you}の きげんが なおった`); say(`${you}「…もう おこってないよ」`); bus.emit('changed'); return; }
    // そだてかた（しつけ・ごきげん）で じぶんから あやまれるか きまる
    const sorryMe = .03 * P1.sorry * (.5 + S.discipline / 100) * (S.happy > 60 ? 1.3 : S.happy < 30 ? .5 : 1);
    const sorryYou = .022 * P2.sorry, x = Math.random();
    if (v.sorryCool > 0) { v.sorryCool--; return; }   // ことわられたら すこし じかんを おく
    if (x < sorryMe) { makeUp(true); bus.emit('changed'); return; }
    if (x < sorryMe + sorryYou) { makeUp(false); bus.emit('changed'); return; }
    if (Math.random() < .08) say(Math.random() < .5 ? `${you}「${pick(LINES.kenka)}」` : `${me}「${pick(LINES.kenka)}」`);
    return;
  }
  if (v.t < 2) return;   // きて すぐは ようすみ

  // けんか：せいかく × きげん
  // 1かいの あそびで けんかは 1どまで
  let p = .0016 * Math.pow(P1.kenka, 1.7) * P2.kenka + (S.happy < 40 ? .01 : 0) + (S.fake ? .008 : 0) + (S.hunger < 30 ? .005 : 0);
  if (r.lover) p *= .5;
  if (!v.kenkaDone && Math.random() < p) { v.kenkaDone = true; startKenka(); return; }

  // こくはく：しんゆうで ふたりとも おとな。ゆうきの ある ほうが いう
  if (r.pt >= REL_RULE.confess && canConfess(r, v.card) && r.askDay !== dayKey()) {
    const pm = .012 * P1.confess, py = .012 * P2.confess, x = Math.random();
    if (x < pm) { confession(true); return; }
    if (x < pm + py) { confession(false); return; }
  }
  // あそびに さそう（1にち 1かい）
  if (S.friendPlay[pid] !== dayKey() && S.happy > 30 && S.energy > 20 && Math.random() < .06 * Math.max(P1.play, P2.play)) { playTogether(); bus.emit('changed'); return; }
  // おすそわけ（おやつを もっていれば じぶんで わける）
  if (r.shareDay !== dayKey() && S.inv.food.snack > 0 && Math.random() < .012 * P1.share) {
    r.shareDay = dayKey(); S.inv.food.snack--; addRelPt(pid, 10, you); nudge({ kind: 1.5 });
    log(`${me}が ${you}に おやつを おすそわけ した`);
    say(`${me}「これ、はんぶんこ しよ！」　${you}「わあ、ありがとう！」`); bus.emit('fx', 'candy'); bus.emit('changed'); return;
  }
  // おしゃべり（1にち 5かいまで なかよしポイント）
  if (r.talkN < REL_RULE.talkPerDay && Math.random() < .06 * (P1.talk + P2.talk) / 2) {
    r.talkN++; addRelPt(pid, 2, you);
    const st = relStage(r);
    say(`${you}「${pick(LINES[st])}」`);
    later(1900, () => { if (G.visitor && G.visitor.card.pid === pid) say(`${me}「${pick(REPLY[st])}」`); });
    bus.emit('changed'); return;
  }
  // いい できごと（1かいの あそびに 1ど まで）
  if (!v.ev && Math.random() < .01) {
    v.ev = true;
    const t = pick(GOOD_EVENTS);
    addRelPt(pid, 3, you); S.happy = clamp(S.happy + 5);
    log(`${me}と ${you}は ${t}`); say(`${me}と ${you}は ${t}`); bus.emit('fx', 'sparkle'); bus.emit('changed');
    return;
  }
  if (Math.random() < .03) say(`${you}「${pick(LINES[relStage(r)])}」`);
  if (r.lover && Math.random() < .08) bus.emit('fx', 'heart', 40);
}
