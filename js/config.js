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

// ---- どうぐ（つかうと なくなる）----
//   はやさや さいしょからは、どうぐを つかった ときだけ できる
export const TOOLS = [
  { id: 'sandglass', ic: 'sandglass', name: 'はやおくりの すなどけい', desc: '3ぷんかん じかんが 10ばいの はやさで すすむ', price: 30, boostMin: 3, mult: 10 },
  { id: 'newegg',    ic: 'egg',       name: 'あたらしい たまご',       desc: 'いまの イカを うみに かえして、あたらしい たまごを むかえる', price: 80 },
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
  momo:   { name: 'ももイカ', mix: 'もも',     w: 25, body: '#ffc6d2', edge: '#e98aa0', line: '#f3a3b6', cheek: '#ff7f9a', ink: '#4a3a3a', fin: 'round',
            desc: 'ピンクで あまえんぼう。いちばん よく みかける イカ。' },
  neon:   { name: 'ネオンイカ', mix: 'ネオン',   w: 20, body: '#2e3270', edge: '#5ff3ff', line: '#ff6ff0', line2: '#5ff3ff', cheek: '#ff6ff0', ink: '#e8f7ff', fin: 'sharp', glow: '#5ff3ff',
            desc: 'よるの うみで ピカピカ ひかる。おしゃれが だいすき。' },
  sabaku: { name: 'さばくイカ', mix: 'さばく',   w: 20, body: '#f5d59e', edge: '#c99a5c', line: '#e0ad66', cheek: '#ff9a6a', ink: '#5b3e24', fin: 'wide',
            desc: 'すなの うみ うまれ。あたまに サボテンが はえている。' },
  yuki:   { name: 'ゆきイカ', mix: 'ゆき',     w: 20, body: '#f6fbff', edge: '#9cc9e6', line: '#cfe8f7', cheek: '#9fd0ff', ink: '#3d4f66', fin: 'fluffy',
            desc: 'つめたい うみの イカ。ふわふわの ゆきぼうしが じまん。' },
  hoshi:  { name: 'ほしぞらイカ', mix: 'ほしぞら', w: 12, body: '#7d70d8', edge: '#4e46a3', line: '#ffe38a', cheek: '#ff9fd0', ink: '#2a2350', fin: 'pointy',
            desc: 'からだに ほしが ひかる。ゆめを みるのが とくい。' },
  niji:   { name: 'にじイカ', mix: 'にじ',     w: 3, rare: true, body: '#fff3f8', edge: '#c79ad9', line: '#ff9a9a', cheek: '#ff9fb3', ink: '#4a3a3a', fin: 'round',
            desc: 'めったに うまれない まぼろしの イカ。' },
};

// ---- せいかくの タイプ（traits.js：8つの パラメータが p に いちばん ちかい タイプに なる）----
//   p: そのタイプの「りそうの パラメータ」  lines: ひとりごと（くちぐせ）
export const PERSONALITY = {
  mypace:     { name: 'マイペース',     p: { kind: 50, genki: 50, sunao: 50, yuki: 50, kouki: 50, amae: 50, kui: 50, kirei: 50 },
                desc: 'のんびりやで ゆうゆう じてき', hint: 'バランスよく そだつと',
                lines: ['きょうも いい ひだね〜', 'ま、いっか', 'のんびり いこ〜', 'ふわぁ…'] },
  yasashii:   { name: 'やさしい',       p: { kind: 82, sunao: 65 }, desc: 'おこりにくくて、すぐ あやまれる', hint: 'たくさん なでると',
                lines: ['みんな なかよく できたら いいな', 'きょうも ありがとう', 'だいじょうぶ？', 'おはなに みずを あげたいな'] },
  osewazuki:  { name: 'おせわずき',     p: { kind: 85, kirei: 72, yuki: 62 }, desc: 'こまってる こを ほうっておけない', hint: 'なでて、おそうじも ちゃんと すると',
                lines: ['だれか こまってないかな', 'おへや ぴかぴかに しよ！', 'わたしが まもって あげる', 'みんなの おせわ するの すき'] },
  ottori:     { name: 'おっとり',       p: { kind: 72, genki: 28 }, desc: 'やさしくて のんびり。けんかは にがて', hint: 'なでるけど あまり あそばないと',
                lines: ['ゆっくりで いいよ〜', 'あったかいね…', 'おひるね したいな', 'ぽかぽか〜'] },
  genki:      { name: 'げんき',         p: { genki: 84, yuki: 62 }, desc: 'いつも あそびたくて うずうず', hint: 'たくさん あそぶと',
                lines: ['あそぼー！', 'かけっこ しよう！', 'きょうも げんき いっぱい！', 'じっと してられない〜！'] },
  ganbariya:  { name: 'がんばりや',     p: { yuki: 80, genki: 70, sunao: 66 }, desc: 'まけずぎらいで、なんでも がんばる', hint: 'ゲームで かたせて、しつけも すると',
                lines: ['つぎは ぜったい かつ！', 'もっと はやく およげるように なるんだ', 'れんしゅう あるのみ！', 'がんばるぞー！'] },
  shikkari:   { name: 'しっかりもの',   p: { sunao: 84, yuki: 72, kirei: 64 }, desc: 'すなおで ゆうきも ある おにいさん・おねえさん', hint: 'ただしく しつけて、ゲームにも かたせると',
                lines: ['じゅんばんは まもらないとね', 'はやねはやおき！', 'まかせて！', 'やくそくは まもるよ'] },
  kireizuki:  { name: 'きれいずき',     p: { kirei: 86, sunao: 62 }, desc: 'よごれが だいきらい。いつも ぴかぴか', hint: 'よごれたら すぐ おそうじ すると',
                lines: ['ほこり ひとつ ゆるさない！', 'ぴかぴかって きもちいいね', 'てを あらった？', 'おへやの かたづけ たのしい'] },
  tanken:     { name: 'たんけんか',     p: { kouki: 86, yuki: 72 }, desc: 'しらない ばしょが だいすき', hint: 'すなほりや あたらしい ことを たくさん すると',
                lines: ['あっちに なにか ありそう！', 'たからものを さがしに いこう！', 'うみの そこって どうなってるの？', 'ぼうけんに しゅっぱーつ！'] },
  monoshiri:  { name: 'ものしり',       p: { kouki: 80, genki: 34, sunao: 64 }, desc: 'しずかに いろんな ことを かんがえている', hint: 'こうきしんを そだてて、おちついて すごすと',
                lines: ['ねえ しってる？ イカの しんぞうは 3つ あるんだよ', 'ほしって なんで ひかるのかな', 'ふむふむ…', 'きょうは なにを しらべようかな'] },
  chakkari:   { name: 'ちゃっかりもの', p: { kui: 74, kouki: 66, sunao: 38 }, desc: 'おいしい ところは のがさない', hint: 'おやつを よく あげて、ほどほどに あまやかすと',
                lines: ['おやつの においが する…！', 'いまの うちに…えへへ', 'いいこと おもいついた！', 'ぼく けっこう かしこいでしょ'] },
  kuishinbo:  { name: 'くいしんぼう',   p: { kui: 88 }, desc: 'たべることが いちばん しあわせ', hint: 'たくさん たべさせると',
                lines: ['おなか すいたぁ〜', 'エビ…エビが たべたい…', 'つぎの ごはん まだ？', 'もぐもぐ するの だいすき！'] },
  amaenbo:    { name: 'あまえんぼう',   p: { amae: 84, sunao: 34, kind: 62 }, desc: 'やさしいけど わがままが おおい', hint: 'なでて おやつで あまやかすと',
                lines: ['ねえねえ、なでて〜', 'だっこして〜', 'いっしょに いてくれる？', 'ひとりは やだ〜'] },
  samishigari:{ name: 'さみしがりや',   p: { amae: 86, yuki: 28 }, desc: 'ひとりに なると すぐ ふあんに なる', hint: 'かわいがったり ほうっておいたり ムラが あると',
                lines: ['…どこにも いかないでね', 'まってたんだよ…', 'ひとりぼっちは こわいな', 'ずっと そばに いてね'] },
  hitorizuki: { name: 'ひとりがすき',   p: { amae: 14, kouki: 62 }, desc: 'ひとりの じかんを たいせつに する', hint: 'あまり かまわずに、すきに させると',
                lines: ['ひとりで いるのも わるくない', 'しずかで いいな', 'べつに さみしくないよ', 'じぶんの ペースが いちばん'] },
  hazukashi:  { name: 'はずかしがり',   p: { yuki: 20, amae: 60 }, desc: 'なかなか じぶんの きもちを いえない', hint: 'ほうっておいたり、しかりすぎると',
                lines: ['…あの、えっと…', 'みられると はずかしい…', '…なんでもない', 'こっそり がんばってるの'] },
  kimagure:   { name: 'きまぐれ',       p: { sunao: 34, kouki: 70, amae: 40 }, desc: 'きょうは あっち、あしたは こっち', hint: 'しつけず すきに あそばせると',
                lines: ['やっぱ やめた！', 'きぶん かわっちゃった〜', 'いま それ いいかも！', 'さっきの なし！'] },
  ijippari:   { name: 'いじっぱり',     p: { sunao: 20, yuki: 60 }, desc: 'すぐ ムキに なって、ごめんねが にがて', hint: 'りふじんに しかったり、あまやかすと',
                lines: ['べつに！', 'しってるもん', 'じぶんで できるし', 'まけてないもん！'] },
  wanpaku:    { name: 'わんぱく',       p: { genki: 86, sunao: 24 }, desc: 'げんきすぎて いうことを きかない', hint: 'あそんでばかりで しつけないと',
                lines: ['いたずら しちゃお〜', 'じっと してるの むり！', 'つかまえて みな〜！', 'あそぶまで ねないもん！'] },
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
