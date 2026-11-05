// =========================================================
//  時間経過のシミュレーション（成長・進化・おせわミス・寿命 など）
//  live=false のときは るすの間の計算（ふきだし等は出さない）
// =========================================================
import { CONFIG, FORMS, WEATHER, SPECIES } from './config.js';
import { G, bus, clamp, dayKey, isNight, hour, hashStr } from './state.js';
import { nudge, traitMul } from './traits.js';

export const stageInfo = id => CONFIG.stages.find(s => s.id === id);
const stageByAge = age => CONFIG.stages.find(s => age < s.until);
export const baseWeight = stage => CONFIG.weightBase[stage] || 5;

export const speciesOf = sp => SPECIES[sp] || SPECIES.momo;
export function stageName(S = G.state) {
  const sp = speciesOf(S.sp).name;
  if (S.stage === 'egg') return 'たまご';
  if (S.stage === 'baby') return 'あかちゃん' + sp;
  if (S.stage === 'child') return 'こども' + sp;
  const f = FORMS[S.form] || FORMS.surume;
  return (f.prefix ? f.prefix + ' ' : '') + sp;
}
export function log(text) {
  const S = G.state;
  S.log.unshift({ t: Date.now(), text });
  if (S.log.length > 40) S.log.length = 40;
}
export function care(kind, n = 1) { G.state.care[kind] = (G.state.care[kind] || 0) + n; }
export function addBond(n) { G.state.bond = Math.max(0, G.state.bond + n); }
export const bondLevel = (b = G.state.bond) => Math.min(10, 1 + Math.floor(b / 20));
export const lifespan = () => CONFIG.lifespanMin + bondLevel() * CONFIG.lifespanBondBonus;
export const ageYears = (S = G.state) => Math.floor(S.ageMin / 1440);   // たまごっちと同じ 1日 = 1さい

export function weatherToday(d = new Date()) {
  const r = (hashStr(dayKey(d) + 'ikacchi') % 1000) / 1000;
  let acc = 0;
  for (const w of WEATHER) { acc += w.p; if (r < acc) return w; }
  return WEATHER[0];
}

const say = (live, t) => { if (live) bus.emit('say', t); };

export function wake(S = G.state) { S.sleeping = false; S.lightsOff = false; S.pos = 50; }

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
  if (S.travelReady) return;   // たびだちを まっている間は とまる

  S.ageMin += dt;
  const night = isNight();
  S.hunger = clamp(S.hunger - r.hunger * dt * (S.sleeping ? .5 : 1));

  // ---- ねむり ----
  if (S.sleeping) {
    S.energy = clamp(S.energy + r.sleepGain * dt * (S.lightsOff ? 1 : .5));   // でんきが ついてると よく ねむれない
    if (night && S.lightsOff) S.happy = clamp(S.happy + .5 * dt);
    if (S.energy >= 100 && !night) { wake(S); say(live, 'ふわぁ…よくねた！'); }
  } else {
    S.energy = clamp(S.energy - r.energy * dt * (night ? 1.6 : 1));
    if (S.energy <= 0) {
      S.sleeping = true; S.lightsOff = false; S.pos = 50; S.happy = clamp(S.happy - 10); care('bad');
      log('つかれて ゆかで ねちゃった'); say(live, '…ぐぅ（ゆかで ねちゃった）');
    } else if (night && hour() >= 21 && S.energy < 70 && Math.random() < dt * .15) {
      // たまごっちと同じく よるは 自分で ねる → でんきを けしてあげる
      S.sleeping = true; S.lightsOff = false; S.pos = 50; S.fake = false;
      log('ねむくなって ねちゃった'); say(live, 'ねむくなっちゃった… でんきを けしてね');
    }
  }

  // ---- トイレ・よごれ ----
  S.bladder = clamp(S.bladder + r.bladder * dt * (S.sleeping ? .35 : 1));
  if (S.bladder >= 100) accident(live);
  S.clean = clamp(S.clean - r.dirtPerMess * dt * S.messes.length + (S.messes.length ? 0 : 2 * dt));

  // ---- たいじゅう ----
  const over = S.weight - baseWeight(S.stage);

  // ---- ごきげん ----
  let down = r.happy;
  if (S.hunger < 20) down += 4;
  if (S.clean < 40) down += 3;
  if (S.sick) down += 4;
  if (S.messes.length) down += 1;
  if (over > 10) down += 1;
  if (S.sleeping && !S.lightsOff) down += 1;
  S.happy = clamp(S.happy - down * dt);

  // ---- びょうき ----
  if (!S.sick && (S.hunger <= 0 || S.clean <= 10 || over > 20)) {
    S.sickTimer += dt;
    if (S.sickTimer > 3) {
      S.sick = true; S.sickTimer = 0; care('bad', 2);
      log(over > 20 ? 'ふとりすぎて ぐあいが わるくなった' : 'ぐあいが わるくなった');
      say(live, 'うぅ…ぐあいが わるい…');
    }
  } else if (!S.sick) S.sickTimer = Math.max(0, S.sickTimer - dt);

  // ---- わがまま（しつけ） ----
  if (S.fake) { S.fakeT += dt; if (S.fakeT > 10) S.fake = false; }
  else if (!S.sleeping && S.stage !== 'baby' && S.discipline < 100 && Math.random() < CONFIG.fakeCallRate * dt * traitMul(S.tr).fake) {
    S.fake = true; S.fakeT = 0; say(live, 'ねぇねぇ！ かまって〜！');
  }

  // ---- おせわミス：よびだしを ほうっておくと たまる ----
  const needs = { hunger: S.hunger < 20, mess: S.messes.length > 0, light: S.sleeping && !S.lightsOff, sick: S.sick };
  for (const k in needs) {
    if (needs[k]) {
      S.needT[k] = (S.needT[k] || 0) + dt;
      if (S.needT[k] >= CONFIG.mistakeAfter) { S.needT[k] = 0; mistake(k, live); }
    } else S.needT[k] = 0;
  }

  // ---- せいちょう・じゅみょう ----
  const st = stageByAge(S.ageMin);
  if (st.id !== S.stage) grow(st, live);
  if (S.stage === 'adult' && S.ageMin >= lifespan()) {
    S.travelReady = true;
    log(`${S.name || 'イカッチ'}は たびだちの ときを むかえた`);
    bus.emit('travel', live);
  }
}

const MISTAKE_TEXT = { hunger: 'おなかが すいたまま ほうっておかれた', mess: 'よごれたまま ほうっておかれた', light: 'でんきが ついたまま ねていた', sick: 'びょうきのまま ほうっておかれた' };
function mistake(kind, live) {
  const S = G.state;
  S.mistakes++; care('bad'); S.happy = clamp(S.happy - 5);
  // ほうっておかれると さびしくて じしんを なくす
  nudge(kind === 'light' ? { genki: -1.5, sunao: -.3 } : { yuki: -2.2, kind: -.8, sunao: -.3 }, live);
  log(`おせわミス：${MISTAKE_TEXT[kind]}`);
  if (live) bus.emit('beep', 200, .25);
}

export function hatch(live) {
  const S = G.state;
  Object.assign(S, {
    stage: 'baby', ageMin: 0, hunger: 60, energy: 80, bladder: 10, happy: 80, clean: 100,
    weight: baseWeight('baby'), discipline: 0, mistakes: 0, sleeping: false, lightsOff: false,
    fake: false, fakeT: 0, needT: { hunger: 0, mess: 0, light: 0, sick: 0 }, bornAt: Date.now(),
  });
  S.shells += 5;
  if (!S.seenSp.includes(S.sp)) S.seenSp = [...S.seenSp, S.sp];
  const sp = speciesOf(S.sp);
  log(`${S.gen > 1 ? S.gen + 'だいめの ' : ''}${sp.name}が うまれた！${sp.rare ? '（レア！）' : ''}`);
  if (live) {
    say(live, sp.rare ? `ぱかっ！ まぼろしの ${sp.name}だ！` : `ぱかっ！ ${sp.name}が うまれたよ！`);
    bus.emit('fx', 'chick'); bus.emit('fx', 'sparkle', 30); bus.emit('beep', 990, .15);
    if (sp.rare) { bus.emit('fx', 'rainbow', -30); bus.emit('fx', 'party', 50); }
  }
  bus.emit('hatched', live);
}

function accident(live) {
  const S = G.state;
  S.bladder = 0;
  S.happy = clamp(S.happy - 15);
  care('bad'); nudge({ yuki: -.8 }, live);
  if (S.messes.length < 6) S.messes.push({ x: Math.round(14 + Math.random() * 72) });
  log(S.sleeping ? 'おねしょ しちゃった' : 'おもらし しちゃった');
  if (live) { say(live, S.sleeping ? 'あっ… おねしょ しちゃった…' : 'あっ… もらしちゃった…'); bus.emit('beep', 220, .2); }
}

export function decideForm(c, S = G.state) {
  if (c.bad <= 1 && c.good >= 8 && S.discipline >= 50) return 'hotaru';
  if (c.feed >= 10 || S.weight - baseWeight('child') > 8) return 'daiou';
  if (c.play >= 4) return 'aori';
  return 'surume';
}

function grow(st, live) {
  const S = G.state, prev = S.stage;
  S.stage = st.id;
  S.weight += baseWeight(st.id) - baseWeight(prev);
  S.shells += 10;
  if (st.id === 'child') S.care = { good: 0, bad: 0, feed: 0, play: 0 };
  if (st.id === 'adult') S.form = decideForm(S.care, S);
  const nm = stageName(S);
  log(`${nm}に せいちょうした！`);
  if (live) { say(live, `${nm}に せいちょうした！`); bus.emit('fx', 'sparkle'); bus.emit('fx', 'party', 30); bus.emit('beep', 880, .15); }
}

// るすの間の時間を すすめる。日がかわったら ボーナス
export function catchUp() {
  const S = G.state;
  // ストップちゅうは るすの間も じかんが すすまない
  const mins = S.paused ? 0 : Math.min((Date.now() - S.lastSaved) / 60000, CONFIG.maxOfflineMinutes);
  const before = S.messes.length, mBefore = S.mistakes;
  for (let t = 0; t < mins; t += 1) step(Math.min(1, mins - t), false);
  let daily = false;
  if (S.lastDay !== dayKey()) {
    S.lastDay = dayKey(); S.shells += CONFIG.dailyBonus; daily = true;
    S.friendPlay = {};
  }
  return { mins, newMesses: Math.max(0, S.messes.length - before), newMistakes: S.mistakes - mBefore, daily };
}
