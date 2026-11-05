// =========================================================
//  時間経過のシミュレーション（成長・進化・てんき など）
//  live=false のときは るすの間の計算（ふきだし等は出さない）
// =========================================================
import { CONFIG, FORMS, WEATHER } from './config.js';
import { G, bus, clamp, dayKey, isNight, hashStr } from './state.js';

export const stageInfo = id => CONFIG.stages.find(s => s.id === id);
const stageByAge = age => CONFIG.stages.find(s => age < s.until);

export function stageName(S = G.state) {
  if (S.stage === 'egg') return 'たまご';
  if (S.stage === 'adult') return (FORMS[S.form] || FORMS.surume).name;
  return stageInfo(S.stage).name;
}
export function log(text) {
  const S = G.state;
  S.log.unshift({ t: Date.now(), text });
  if (S.log.length > 40) S.log.length = 40;
}
export function care(kind, n = 1) { G.state.care[kind] = (G.state.care[kind] || 0) + n; }
export function addBond(n) { G.state.bond = Math.max(0, G.state.bond + n); }
export const bondLevel = (b = G.state.bond) => Math.min(10, 1 + Math.floor(b / 20));

export function weatherToday(d = new Date()) {
  const r = (hashStr(dayKey(d) + 'ikacchi') % 1000) / 1000;
  let acc = 0;
  for (const w of WEATHER) { acc += w.p; if (r < acc) return w; }
  return WEATHER[0];
}

const say = (live, t) => { if (live) bus.emit('say', t); };

export function step(dt, live) {
  const r = CONFIG.rates, S = G.state;

  if (S.stage === 'egg') {
    const e = S.egg;
    e.warmth = clamp(e.warmth - r.eggWarmthLoss * dt);
    e.water = clamp(e.water - r.eggWaterLoss * dt);
    const good = e.warmth >= CONFIG.warmRange[0] && e.warmth <= CONFIG.warmRange[1];
    if (good) e.hatch = Math.min(100, e.hatch + dt * (100 / CONFIG.hatchMinutes) * (e.water > 30 ? 1 : .35));
    if (e.hatch >= 100) hatch(live);
    return;
  }

  S.ageMin += dt;
  const night = isNight();
  S.hunger = clamp(S.hunger - r.hunger * dt * (S.sleeping ? .5 : 1));

  if (S.sleeping) {
    S.energy = clamp(S.energy + r.sleepGain * dt);
    if (night) S.happy = clamp(S.happy + .5 * dt);
    if (S.energy >= 100 && !night) { S.sleeping = false; say(live, 'ふわぁ…よくねた！'); }
  } else {
    S.energy = clamp(S.energy - r.energy * dt * (night ? 1.6 : 1));
    if (S.energy <= 0) {
      S.sleeping = true; S.happy = clamp(S.happy - 10); S.pos = 50; care('bad');
      log('つかれて ゆかで ねちゃった'); say(live, '…ぐぅ（ゆかで ねちゃった）');
    }
  }

  S.bladder = clamp(S.bladder + r.bladder * dt * (S.sleeping ? .35 : 1));
  if (S.bladder >= 100) accident(live);

  S.clean = clamp(S.clean - r.dirtPerMess * dt * S.messes.length + (S.messes.length ? 0 : 2 * dt));

  let down = r.happy;
  if (S.hunger < 20) down += 4;
  if (S.clean < 40) down += 3;
  if (S.sick) down += 4;
  if (S.messes.length) down += 1;
  S.happy = clamp(S.happy - down * dt);

  if (!S.sick && (S.hunger <= 0 || S.clean <= 10)) {
    S.sickTimer += dt;
    if (S.sickTimer > 3) {
      S.sick = true; S.sickTimer = 0; care('bad', 2);
      log('ぐあいが わるくなった'); say(live, 'うぅ…ぐあいが わるい…');
    }
  } else if (!S.sick) S.sickTimer = Math.max(0, S.sickTimer - dt);

  const st = stageByAge(S.ageMin);
  if (st.id !== S.stage) grow(st, live);
}

export function hatch(live) {
  const S = G.state;
  Object.assign(S, { stage: 'baby', ageMin: 0, hunger: 60, energy: 80, bladder: 10, happy: 80, clean: 100 });
  S.shells += 5;
  log('たまごから うまれた！');
  if (live) { say(live, 'ぱかっ！ うまれたよ！'); bus.emit('fx', '🐣'); bus.emit('fx', '✨', 30); bus.emit('beep', 990, .15); }
  bus.emit('hatched', live);
}

function accident(live) {
  const S = G.state;
  S.bladder = 0;
  S.happy = clamp(S.happy - 15);
  care('bad');
  if (S.messes.length < 6) S.messes.push({ x: Math.round(14 + Math.random() * 72) });
  log(S.sleeping ? 'おねしょ しちゃった' : 'おもらし しちゃった');
  if (live) { say(live, S.sleeping ? 'あっ… おねしょ しちゃった…' : 'あっ… もらしちゃった…'); bus.emit('beep', 220, .2); }
}

export function decideForm(c) {
  if (c.bad <= 1 && c.good >= 8) return 'hotaru';
  if (c.feed >= 10) return 'daiou';
  if (c.play >= 4) return 'aori';
  return 'surume';
}

function grow(st, live) {
  const S = G.state;
  S.stage = st.id;
  S.shells += 10;
  if (st.id === 'child') S.care = { good: 0, bad: 0, feed: 0, play: 0 };
  if (st.id === 'adult') S.form = decideForm(S.care);
  const nm = stageName(S);
  log(`${nm}に せいちょうした！`);
  if (live) { say(live, `${nm}に せいちょうした！`); bus.emit('fx', '✨'); bus.emit('fx', '🎉', 30); bus.emit('beep', 880, .15); }
}

// るすの間の時間を すすめる。日がかわったら ボーナス
export function catchUp() {
  const S = G.state;
  const mins = Math.min((Date.now() - S.lastSaved) / 60000, CONFIG.maxOfflineMinutes);
  const before = S.messes.length;
  for (let t = 0; t < mins; t += 1) step(Math.min(1, mins - t), false);
  let daily = false;
  if (S.lastDay !== dayKey()) {
    S.lastDay = dayKey(); S.shells += CONFIG.dailyBonus; daily = true;
    S.friendPlay = {};
  }
  return { mins, newMesses: Math.max(0, S.messes.length - before), daily };
}
