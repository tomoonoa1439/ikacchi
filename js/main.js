// =========================================================
//  イカッチ  起動とゲームループ
// =========================================================
import { G, load, save, newState, rand, dayKey } from './state.js';
import { step, catchUp, weatherToday, log } from './sim.js';
import { render, decorate, say, askName } from './ui.js';

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
  if (away.daily) { log('きょうも あそびに きた'); say(`きょうも きてくれた！ 🐚+5 ／ きょうの てんき：${w.ic}${w.name}`); }
  else if (S.stage === 'egg' && S.egg.hatch === 0) say('イカの たまごが とどいた！ あたためて ふかそう');
  else if (away.mins > 5 && S.stage !== 'egg') say(away.newMesses ? `るすのあいだに ${away.newMesses}かい もらしちゃった…` : 'おかえり！ まってたよ');
  askName();
}, 500);

let tick = 0;
setInterval(() => {
  const S = G.state;
  step((1 / 60) * G.speed, true);
  tick++;
  if (!G.busy && S.stage !== 'egg' && !S.sleeping && tick % 4 === 0 && Math.random() < .6) S.pos = Math.round(rand(36, 66));
  if (G.visitor && tick % 5 === 0) G.visitor.pos = Math.round(rand(55, 75));
  render();
  if (tick % 5 === 0) save();
}, 1000);

window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

// デバッグ用（ブラウザのコンソールから ikacchi.G.state を さわれる）
window.ikacchi = { G, render, save };
