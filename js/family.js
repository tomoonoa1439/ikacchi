// =========================================================
//  かけいず（ともだちと つながる 家族の 物語）
//  ---------------------------------------------------------
//  ・1ぴき ずつ uid（その こだけの ID）を もつ
//  ・anc = ごせんぞ { uid: なんだい まえか }（1=おや 2=そふぼ …）
//  ・names = ごせんぞの なまえ・すがた
//  ・こいびとどうしから まれに「ふたりの たまご」が うまれる
//  ・たまごは リンクで ともだちに たくせる → あいての いえで そだつ
//  ・ともだちの イカの カードに anc が のっているので、しんせきが わかる
// =========================================================
import { G, bus, genId, clamp, rand, dayKey } from './state.js';
import { fillTraits, cardTraits } from './traits.js';

export const MAX_EGGS = 3;
const MAX_DEPTH = 4;

export function myUid(S = G.state) { if (!S.uid) S.uid = genId(); return S.uid; }
export const cardUid = c => c.uid || ('p:' + c.pid + ':' + c.name);
const info = p => ({ uid: p.uid, name: p.name, sp: p.sp || 'momo', sp2: p.sp2 || null, owner: p.owner || '' });

// おやたちから ごせんぞの きろくを つくる
export function lineageFor(parents) {
  const anc = {}, names = {};
  for (const p of parents) {
    anc[p.uid] = 1; names[p.uid] = info(p);
    for (const [u, d] of Object.entries(p.anc || {})) {
      if (d + 1 > MAX_DEPTH) continue;
      if (!(u in anc) || anc[u] > d + 1) anc[u] = d + 1;
      if (p.names?.[u]) names[u] = p.names[u];
    }
  }
  // おおすぎたら とおい ほうから けす
  const keys = Object.keys(anc).sort((a, b) => anc[a] - anc[b]).slice(0, 30);
  const A = {}, N = {};
  for (const k of keys) { A[k] = anc[k]; if (names[k]) N[k] = names[k]; }
  return { anc: A, names: N };
}
export const meAsParent = (S = G.state) => ({ uid: myUid(S), anc: S.anc || {}, names: S.names || {}, name: S.name || 'イカッチ', sp: S.sp, sp2: S.sp2, owner: S.player?.name || '' });

// ---- ふたりの たまご ----
export function makeCoupleEgg(card) {
  const S = G.state;
  const mine = meAsParent(S);
  const theirs = { uid: cardUid(card), anc: card.anc || {}, names: card.names || {}, name: card.name, sp: card.sp || 'momo', sp2: card.sp2 || null, owner: card.owner || '' };
  const pickSp = p => (p.sp2 && Math.random() < .5) ? p.sp2 : p.sp;
  let a = pickSp(mine), b = pickSp(theirs);
  if (Math.random() < .5) [a, b] = [b, a];
  let sp = a, sp2 = a === b ? null : b;
  if (Math.random() < .03) sp2 = 'niji';   // ごくまれに ふしぎな いろが まざる
  const t1 = fillTraits(S.tr), t2 = cardTraits(card), tr = {};
  for (const k in t1) tr[k] = Math.round(((t1[k] + t2[k]) / 2) * .45 + rand(38, 62) * .55);
  const { anc, names } = lineageFor([mine, theirs]);
  return { id: genId(), uid: genId(), sp, sp2, tr, parents: [info(mine), info(theirs)], anc, names, from: 'mine', t: Date.now() };
}

// ---- しんせき はんてい ----
export function kinOf(card, S = G.state) {
  const me = { [myUid(S)]: 0, ...(S.anc || {}) };
  const cu = cardUid(card), them = { [cu]: 0, ...(card.anc || {}) };
  if (me[cu] > 0) return me[cu] === 1 ? 'おや' : me[cu] === 2 ? 'おじいちゃん・おばあちゃん' : 'ごせんぞ';
  if (them[S.uid] > 0) return them[S.uid] === 1 ? 'こども' : them[S.uid] === 2 ? 'まご' : 'しそん';
  // むかしの じぶんの イカの こども（たくした たまご）
  const pastUids = (S.album || []).map(a => a.uid).filter(Boolean);
  for (const u of pastUids) if (them[u] === 1) return 'きょうだい（おなじ おやの こ）';
  let best = null;
  for (const u in me) if (u in them && me[u] > 0 && them[u] > 0) { const pr = [me[u], them[u]]; if (!best || pr[0] + pr[1] < best[0] + best[1]) best = pr; }
  if (!best) return null;
  const [a, b] = best;
  if (a === 1 && b === 1) return 'きょうだい';
  if (a === 2 && b === 2) return 'いとこ';
  if (a === 1 && b === 2) return 'おい・めい';
  if (a === 2 && b === 1) return 'おじ・おば';
  if (a === 3 && b === 3) return 'はとこ';
  return 'とおい しんせき';
}

// ともだちに わたす カード用（おおきく なりすぎないように けずる）
export function lineageForCard(S = G.state) {
  const anc = {}, names = {};
  for (const [u, d] of Object.entries(S.anc || {})) if (d <= 3) { anc[u] = d; if (S.names?.[u]) names[u] = S.names[u]; }
  return { uid: myUid(S), anc, names };
}

// こいびとと いっしょに いるときに まれに うまれる（1にち 1かいまで）
export function maybeCoupleEgg(v, r) {
  const S = G.state;
  if (!r.lover || S.stage !== 'adult' || v.card.stage !== 'adult') return false;
  S.eggBox ||= []; S.kids ||= [];
  if (r.eggDay === dayKey() || S.eggBox.length >= MAX_EGGS) return false;
  if (Math.random() > .012) return false;
  r.eggDay = dayKey();
  const egg = makeCoupleEgg(v.card);
  S.eggBox.push(egg);
  S.kids.push({ uid: egg.uid, with: v.card.name, sp: egg.sp, sp2: egg.sp2, t: Date.now() });
  S.log.unshift({ t: Date.now(), text: `${S.name || 'イカッチ'}と ${v.card.name}の あいだに ふたりの たまごが うまれた` });
  bus.emit('coupleEgg', { egg, name: v.card.name });
  return true;
}
