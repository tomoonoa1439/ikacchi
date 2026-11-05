// =========================================================
//  せいかく（プレイヤーの かかわりかたで いくらでも かわる）
//  ---------------------------------------------------------
//  4つの パラメータ（0〜100）
//    kind  やさしさ … なでる・おすそわけ・なかなおり で あがる / ほうっておく・りふじんに しかる で さがる
//    genki げんき   … あそぶ・すなほり・ともだちと あそぶ で あがる / でんきつけっぱなし・あそばない で さがる
//    sunao すなおさ … ただしく しかる・トイレ・はやね で あがる / あまやかす・りふじんに しかる で さがる
//    yuki  ゆうき   … ゲームに かつ・なでる・こいびと で あがる / ほうっておく・しかりすぎ で さがる
//  パラメータの くみあわせで「せいかく」の なまえが きまり、ふるまいの かくりつが かわる
// =========================================================
import { G, bus, clamp, rand } from './state.js';
import { PERSONALITY } from './config.js';

export const TRAITS = {
  kind:  { name: 'やさしさ', color: '#ff8fa8' },
  genki: { name: 'げんき',   color: '#f6c85f' },
  sunao: { name: 'すなおさ', color: '#7cc68d' },
  yuki:  { name: 'ゆうき',   color: '#6cc3e0' },
};
// むかしの せいかく → パラメータ
const PRESET = {
  yasashii: { kind: 75, genki: 50, sunao: 65, yuki: 50 }, genki: { kind: 50, genki: 78, sunao: 50, yuki: 62 },
  hazukashi: { kind: 55, genki: 40, sunao: 55, yuki: 22 }, ijippari: { kind: 40, genki: 55, sunao: 22, yuki: 55 },
  mypace: { kind: 50, genki: 50, sunao: 50, yuki: 50 },
};
export const randomTraits = () => ({ kind: Math.round(rand(38, 62)), genki: Math.round(rand(38, 62)), sunao: Math.round(rand(38, 62)), yuki: Math.round(rand(38, 62)) });
export const presetTraits = per => ({ ...(PRESET[per] || PRESET.mypace) });

// パラメータ → せいかくの なまえ
export function perLabel(t, m = 0) {
  const hi = v => v >= 65 + m, lo = v => v <= 35 - m;
  if (hi(t.sunao) && hi(t.yuki)) return 'shikkari';
  if (hi(t.genki) && lo(t.sunao)) return 'wanpaku';
  if (hi(t.kind) && lo(t.sunao)) return 'amaenbo';
  if (lo(t.yuki) && (!lo(t.sunao) || t.yuki <= t.sunao)) return 'hazukashi';
  if (lo(t.sunao)) return 'ijippari';
  if (hi(t.kind) && lo(t.genki)) return 'ottori';
  if (hi(t.genki)) return 'genki';
  if (hi(t.kind)) return 'yasashii';
  return 'mypace';
}

// パラメータ → ふるまいの かくりつ（ばいりつ）
export function traitMul(t) {
  const k = t.kind / 100, g = t.genki / 100, s = t.sunao / 100, y = t.yuki / 100;
  return {
    kenka: .4 + (1 - s) * .9 + (1 - k) * .5,   // けんかの しやすさ
    sorry: .4 + s * .8 + k * .5,               // じぶんから あやまる
    forgive: .5 + k * .7 + s * .2,             // あやまられて ゆるす
    share: .3 + k * 1.7,                       // おすそわけ
    confess: .3 + y * 1.4,                     // こくはくする ゆうき
    accept: .6 + k * .6,                       // こくはくを うけいれる
    talk: .4 + (g + y) / 2 * 1.1,              // おしゃべり
    play: .4 + g * 1.4,                        // あそびに さそう
    fake: 1.6 - s * 1.2,                       // わがままの でやすさ
    refuse: 1.6 - s * 1.3,                     // ごはんを いやがる
  };
}

// かかわりで パラメータを うごかす（50から はなれるほど うごきにくいが、いくらでも かわる）
const SPEED = .55;   // せいかくの かわる はやさ
export function nudge(d, live = true) {
  const S = G.state;
  if (!S || S.stage === 'egg' || !S.tr) return;
  const before = S.per;
  for (const k in d) {
    const v = S.tr[k], dir = Math.sign(d[k]), away = (v - 50) * dir > 0;
    const f = away ? Math.max(.3, 1 - Math.abs(v - 50) / 70) : 1;
    S.tr[k] = Math.round(clamp(v + d[k] * f * SPEED) * 10) / 10;
  }
  // さかいめで いったり きたり しないように、かわるときは すこし はっきり してから
  const next = perLabel(S.tr);
  if (next !== before && perLabel(S.tr, 3) === next) S.per = next;
  if (S.per !== before) {
    const from = PERSONALITY[before]?.name || '？', to = PERSONALITY[S.per].name;
    S.log.unshift({ t: Date.now(), text: `せいかくが「${from}」から「${to}」に かわった` });
    if (live) bus.emit('perchange', { from: before, to: S.per });
  }
}

// ともだちの パラメータ（むかしの カードにも たいおう）
export function cardTraits(card) {
  if (card.tr) return card.tr;
  if (card.per && PRESET[card.per]) return PRESET[card.per];
  let h = 0; for (const c of String(card.pid || 'x')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { kind: 30 + h % 41, genki: 30 + (h >> 5) % 41, sunao: 30 + (h >> 10) % 41, yuki: 30 + (h >> 15) % 41 };
}
