// =========================================================
//  ゲームの状態（セーブデータ）と 共通ユーティリティ
// =========================================================
import { CONFIG, SPECIES } from './config.js';
import { randomTraits, presetTraits, perLabel, fillTraits, newGene } from './traits.js';

// 実行中の共有オブジェクト（state 以外は セーブしない）
export const G = { state: null, modalOpen: false, busy: false, speed: 1, sound: true, visitor: null, lastPet: 0, lastTalk: 0 };

// かんたんな イベントバス（UI ⇄ ロジックを切りはなす）
const handlers = {};
export const bus = {
  on(e, f) { (handlers[e] ||= []).push(f); },
  emit(e, ...a) { (handlers[e] || []).forEach(f => f(...a)); },
};

export const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const hour = () => new Date().getHours();
export const isNight = () => { const h = hour(); return h >= 21 || h < 6; };
export function timeOfDay() {
  const h = hour();
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 17) return 'day';
  if (h >= 17 && h < 19) return 'eve';
  return 'night';
}
export const TOD_LABEL = { dawn: 'あさ', day: 'ひる', eve: 'ゆうがた', night: 'よる' };

export function hashStr(s) {
  let h = 2166136261;
  for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function genId() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = new Uint8Array(8);
  try { crypto.getRandomValues(r); } catch (e) { r.forEach((_, i) => r[i] = Math.random() * 256); }
  return Array.from(r, b => abc[b % abc.length]).join('');
}

export function rollSpecies() {
  const list = Object.entries(SPECIES), total = list.reduce((a, [, v]) => a + v.w, 0);
  let r = Math.random() * total;
  for (const [id, v] of list) { r -= v.w; if (r <= 0) return id; }
  return 'momo';
}

export function newState() {
  const tr = randomTraits(), gene = newGene();
  return {
    v: CONFIG.version,
    // ---- プレイヤー（マルチで使う。アカウント不要のランダムID）----
    player: { id: genId(), name: '' },
    // ---- イカ ----
    stage: 'egg', form: null, name: '', ageMin: 0, sp: rollSpecies(), seenSp: [], tr, gene, per: perLabel(tr, null, gene), seenPer: [], seenForm: [],
    likes: { food: {}, game: {}, hat: {} }, mem: [], trHist: [], lastTouch: 0,
    egg: { warmth: 55, water: 100, hatch: 0 },
    hunger: 70, energy: 80, bladder: 10, happy: 70, clean: 100,
    messes: [], sleeping: false, sick: false, sickTimer: 0, pos: 50,
    bond: 0,
    care: { good: 0, bad: 0, feed: 0, play: 0 },
    // ---- たまごっち要素 ----
    weight: 5, discipline: 0, mistakes: 0, lightsOff: false,
    needT: { hunger: 0, mess: 0, light: 0, sick: 0 },
    fake: false, fakeT: 0, travelReady: false, bornAt: null,
    gen: 1, album: [],
    // ---- もちもの ----
    shells: 0,
    inv: { food: { shrimp: 1, snack: 1, cake: 0 }, tools: { sandglass: 0, newegg: 0 }, hats: [], hat: null, decor: [], placed: [], finds: {} },
    boostUntil: 0, boostLeft: 0,
    // ---- きろく ----
    log: [], lastSaved: Date.now(), lastDay: dayKey(), rainbowDay: '',
    // ---- ともだち ----
    friends: [], friendPlay: {}, redeemed: [], rel: {},
    paused: false, pausedAt: 0,
  };
}

// 古いセーブデータ（v1）にも 足りない項目を おぎなう
export function migrate(s) {
  const base = newState();
  const out = { ...base, ...s, v: CONFIG.version };
  out.player = s.player || base.player;
  out.egg = { ...base.egg, ...(s.egg || {}) };
  out.care = { ...base.care, ...(s.care || {}) };
  out.needT = { ...base.needT, ...(s.needT || {}) };
  if (s.v < 3 && out.stage !== 'egg') { out.weight = CONFIG.weightBase[out.stage] || 5; if (out.sleeping) out.lightsOff = true; }
  out.inv = { ...base.inv, ...(s.inv || {}) };
  out.inv.food = { ...base.inv.food, ...((s.inv || {}).food || {}) };
  out.inv.tools = { ...base.inv.tools, ...((s.inv || {}).tools || {}) };
  if (out.stage === 'adult' && !out.form) out.form = 'surume';
  if (!out.tr) out.tr = s.per ? presetTraits(s.per) : randomTraits();
  out.tr = fillTraits(out.tr);
  if (!out.gene) out.gene = newGene();
  out.per = perLabel(out.tr, s.per, out.gene);
  out.likes = { food: {}, game: {}, hat: {}, ...(s.likes || {}) };
  if (out.lastTouch == null) out.lastTouch = out.ageMin || 0;
  if (!s.sp) { out.sp = out.stage === 'egg' ? rollSpecies() : 'momo'; }
  if (out.stage !== 'egg' && !out.seenSp.includes(out.sp)) out.seenSp = [...out.seenSp, out.sp];
  return out;
}

export function load() {
  try {
    const raw = localStorage.getItem(CONFIG.saveKey) || localStorage.getItem(CONFIG.legacyKey);
    return raw ? migrate(JSON.parse(raw)) : null;
  } catch (e) { return null; }
}
export function save() {
  if (!G.state) return;
  G.state.lastSaved = Date.now();
  try { localStorage.setItem(CONFIG.saveKey, JSON.stringify(G.state)); } catch (e) {}
}
