// =========================================================
//  イカッチ  ゲームデータ / バランス設定
//  ここを書きかえるだけで バランスや アイテムを追加できます
// =========================================================

export const CONFIG = {
  version: 2,
  saveKey: 'ikacchi-save-v2',
  legacyKey: 'ikacchi-save-v1',
  hatchMinutes: 3,            // ちょうどいい温度で何分ふかすと孵化するか
  warmRange: [35, 85],        // ふか に適した あたたかさ
  stages: [                   // ageMin（孵化後の分）で成長
    { id: 'baby',  name: 'あかちゃんイカ', until: 15,       scale: .5  },
    { id: 'child', name: 'こどもイカ',     until: 60,       scale: .65 },
    { id: 'adult', name: 'おとなイカ',     until: Infinity, scale: .8  },
  ],
  rates: {                    // 1分あたりの変化量
    hunger: 4, energy: 3, sleepGain: 14, bladder: 6, happy: 1.5, dirtPerMess: 6,
    eggWarmthLoss: 14, eggWaterLoss: 6,
  },
  maxOfflineMinutes: 720,     // るすの間に進める最大時間
  dailyBonus: 5,
  dig: { spots: 9, tries: 3, energy: 12, hunger: 5 },
  maxFriends: 8,
};

// ---- ごはん（price 0 は むりょう・むげん）----
export const FOODS = [
  { id: 'plankton', ic: '🦐', name: 'プランクトン',   desc: 'いつでも たべられる', price: 0,  hunger: 15, bladder: 8,  happy: 2  },
  { id: 'shrimp',   ic: '🍤', name: 'エビ',           desc: 'おなか いっぱい',     price: 3,  hunger: 35, bladder: 18, happy: 6  },
  { id: 'snack',    ic: '🍬', name: 'うみのおやつ',   desc: 'ごきげん アップ',     price: 2,  hunger: 5,  bladder: 5,  happy: 22 },
  { id: 'cake',     ic: '🍰', name: 'しんじゅケーキ', desc: 'とくべつな ごちそう', price: 12, hunger: 30, bladder: 12, happy: 40 },
];

// ---- きせかえ（art.js に えが あります）----
export const HATS = [
  { id: 'hachimaki', ic: '🎽', name: 'はちまき',       price: 10 },
  { id: 'ribbon',    ic: '🎀', name: 'リボン',         price: 15 },
  { id: 'straw',     ic: '👒', name: 'むぎわらぼうし', price: 25 },
  { id: 'crown',     ic: '👑', name: 'おうかん',       price: 60 },
];

// ---- もようがえ（x, y は シーン内の % 位置）----
export const DECOR = [
  { id: 'starfish', ic: '⭐', name: 'ヒトデ',       price: 10, x: 58, y: 3,  size: 24 },
  { id: 'rock',     ic: '🪨', name: 'すべすべいわ', price: 15, x: 37, y: 21, size: 30 },
  { id: 'coral',    ic: '🪸', name: 'サンゴ',       price: 20, x: 53, y: 21, size: 40 },
  { id: 'lantern',  ic: '🏮', name: 'ちょうちん',   price: 30, x: 6,  y: 25, size: 30, glow: true },
  { id: 'chest',    ic: '🧰', name: 'たからばこ',   price: 40, x: 68, y: 20, size: 32 },
];

// ---- すなほり で みつかる もの（ずかん）rare: 1ふつう 2レア 3ちょうレア ----
export const FINDS = [
  { id: 'sakura',  ic: '🐚', name: 'さくらがい',       rare: 1, value: 2,  text: 'うすい ピンクの かいがら。' },
  { id: 'hotate',  ic: '🦪', name: 'ホタテのから',     rare: 1, value: 2,  text: 'おおきくて りっぱ。' },
  { id: 'stone',   ic: '🪨', name: 'まるいいし',       rare: 1, value: 1,  text: 'なみに みがかれて つるつる。' },
  { id: 'crab',    ic: '🦀', name: 'ちいさなカニ',     rare: 1, value: 3,  text: 'よこあるきで あいさつしてくれた。' },
  { id: 'glass',   ic: '💎', name: 'シーグラス',       rare: 2, value: 6,  text: 'むかしの ビンが うみで まるくなった。' },
  { id: 'star',    ic: '⭐', name: 'ほしのすな',       rare: 2, value: 6,  text: 'よくみると ほしの かたち。' },
  { id: 'bottle',  ic: '🍾', name: 'ボトルメール',     rare: 2, value: 8,  text: 'とおくの だれかからの てがみ。' },
  { id: 'pearl',   ic: '⚪', name: 'しんじゅ',         rare: 3, value: 20, text: 'まんまるで ひかりかがやく。' },
  { id: 'coin',    ic: '🪙', name: 'むかしのコイン',   rare: 3, value: 25, text: 'かいぞくの たからもの？' },
  { id: 'rainbow', ic: '🌈', name: 'にじいろのうろこ', rare: 3, value: 30, text: 'あめや にじの ひにだけ みつかる。', weather: ['rain', 'rainbow'] },
];

// ---- おとなの すがた（こどもの ころの おせわで きまる）----
export const FORMS = {
  surume: { name: 'スルメイカ',   body: '#ffb48a', edge: '#d77a4c', hint: 'ふつうに そだつと' },
  hotaru: { name: 'ホタルイカ',   body: '#cfdcff', edge: '#6f8de0', glow: true, hint: 'しっぱい すくなく ていねいに おせわすると' },
  aori:   { name: 'アオリイカ',   body: '#cdeee6', edge: '#5fb8a2', hint: 'たくさん あそぶと' },
  daiou:  { name: 'ダイオウイカ', body: '#ff9a8f', edge: '#c95555', big: true, hint: 'たくさん たべると' },
};

// ---- てんき（ひづけで きまる。みんな おなじ ひは おなじ てんき）----
export const WEATHER = [
  { id: 'sunny',   ic: '☀️', name: 'はれ',   p: .55 },
  { id: 'cloudy',  ic: '☁️', name: 'くもり', p: .25 },
  { id: 'rain',    ic: '☔', name: 'あめ',   p: .17 },
  { id: 'rainbow', ic: '🌈', name: 'にじ',   p: .03 },
];
