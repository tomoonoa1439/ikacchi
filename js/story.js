// =========================================================
//  イカが じぶんで かく にっき と たびだちの てがみ
//  ---------------------------------------------------------
//  ・1にちの おわり（ひづけが かわった とき）に、その ひの できごとを
//    せいかくに あった くちょうで にっきに かく
//  ・たびだつ ときに、そだててくれた プレイヤーへ てがみを のこす
// =========================================================
import { G, pick, dayKey } from './state.js';
import { FOODS, PERSONALITY } from './config.js';
import { favorite, itemName } from './traits.js';

// ---- くちょう（せいかくの タイプ → 6つの かきかた）----
const VOICE_OF = {
  yasashii: 'soft', osewazuki: 'soft', ottori: 'soft',
  genki: 'loud', wanpaku: 'loud', ganbariya: 'loud',
  ijippari: 'tsun', kimagure: 'tsun',
  hazukashi: 'shy', samishigari: 'shy', amaenbo: 'shy',
  shikkari: 'polite', kireizuki: 'polite', tanken: 'polite', monoshiri: 'polite',
  mypace: 'yuru', hitorizuki: 'yuru', chakkari: 'yuru', kuishinbo: 'yuru',
};
// good/bad: 文の おわりかた、 I: じぶんの よびかた
const V = {
  soft:   { I: 'わたし', good: ['うれしかったな。', 'あったかい きもちに なったよ。', 'しあわせだったな。'], bad: ['ちょっと かなしかったな。', 'むねが きゅっと したよ。'], open: ['きょうも いちにち ありがとう。', 'きょうの こと、かいておくね。'], close: ['あしたも いい ひに なりますように。', 'おやすみなさい。'] },
  loud:   { I: 'ぼく', good: ['さいこうだった！', 'すっごく たのしかった！', 'やったー！'], bad: ['くやしかった！ でも まけないぞ！', 'ぜんぜん へいき…じゃなかった！'], open: ['きょうも いろいろ あった！', 'にっき かくぞ！'], close: ['あしたも あそぶぞー！', 'ねる！ おやすみ！'] },
  tsun:   { I: 'ぼく', good: ['…まあ、わるくなかったし。', 'べつに うれしくなんか…ちょっとだけ。'], bad: ['ぜんぜん きにしてないし。', '…ふんっ。'], open: ['にっきなんて べつに かきたくないけど。', 'しかたないから かいてあげる。'], close: ['あしたは もっと うまく やるし。', 'おわり。'] },
  shy:    { I: 'わたし', good: ['…ちょっと うれしかった、かも。', '…えへへ。'], bad: ['…すこし こわかった。', '…ないちゃいそうだった。'], open: ['…あのね、きょうの こと。', '…だれにも ないしょの にっき。'], close: ['…あしたも そばに いてね。', '…おやすみ。'] },
  polite: { I: 'わたし', good: ['とても よい いちにち でした。', 'すばらしい けいけんでした。'], bad: ['はんせいが ひつようです。', 'つぎは きを つけます。'], open: ['きょうの きろくを のこします。', 'ほんじつの できごとです。'], close: ['あしたも がんばります。', 'いじょう です。'] },
  yuru:   { I: 'ぼく', good: ['よかったな〜。', 'まあ、いい ひだったな〜。'], bad: ['…ま、いっか〜。', 'そういう ひも あるよね〜。'], open: ['きょうは どんな ひだったかな〜。', 'のんびり かくか〜。'], close: ['さて、ねよっと。', 'おやすみ〜。'] },
};
const voiceOf = per => V[VOICE_OF[per] || 'yuru'];

// その ひの きろく（log）から できごとを ひろう
const PATTERNS = [
  [/(.+)と けんかした（(.+)）/, m => ({ k: 'kenka', who: m[1], why: m[2], w: 5 })],
  [/(.+)が ごめんねって いえて、(.+)と なかなおりした/, m => ({ k: 'makeup', who: m[1] === myName() ? m[2] : m[1], self: m[1] === myName(), w: 5 })],
  [/こいびとに なった/, m => ({ k: 'lover', w: 7 })],
  [/ふたりの たまごが うまれた/, m => ({ k: 'egg', w: 8 })],
  [/たまごを あずかった/, m => ({ k: 'eggget', w: 6 })],
  [/ハプニング：(.+)/, m => ({ k: 'hap', title: m[1], w: 4 })],
  [/わがままを しかった/, m => ({ k: 'scold', w: 2 })],
  [/おせわミス/, m => ({ k: 'mistake', w: 3 })],
  [/ぐあいが わるく なった|ぐあいが わるくなった/, m => ({ k: 'sick', w: 4 })],
  [/(.+)に せいちょうした/, m => ({ k: 'grow', name: m[1], w: 7 })],
  [/すなほりで「(.+)」を みつけた|ずかんに「(.+)」が/, m => ({ k: 'found', item: m[1] || m[2], w: 3 })],
  [/(.+)と (.+)が (.+)を して あそんだ/, m => ({ k: 'fplay', who: m[2], game: m[3], w: 4 })],
  [/(.+)と ともだちに なった！/, m => ({ k: 'newfriend', who: m[1], w: 5 })],
  [/(.+)と しんゆうに なった！/, m => ({ k: 'shinyu', who: m[1], w: 6 })],
  [/つまみぐい/, m => ({ k: 'sneak', w: 3 })],
  [/じぶんで おそうじ/, m => ({ k: 'tidy', w: 2 })],
  [/おもらし|おねしょ/, m => ({ k: 'accident', w: 3 })],
  [/せいかくが「.+」から「(.+)」に/, m => ({ k: 'per', to: m[1], w: 2 })],
  [/やきもち/, m => ({ k: 'jealous', w: 3 })],
];
const myName = () => G.state.name || 'イカッチ';

let used = new Set();
const fresh = list => { const c = list.filter(x => !used.has(x)); const x = pick(c.length ? c : list); used.add(x); return x; };
function sentence(ev, v) {
  const g = () => fresh(v.good), b = () => fresh(v.bad);
  switch (ev.k) {
    case 'kenka': return `${ev.who}と けんかしちゃった。${ev.why}んだ。${b()}`;
    case 'makeup': return ev.self ? `${v.I}から「ごめんね」って いえた。${ev.who}と なかなおり できて ${g()}` : `${ev.who}が「ごめんね」って いってくれた。なかなおり できて ${g()}`;
    case 'lover': return `…${v.I}たち、こいびとに なったんだ。${g()}`;
    case 'egg': return `${v.I}たちの たまごが うまれた！ どんな こに なるのかな。${g()}`;
    case 'eggget': return `ともだちの おうちから たまごが きた。たいせつに するね。`;
    case 'hap': return `うみで「${ev.title.replace(/[！!]$/, '')}」って ことが あったよ。`;
    case 'scold': return `わがまま いって おこられちゃった。${b()}`;
    case 'mistake': return `ちょっと さみしい じかんが あったな。`;
    case 'sick': return `ぐあいが わるく なっちゃった。${b()}`;
    case 'grow': return `${v.I}、${ev.name}に なったんだよ！ ${g()}`;
    case 'found': return `すなの なかから ${ev.item}を みつけた！ ${g()}`;
    case 'fplay': return `${ev.who}と ${ev.game}を して あそんだ。${g()}`;
    case 'newfriend': return `${ev.who}と ともだちに なったよ。${g()}`;
    case 'shinyu': return `${ev.who}と しんゆうに なった。${g()}`;
    case 'sneak': return `…おやつを こっそり たべちゃった。ないしょ だよ。`;
    case 'tidy': return `おへやを じぶんで おそうじ したよ。ぴかぴか！`;
    case 'accident': return `…もらしちゃった。${b()}`;
    case 'per': return `さいきん ${v.I}、すこし かわったかも しれない。`;
    case 'jealous': return `ほかの こと あそんだら、すねられちゃった。`;
  }
  return '';
}
function statSentences(st, v) {
  const out = [];
  const pick = fresh;
  const eats = Object.entries(st.eat || {}).sort((a, b) => b[1] - a[1]);
  if (eats.length) {
    const [id, n] = eats[0], f = FOODS.find(x => x.id === id);
    out.push({ w: 2, i: 1e9, t: favorite('food') === id ? `だいすきな ${f.name}を たべた！ ${pick(v.good)}` : `${f.name}を ${n > 2 ? 'いっぱい ' : ''}たべた。${n > 3 ? 'おなか ぱんぱん！' : 'おいしかった。'}` });
  }
  if ((st.pet || 0) >= 3) out.push({ w: 2, i: 1e9 - 1, t: `たくさん なでて もらった。${pick(v.good)}` });
  const games = Object.entries(st.game || {});
  if (games.length) { const [gid, r] = games[0]; out.push({ w: 2, i: -1, t: r.w > r.l ? `${itemName('game', gid)}で かった！ ${pick(v.good)}` : `${itemName('game', gid)}で まけちゃった。${pick(v.bad)}` }); }
  return out;
}

// くちょうに あわせて ことばを ととのえる
function polish(t, voice) {
  if (voice === 'polite') return t.replace(/あそんだ。/g, 'あそびました。').replace(/しちゃった。/g, 'してしまいました。').replace(/ちゃった。/g, 'てしまいました。').replace(/んだ。/g, 'のです。').replace(/たべた。/g, 'たべました。').replace(/たべた！/g, 'たべました！').replace(/みつけた！/g, 'みつけました！')
    .replace(/あったよ。/g, 'ありました。').replace(/したよ。/g, 'しました。').replace(/なったよ。/g, 'なりました。').replace(/もらった。/g, 'もらいました。')
    .replace(/いえた。/g, 'いえました。').replace(/かった！/g, 'かちました！').replace(/かもしれない。/g, 'かもしれません。').replace(/ないしょ だよ。/g, 'ないしょです。');
  if (voice === 'loud') return t.replace(/あそんだ。/g, 'あそんだ！').replace(/あったよ。/g, 'あったんだ！');
  if (voice === 'shy') return t.startsWith('…') ? t : '…' + t;
  if (voice === 'yuru') return t.replace(/あったよ。/g, 'あったな〜。');
  return t;
}

// ある ひ（dk）の にっきを かく
export function writeDiary(dk) {
  const S = G.state;
  if (!S || S.stage === 'egg') return null;
  const v = voiceOf(S.per);
  used = new Set();
  const evs = [];
  for (const [idx, l] of S.log.entries()) {
    const d = new Date(l.t); const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (k !== dk) continue;
    for (const [re, f] of PATTERNS) { const m = l.text.match(re); if (m) { evs.push({ ...f(m), i: idx }); break; } }
  }
  const lines = evs.map(e => ({ w: e.w + Math.random(), t: sentence(e, v), k: e.k, i: e.i }))
    .filter(x => x.t).concat(statSentences(S.dayStat || {}, v));
  // おなじ しゅるいは 1つだけ、だいじな じゅんに 3〜4こ
  const seen = new Set(), chosen = [];
  for (const x of lines.sort((a, b) => b.w - a.w)) { if (x.k && seen.has(x.k)) continue; seen.add(x.k); chosen.push(x); if (chosen.length >= 4) break; }
  // おきた じゅんばんに ならべる（log は あたらしい じゅん）
  const pickd = chosen.sort((a, b) => (b.i ?? 0) - (a.i ?? 0)).map(x => polish(x.t, VOICE_OF[S.per] || 'yuru'));
  if (!pickd.length) pickd.push(pick(['きょうは しずかな いちにち だった。', 'とくに なにも なかったけど、それも いいよね。', 'のんびり すごした。']));
  const text = [pick(v.open), ...pickd, pick(v.close)].join('\n');
  const entry = { dk, text, per: S.per, name: myName(), t: Date.now() };
  S.diary ||= [];
  S.diary.unshift(entry);
  if (S.diary.length > 60) S.diary.length = 60;
  return entry;
}

// ひづけが かわったら きのうの にっきを かく
export function diaryCheck() {
  const S = G.state;
  if (!S || S.stage === 'egg') { if (S) S.diaryDay = dayKey(); return null; }
  const today = dayKey();
  if (!S.diaryDay) S.diaryDay = today;
  if (S.diaryDay === today) return null;
  const e = writeDiary(S.diaryDay);
  S.diaryDay = today; S.dayStat = {};
  return e;
}

// その ひの うごき（ログに のこらない こと）を かぞえる
export function stat(kind, id, win) {
  const S = G.state; if (!S || S.stage === 'egg') return;
  S.dayStat ||= {};
  if (kind === 'eat') { S.dayStat.eat ||= {}; S.dayStat.eat[id] = (S.dayStat.eat[id] || 0) + 1; }
  if (kind === 'pet') S.dayStat.pet = (S.dayStat.pet || 0) + 1;
  if (kind === 'game') { S.dayStat.game ||= {}; const g = S.dayStat.game[id] ||= { w: 0, l: 0 }; win ? g.w++ : g.l++; }
}

// ---- たびだちの てがみ ----
export function writeLetter() {
  const S = G.state, v = voiceOf(S.per);
  const to = S.player?.name ? `${S.player.name}へ` : 'そだててくれた あなたへ';
  const L = [to, ''];
  L.push(pick({
    soft: ['いままで ほんとうに ありがとう。', 'あなたに そだてて もらえて、しあわせ だったよ。'],
    loud: ['いままで ありがとう！ めっちゃ たのしかった！'],
    tsun: ['…べつに さみしくなんか ないけど、いちおう おれいを いっておく。', 'いままで…まあ、ありがと。'],
    shy: ['…あのね。ずっと いえなかったけど、ありがとう。'],
    polite: ['これまで たいへん おせわに なりました。'],
    yuru: ['いや〜、いろいろ あったね〜。ありがとね〜。'],
  }[VOICE_OF[S.per] || 'yuru']));
  const mem = [...(S.mem || [])].sort((a, b) => b.w - a.w).slice(0, 3);
  if (mem.length) { L.push(''); L.push('おぼえてる？'); for (const m of mem) L.push(`・${m.text}`); }
  const ff = favorite('food'), fg = favorite('game');
  if (ff || fg) { L.push(''); L.push(`${ff ? `${itemName('food', ff)}、だいすき だったな。` : ''}${fg ? `${itemName('game', fg)}も たのしかった。` : ''}`); }
  const lover = S.friends.find(f => S.rel?.[f.pid]?.lover);
  const best = [...S.friends].sort((a, b) => (S.rel?.[b.pid]?.pt || 0) - (S.rel?.[a.pid]?.pt || 0))[0];
  if (lover) L.push(`${lover.name}にも よろしく つたえてね。${v.I}の たいせつな ひと だから。`);
  else if (best) L.push(`${best.name}と あそべて たのしかった。よろしくね。`);
  if ((S.kids || []).length) L.push(`${v.I}の こどもたちの こと、みまもって あげてね。`);
  L.push('');
  L.push(pick({
    soft: ['うみの むこうから、ずっと みまもってるね。'], loud: ['ひろい うみで もっと つよく なってくる！ またね！'],
    tsun: ['…ないてないし。じゃあね。'], shy: ['…わすれないでね。だいすき。'],
    polite: ['どうか おげんきで。'], yuru: ['じゃ、ちょっと うみ いってくるね〜。'],
  }[VOICE_OF[S.per] || 'yuru']));
  L.push(''); L.push(`${myName()}より`);
  return L.join('\n');
}
export { VOICE_OF };
export const personalityName = per => PERSONALITY[per]?.name || '';
