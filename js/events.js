// =========================================================
//  うみの ハプニング
//  ---------------------------------------------------------
//  ときどき いろんな できごとが おこる。イカは せいかくで はんのうを きめる。
//  「にげて！」などの ボタンが でる できごとでは、プレイヤーが てだすけ できる
//  （すなおな こほど いうことを きいてくれる）
// =========================================================
import { G, bus, clamp, rand, pick, isNight } from './state.js';
import { FINDS } from './config.js';
import { nudge, remember, traitMul } from './traits.js';
import { log, addBond } from './sim.js';

const nm = () => G.state.name || 'イカッチ';
const chance = p => Math.random() < clamp(p, 0, 1);
function addFind(id) {
  const S = G.state, f = FINDS.find(x => x.id === id);
  const first = !S.inv.finds[id];
  S.inv.finds[id] = (S.inv.finds[id] || 0) + 1;
  if (first) log(`ずかんに「${f.name}」が とうろくされた`);
  return f;
}

// w: でやすさ（S, t=せいかく）  run: できごとを つくる
//   かえす もの: { title, actor, intro, help?: {label, ms}, resolve(helped) → { text, icon, good } }
export const EVENTS = [
  { id: 'tako', w: () => 1.2, run: (S, t) => ({
      title: 'やせいの タコが あそびに きた！', actor: 'tako',
      intro: `うねうね… みたことのない タコが ${nm()}の まえに あらわれた`,
      resolve() {
        if (t.kouki + t.yuki > 115 && chance(.75)) {
          S.happy = clamp(S.happy + 15); S.shells += 3; nudge({ kouki: 1.5, yuki: 1 });
          remember('やせいの タコと ともだちに なった', 2);
          return { text: `${nm()}「いっしょに あそぼ！」\nタコと すっかり なかよしに なった。おれいに かいがらを 3こ もらった`, icon: 'party', good: true };
        }
        if (t.yuki < 40) {
          S.happy = clamp(S.happy - 8); nudge({ yuki: -1 });
          if (chance(.5)) { S.messes.push({ x: Math.round(rand(20, 80)), a: Math.floor(S.ageMin) }); return { text: `${nm()}は こわくて かたまっちゃった…\nタコは いたずらで スミを はいて かえっていった`, icon: 'sweat', good: false }; }
          bus.emit('ink');
          return { text: `${nm()}は びっくりして スミを ぷしゅっ！\nまっくらな うちに いわの かげへ にげこんだ`, icon: 'sweat', good: false };
        }
        S.happy = clamp(S.happy + 6); nudge({ kouki: .8 });
        return { text: `${nm()}と タコは しばらく にらめっこ。\nタコは ぷいっと かえっていった`, icon: 'eyes', good: true };
      } }) },

  { id: 'fisher', w: () => 1, run: (S, t) => ({
      title: 'つりびとが きた！ にげなきゃ！', actor: 'hook',
      intro: `うえから つりばりが おりてきた… さきっぽには おいしそうな エビが ついている！`,
      help: { label: 'あぶない！ にげて！', ms: 3500 },
      resolve(helped) {
        const M = traitMul(S.tr);
        // くいしんぼうほど つられやすい。すなおな こほど こえを きいて にげる
        let bite = .15 + t.kui / 160 - t.sunao / 400 - t.yuki / 600;
        if (helped) bite *= 1 - (.35 + t.sunao / 140);
        if (S.hunger < 30) bite += .15;
        if (!chance(bite)) {
          nudge(helped ? { sunao: 1, yuki: .5 } : { yuki: 1.2, kui: -.5 });
          if (helped) addBond(2);
          const how = t.yuki < 45 ? 'ink' : t.kouki > 55 ? 'camo' : 'run';
          bus.emit(how === 'ink' ? 'ink' : how === 'camo' ? 'camo' : 'bounce');
          const act = how === 'ink' ? 'スミを はいて めくらまし！ そのすきに' : how === 'camo' ? 'からだの いろを すなと おなじに して' : 'くるっと むきを かえて';
          return { text: helped ? `「にげて！」の こえで、${nm()}は ${act} にげた！\nあぶなかった…` : `${nm()}は つりばりに きづいて、${act} にげた！`, icon: 'sparkle', good: true };
        }
        // つられかけるけど、にがしてもらえる（こわい おもいで）
        S.energy = clamp(S.energy - 30); S.happy = clamp(S.happy - 20);
        nudge({ yuki: -4, kui: -2, amae: 1.5 });
        remember('つりばりに ひっかかって こわい おもいを した', 3);
        log('つりびとに つられかけた…');
        return { text: `エビに つられて パクッ！ ${nm()}は つりあげられちゃった！\n…でも つりびとが「ちいさいから にがして あげよう」って うみに もどしてくれた。\nこわかったね…`, icon: 'sweat', good: false };
      } }) },

  { id: 'shark', w: S => .6 + (S.stage === 'adult' ? .3 : 0), run: (S, t) => ({
      title: 'おおきな さかなの かげが…！', actor: 'shark',
      intro: 'ゆらり… おおきな さかなが すぐ ちかくを およいでいる',
      help: { label: 'かくれて！', ms: 3000 },
      resolve(helped) {
        const hide = S.inv.placed.includes('rock') || S.inv.placed.includes('coral') || S.inv.placed.includes('chest');
        let safe = .45 + t.genki / 300 + (hide ? .2 : 0) + (helped ? .15 + t.sunao / 400 : 0);
        if (t.yuki > 75 && chance(.4)) {
          nudge({ yuki: 1.5 }); remember('おおきな さかなに にらみかえした', 2);
          return { text: `${nm()}は にげずに じっと にらみかえした！\nさかなは びっくりして いってしまった。${nm()}、つよい！`, icon: 'sparkle', good: true };
        }
        if (chance(safe)) {
          nudge(helped ? { sunao: .8 } : { genki: .5 });
          if (!hide) bus.emit('camo', 5000);
          return { text: hide ? `${nm()}は かざりの かげに さっと かくれた。\nさかなは きづかずに いってしまった` : `${nm()}は からだの いろを すなと そっくりに かえて、じっと した。\nさかなは きづかずに いってしまった`, icon: 'sparkle', good: true };
        }
        S.happy = clamp(S.happy - 12); S.energy = clamp(S.energy - 15); nudge({ yuki: -2 });
        bus.emit('ink');
        return { text: `${nm()}は スミを はきながら おおあわてで にげまわって へとへと…\nなんとか にげきれたけど、こわかった`, icon: 'sweat', good: false };
      } }) },

  { id: 'star', w: () => isNight() ? 1.4 : 0, run: (S, t) => ({
      title: 'ながれぼしだ！', actor: 'sparkle',
      intro: 'よぞらに キラッと ながれぼしが とんだ',
      resolve() {
        const wish = t.kind > 65 ? ['みんなが なかよく できますように', () => { S.friends.forEach(f => { if (S.rel?.[f.pid]) S.rel[f.pid].pt = Math.min(100, S.rel[f.pid].pt + 3); }); }]
          : t.kui > 65 ? ['おなか いっぱい たべられますように', () => { S.inv.food.cake = (S.inv.food.cake || 0) + 1; }]
          : t.kouki > 65 ? ['もっと いろんな ところに いけますように', () => { S.treasure = true; }]
          : t.amae > 65 ? ['ずっと いっしょに いられますように', () => { addBond(5); }]
          : ['あしたも いい ひに なりますように', () => { S.shells += 3; }];
        wish[1](); S.happy = clamp(S.happy + 10); bus.emit('shine', 5000); remember(`ながれぼしに「${wish[0]}」って おねがいした`, 2);
        return { text: `${nm()}は ながれぼしに こたえるように からだを ぽうっと ひからせて、おねがい した。\n「${wish[0]}」`, icon: 'sparkle', good: true };
      } }) },

  { id: 'bottle', w: () => .7, run: (S, t) => ({
      title: 'なにか ながれてきた！', actor: 'bottle',
      intro: 'ぷかぷか… ビンが ながれついた',
      resolve() {
        if (t.kouki > 55 || chance(.4)) {
          addFind('bottle'); nudge({ kouki: 1 });
          return { text: `${nm()}は さっそく あけてみた。なかには「うみの むこうの ともだちへ」と かいた てがみが！\nボトルメールを てに いれた`, icon: 'bottle', good: true };
        }
        return { text: `${nm()}は ちょっと こわくて さわらなかった。\nビンは また ながされていった`, icon: 'poof', good: false };
      } }) },

  { id: 'jelly', w: () => .8, run: (S, t) => ({
      title: 'まいごの あかちゃんクラゲ', actor: 'jelly',
      intro: 'ちいさな クラゲが ないている。「おうち どこ…」',
      resolve() {
        if (t.kind > 50 || chance(.3)) {
          S.shells += 5; addBond(2); nudge({ kind: 2, yuki: .8 }); remember('まいごの クラゲを おうちに おくってあげた', 2);
          return { text: `${nm()}「いっしょに さがして あげる！」\nぶじに おかあさんクラゲの ところへ。おれいに かいがらを 5こ もらった`, icon: 'heart', good: true };
        }
        nudge({ kind: -.5 });
        return { text: `${nm()}は きづかない ふりを した…\nクラゲは ひとりで ふわふわ いってしまった`, icon: 'poof', good: false };
      } }) },

  { id: 'map', w: () => .5, run: (S, t) => ({
      title: 'たからの ちずを みつけた！？', actor: 'map',
      intro: 'すなの なかから ふるい かみきれが でてきた',
      resolve() {
        if (t.kouki > 45) { S.treasure = true; nudge({ kouki: 1.5 });
          return { text: `${nm()}「これ、たからの ちずだ！」\nつぎの すなほりで すごい ものが みつかるかも！`, icon: 'map', good: true }; }
        return { text: `${nm()}は「ただの ゴミかな」って すてちゃった…`, icon: 'poof', good: false };
      } }) },

  { id: 'crabs', w: () => .7, run: (S, t) => ({
      title: 'カニの だいこうしん！', actor: 'crab',
      intro: 'よこあるきの カニたちが ぞろぞろ やってきた',
      resolve() {
        if (t.genki > 60) { S.happy = clamp(S.happy + 10); S.energy = clamp(S.energy - 8); nudge({ genki: 1 });
          return { text: `${nm()}は カニたちと いっしょに よこあるき！ たのしかった`, icon: 'party', good: true }; }
        if (t.kirei > 65) { S.happy = clamp(S.happy - 5);
          return { text: `${nm()}「すなが ちらかる〜！」カニたちが とおった あとを いっしょうけんめい おそうじ した`, icon: 'sponge', good: false }; }
        if (chance(.4)) { addFind('crab'); return { text: `1ぴき まいごに なった カニが のこっていった。ずかんに のせておこう`, icon: 'crab', good: true }; }
        return { text: `${nm()}は カニの こうしんを ぼーっと ながめていた`, icon: 'eyes', good: true };
      } }) },

  { id: 'diver', w: () => isNight() ? 0 : .6, run: (S, t) => ({
      title: 'ダイバーが カメラを むけてきた', actor: 'camera',
      intro: 'ぶくぶく… ニンゲンの ダイバーが しゃしんを とろうと している',
      resolve() {
        if (t.yuki > 60 && t.amae < 75) { S.happy = clamp(S.happy + 8); nudge({ yuki: 1 }); remember('ダイバーに しゃしんを とってもらった', 2);
          bus.emit('shine', 3000);
          return { text: `${nm()}は からだを キラキラ ひからせて ばっちり ポーズ！ パシャッ！\nいつか ざっしに のるかも？`, icon: 'camera', good: true }; }
        nudge({ yuki: -.5 });
        bus.emit('camo', 5000);
        return { text: `${nm()}は はずかしくて、からだの いろを すなと おなじに して かくれちゃった`, icon: 'sweat', good: false };
      } }) },

  { id: 'lost', w: () => .6, run: (S, t) => ({
      title: 'おとしもの だ！', actor: 'pearl',
      intro: 'きれいな しんじゅの ネックレスが おちている。だれの かな？',
      resolve() {
        // すなおで やさしい こは もちぬしに かえす。ちゃっかりものは…
        if (t.sunao + t.kind > 105 || chance(.3)) {
          S.shells += 4; nudge({ sunao: 1.5, kind: 1 }); remember('おとしものを もちぬしに かえしてあげた', 2);
          return { text: `${nm()}は もちぬしの ウミガメさんを さがして かえしてあげた。\n「ありがとう！」 おれいに かいがらを 4こ もらった`, icon: 'heart', good: true };
        }
        addFind('pearl'); nudge({ sunao: -1.5, kui: .5 });
        return { text: `${nm()}は こっそり じぶんの ものに しちゃった…\n（しんじゅを てに いれた。でも ちょっと むねが ちくっ）`, icon: 'pearl', good: false };
      } }) },

  { id: 'whale', w: () => .5, run: (S, t) => ({
      title: 'とおくから クジラの うた', actor: 'whale',
      intro: 'ぼお〜…ん。うみの そこまで ひびく ふしぎな うた',
      resolve() {
        S.happy = clamp(S.happy + 8); nudge({ kind: .8 });
        if (t.genki < 45) { S.energy = clamp(S.energy + 15); return { text: `${nm()}は うっとり… きもちよくて うとうと しちゃった`, icon: 'zzz', good: true }; }
        return { text: `${nm()}は いっしょに うたいだした！ ♪ぼお〜〜`, icon: 'note', good: true };
      } }) },

  { id: 'wave', w: () => .5, run: (S, t) => ({
      title: 'おおきな なみが きた！', actor: 'wave',
      intro: 'ざっぱーん！ つよい なみが へやを ゆらした',
      help: { label: 'つかまって！', ms: 3000 },
      resolve(helped) {
        if (helped && chance(.5 + t.sunao / 200) || t.yuki > 70) {
          nudge(helped ? { sunao: .8 } : { yuki: .8 });
          return { text: `${nm()}は しっかり つかまって へいき だった！`, icon: 'sparkle', good: true };
        }
        S.pos = Math.round(rand(10, 90)); S.happy = clamp(S.happy - 6);
        if (S.inv.hat && chance(.3)) { S.inv.hat = null; return { text: `${nm()}は ごろごろ〜っと ころがっちゃった。\nぼうしが とれちゃった！（もちものには のこってるよ）`, icon: 'sweat', good: false }; }
        return { text: `${nm()}は ごろごろ〜っと ころがっちゃった。めが まわる〜`, icon: 'sweat', good: false };
      } }) },
];

// ---- 5びょうごとに よばれる ----
export function eventTick() {
  const S = G.state;
  if (!S || S.stage === 'egg' || S.sleeping || S.paused || S.travelReady || G.busy || G.modalOpen || G.visitor) return;
  if (S.nextEventAt == null || S.nextEventAt - S.ageMin > 400) S.nextEventAt = S.ageMin + rand(60, 180);
  if (S.ageMin < S.nextEventAt) return;
  S.nextEventAt = S.ageMin + rand(150, 360);   // つぎの できごとまで（ゲームの じかん 2.5〜6じかん）
  const t = S.tr;
  const opts = EVENTS.map(e => ({ e, w: e.w(S, t) })).filter(x => x.w > 0);
  let r = Math.random() * opts.reduce((a, x) => a + x.w, 0);
  for (const x of opts) { r -= x.w; if (r <= 0) { startEvent(x.e); return; } }
}
export function startEvent(e) {
  const S = G.state, ev = e.run(S, S.tr);
  ev.id = e.id;
  S.seenEv ||= {};
  S.seenEv[e.id] = (S.seenEv[e.id] || 0) + 1;
  log(`ハプニング：${ev.title}`);
  bus.emit('happening', ev);
}
export const EVENT_NAMES = { tako: 'やせいの タコ', fisher: 'つりびと', shark: 'おおきな さかな', star: 'ながれぼし', bottle: 'ながれついた ビン', jelly: 'まいごの クラゲ', map: 'たからの ちず', crabs: 'カニの だいこうしん', diver: 'ダイバー', lost: 'おとしもの', whale: 'クジラの うた', wave: 'おおきな なみ' };
