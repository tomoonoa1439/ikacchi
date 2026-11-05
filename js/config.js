// =========================================================
//  イカッチ  ゲームデータ / バランス設定
//  ここを書きかえるだけで バランスや アイテムを追加できます
// =========================================================

export const CONFIG = {
  version: 3,
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
  mistakeAfter: 15,           // おせわを ほうっておくと 何分で「おせわミス」になるか
  fakeCallRate: .06,          // 1分あたりの「わがまま」はっせい確率（しつけ100で なくなる）
  weightBase: { baby: 5, child: 10, adult: 20 },  // たいじゅう(g) のめやす
  lifespanMin: 4320,          // おとなに なってからではなく、うまれてから たびだつまでの分（3日）
  lifespanBondBonus: 240,     // なかよしLv 1ごとに のびる分
};

// ---- ごはん（price 0 は むりょう・むげん）----
export const FOODS = [
  { id: 'plankton', ic: 'plankton', name: 'プランクトン',   desc: 'いつでも たべられる', price: 0,  hunger: 15, bladder: 8,  happy: 2,  weight: 1  },
  { id: 'shrimp',   ic: 'ebi', name: 'エビ',           desc: 'おなか いっぱい',     price: 3,  hunger: 35, bladder: 18, happy: 6,  weight: 1  },
  { id: 'snack',    ic: 'candy', name: 'うみのおやつ',   desc: 'ごきげん アップ',     price: 2,  hunger: 5,  bladder: 5,  happy: 22, weight: 2 },
  { id: 'cake',     ic: 'cake', name: 'しんじゅケーキ', desc: 'とくべつな ごちそう', price: 12, hunger: 30, bladder: 12, happy: 40, weight: 3 },
];

// ---- きせかえ（art.js に えが あります）----
export const HATS = [
  { id: 'hachimaki', ic: 'hachimaki', name: 'はちまき',       price: 10 },
  { id: 'ribbon',    ic: 'ribbon', name: 'リボン',         price: 15 },
  { id: 'straw',     ic: 'straw', name: 'むぎわらぼうし', price: 25 },
  { id: 'crown',     ic: 'crown', name: 'おうかん',       price: 60 },
];

// ---- もようがえ（x, y は シーン内の % 位置）----
export const DECOR = [
  { id: 'starfish', ic: 'starfish', name: 'ヒトデ',       price: 10, x: 58, y: 3,  size: 24 },
  { id: 'rock',     ic: 'rock', name: 'すべすべいわ', price: 15, x: 37, y: 21, size: 30 },
  { id: 'coral',    ic: 'coral', name: 'サンゴ',       price: 20, x: 53, y: 21, size: 40 },
  { id: 'lantern',  ic: 'lantern', name: 'ちょうちん',   price: 30, x: 6,  y: 25, size: 30, glow: true },
  { id: 'chest',    ic: 'chest', name: 'たからばこ',   price: 40, x: 68, y: 20, size: 32 },
];

// ---- すなほり で みつかる もの（ずかん）rare: 1ふつう 2レア 3ちょうレア ----
export const FINDS = [
  { id: 'sakura',  ic: 'sakura', name: 'さくらがい',       rare: 1, value: 2,  text: 'うすい ピンクの かいがら。' },
  { id: 'hotate',  ic: 'hotate', name: 'ホタテのから',     rare: 1, value: 2,  text: 'おおきくて りっぱ。' },
  { id: 'stone',   ic: 'stone', name: 'まるいいし',       rare: 1, value: 1,  text: 'なみに みがかれて つるつる。' },
  { id: 'crab',    ic: 'crab', name: 'ちいさなカニ',     rare: 1, value: 3,  text: 'よこあるきで あいさつしてくれた。' },
  { id: 'glass',   ic: 'glass', name: 'シーグラス',       rare: 2, value: 6,  text: 'むかしの ビンが うみで まるくなった。' },
  { id: 'star',    ic: 'starsand', name: 'ほしのすな',       rare: 2, value: 6,  text: 'よくみると ほしの かたち。' },
  { id: 'bottle',  ic: 'bottle', name: 'ボトルメール',     rare: 2, value: 8,  text: 'とおくの だれかからの てがみ。' },
  { id: 'pearl',   ic: 'pearl', name: 'しんじゅ',         rare: 3, value: 20, text: 'まんまるで ひかりかがやく。' },
  { id: 'coin',    ic: 'coin', name: 'むかしのコイン',   rare: 3, value: 25, text: 'かいぞくの たからもの？' },
  { id: 'rainbow', ic: 'scale', name: 'にじいろのうろこ', rare: 3, value: 30, text: 'あめや にじの ひにだけ みつかる。', weather: ['rain', 'rainbow'] },
];

// ---- イカの しゅるい（たまごの ときに ランダムで きまる。w は でやすさ）----
//   body: からだ  edge: ふちどり  line: もようの いろ  ink: かおの せんの いろ  fin: ひれの かたち
export const SPECIES = {
  momo:   { name: 'ももイカ',     w: 25, body: '#ffc6d2', edge: '#e98aa0', line: '#f3a3b6', cheek: '#ff7f9a', ink: '#4a3a3a', fin: 'round',
            desc: 'ピンクで あまえんぼう。いちばん よく みかける イカ。' },
  neon:   { name: 'ネオンイカ',   w: 20, body: '#2e3270', edge: '#5ff3ff', line: '#ff6ff0', line2: '#5ff3ff', cheek: '#ff6ff0', ink: '#e8f7ff', fin: 'sharp', glow: '#5ff3ff',
            desc: 'よるの うみで ピカピカ ひかる。おしゃれが だいすき。' },
  sabaku: { name: 'さばくイカ',   w: 20, body: '#f5d59e', edge: '#c99a5c', line: '#e0ad66', cheek: '#ff9a6a', ink: '#5b3e24', fin: 'wide',
            desc: 'すなの うみ うまれ。あたまに サボテンが はえている。' },
  yuki:   { name: 'ゆきイカ',     w: 20, body: '#f6fbff', edge: '#9cc9e6', line: '#cfe8f7', cheek: '#9fd0ff', ink: '#3d4f66', fin: 'fluffy',
            desc: 'つめたい うみの イカ。ふわふわの ゆきぼうしが じまん。' },
  hoshi:  { name: 'ほしぞらイカ', w: 12, body: '#7d70d8', edge: '#4e46a3', line: '#ffe38a', cheek: '#ff9fd0', ink: '#2a2350', fin: 'pointy',
            desc: 'からだに ほしが ひかる。ゆめを みるのが とくい。' },
  niji:   { name: 'にじイカ',     w: 3, rare: true, body: '#fff3f8', edge: '#c79ad9', line: '#ff9a9a', cheek: '#ff9fb3', ink: '#4a3a3a', fin: 'round',
            desc: 'めったに うまれない まぼろしの イカ。' },
};

// ---- せいかく（うまれたときに ランダム。ともだちとの ふるまいが かわる）----
//   kenka: けんかの しやすさ  sorry: じぶんから あやまる  forgive: ゆるす  share: おすそわけ
//   confess: こくはくする ゆうき  accept: こくはくを うけいれる  talk: おしゃべり  play: あそびに さそう
export const PERSONALITY = {
  yasashii:  { name: 'やさしい',     kenka: .6,  sorry: 1.5, forgive: 1.2, share: 2,  confess: 1,   accept: 1.2, talk: 1,   play: 1,   desc: 'おこりにくくて、すぐ あやまれる' },
  genki:     { name: 'げんき',       kenka: 1.1, sorry: 1,   forgive: 1,   share: 1,  confess: 1.4, accept: 1,   talk: 1.4, play: 1.6, desc: 'いつも あそびたくて うずうず' },
  hazukashi: { name: 'はずかしがり', kenka: .8,  sorry: .9,  forgive: 1,   share: 1,  confess: .4,  accept: .8,  talk: .6,  play: .8,  desc: 'なかなか じぶんの きもちを いえない' },
  ijippari:  { name: 'いじっぱり',   kenka: 1.5, sorry: .5,  forgive: .6,  share: .7, confess: .8,  accept: 1,   talk: 1,   play: 1,   desc: 'すぐ ムキに なって、ごめんねが にがて' },
  mypace:    { name: 'マイペース',   kenka: .9,  sorry: 1,   forgive: 1,   share: 1,  confess: 1,   accept: 1,   talk: .8,  play: .9,  desc: 'のんびりやで ゆうゆう じてき' },
};

// ---- おとなの タイプ（こどもの ころの おせわで きまる。しゅるいの まえに つく）----
export const FORMS = {
  surume: { name: 'のびのびタイプ', prefix: '',         hint: 'ふつうに そだつと' },
  hotaru: { name: 'ピカピカタイプ', prefix: 'ひかる',   glow: true, hint: 'ミスなく ていねいに おせわして、しつけも できると' },
  aori:   { name: 'ヒラヒラタイプ', prefix: 'ひらひら', bigFin: true, hint: 'たくさん あそぶと' },
  daiou:  { name: 'ビッグタイプ',   prefix: 'ビッグ',   big: true, hint: 'たくさん たべると' },
};

// ---- てんき（ひづけで きまる。みんな おなじ ひは おなじ てんき）----
export const WEATHER = [
  { id: 'sunny',   ic: 'sun', name: 'はれ',   p: .55 },
  { id: 'cloudy',  ic: 'cloud', name: 'くもり', p: .25 },
  { id: 'rain',    ic: 'rain', name: 'あめ',   p: .17 },
  { id: 'rainbow', ic: 'rainbow', name: 'にじ',   p: .03 },
];
