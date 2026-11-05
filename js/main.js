// =========================================================
//  イカッチ  起動とゲームループ
// =========================================================
import { G, bus, load, save, newState, rand, dayKey } from './state.js';
import { step, catchUp, weatherToday, log } from './sim.js';
import { render, decorate, say, askName, handleLink } from './ui.js';
import { parseLink } from './net.js';
import { socialTick, relOf } from './social.js';

G.state = load() || newState();
const away = catchUp();

// にじの日ボーナス
const w = weatherToday();
if (w.id === 'rainbow' && G.state.rainbowDay !== dayKey()) { G.state.rainbowDay = dayKey(); G.state.shells += 5; }

decorate();
render();
save();

setTimeout(() => {
  const S = G.state;
  if (away.daily) { log('きょうも あそびに きた'); say(`きょうも きてくれた！ かいがら+5 ／ きょうの てんき：${w.name}`); }
  else if (S.stage === 'egg' && S.egg.hatch === 0) say('イカの たまごが とどいた！ あたためて ふかそう');
  else if (away.mins > 5 && S.stage !== 'egg') say(away.newMistakes ? `るすのあいだに おせわミスが ${away.newMistakes}かい…` : away.newMesses ? `るすのあいだに ${away.newMesses}かい もらしちゃった…` : 'おかえり！ まってたよ');
  askName();
  if (S.travelReady) bus.emit('travel', false);
  checkHash();
}, 500);

let tick = 0;
setInterval(() => {
  const S = G.state;
  step((1 / 60) * G.speed, true);
  tick++;
  if (!G.busy && S.stage !== 'egg' && !S.sleeping && tick % 4 === 0 && Math.random() < .6) S.pos = Math.round(G.visitor ? rand(30, 44) : rand(36, 66));
  if (G.visitor && tick % 5 === 0) {
    const r = relOf(G.visitor.card.pid);
    // けんか中は はなれて、こいびとは となりに
    G.visitor.pos = r.kenka ? Math.round(rand(80, 86)) : r.lover && !S.sleeping ? Math.min(84, S.pos + 26) : Math.round(rand(62, 78));
    socialTick();
  }
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
