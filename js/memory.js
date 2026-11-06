// =========================================================
//  いきている かんじ：ともだちとの おもいで・さいかい・ゆめ・おかえり
//  ---------------------------------------------------------
//  ・ともだちごとに「いっしょに した こと」を おぼえておく（rel.ep）
//  ・ひさしぶりに あうと、あいだの じかんや かんけいで あいさつが かわる
//  ・まえの おもいでを はなしたり、あいての せいちょうに きづいたりする
//  ・あえない ともだちを きにしたり、ねごとで ゆめを みたりする
// =========================================================
import { G, pick, dayKey } from './state.js';
import { FOODS } from './config.js';
import { favorite } from './traits.js';
import { voiceKey } from './story.js';

const DAY = 864e5;
const STAGE_NAME = { baby: 'あかちゃん', child: 'こども', teen: 'わかもの', adult: 'おとな' };
const relRaw = pid => (G.state.rel ||= {})[pid] ||= { pt: 10, kenka: false, kenkaUntil: 0, lover: false, day: '', talkN: 0, shareDay: '', askDay: '' };
const close = r => r && (r.lover || r.pt >= 50);
const myName = () => G.state.name || 'イカッチ';

// ---- ともだちごとの できごとを おぼえる（あたらしい じゅん・8こまで）----
export function epi(pid, k, x = '') {
  if (!pid || !G.state) return;
  const r = relRaw(pid);
  r.ep ||= [];
  r.ep.unshift({ t: Date.now(), k, x });
  if (r.ep.length > 8) r.ep.length = 8;
}

// ---- まえの おもいでを ひとこと ----
function recall(r, you) {
  const me = myName();
  const ep = (r.ep || []).filter(e => Date.now() - e.t > 30 * 60000);   // さっきの ことは いわない
  if (!ep.length) return null;
  const e = Math.random() < .6 ? ep[0] : pick(ep);
  switch (e.k) {
    case 'play': return pick([`${you}「このまえの ${e.x}、たのしかったね！」`, `${me}「また ${e.x} しようよ！」`, `${me}「こんどの ${e.x}は まけないからね」`]);
    case 'good': return `${me}「まえに ${e.x.replace(/[！!]$/, '')}の、おぼえてる？」　${you}「もちろん！」`;
    case 'share': return `${you}「このまえ おやつ くれて ありがとう。おいしかった！」`;
    case 'kenka': return r.kenka ? null : pick([`${you}「このまえは けんかして ごめんね」　${me}「もう いいよ」`, `${me}「まえは ${e.x.replace(/た$/, 'たよね')}…　もう へいき？」`]);
    case 'makeup': return `${me}「なかなおり できて よかった」`;
    case 'gift': return `${me}「このまえの ${e.x || 'プレゼント'}、たいせつに してるよ！」`;
    case 'lover': return `${you}「こいびとに なった ひの こと、ずっと おぼえてるよ」`;
    case 'egg': return `${me}「ふたりの たまご、げんきかな」　${you}「きっと だいじょうぶ」`;
  }
  return null;
}

// ---- さいかいの あいさつ（ことばを じゅんばんに いう）----
// prevSeen: まえに あった じかん / grew: あいての かわったところ
export function reunion(f, r, prevSeen) {
  const S = G.state, me = myName(), you = f.name, out = [];
  const gap = prevSeen ? Date.now() - prevSeen : null;
  if (gap == null) return out;                            // はじめて → いつもの あいさつ
  if (r.kenka) return out;
  if (gap > 7 * DAY && !close(r) && r.pt < 20) {           // しりあいは わすれかける
    out.push(`${me}「…えっと、だれ だっけ？」`);
    out.push(`${me}「あっ！ ${you}だ！ まえに あったよね」`);
  } else if (gap > 14 * DAY && close(r)) {
    out.push(r.lover ? `${me}「…ずっと、ずっと あいたかった」` : `${me}「${you}！ ずーっと まってたんだよ！」`);
  } else if (gap > 3 * DAY) {
    out.push(r.lover ? `${me}「あいたかった…！」` : close(r) ? `${me}「ひさしぶり！ げんきだった？」` : `${me}「ひさしぶり〜」`);
  } else if (gap < 3 * 3600e3) {
    out.push(`${you}「また きちゃった」　${me}「えへへ、いらっしゃい」`);
  }
  // あいての かわった ところに きづく
  if (r.grew) {
    out.push(r.grew === 'hat' ? `${me}「その ぼうし、にあうね！」` : `${me}「${you}、${STAGE_NAME[r.grew] ? STAGE_NAME[r.grew] + 'に なったんだね！' : 'すこし かわったね'}」`);
    r.grew = null;
  }
  // じぶんの せいちょうに あいてが きづく
  if (r.seenMy && r.seenMy !== S.stage && STAGE_NAME[S.stage]) out.push(`${you}「${me}、おおきく なったね！」`);
  const rc = gap > 30 * 60000 && Math.random() < .75 ? recall(r, you) : null;
  if (rc) out.push(rc);
  return out;
}
export function markSeen(pid) { const r = relRaw(pid); r.seen = Date.now(); r.seenMy = G.state.stage; }
export const lastSeen = (f, r) => r?.seen || f.lastVisit || f.addedAt || 0;

// ---- あえない ともだちを きにする（ひとりあそび）----
export function missLine(S) {
  const fs = S.friends.map(f => ({ f, r: S.rel?.[f.pid] })).filter(x => x.r);
  if (!fs.length) return null;
  fs.sort((a, b) => (b.r.lover ? 200 : b.r.pt) - (a.r.lover ? 200 : a.r.pt));
  const { f, r } = fs[0], days = (Date.now() - lastSeen(f, r)) / DAY;
  if (r.kenka) return `${f.name}と なかなおり したいな…`;
  if (days > 2 && close(r)) {
    if (S.missDay !== dayKey()) { S.missDay = dayKey(); S.log.unshift({ t: Date.now(), text: `${f.name}に あいたがっていた` }); }
    const e = (r.ep || [])[0];
    return r.lover ? `${f.name}に あいたいな…` : e?.k === 'play' ? `${f.name}と また ${e.x} したいな…` : `${f.name}、さいきん こないな… げんき かな`;
  }
  return r.lover ? `${f.name}の こと かんがえてた` : `${f.name}、げんき かな`;
}

// ---- ねごと（ゆめ）----
export function dreamLine(S) {
  const opts = [];
  for (const f of S.friends) {
    const e = S.rel?.[f.pid]?.ep?.[0];
    if (e?.k === 'play') opts.push(`むにゃ… ${f.name}… ${e.x}… まって〜…`);
    else if (S.rel?.[f.pid]?.lover) opts.push(`むにゃ… ${f.name}…　えへへ…`);
  }
  const fav = favorite('food', S);
  const food = FOODS.find(x => x.id === fav);
  if (food) opts.push(`むにゃ… ${food.name}… もう たべられない…`);
  const m = (S.mem || []).find(x => x.w >= 2);
  if (m) opts.push(`むにゃ…（${m.text} ゆめを みてる…）`);
  opts.push('…すぴー', 'むにゃむにゃ…', '…うみの ゆめ…');
  return pick(opts);
}

// ---- おかえりの あいさつ（せいかくの くちょうで）----
const WB = {
  soft:   ['おかえり。まってたよ', 'ずっと まってたよ。あえて うれしい'],
  loud:   ['おかえりー！ あそぼ！', 'おそいよー！ ずーっと まってたんだから！'],
  tsun:   ['べ、べつに まってなかったし', '…おそい。…しんぱい したんだから'],
  shy:    ['…おかえり。…さみしかった', '…もう こないかと おもった…'],
  polite: ['おかえりなさい', 'おひさしぶりです。おまちして おりました'],
  yuru:   ['あ〜、おかえり〜', 'ひさしぶり〜。ねて まってた〜'],
};
export function welcomeBack(mins) {
  const v = WB[voiceKey(G.state.per)] || WB.yuru;
  return mins > 1440 ? v[1] : v[0];
}
