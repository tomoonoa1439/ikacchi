// =========================================================
//  プレイヤーの そうさ は すべて dispatch(type, payload) を通る
//  → オンライン化するときは この action を サーバーへ送れば OK
// =========================================================
import { CONFIG, FOODS, HATS, DECOR, FINDS } from './config.js';
import { G, bus, clamp, rand, pick, dayKey, isNight, newState, migrate } from './state.js';
import { care, addBond, log, weatherToday, stageName, baseWeight, bondLevel, wake } from './sim.js';
import { relOf, relStage, addRelPt, daily, canConfess, LINES, REL_RULE } from './social.js';

const say = t => bus.emit('say', t);
const fx = (c, d) => bus.emit('fx', c, d);
const beep = (f, d) => bus.emit('beep', f, d);
const asleepBlock = () => { if (G.state.sleeping) { say('Zzz…（ねてるよ）'); return true; } return false; };

export function dispatch(type, p = {}) {
  const fn = A[type];
  if (!fn) { console.warn('unknown action', type); return; }
  if (G.busy && !['cleanOne', 'buy', 'equipHat', 'toggleDecor', 'sell', 'setPlayerName', 'importSave', 'travel', 'answerConfess'].includes(type)) return;
  const r = fn(p);
  bus.emit('changed', type);
  return r;
}

const A = {
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
    if (f.hunger > 10 && S.discipline < 50 && S.hunger > 30 && Math.random() < .15) { say('いやいや！ たべたくない〜（しつけが たりない？）'); return false; }
    if (f.price > 0) S.inv.food[id]--;
    S.weight += f.weight || 0;
    S.fake = false;
    const wasHungry = S.hunger < 50;
    S.hunger = clamp(S.hunger + f.hunger);
    S.bladder = clamp(S.bladder + f.bladder);
    S.happy = clamp(S.happy + f.happy);
    care('feed');
    if (wasHungry) { S.shells += 1; care('good'); addBond(1); }
    say(f.hunger < 10 || id === 'cake' ? 'あま〜い！' : 'もぐもぐ… おいしい！');
    fx(f.ic); beep(700, .08); bus.emit('bounce');
    return true;
  },
  futon() {
    const S = G.state;
    if (S.sleeping && !S.lightsOff) {           // かってに ねた → でんきを けして おふとんへ
      S.lightsOff = true; S.pos = 22; S.shells += 1; care('good'); addBond(1);
      say('でんきを けしたよ。おやすみ…'); return;
    }
    if (S.sleeping) {
      wake(S);
      if (S.energy < 50) { S.happy = clamp(S.happy - 5); say('まだ ねむい…'); } else say('おはよう！');
      return;
    }
    if (S.energy > 85 && !isNight()) { say('まだ ねむくないよ！'); return; }
    S.sleeping = true; S.lightsOff = true; S.pos = 22; S.fake = false; say('おやすみなさい…');
    if (S.energy < 40 || isNight()) { S.shells += 1; care('good'); addBond(1); }
  },
  scold() {
    const S = G.state;
    if (asleepBlock()) return;
    if (S.fake) {
      S.fake = false; S.discipline = clamp(S.discipline + 25); S.happy = clamp(S.happy - 3); care('good');
      log(`わがままを しかった（しつけ ${S.discipline}）`);
      say(S.discipline >= 100 ? '…もう わがまま いわない！' : '…ごめんなさい'); fx('sweat');
    } else {
      S.happy = clamp(S.happy - 15); addBond(-3); care('bad');
      say('なんで おこるの…？'); fx('drop'); beep(240, .15);
    }
  },
  travel() {
    const S = G.state;
    S.album.unshift({ gen: S.gen, name: S.name || 'イカッチ', sp: S.sp, form: S.form, hat: S.inv.hat, days: +(S.ageMin / 1440).toFixed(1), bond: bondLevel(), mistakes: S.mistakes, t: Date.now() });
    const keep = { seenSp: S.seenSp, player: S.player, rel: {}, shells: S.shells + 20, inv: S.inv, friends: S.friends, friendPlay: S.friendPlay, redeemed: S.redeemed,
                   album: S.album.slice(0, 30), log: S.log, gen: S.gen + 1, rainbowDay: S.rainbowDay, lastDay: S.lastDay };
    G.state = Object.assign(newState(), keep);
    G.visitor = null;
    log(`${keep.gen}だいめの たまごが やってきた`);
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
      S.bladder = 0; S.happy = clamp(S.happy + 10); S.shells += 2; care('good'); addBond(2);
      say('ひとりで できた！ スッキリ〜'); fx('sparkle'); beep(880, .1); bus.emit('changed');
      setTimeout(() => { S.pos = 50; G.busy = false; bus.emit('changed'); }, 1200);
    }, 1600);
  },
  clean() {
    const S = G.state;
    if (!S.messes.length) { say('もう ぴかぴかだよ！'); return; }
    S.messes = []; S.clean = 100; S.shells += 1; care('good'); addBond(1);
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
    G.lastPet = Date.now(); S.happy = clamp(S.happy + 4); addBond(1); S.fake = false;
    say(pick(['えへへ', 'なでなで うれしい！', 'すき〜！'])); fx('heart'); bus.emit('bounce'); beep(980, .05);
  },
  playResult({ win }) {
    const S = G.state;
    S.energy = clamp(S.energy - 10); S.hunger = clamp(S.hunger - 5); S.happy = clamp(S.happy + (win ? 25 : 10));
    care('play'); addBond(win ? 3 : 2); S.fake = false;
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
    S.weight = Math.max(baseWeight(S.stage), S.weight - 1);
    return true;
  },
  digSpot() {
    const S = G.state, r = Math.random();
    if (r < .38) { const n = 1 + Math.floor(rand(0, 3)); S.shells += n; return { kind: 'shells', n }; }
    if (r < .78) {
      const f = rollFind(), first = !S.inv.finds[f.id];
      S.inv.finds[f.id] = (S.inv.finds[f.id] || 0) + 1;
      if (first) { S.shells += 2; log(`ずかんに「${f.name}」が とうろくされた`); }
      if (f.rare >= 3) log(`すなほりで「${f.name}」を みつけた！`);
      return { kind: 'find', f, first };
    }
    return { kind: 'none', text: pick(['なにも なかった…', 'ヤドカリが にげていった', 'キラッと…きのせいだった']) };
  },

  // ---------- ショップ / もちもの ----------
  buy({ kind, id }) {
    const S = G.state;
    const list = { food: FOODS, hat: HATS, decor: DECOR }[kind];
    const it = list.find(x => x.id === id);
    if (S.shells < it.price) { say('かいがらが たりないよ…'); beep(260, .1); return false; }
    if (kind === 'hat' && S.inv.hats.includes(id)) return false;
    if (kind === 'decor' && S.inv.decor.includes(id)) return false;
    S.shells -= it.price;
    if (kind === 'food') S.inv.food[id] = (S.inv.food[id] || 0) + 1;
    if (kind === 'hat') { S.inv.hats.push(id); S.inv.hat = id; }
    if (kind === 'decor') { S.inv.decor.push(id); S.inv.placed.push(id); }
    log(`ショップで「${it.name}」を かった`);
    say(`${it.name} を かったよ！`); beep(880, .08);
    return true;
  },
  equipHat({ id }) { const S = G.state; S.inv.hat = S.inv.hat === id ? null : id; if (S.inv.hat) { say('にあう？'); fx('sparkle'); } },
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
    const entry = { ...card, addedAt: old ? old.addedAt : Date.now(), lastVisit: Date.now() };
    S.friends = [entry, ...S.friends.filter(f => f.pid !== card.pid)].slice(0, CONFIG.maxFriends);
    if (!old) log(`${card.owner || 'だれか'}の ${card.name} と ともだちに なった`);
    return true;
  },
  removeFriend({ pid }) { const S = G.state; S.friends = S.friends.filter(f => f.pid !== pid); if (G.visitor && G.visitor.card.pid === pid) G.visitor = null; },
  inviteFriend({ pid }) {
    const S = G.state, f = S.friends.find(x => x.pid === pid);
    if (!f) return;
    G.visitor = { card: f, pos: 72 };
    f.lastVisit = Date.now();
    const r = relOf(pid);
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
    beep(780, .1);
  },
  sendHome() { if (G.visitor) say(`${G.visitor.card.name} は かえっていった`); G.visitor = null; },
  friendPlay({ pid }) {
    const S = G.state, f = S.friends.find(x => x.pid === pid);
    if (asleepBlock()) return false;
    if (relOf(pid).kenka) { say(`${f.name}は まだ おこってて あそんでくれない…`); return false; }
    if (S.friendPlay[pid] === dayKey()) { say('きょうは もう いっぱい あそんだね'); return false; }
    S.friendPlay[pid] = dayKey();
    S.happy = clamp(S.happy + 15); addBond(3); S.shells += 3;
    addRelPt(pid, 8, f.name);
    log(`${f.name} と いっしょに あそんだ`);
    say(`${f.name} と あそんで たのしかった！`); fx('note'); fx('heart', 30);
    return true;
  },
  // ---------- かんけい ----------
  talkFriend({ pid }) {
    const S = G.state, f = S.friends.find(x => x.pid === pid), r = relOf(pid);
    if (asleepBlock()) return null;
    if (r.kenka) return `${f.name}「${pick(LINES.kenka)}」`;
    daily(r);
    if (r.talkN >= REL_RULE.talkPerDay) return `${f.name}「きょうは いっぱい おしゃべりしたね」`;
    r.talkN++;
    addRelPt(pid, 2, f.name);
    return `${f.name}「${pick(LINES[relStage(r)])}」`;
  },
  giftFriend({ pid, id }) {
    const S = G.state, f = S.friends.find(x => x.pid === pid), r = relOf(pid), food = FOODS.find(x => x.id === id);
    if (!(S.inv.food[id] > 0)) { say('もってないよ'); return false; }
    daily(r);
    if (!r.kenka && r.giftN >= REL_RULE.giftPerDay) { say(`${f.name}「きょうは もう もらったよ、ありがと！」`); return false; }
    S.inv.food[id]--; r.giftN++;
    if (r.kenka) {
      r.kenka = false; addRelPt(pid, 12, f.name);
      log(`${food.name}を あげて ${f.name}と なかなおりした`);
      say(`${f.name}「…ありがと。さっきは ごめんね」なかなおり できた！`); fx('heart'); fx('sparkle', 30);
    } else {
      addRelPt(pid, 10, f.name);
      log(`${f.name}に ${food.name}を あげた`);
      say(`${f.name}「わあ、${food.name}だ！ ありがとう！」`); fx('gift');
    }
    return true;
  },
  apologize({ pid }) {
    const S = G.state, f = S.friends.find(x => x.pid === pid), r = relOf(pid);
    if (!r.kenka) return false;
    const wait = REL_RULE.sorryCooldownMin * 60000 - (Date.now() - r.lastSorry);
    if (wait > 0) { say(`${f.name}は まだ むこうを むいてる…（すこし まってから もういちど）`); return false; }
    r.lastSorry = Date.now();
    const chance = .45 + S.discipline / 250 + (S.happy > 60 ? .15 : 0) + (relStage(r) === 'shinyu' || r.lover ? .15 : 0);
    if (Math.random() < chance) {
      r.kenka = false; addRelPt(pid, 15, f.name); addBond(1);
      log(`${f.name}に ごめんねを いって なかなおりした`);
      say(`「ごめんね」「ううん、ぼくも ごめん」なかなおり できた！ まえより なかよしに なった きがする`); fx('heart'); fx('sparkle', 30);
      return true;
    }
    say(`${f.name}「……まだ ゆるさないもん」`); fx('sweat');
    return false;
  },
  confess({ pid }) {
    const S = G.state, f = S.friends.find(x => x.pid === pid), r = relOf(pid);
    if (!canConfess(r, f)) return false;
    r.asked = true;
    if (r.pt >= REL_RULE.confess) {
      r.lover = true; addRelPt(pid, 0, f.name);
      log(`${f.name}に すきって つたえて こいびとに なった`);
      bus.emit('relchange', { pid, before: 'shinyu', after: 'koibito', up: true, name: f.name });
      return true;
    }
    addRelPt(pid, -3, f.name);
    say(`${f.name}「えっ…！ ごめんね、まだ しんゆうで いたいな」`); fx('sweat');
    return false;
  },
  answerConfess({ pid, yes }) {
    const S = G.state, f = S.friends.find(x => x.pid === pid), r = relOf(pid);
    if (yes) {
      r.lover = true;
      log(`${f.name}から こくはくされて こいびとに なった`);
      bus.emit('relchange', { pid, before: 'shinyu', after: 'koibito', up: true, name: f.name });
    } else {
      say(`${f.name}「…そっか。これからも しんゆうで いてね！」`);
      log(`${f.name}の こくはくに 「しんゆうで いよう」と こたえた`);
    }
  },

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
    addBond(2);
    log(`${gift.fromName || 'ともだち'}から「${item.name}」が とどいた`);
    fx('gift'); beep(990, .12);
    return { ok: true, item };
  },
};

function rollFind() {
  const w = weatherToday().id;
  const pool = FINDS.filter(f => !f.weather || f.weather.includes(w));
  const boost = (w === 'rain' || w === 'rainbow') ? 2 : 1;
  const weight = f => f.rare === 1 ? 10 : f.rare === 2 ? 4 * boost : 1 * boost;
  let total = pool.reduce((a, f) => a + weight(f), 0), r = Math.random() * total;
  for (const f of pool) { r -= weight(f); if (r <= 0) return f; }
  return pool[0];
}

// ともだちに わたす「カード」= じぶんのイカの みため
export function makeCard() {
  const S = G.state;
  return { pid: S.player.id, owner: S.player.name, name: S.name || 'イカッチ', sp: S.sp, stage: S.stage, form: S.form, hat: S.inv.hat, title: stageName(S), t: Date.now() };
}
