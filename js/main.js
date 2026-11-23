// =========================================================
//  イカッチ  起動とゲームループ
// =========================================================
import { G, bus, load, save, newState, rand, pick, dayKey } from './state.js';
import { step, catchUp, weatherToday, log } from './sim.js';
import { render, decorate, say, askName, askOwner, handleLink } from './ui.js';
import { parseLink } from './net.js';
import { socialTick, relOf } from './social.js';
import { idleTick, setWeatherFn } from './traits.js';
import { eventTick } from './events.js';
import { diaryCheck } from './story.js';
import { welcomeBack } from './memory.js';
import { initGrowth, countDay, souvenir, pickQuestion, restCheck, refLine, lifeGreet } from './growth.js';
import { trickIdle, askQuestion, showSouvenir, showMilestone } from './ui2.js';

G.state = load() || newState();
initGrowth();
setWeatherFn(() => weatherToday().id);
const away = catchUp();
const mile = away.daily ? countDay() : null;
const gift = souvenir(away.mins);

// にじの日ボーナス
const w = weatherToday();
if (w.id === 'rainbow' && G.state.rainbowDay !== dayKey()) { G.state.rainbowDay = dayKey(); G.state.shells += 5; }

decorate();
render();
// タイトル：タップ（または 4びょう）で とじる
{ const sp = document.getElementById('splash'); if (sp && (location.hash.length > 3 || location.search.includes('ns'))) sp.remove();
  else if (sp) { const go = () => { sp.classList.add('hide'); setTimeout(() => sp.remove(), 700); }; sp.addEventListener('click', go, { once: true }); setTimeout(go, 4000); } }
save();

setTimeout(() => {
  const S = G.state;
  if (away.daily) { log('きょうも あそびに きた'); say(`きょうも きてくれた！ かいがら+5 ／ きょうの てんき：${w.name}`); }
  else if (S.stage === 'egg' && S.egg.hatch === 0) say('イカの たまごが とどいた！ あたためて ふかそう');
  else if (away.mins > 5 && S.stage !== 'egg') say(away.newMistakes ? `るすのあいだに おせわミスが ${away.newMistakes}かい…` : away.newMesses ? `るすのあいだに ${away.newMesses}かい もらしちゃった…` : (S.player.name ? S.player.name + '、' : '') + welcomeBack(away.mins) + (lifeGreet() ? '　' + lifeGreet() : ''));
  askName();
  if (diaryCheck()) setTimeout(() => say(`${S.name || 'イカッチ'}が にっきを かいていたよ。「にっき」で よめるよ`), 3600);
  if (S.travelReady) bus.emit('travel', false);
  if (mile) setTimeout(() => showMilestone(mile), 2500);
  // おやの なまえを まだ きいて いなければ、イカが きく
  if (S.stage !== 'egg' && S.name && !S.player.name && S.ownerAskDay !== dayKey()) setTimeout(() => askOwner(), mile || gift ? 9000 : 5000);
  if (gift) setTimeout(() => showSouvenir(gift), mile ? 2600 : 4200);
  checkHash();
}, 500);

let tick = 0;
G.activeSec = 0;
setInterval(() => {
  const S = G.state;
  tick++;
  if (S.paused) { render(); return; }   // ストップちゅうは なにも すすまない
  // すなどけいを つかっている あいだだけ はやく すすむ（G.speed は かいはつ用）
  const boost = S.boostUntil > Date.now() ? 10 : 1;
  step((1 / 60) * G.speed * boost, true);
  if (!G.busy && S.stage !== 'egg' && !S.sleeping && tick % 4 === 0 && Math.random() < .6) S.pos = Math.round(G.visitor ? rand(30, 44) : rand(36, 66));
  if (G.visitor && tick % 5 === 0) {
    const r = relOf(G.visitor.card.pid);
    // けんか中は はなれて、こいびとは となりに
    G.visitor.pos = r.kenka ? Math.round(rand(80, 86)) : r.lover && !S.sleeping ? Math.min(84, S.pos + 26) : Math.round(rand(62, 78));
    socialTick();
  }
  if (!document.hidden) { G.activeSec++; const rc = restCheck(G.activeSec); if (rc) say(rc); }
  if (tick % 5 === 0) {
    trickIdle();
    if (!G.modalOpen && !G.visitor && tick > 60 && Math.random() < .05) { const q = pickQuestion(); if (q) askQuestion(q); }
    else if (!G.visitor && !S.sleeping && S.stage !== 'egg' && Math.random() < .012) { const t = refLine(); if (t) say(t); }
    else if (S.player.name && !G.visitor && !S.sleeping && S.stage !== 'egg' && S.happy > 50 && Math.random() < .008) { const n = S.player.name; say(pick([`${n}、だいすき`, `ねえ ${n}、あそぼ？`, `${n}が いると うれしいな`, `${n}、なに してるの？`])); }
  }
  if (tick % 5 === 0) { idleTick(); eventTick(); if (diaryCheck()) say(`${S.name || 'イカッチ'}が きのうの にっきを かいたよ`); }
  render();
  if (tick % 5 === 0) save();
}, 1000);

// ともだち／プレゼント／ひっこし リンクで ひらかれたとき
function checkHash() {
  if (!location.hash || location.hash.length < 4) return;
  let r = null;
  try { r = parseLink(location.hash); } catch (e) { say(e.message); }
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  if (r) handleLink(r);
}
window.addEventListener('hashchange', checkHash);

window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

// デバッグ用（ブラウザのコンソールから ikacchi.G.state を さわれる）
window.ikacchi = { G, render, save };
