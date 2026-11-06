// =========================================================
//  プレイヤーの そうさ は すべて dispatch(type, payload) を通る
//  → オンライン化するときは この action を サーバーへ送れば OK
// =========================================================
import { CONFIG, FOODS, HATS, DECOR, FINDS, TOOLS } from './config.js';
import { G, bus, clamp, rand, pick, dayKey, isNight, newState, migrate } from './state.js';
import { care, addBond, log, weatherToday, stageName, baseWeight, bondLevel, wake } from './sim.js';
import { relOf, relStage, addRelPt } from './social.js';
import { nudge, traitMul, like, favorite, disliked, inheritTraits, perLabel, remember } from './traits.js';
import { lineageFor, meAsParent, lineageForCard, MAX_EGGS } from './family.js';
import { stat } from './story.js';
import { epi, reunion, markSeen } from './memory.js';

const say = t => bus.emit('say', t);
const fx = (c, d) => bus.emit('fx', c, d);
const beep = (f, d) => bus.emit('beep', f, d);
const asleepBlock = () => { if (G.state.sleeping) { say('Zzz…（ねてるよ）'); return true; } return false; };

const TOUCH = ['feed', 'futon', 'toilet', 'clean', 'cleanOne', 'medicine', 'pet', 'playResult', 'scold', 'digStart'];
export function dispatch(type, p = {}) {
  const fn = A[type];
  if (!fn) { console.warn('unknown action', type); return; }
  if (G.state.paused && !['resume', 'receiveEgg', 'giveEgg', 'buy', 'equipHat', 'toggleDecor', 'sell', 'setPlayerName', 'importSave'].includes(type)) { say('ストップちゅうだよ。さいかいしてね'); return; }
  if (G.busy && !['cleanOne', 'buy', 'useTool', 'travel', 'receiveEgg', 'giveEgg', 'equipHat', 'toggleDecor', 'sell', 'setPlayerName', 'importSave', 'travel'].includes(type)) return;
  const r = fn(p);
  if (TOUCH.includes(type) && G.state.stage !== 'egg') G.state.lastTouch = G.state.ageMin;   // かまってもらった じかん
  bus.emit('changed', type);
  return r;
}

const A = {
  // ---------- ストップ（いちじていし）----------
  pause() {
    const S = G.state;
    S.paused = true; S.pausedAt = Date.now();
    // すなどけいの のこり じかんも いっしょに とめる
    if (S.boostUntil > Date.now()) { S.boostLeft = S.boostUntil - Date.now(); S.boostUntil = 0; }
    if (G.visitor) G.visitor = null;
    log('ストップした（じかんが とまった）');
  },
  resume() {
    const S = G.state;
    if (!S.paused) return;
    const h = (Date.now() - S.pausedAt) / 3600000;
    S.paused = false; S.lastSaved = Date.now();   // とまっていた あいだの じかんは すすめない
    if (S.boostLeft > 0) { S.boostUntil = Date.now() + S.boostLeft; S.boostLeft = 0; }
    log(`さいかいした（${h < 1 ? Math.max(1, Math.round(h * 60)) + 'ふん' : h.toFixed(1) + 'じかん'} とまっていた）`);
    say('おかえり！ まってたよ'); fx('sparkle');
  },

  // ---------- たまご ----------
  warm() {
    const e = G.state.egg;
    e.warmth = clamp(e.warmth + 22);
    say(e.warmth > CONFIG.warmRange[1] ? 'あつすぎるかも…！' : 'ぽかぽか…'); fx('flame');
  },
  water() { G.state.egg.water = 100; say('みずを きれいにした！'); fx('drop'); },
  talk() {
    if (Date.now() - G.lastTalk < 4000) { say('…（ねてるみたい）'); return; }
    G.lastTalk = Date.now();
    G.state.egg.hatch = Math.min(100, G.state.egg.hatch + 3);
    say(pick(['…ぴく！', 'なかで うごいた！', 'こえ きこえてるかな？'])); fx('note');
  },

  // ---------- おせわ ----------
  feed({ id }) {
    const S = G.state, f = FOODS.find(x => x.id === id);
    if (asleepBlock()) return false;
    if (f.price > 0 && !(S.inv.food[id] > 0)) { say('もってないよ… ショップで かえるよ'); return false; }
    if (S.hunger >= 95 && f.hunger > 10 && id !== 'cake') { say('おなか いっぱい…'); return false; }
    if (id === 'snack' && S.hunger < 25) { say('おやつより ごはんが いい…'); return false; }
    if (f.hunger > 10 && S.hunger > 30 && Math.random() < .1 * traitMul(S.tr).refuse) { say('いやいや！ たべたくない〜'); nudge({ sunao: -.5 }); return false; }
    // すき・きらい
    const fav = favorite('food') === id, hate = disliked('food') === id;
    if (hate && Math.random() < .5) { say(`${f.name}、きらい…`); like('food', id, -.3); return false; }
    if (f.price > 0) S.inv.food[id]--;
    S.weight += (f.weight || 0) * traitMul(S.tr).weight;
    like('food', id, S.hunger < 60 && S.happy > 45 ? 1 : S.hunger > 85 ? -1 : .3);
    if (fav) S.happy = clamp(S.happy + 10);
    stat('eat', id);
    if (S.hunger > 70) nudge({ kui: 1 }); else if (f.hunger < 10) nudge({ kui: .8 });
    // わがまま中に おやつ → あまやかし。おなかが すいてる ときの ごはん → きそく ただしく
    if (S.fake) nudge({ sunao: -2.5, kind: .5 });
    else if (f.hunger < 10 && S.hunger > 50) nudge({ sunao: -1, kind: .5 });
    else if (S.hunger < 50) nudge({ sunao: .3, kind: .2 });
    S.fake = false;
    const wasHungry = S.hunger < 50;
    S.hunger = clamp(S.hunger + f.hunger);
    S.bladder = clamp(S.bladder + f.bladder);
    S.happy = clamp(S.happy + f.happy);
    care('feed');
    if (wasHungry) { S.shells += 1; care('good'); addBond(1); }
    say(fav ? `だいすきな ${f.name}だ！` : hate ? `${f.name}…まあ たべるけど` : f.hunger < 10 || id === 'cake' ? 'あま〜い！' : 'もぐもぐ… おいしい！');
    fx(f.ic); beep(700, .08); bus.emit('bounce');
    return true;
  },
  futon() {
    const S = G.state;
    if (S.sleeping && !S.lightsOff) {           // かってに ねた → でんきを けして おふとんへ
      S.lightsOff = true; S.pos = 22; S.shells += 1; care('good'); addBond(1); nudge({ sunao: .5 });
      say('でんきを けしたよ。おやすみ…'); return;
    }
    if (S.sleeping) {
      wake(S);
      if (S.energy < 50) { S.happy = clamp(S.happy - 5); say('まだ ねむい…'); } else say('おはよう！');
      return;
    }
    if (S.energy > 85 && !isNight()) { say('まだ ねむくないよ！'); return; }
    S.sleeping = true; S.lightsOff = true; S.pos = 22; S.fake = false; say('おやすみなさい…');
    if (S.energy < 40 || isNight()) { S.shells += 1; care('good'); addBond(1); nudge({ sunao: .8 }); }
  },
  scold() {
    const S = G.state;
    if (asleepBlock()) return;
    if (S.fake) {
      S.fake = false; S.discipline = clamp(S.discipline + 25); S.happy = clamp(S.happy - 3); care('good');
      nudge({ sunao: 3.5, yuki: -.5 });
      log(`わがままを しかった（しつけ ${S.discipline}）`);
      say(S.discipline >= 100 ? '…もう わがまま いわない！' : '…ごめんなさい'); fx('sweat');
    } else {
      S.happy = clamp(S.happy - 15); addBond(-3); care('bad');
      nudge({ sunao: -3, yuki: -2.5, kind: -1.5 });   // りふじんに しかると ひねくれる
      say('なんで おこるの…？'); fx('drop'); beep(240, .15);
    }
  },
  foundHide() {
    const S = G.state;
    S.happy = clamp(S.happy + 8); addBond(1); nudge({ kouki: .5, amae: .4 });
    say(pick(['みつかっちゃった〜！', 'えへへ、さすが！', 'なんで わかったの！？'])); fx('sparkle'); beep(990, .08);
    G.state.lastTouch = G.state.ageMin;
  },
  // ---------- どうぐ ----------
  useTool({ id, ...p }) {
    const S = G.state, tool = TOOLS.find(t => t.id === id);
    if (!(S.inv.tools[id] > 0)) { say('もってないよ'); return false; }
    if (id === 'sandglass') {
      S.inv.tools[id]--;
      S.boostUntil = Math.max(Date.now(), S.boostUntil || 0) + tool.boostMin * 60000;
      log('はやおくりの すなどけいを つかった');
      say('さらさら… じかんが はやく すすみはじめた！'); fx('sparkle'); beep(990, .1);
      return true;
    }
    if (id === 'newegg') {
      S.inv.tools[id]--;
      const nm = S.stage === 'egg' ? null : (S.name || 'イカッチ');
      A.travel({ release: true, eggId: p.eggId || null });
      log(nm ? `${nm}を うみに かえして、あたらしい たまごを むかえた` : 'あたらしい たまごに とりかえた');
      say('あたらしい たまごが とどいた！'); fx('egg');
      return true;
    }
  },
  travel({ release = false, eggId = null, letter = null } = {}) {
    const S = G.state;
    const lovers = S.friends.filter(f => S.rel?.[f.pid]?.lover).map(f => f.name);
    if (S.stage !== 'egg') S.album.unshift({ uid: S.uid, gen: S.gen, name: S.name || 'イカッチ', sp: S.sp, sp2: S.sp2 || null, form: S.form, hat: S.inv.hat,
      days: +(S.ageMin / 1440).toFixed(1), bond: bondLevel(), mistakes: S.mistakes, t: Date.now(), release, per: S.per,
      lovers, kids: S.kids || [], parents: S.parents || [], letter, diary: (S.diary || []).slice(0, 14) });
    const egg = (S.eggBox || []).find(e => e.id === eggId);
    const keep = { seenSp: S.seenSp, seenPer: S.seenPer, seenForm: S.seenForm, player: S.player, rel: {}, shells: S.shells + (release ? 0 : 20), inv: S.inv, friends: S.friends, friendPlay: S.friendPlay, redeemed: S.redeemed,
                   album: S.album.slice(0, 30), log: S.log, gen: S.gen + 1, rainbowDay: S.rainbowDay, lastDay: S.lastDay,
                   eggBox: (S.eggBox || []).filter(e => e.id !== eggId) };
    const parent = { name: S.name || 'イカッチ', per: S.per };
    G.state = Object.assign(newState(), keep);
    const N = G.state;
    if (egg) {   // ふたりの たまご
      Object.assign(N, { sp: egg.sp, sp2: egg.sp2 || null, tr: { ...egg.tr }, uid: egg.uid, anc: egg.anc, names: egg.names, parents: egg.parents });
      N.parent = { name: egg.parents.map(p => p.name).join(' と ') };
    } else if (S.stage !== 'egg') {   // ふつうの たまご（おやは まえの イカ）
      N.tr = inheritTraits(S.tr);
      const lin = lineageFor([meAsParent(S)]);
      Object.assign(N, { anc: lin.anc, names: lin.names, parents: [{ uid: S.uid, name: S.name || 'イカッチ', sp: S.sp, sp2: S.sp2 || null, owner: S.player.name }] });
      N.parent = parent;
    } else {   // たまごの まま とりかえ
      Object.assign(N, { gen: S.gen, parent: S.parent || null, anc: S.anc || {}, names: S.names || {}, parents: S.parents || [] });
    }
    N.per = perLabel(N.tr, null, N.gene);
    G.visitor = null;
    if (S.stage !== 'egg' || egg) log(egg ? `${N.parent.name}の たまごを むかえた（${N.gen}だいめ）` : `${keep.gen}だいめの たまごが やってきた`);
  },
  // ---------- ふたりの たまご ----------
  giveEgg({ id }) {
    const S = G.state, egg = (S.eggBox || []).find(e => e.id === id);
    if (!egg) return null;
    S.eggBox = S.eggBox.filter(e => e.id !== id);
    const k = (S.kids || []).find(x => x.uid === egg.uid); if (k) k.given = true;
    log('ふたりの たまごを ともだちに たくした');
    return { egg: { ...egg, from: 'friend' }, fromName: S.player.name || S.name, from: S.player.id };
  },
  receiveEgg({ data }) {
    const S = G.state, egg = data.egg;
    if (!egg || !egg.id) return { ok: false, msg: 'たまごが よめなかった' };
    if (data.from === S.player.id) return { ok: false, msg: 'じぶんが たくした たまごだよ' };
    if (S.redeemed.includes('egg:' + egg.id)) return { ok: false, msg: 'この たまごは もう うけとったよ' };
    S.eggBox ||= [];
    if (S.eggBox.length >= MAX_EGGS) return { ok: false, msg: 'たまごポケットが いっぱいだよ' };
    S.redeemed = ['egg:' + egg.id, ...S.redeemed].slice(0, 200);
    S.eggBox.push({ ...egg, from: 'friend', fromName: data.fromName || 'ともだち' });
    log(`${data.fromName || 'ともだち'}から ${egg.parents.map(p => p.name).join(' と ')}の たまごを あずかった`);
    remember(`${egg.parents.map(p => p.name).join(' と ')}の たまごを あずかった`, 2);
    fx('egg'); beep(990, .12);
    return { ok: true, egg };
  },
  importSave({ data }) {
    G.state = migrate(data); G.state.lastSaved = Date.now(); G.visitor = null;
    log('ひっこしして きた！');
  },
  toilet() {
    const S = G.state;
    if (asleepBlock()) return;
    if (S.bladder < 30) { say('まだ でないよ〜'); return; }
    G.busy = true; S.pos = 80; say('トイレ いってくる！');
    setTimeout(() => {
      S.bladder = 0; S.happy = clamp(S.happy + 10); S.shells += 2; care('good'); addBond(2); nudge({ sunao: 1 });
      say('ひとりで できた！ スッキリ〜'); fx('sparkle'); beep(880, .1); bus.emit('changed');
      setTimeout(() => { S.pos = 50; G.busy = false; bus.emit('changed'); }, 1200);
    }, 1600);
  },
  clean() {
    const S = G.state;
    if (!S.messes.length) { say('もう ぴかぴかだよ！'); return; }
    const slow = S.messes.some(m => S.ageMin - (m.a ?? S.ageMin) > 10);
    S.messes = []; S.clean = 100; S.shells += 1; care('good'); addBond(1);
    nudge(slow ? { kind: .3, kirei: -.3 } : { kind: .3, kirei: 1.5 });   // すぐ おそうじすると きれいずきに
    say('おそうじ できた！ ありがと'); fx('bubbles');
  },
  cleanOne({ i }) {
    const S = G.state;
    S.messes.splice(i, 1);
    if (!S.messes.length) { S.clean = Math.max(S.clean, 80); care('good'); }
    fx('bubbles'); beep(760, .05);
  },
  medicine() {
    const S = G.state;
    if (!S.sick) return;
    S.sick = false; S.happy = clamp(S.happy - 5); care('good');
    log('おくすりで げんきに なった'); say('にがい… でも げんきに なった！'); fx('pill');
  },
  pet() {
    const S = G.state;
    if (S.stage === 'egg') return A.talk();
    if (asleepBlock()) return;
    if (Date.now() - G.lastPet < 2500) { say('くすぐったいよ〜'); return; }
    G.lastPet = Date.now(); S.happy = clamp(S.happy + 4); addBond(1); stat('pet');
    nudge(S.fake ? { kind: 1, sunao: -1.5 } : { kind: 1.5, yuki: .6 });   // わがまま中に なでると あまえんぼうに
    S.fake = false;
    say(pick(['えへへ', 'なでなで うれしい！', 'すき〜！'])); fx('heart'); bus.emit('bounce'); beep(980, .05);
  },
  playResult({ win, game = 'docchi' }) {
    const S = G.state;
    S.energy = clamp(S.energy - 10); S.hunger = clamp(S.hunger - 5); S.happy = clamp(S.happy + (win ? 25 : 10));
    care('play'); addBond(win ? 3 : 2);
    like('game', game, win ? 1 : S.tr.yuki < 40 ? -1 : -.3); stat('game', game, win);
    if (favorite('game') === game) S.happy = clamp(S.happy + 8);
    if (game !== S.lastGame) nudge({ kouki: .8 }); S.lastGame = game;
    nudge(S.fake ? { genki: 2, sunao: -1.5 } : { genki: 2.2, yuki: win ? 1.8 : .4 });
    S.fake = false;
    S.weight = Math.max(baseWeight(S.stage), S.weight - 1);
    if (win) S.shells += 3;
    say(win ? 'たのしかった〜！' : 'くやしい… もういっかい！'); if (win) fx('party');
  },

  // ---------- すなほり ----------
  digStart() {
    const S = G.state, d = CONFIG.dig;
    if (S.stage === 'egg') { say('うまれてから いこうね'); return false; }
    if (asleepBlock()) return false;
    if (S.energy < d.energy) { say('つかれてて ほれない…'); return false; }
    S.energy = clamp(S.energy - d.energy); S.hunger = clamp(S.hunger - d.hunger);
    nudge({ genki: 1.2, yuki: .6, kouki: .8 }); like('game', 'dig', .5);
    S.weight = Math.max(baseWeight(S.stage), S.weight - 1);
    return true;
  },
  digSpot() {
    const S = G.state, r = Math.random();
    if (S.treasure) {   // たからの ちず
      S.treasure = false;
      const pool = FINDS.filter(f => f.rare === 3 && !f.weather);
      const f = pool[Math.floor(Math.random() * pool.length)], first = !S.inv.finds[f.id];
      S.inv.finds[f.id] = (S.inv.finds[f.id] || 0) + 1; S.shells += 5;
      log(`たからの ちずの ばしょから「${f.name}」が でてきた！`); remember(`たからの ちずで ${f.name}を みつけた`, 2);
      return { kind: 'find', f, first, treasure: true };
    }
    if (r < .38) { const n = 1 + Math.floor(rand(0, 3)); S.shells += n; return { kind: 'shells', n }; }
    if (r < .78) {
      const f = rollFind(), first = !S.inv.finds[f.id];
      S.inv.finds[f.id] = (S.inv.finds[f.id] || 0) + 1;
      if (first) { S.shells += 2; log(`ずかんに「${f.name}」が とうろくされた`); }
      if (f.rare >= 3) { log(`すなほりで「${f.name}」を みつけた！`); remember(`${f.name}を みつけた`, 2); }
      return { kind: 'find', f, first };
    }
    return { kind: 'none', text: pick(['なにも なかった…', 'ヤドカリが にげていった', 'キラッと…きのせいだった']) };
  },

  // ---------- ショップ / もちもの ----------
  buy({ kind, id }) {
    const S = G.state;
    const list = { food: FOODS, hat: HATS, decor: DECOR, tool: TOOLS }[kind];
    const it = list.find(x => x.id === id);
    if (S.shells < it.price) { say('かいがらが たりないよ…'); beep(260, .1); return false; }
    if (kind === 'hat' && S.inv.hats.includes(id)) return false;
    if (kind === 'decor' && S.inv.decor.includes(id)) return false;
    S.shells -= it.price;
    if (kind === 'food') S.inv.food[id] = (S.inv.food[id] || 0) + 1;
    if (kind === 'tool') S.inv.tools[id] = (S.inv.tools[id] || 0) + 1;
    if (kind === 'hat') { S.inv.hats.push(id); S.inv.hat = id; }
    if (kind === 'decor') { S.inv.decor.push(id); S.inv.placed.push(id); }
    if (kind !== 'food') nudge({ kouki: .8 });
    log(`ショップで「${it.name}」を かった`);
    say(`${it.name} を かったよ！`); beep(880, .08);
    return true;
  },
  equipHat({ id }) {
    const S = G.state; S.inv.hat = S.inv.hat === id ? null : id;
    if (!S.inv.hat) return;
    const v = S.likes?.hat?.[id] || 0;
    if (v >= 3) { say('だいすきな ぼうしだ！'); S.happy = clamp(S.happy + 8); } else if (v <= -3) { say('これ… あんまり すきじゃない'); S.happy = clamp(S.happy - 5); } else say('にあう？');
    fx('sparkle');
  },
  toggleDecor({ id }) {
    const p = G.state.inv.placed, i = p.indexOf(id);
    if (i >= 0) p.splice(i, 1); else p.push(id);
  },
  sell({ id }) {
    const S = G.state, f = FINDS.find(x => x.id === id);
    if (!(S.inv.finds[id] > 1)) { say('1こは ずかんに のこしておこう'); return false; }
    S.inv.finds[id]--; S.shells += f.value; beep(880, .06);
    say(`${f.name} を うって かいがら+${f.value}`);
    return true;
  },

  // ---------- ともだち（非同期マルチ）----------
  setPlayerName({ name }) { G.state.player.name = (name || '').slice(0, 10); },
  addFriend({ card }) {
    const S = G.state;
    if (card.pid === S.player.id) { say('それは じぶんの カードだよ'); return false; }
    const old = S.friends.find(f => f.pid === card.pid);
    const entry = { ...card, addedAt: old ? old.addedAt : Date.now(), lastVisit: old ? old.lastVisit : 0 };
    if (old) {   // まえに あった ときから かわった ところ
      const r = relOf(card.pid);
      if (card.stage !== old.stage && card.stage !== 'egg') r.grew = card.stage;
      else if (card.hat && card.hat !== old.hat) r.grew = 'hat';
    }
    S.friends = [entry, ...S.friends.filter(f => f.pid !== card.pid)].slice(0, CONFIG.maxFriends);
    if (!old) { log(`${card.owner || 'だれか'}の ${card.name} と ともだちに なった`); nudge({ kouki: 1 }); remember(`${card.name}と であった`, 1); }
    return true;
  },
  removeFriend({ pid }) { const S = G.state; S.friends = S.friends.filter(f => f.pid !== pid); if (G.visitor && G.visitor.card.pid === pid) G.visitor = null; },
  inviteFriend({ pid }) {
    const S = G.state, f = S.friends.find(x => x.pid === pid);
    if (!f) return;
    G.visitor = { card: f, pos: 72 };
    const r = relOf(pid), prev = r.seen || f.lastVisit || null;   // はじめてなら null
    f.lastVisit = Date.now();
    const lines = reunion(f, r, prev);
    markSeen(pid);
    if (prev && Date.now() - prev > 3 * 864e5 && !r.kenka) log(`ひさしぶりに ${f.name}に あえた`);
    // やきもち：なかよし いじょうの こは、きょう ほかの こと あそんでいると すねる
    const playedOther = Object.entries(S.friendPlay).some(([k, d]) => k !== pid && d === dayKey());
    if (!r.kenka && ['nakayoshi', 'shinyu', 'koibito'].includes(relStage(r)) && playedOther && S.friendPlay[pid] !== dayKey() && Math.random() < .4) {
      addRelPt(pid, -3, f.name);
      log(`${f.name}が やきもちを やいた`);
      say(`${f.name}「…きょう ほかの こと あそんでたでしょ」（やきもち）`);
      fx('angry', 50); return;
    }
    if (r.kenka) say(`${f.name}が きたけど、まだ ちょっと ふきげん…`);
    else say(r.lover ? `${f.name}が あいに きてくれた！` : `${f.name} が あそびに きた！`);
    lines.forEach((t, i) => setTimeout(() => { if (G.visitor && G.visitor.card.pid === pid) say(t); }, 2600 * (i + 1)));
    beep(780, .1);
  },
  sendHome() { if (G.visitor) say(`${G.visitor.card.name} は かえっていった`); G.visitor = null; },
  // プレゼント：もちものを へらして ギフトデータを つくる（コード化は net.js）
  makeGift({ kind, id, to }) {
    const S = G.state;
    if (kind === 'food') { if (!(S.inv.food[id] > 0)) return null; S.inv.food[id]--; }
    if (kind === 'find') { if (!(S.inv.finds[id] > 1)) return null; S.inv.finds[id]--; }
    const gift = { gid: S.player.id + '-' + Date.now().toString(36), from: S.player.id, fromName: S.player.name || S.name, to: to || null, kind, id, t: Date.now() };
    log('プレゼントを つつんだ');
    return gift;
  },
  receiveGift({ gift }) {
    const S = G.state;
    if (gift.from === S.player.id) return { ok: false, msg: 'じぶんの プレゼントは あけられないよ' };
    if (gift.to && gift.to !== S.player.id) return { ok: false, msg: 'これは ほかの ひとあての プレゼントみたい' };
    if (S.redeemed.includes(gift.gid)) return { ok: false, msg: 'この プレゼントは もう うけとったよ' };
    const item = (gift.kind === 'food' ? FOODS : FINDS).find(x => x.id === gift.id);
    if (!item) return { ok: false, msg: 'しらない アイテムだった…' };
    S.redeemed = [gift.gid, ...S.redeemed].slice(0, 200);
    if (gift.kind === 'food') S.inv.food[gift.id] = (S.inv.food[gift.id] || 0) + 1;
    else S.inv.finds[gift.id] = (S.inv.finds[gift.id] || 0) + 1;
    addBond(2); epi(gift.from, 'gift', item.name);
    log(`${gift.fromName || 'ともだち'}から「${item.name}」が とどいた`);
    fx('gift'); beep(990, .12);
    return { ok: true, item };
  },
};

function rollFind() {
  const w = weatherToday().id;
  const pool = FINDS.filter(f => !f.weather || f.weather.includes(w));
  const boost = (w === 'rain' || w === 'rainbow') ? 2 : 1;
  const m = traitMul(G.state.tr).rare;
  const weight = f => f.rare === 1 ? 10 : f.rare === 2 ? 4 * boost * m : 1 * boost * m;
  let total = pool.reduce((a, f) => a + weight(f), 0), r = Math.random() * total;
  for (const f of pool) { r -= weight(f); if (r <= 0) return f; }
  return pool[0];
}

// ともだちに わたす「カード」= じぶんのイカの みため
export function makeCard() {
  const S = G.state;
  return { pid: S.player.id, owner: S.player.name, name: S.name || 'イカッチ', sp: S.sp, sp2: S.sp2 || null, per: S.per, tr: S.tr, stage: S.stage, form: S.form, hat: S.inv.hat, title: stageName(S), t: Date.now(), ...lineageForCard(S) };
}
