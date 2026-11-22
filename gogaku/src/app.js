// ===================== state =====================

const DEF={lang:'ko',done:{ko:{},fr:{},en:{}},score:{ko:{},fr:{},en:{}},furi:'auto',slow:false,srs:{ko:{},fr:{},en:{}},cards:{ko:{},fr:{},en:{}},newIdx:{ko:0,fr:0,en:0},newPer:{ko:10,fr:10,en:10},log:{ko:{},fr:{},en:{}},frBase:'en',custom:{ko:[],fr:[],en:[]},ear:{ko:{},fr:{},en:{}},mission:{ko:{},fr:{},en:{}},plan:{cue:'',act:''},migrated:false,intro:{ko:false},unlockAll:false,pathV:0,enLv:0,enRead:{},enLis:{},enGen:[],enGenL:[],xp:{ko:0,fr:0,en:0},badges:{ko:{},fr:{},en:{}},hist:{ko:{},fr:{},en:{}},mute:false,enUp:0};
let S=JSON.parse(JSON.stringify(DEF));
function loadState(raw){try{const s=typeof raw==='string'?JSON.parse(raw):raw;if(!s)return;for(const key in s){if(S[key]&&typeof S[key]==='object'&&!Array.isArray(S[key])&&s[key]&&typeof s[key]==='object'&&!Array.isArray(s[key]))S[key]={...S[key],...s[key]};else S[key]=s[key]}}catch(e){}}
try{loadState(localStorage.getItem('lang30'))}catch(e){}
// コースを組み直したので、韓国語のステップ進行だけ最初から（覚えたカードは残す）
if(S.pathV!==2){S.done.ko={};S.score.ko={};S.newPer.ko=10;S.pathV=2}
function save(){try{localStorage.setItem('lang30',JSON.stringify(S))}catch(e){}}
const L=()=>DATA[S.lang];
const LN=()=>({ko:'Korean',fr:'French',en:'English'}[S.lang]);
const $=s=>document.querySelector(s);
let view={v:'home'};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m){const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2400)}
const ds=d=>{const z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())};
const today=()=>ds(new Date());
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+Math.round(n));return ds(d)};
function logT(){const t=today();if(!S.log[S.lang][t])S.log[S.lang][t]={};return S.log[S.lang][t]}
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)];

// display helpers (French: English or Japanese base)
const EN=()=>S.lang==='fr'&&S.frBase!=='ja';
const R=it=>EN()&&it.re?it.re:it.r;
const M=it=>EN()&&it.me?it.me:it.m;
const X=it=>EN()?(it.xe||null):it.x;
const T=d=>EN()&&d.te?d.te:d.title;
const TIP=d=>EN()&&d.tipe?d.tipe:d.tip;
const tr=(ja,en)=>EN()&&en?en:ja;
function baseToggle(){return S.lang!=='fr'?'':`<div class="wk" style="margin-top:10px"><span class="small"><b style="color:var(--ink)">説明の言語</b>（意味・読み方・解説）</span><div class="seg mini">${[['en','English'],['ja','日本語']].map(([k,l])=>`<button class="${(S.frBase||'en')===k?'on':''}" onclick="S.frBase='${k}';save();render()">${l}</button>`).join('')}</div></div>`}

// custom items (from AI conversations / stories)
function kindOf(t,m){return /^[0-9]+$/.test(m)?'num':/[ ?]/.test(String(t).trim())?'sent':'word'}
function registerCustom(lang,c){const D=DATA[lang];if(D.byT[c.t])return D.byT[c.t];const it={t:c.t,r:c.r||'',m:c.m||'',re:c.re,me:c.me,n:300,kind:kindOf(c.t,c.m||''),custom:1};D.all.push(it);D.byT[c.t]=it;return it}
for(const lg of ['ko','fr','en'])(S.custom[lg]||[]).forEach(c=>registerCustom(lg,c));
function addCustom(t,r,m){
  t=String(t||'').trim();if(!t)return;
  if(L().byT[t]){const it=L().byT[t];if(!card(it,'L')){initCard(it);save();toast('復習に追加しました')}else toast('もう復習リストにあります');return}
  const c={t,r,m};if(EN()){c.re=r;c.me=m}
  S.custom[S.lang].push(c);const it=registerCustom(S.lang,c);initCard(it);save();toast('復習に追加しました：'+t);
}

// ===================== speech =====================
let playing=false;
function voices(){try{const p=L().lang.slice(0,2);return speechSynthesis.getVoices().filter(v=>v.lang.replace('_','-').toLowerCase().startsWith(p))}catch(e){return[]}}
function voice(){const vs=voices();return vs.find(v=>v.lang.replace('_','-')===L().lang)||vs[0]}
function speak(text,cb,o){
  o=o||{};let called=false;const done=()=>{if(!called){called=true;cb&&cb()}};
  try{
    if(!('speechSynthesis' in window)){toast('この端末では音声が使えません');if(cb)setTimeout(done,1500);return}
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(String(text).replace(/\(.*?\)|（.*?）|~/g,''));
    u.lang=L().lang;u.rate=o.rate||(S.slow?0.6:0.9);if(o.pitch)u.pitch=o.pitch;
    const v=o.voice||voice();if(v)u.voice=v;
    u.onend=done;u.onerror=done;
    speechSynthesis.speak(u);
    if(cb)setTimeout(done,Math.max(4000,String(text).length*450));
    if(!v&&speechSynthesis.getVoices().length&&!speak._warned){speak._warned=1;toast(L().name+'の音声が見つかりません。端末の設定で読み上げ音声を追加してください')}
  }catch(e){toast('音声を再生できませんでした');if(cb)setTimeout(done,1500)}
}
function speakVar(text){const vs=voices();speak(text,null,{voice:vs.length?pick(vs):null,rate:pick([0.7,0.85,1.0,1.1]),pitch:pick([0.8,0.95,1.1,1.25])})}
try{speechSynthesis.onvoiceschanged=()=>{}}catch(e){}
function playAll(items){
  if(playing){stop();render();return}
  playing=true;render();let i=0;
  const next=()=>{if(!playing)return;if(i>=items.length){playing=false;render();return}
    hl(i);speak(items[i++].t,()=>setTimeout(next,900))};
  next();
}
function hl(i){document.querySelectorAll('.item').forEach((e,j)=>e.style.borderColor=j===i?'var(--ac)':'')}
function stop(){playing=false;if(LS)LS.playing=false;if(typeof SH!=='undefined'&&SH){SH.run=false;clearTimeout(SH.timer)}if(SP&&SP.timer){clearInterval(SP.timer);SP.timer=null}try{speechSynthesis.cancel()}catch(e){}}

// ===================== Claude capabilities (AI / dictation) =====================
let AI=null,AIstate='loading',DICT=null;
try{if(window.claude&&claude.use){
  claude.use('sample').then(s=>{AI=s;AIstate=s?'ok':'off';if(view.v!=='sess')render()}).catch(()=>{AIstate='off';render()});
  claude.use('dictation').then(d=>{DICT=d}).catch(()=>{});
}else AIstate='off'}catch(e){AIstate='off'}
setTimeout(()=>{if(AIstate==='loading'){AIstate='off';if(view.v==='home'||view.v==='chat')render()}},11000);
async function askAI(prompt,signal){
  if(!AI)throw {code:'off'};
  let res;
  try{res=await AI.json(prompt,{modelTier:'default',cache:false,signal})}
  catch(e){
    if(e&&e.code==='not_granted'){AIstate='off';AI=null;throw e}
    if(e&&e.code==='rate_limited')throw e;
    const r=await AI(prompt,{modelTier:'default',cache:false,signal});
    const m=String(r.text||'').match(/\{[\s\S]*\}/);if(!m)throw {code:'parse'};res=JSON.parse(m[0]);
  }
  return res;
}
function aiErr(e){return e&&e.code==='rate_limited'?'混み合っています。少し待ってからもう一度押してください。':e&&e.code==='not_granted'?'AIの利用が許可されませんでした。':'AIの応答を受け取れませんでした。もう一度お試しください。'}
let dictOn=false;
function micBtn(targetId){return DICT?`<button class="mic ${dictOn?'on':''}" onclick="toggleMic('${targetId}')">${dictOn?'⏹':'🎤'}</button>`:''}
let dictTarget=null,dictBase='',dictInit=false;
function toggleMic(id){
  if(!DICT)return;
  if(dictOn){DICT.stop().catch(()=>{});return}
  try{
    if(!dictInit){dictInit=true;
      DICT.onPartial(({text})=>{const e=document.getElementById(dictTarget);if(e)e.value=(dictBase+' '+text).trim()});
      DICT.onFinal(({text})=>{dictBase=(dictBase+' '+text).trim();const e=document.getElementById(dictTarget);if(e)e.value=dictBase});
      DICT.onState(({state})=>{dictOn=state==='listening';document.querySelectorAll('.mic').forEach(b=>{b.classList.toggle('on',dictOn);b.textContent=dictOn?'⏹':'🎤'})});
    }
    dictTarget=id;const el=document.getElementById(id);dictBase=el?el.value:'';
    DICT.start().catch(e=>{if(e&&e.code==='not_granted'){DICT=null;render()}});
  }catch(e){}
}

// ===================== FSRS (v4.5 default parameters) =====================
const W=[0.4872,1.4003,3.7145,13.8206,5.1618,1.2298,0.8975,0.031,1.6474,0.1367,1.0461,2.1072,0.0793,0.3246,1.587,0.2272,2.8755];
const DECAY=-0.5,FACTOR=19/81,RET=0.9,DAY=864e5;
const clampD=d=>Math.min(10,Math.max(1,d));
function retr(t,s){return Math.pow(1+FACTOR*t/s,DECAY)}
function ivlOf(s){return Math.max(1,Math.round(s/FACTOR*(Math.pow(RET,1/DECAY)-1)))}
function fsrsNext(c,g,now){
  now=now||Date.now();
  let s,d;
  if(!c||!c.reps){s=W[g-1];d=clampD(W[4]-(g-3)*W[5])}
  else{
    const t=Math.max(0,(now-(c.last||now))/DAY),r=retr(t,c.s);
    d=clampD(W[7]*W[4]+(1-W[7])*(c.d-W[6]*(g-3)));
    if(g===1)s=Math.min(c.s,W[11]*Math.pow(d,-W[12])*(Math.pow(c.s+1,W[13])-1)*Math.exp(W[14]*(1-r)));
    else s=c.s*(Math.exp(W[8])*(11-d)*Math.pow(c.s,-W[9])*(Math.exp(W[10]*(1-r))-1)*(g===2?W[15]:1)*(g===4?W[16]:1)+1);
  }
  s=Math.max(0.1,s);
  let iv=g===1?1:ivlOf(s);
  if(iv>2)iv=Math.round(iv*(0.95+Math.random()*0.1));
  return {s,d,iv};
}
const ckey=(it,dir)=>it.t+'|'+dir;
function card(it,dir){return S.cards[S.lang][ckey(it,dir)]}
function grade(it,dir,g){
  const k=ckey(it,dir),c=S.cards[S.lang][k];const n=fsrsNext(c,g);
  S.cards[S.lang][k]={s:n.s,d:n.d,due:addDays(n.iv),last:Date.now(),reps:((c&&c.reps)||0)+1,lapses:((c&&c.lapses)||0)+(g===1&&c&&c.reps?1:0)};
  ladder(it,dir,g,!!(c&&c.reps));
}
function previewIv(it,dir,g){const n=fsrsNext(card(it,dir),g);return n.iv}
function ivLabel(d){return d<=1?'明日':d<30?d+'日後':d<365?Math.round(d/30)+'ヶ月後':Math.round(d/365*10)/10+'年後'}
const canSpeakCard=it=>it.kind!=='char';
// 技能のはしご：まず「読む・聞く」。復習で思い出せたら「書く」、書けたら「言う」のカードが増える（負担を分散）
function initCard(it){(it.kind==='char'?['R','H']:['R','L']).forEach(d=>{if(!card(it,d))S.cards[S.lang][ckey(it,d)]={reps:0,due:today()}})}
function ladder(it,dir,g,wasReview){
  if(g<2||!wasReview)return;const mkc=d=>{if(!card(it,d))S.cards[S.lang][ckey(it,d)]={reps:0,due:addDays(1)}};
  if(dir==='R'||dir==='L'||dir==='H')mkc('W');
  if(dir==='W'&&it.kind!=='char')mkc('P');
}
// migrate the older Leitner data
(function migrate(){if(S.migrated)return;const INT=[1,1,3,7,14,30,60];
  for(const lg of ['ko','fr','en'])for(const [t,c] of Object.entries(S.srs[lg]||{})){
    const it=DATA[lg].byT[t];if(!it)continue;const s=Math.max(0.5,INT[c.box||0]);
    S.cards[lg][t+'|L']={s,d:5,due:c.due||ds(new Date()),last:Date.now()-s*DAY,reps:(c.box||0)+1,lapses:0};
    if(canSpeakCard(it)&&!S.cards[lg][t+'|P'])S.cards[lg][t+'|P']={reps:0,due:ds(new Date())};
  }
  S.migrated=true;save();})();
function dueCards(){const t=today();const out=[];for(const [k,c] of Object.entries(S.cards[S.lang])){if(c.due<=t){const i=k.lastIndexOf('|');const it=L().byT[k.slice(0,i)];if(it)out.push({it,dir:k.slice(i+1)})}}return out}
const cardsArr=()=>Object.values(S.cards[S.lang]);
const mastered=()=>cardsArr().filter(c=>c.reps&&c.s>=21).length;
const learningN=()=>cardsArr().filter(c=>!c.reps||c.s<21).length;
const speakable=()=>Object.keys(S.cards[S.lang]).filter(k=>k.endsWith('|P')&&S.cards[S.lang][k].reps&&S.cards[S.lang][k].s>=3).length;
function knownWords(){const set=new Set();for(const k of Object.keys(S.cards[S.lang])){const c=S.cards[S.lang][k];if(c.reps)set.add(k.slice(0,k.lastIndexOf('|')))}return [...set]}
function streak(){let n=0;const d=new Date();const has=x=>{const l=S.log[S.lang][ds(x)];return l&&Object.keys(l).length};
  if(!has(d))d.setDate(d.getDate()-1);while(has(d)){n++;d.setDate(d.getDate()-1)}return n}

// ===================== helpers =====================
const total=()=>L().days.length;
const doneCount=()=>Object.keys(S.done[S.lang]).filter(n=>n<=total()).length;
const nextDay=()=>{for(let i=1;i<=total();i++)if(!S.done[S.lang][i])return i;return total()};
const unitDone=n=>!!S.done[S.lang][n];
function gateOpen(key){if(S.unlockAll)return true;const g=L().gate[key];return !g||unitDone(g)}
function gateWhy(key){const g=L().gate[key];return 'ステップ'+g+'を終えると解放'}
function showFuri(n){return S.furi==='on'||(S.furi==='auto'&&n<=L().gate.furi)}
function pool(d){
  const days=L().days;
  if(d.review==='all'||d.review==='final')return days.filter(x=>x.items).flatMap(x=>x.items);
  if(d.review)return days.filter(x=>x.items&&x.n>=d.from&&x.n<d.n).flatMap(x=>x.items);
  return d.items;
}
function exHtml(it){
  const x=X(it);if(!x)return '';const en=EN();
  return `<div class="ex">
  ${x.b.length?`<div class="exh">${en?'Breakdown':'分解'}</div><div class="parts">${x.b.map(p=>`<div class="part"><b>${esc(p[0])}</b><span>${esc(p[1])}</span><i>${esc(p[2])}</i></div>`).join('')}</div>`:''}
  ${x.note?`<div class="exh">${en?'Point':'ポイント'}</div><div class="note">${esc(x.note)}</div>`:''}
  ${x.ex.length?`<div class="exh">${en?'Try also':'こう言い換えられる'}</div>${x.ex.map(e=>`<div class="exl"><button class="spk s" data-t="${esc(e[0])}" onclick="event.stopPropagation();speak(this.dataset.t)">🔊</button><div><b>${esc(e[0])}</b><div class="r2">${esc(e[1])}</div><div class="m">${esc(e[2])}</div></div></div>`).join('')}`:''}
  </div>`;
}
function itemHtml(it,f){
  return `<div class="item"><div class="tx"><div class="t">${esc(it.t)}</div>
    <div class="r ${f?'':'hid'}" onclick="this.classList.remove('hid')">${esc(R(it))}</div><div class="m">${esc(M(it))}</div>
    ${X(it)?`<button class="exbtn" onclick="const w=this.parentNode.querySelector('.exwrap');w.classList.toggle('open');this.textContent=w.classList.contains('open')?(EN()?'Hide ▴':'解説を閉じる ▴'):(EN()?'Explanation ▾':'解説を見る ▾')">${EN()?'Explanation ▾':'解説を見る ▾'}</button><div class="exwrap">${exHtml(it)}</div>`:''}</div>
    <button class="spk" data-t="${esc(it.t)}" onclick="speak(this.dataset.t)">🔊</button></div>`;
}
// まだ習っていない文字・言葉を選択肢に出さない
function seenItem(x,it){return x.n<=it.n||!!card(x,'R')||!!card(x,'L')}
function buildOpts(it){
  let src=L().all.filter(x=>M(x)!==M(it));
  if(it.kind==='char')src=src.filter(x=>x.kind==='char'&&seenItem(x,it));
  const cand=shuffle(src).map(x=>({x,s:(x.kind===it.kind?0:100)+Math.abs(x.n-it.n)+(x.n===it.n?-5:0)+Math.random()*3})).sort((a,b)=>a.s-b.s).map(c=>c.x);
  const wrong=cand.filter((x,i,a)=>a.findIndex(y=>M(y)===M(x))===i).slice(0,3);
  return shuffle([it,...wrong]);
}
function buildForms(it){
  const ks=new Set(hKeys(it.t));
  let src=L().all.filter(x=>x.t!==it.t&&x.kind===it.kind&&(it.n>=100||seenItem(x,it)));
  if(src.length<3)src=L().all.filter(x=>x.t!==it.t&&(x.kind==='char')===(it.kind==='char'));
  const cand=src.map(x=>({x,s:Math.abs(x.t.length-it.t.length)*3+Math.min(6,Math.abs(x.n-it.n))-hKeys(x.t).filter(k=>ks.has(k)).length+Math.random()*3})).sort((a,b)=>a.s-b.s).map(c=>c.x);
  return shuffle([it,...cand.slice(0,3)]);
}
const stripP=s=>String(s).replace(/[?!.,~…？！。、]/g,'').replace(/\s+/g,' ').trim();
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[\s.,!?¿¡'’"“”~\-…。、？！]/g,'');
function sim(a,b){a=norm(a);b=norm(b);if(!a||!b)return 0;const m=a.length,n=b.length;const dp=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)dp[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return 1-dp[m][n]/Math.max(m,n)}
function kbHtml(fn){return `<div class="kb">${KB_ROWS.map(r=>`<div class="kr">${[...r].map(k=>`<button onclick="${fn}('${k}')">${k}</button>`).join('')}</div>`).join('')}
  <div class="kr"><button class="wide2" onclick="${fn}(' ')">スペース</button><button onclick="${fn}('?')">?</button><button class="bs" onclick="${fn}('BS')">⌫</button></div></div>`}
// 手書きキャンバス
let CV=null;
function canvasHtml(guide,trace){return `<canvas id="cv" class="cv" width="260" height="260" data-g="${esc(guide)}" data-t="${trace?1:0}"></canvas>
  <div class="tools" style="justify-content:center"><button class="ghost s" onclick="cvReset()">消す</button>${trace?'':`<button class="ghost s" onclick="cvGuide(.4)">見本を重ねる</button>`}</div>`}
function cvGuide(alpha){const c=$('#cv');if(!c||!c.getContext)return;const x=c.getContext('2d');x.save();x.globalAlpha=alpha;x.fillStyle=alpha>.2?'#d9534f':'#000';x.textAlign='center';x.textBaseline='middle';
  const g=c.dataset.g;x.font=(g.length>1?110:190)+'px "Noto Sans KR",sans-serif';x.fillText(g,130,140);x.restore()}
function cvReset(){const c=$('#cv');if(!c||!c.getContext)return;c.getContext('2d').clearRect(0,0,260,260);if(c.dataset.t==='1')cvGuide(.13)}
function cvInit(){const c=$('#cv');if(!c||c._i||!c.getContext)return;c._i=1;cvReset();const x=c.getContext('2d');x.lineWidth=9;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#1f1d1a';
  let on=false;const pos=e=>{const r=c.getBoundingClientRect();return [(e.clientX-r.left)*260/r.width,(e.clientY-r.top)*260/r.height]};
  c.addEventListener('pointerdown',e=>{on=true;const [a,b]=pos(e);x.beginPath();x.moveTo(a,b);x.lineTo(a+.1,b+.1);x.stroke();e.preventDefault()});
  c.addEventListener('pointermove',e=>{if(!on)return;const [a,b]=pos(e);x.lineTo(a,b);x.stroke();e.preventDefault()});
  ['pointerup','pointerleave','pointercancel'].forEach(n=>c.addEventListener(n,()=>{on=false}));}

// ===================== render =====================
function render(){
  document.body.className=S.lang;
  const a=$('#app');if(!a)return;
  const V={home,day:()=>dayView(L().days[view.n-1]),sess:sessView,shadow:shadowView,ear:earView,chat:chatView,story:storyView,speech:speechView,science:scienceView,backup:backupView,intro:introView,chart:chartView,grow:growView,enplace:enPlaceView,enread:enReadView,enlis:enLisView}[view.v];
  a.innerHTML=V?V():'';cvInit();
}
function go(v,n){stop();view={v,n};render();window.scrollTo(0,0)}
function setLang(l){stop();S.lang=l;save();render()}
function task(icon,title,sub,min,done,btn,lock){
  if(lock)return `<div class="task locked"><div class="ti">🔒</div><div class="tb"><b>${title}</b><div class="small">${lock}</div></div></div>`;
  return `<div class="task ${done?'tdone':''}"><div class="ti">${done?'✓':icon}</div><div class="tb"><b>${title}</b><div class="small">${sub}${min?' · 約'+min+'分':''}</div></div>${btn||''}</div>`;
}
function charsRead(){return L().all.filter(x=>x.kind==='char'&&card(x,'R')&&card(x,'R').reps).length}
function wordsKnown(){return knownWords().filter(t=>{const it=L().byT[t];return it&&it.kind!=='char'}).length}
function home(){
  if(S.lang==='en')return enHome();
  const P=PLAN[S.lang],lg=logT(),c=doneCount(),nd=nextDay(),d=L().days[nd-1],tot=total();
  const due=dueCards().length,nw=lg.new||0,per=S.newPer[S.lang],lis=lg.listen||0;
  const left=L().deck.filter(it=>!card(it,'L')&&!card(it,'R')).length;
  const scen=SCEN[S.lang],mdone=scen.filter(s=>S.mission[S.lang][s.id]).length;
  const wk=wordsKnown(),isKo=S.lang==='ko',fresh=c===0;
  // path
  let path='',si=0,open=false;const st=L().stages;
  L().days.forEach(dd=>{
    if(!open){path+=`<h2>${st[Math.min(si,st.length-1)]}</h2><div class="path">`;open=true}
    const dn=unitDone(dd.n);
    path+=`<button class="urow ${dn?'done':''} ${dd.n===nd&&!dn?'next':''}" onclick="go('day',${dd.n})"><span class="un">${dn?'✓':dd.n}</span><span class="ut">${esc(T(dd))}</span>${dd.review?'<span class="tag">テスト</span>':''}</button>`;
    if(dd.review==='rv'){path+='</div>';open=false;si++}
  });
  if(open)path+='</div>';
  const lockS=wk<40&&!S.unlockAll?'言葉を40個覚えると解放（今 '+wk+'）':'';
  const lockP=wk<60&&!S.unlockAll?'言葉を60個覚えると解放（今 '+wk+'）':'';
  const lk=k=>gateOpen(k)?'':gateWhy(k);
  const plan=S.plan&&S.plan.cue?`<div class="plan">📌 もし <b>${esc(S.plan.cue)}</b> したら、<b>${esc(S.plan.act||'次のステップ')}</b> をする <button class="lnk" onclick="editPlan()">変更</button></div>`:
    (fresh?'':`<div class="card"><b>📌 いつやるか決めよう</b><div class="small" style="margin:4px 0 8px">「もし〇〇したら、△△する」と決めておくと続きやすくなります。</div>
    <input id="pcue" class="inp" placeholder="きっかけ（例：朝コーヒーを淹れ）"><input id="pact" class="inp" placeholder="やること（例：復習と次のステップ）" style="margin-top:6px">
    <button class="ghost wide" onclick="savePlan()">このプランにする</button></div>`);
  return `<h1>話せるようになる語学</h1>
  ${langSeg()}${xpCard()}
  ${fresh||!isKo?`<div class="tip">${P.banner}</div>`:''}${!isKo?`<div class="card" style="margin-top:8px">${baseToggle()}</div>`:''}
  <div class="card hero">
    ${isKo&&!S.intro.ko?`<div class="small">はじめての方へ</div><button class="big-btn" onclick="go('intro')">📖 韓国語ってどんな言葉？（3分）</button>`:`
    ${due?`<div class="small">まず、忘れかけているものから</div><button class="big-btn alt" onclick="startReview()">🔁 復習 ${Math.min(due,40)}枚（約${Math.max(1,Math.ceil(Math.min(due,40)/5))}分）</button>`:''}
    <div class="small" style="margin-top:${due?12:0}px">次のステップ（${nd} / ${tot}）</div>
    <button class="big-btn" onclick="go('day',${nd})">▶ ${esc(T(d))}</button>`}
    <div class="bar" style="margin-top:12px"><i style="width:${c/tot*100}%"></i></div><div class="small">${c} / ${tot} ステップ完了</div>
  </div>
  ${plan}
  <div class="stats"><div><b>${streak()}</b><span>連続日数</span></div>${isKo?`<div><b>${charsRead()}</b><span>読める文字</span></div>`:`<div><b>${mastered()}</b><span>定着</span></div>`}<div><b>${wk}</b><span>覚えた言葉</span></div><div><b>${speakable()}</b><span>言える</span></div></div>
  <div class="card"><b>毎日の練習</b><div class="small">ステップが進むと、少しずつ解放されます。</div>
    ${task('🔁','復習（読む・聞く・書く・言う）',due?`${due} 枚が復習のタイミング`:(cardsArr().length?'今日の分は完了':'ステップを終えると始まります'),0,!due&&(lg.rev||0)>0,due?`<button class="ghost" onclick="startReview()">開始</button>`:'')}
    ${task('🆕','新しい言葉',`今日 ${nw} / ${per}${isKo?'（日本語と似た言葉から）':''}`,P.min.new,nw>=per,left?`<button class="ghost" onclick="startNew()">+5</button>`:'',lk('deck'))}
    ${task('💬','話す：会話ミッション',`場面ごとに練習（${mdone}/${scen.length} 達成）`,P.min.talk,!!lg.talk,`<button class="ghost" onclick="go('chat')">開く</button>`,lk('talk'))}
    ${task('👂','耳トレ（聞き分け）','紛らわしい音を聞き分ける',5,!!lg.ear,`<button class="ghost" onclick="go('ear')">開く</button>`,lk('ear'))}
    ${task('🗣','シャドーイング','聞いてすぐ真似する',P.min.shadow,!!lg.shadow,`<button class="ghost" onclick="startShadow()">開始</button>`,lk('shadow'))}
    ${task('📖','やさしい物語を聞く・読む','覚えた言葉で作った短い話',P.min.story,!!lg.story,`<button class="ghost" onclick="go('story')">開く</button>`,lockS)}
    ${task('⏱','1分スピーチ ×3','同じ話を 60→45→30秒 で3回',8,!!lg.speech,`<button class="ghost" onclick="go('speech')">開く</button>`,lockP)}
    ${task('🎧','ネイティブ音声',`今日 ${lis} / ${P.listen} 分`,0,lis>=P.listen,`<div class="plus"><button onclick="addListen(5)">+5</button><button onclick="addListen(15)">+15</button></div>`,lk('talk'))}
  </div>
  ${isKo?`<button class="ghost wide" onclick="go('chart')">🔤 ハングル表（音を確認する）</button>`:''}
  ${path}
  ${gateOpen('talk')?`<div class="card"><b>できるようになったこと</b>
    ${scen.map(s=>`<div class="cando ${S.mission[S.lang][s.id]?'ok':''}">${S.mission[S.lang][s.id]?'✅':'⬜'} ${s.icon} ${esc(tr(s.title,s.titleEn))}</div>`).join('')}</div>
  <div class="card"><b>🎧 ネイティブ音声を聞く</b>
    <div class="small" style="margin:4px 0 6px">7割くらい分かるやさしい動画がベストです。</div>
    ${RES[S.lang].map(r=>`<a class="res" href="${r[1]}" target="_blank" rel="noopener">${esc(r[0])} ›</a>`).join('')}
    <div class="small" style="margin-top:8px">慣れてきたら、週に1回でもオンライン家庭教師や語学交換で<b>人と話す</b>と伸び方が変わります。</div></div>`:''}
  <button class="sci" onclick="go('science')">🔬 なぜこの方法？（研究の根拠）</button>
  <div class="card small">
    <div class="wk"><b style="color:var(--ink)">読み仮名</b>
    <div class="seg mini">${['auto','on','off'].map(m=>`<button class="${S.furi===m?'on':''}" onclick="S.furi='${m}';save();render()">${{auto:'自動',on:'常に',off:'隠す'}[m]}</button>`).join('')}</div></div>
    <div style="margin-top:4px">「自動」は${isKo?'ハングルのステージの間だけ表示し、その後は':'最初の2週間だけ表示し、その後は'}タップで表示します。</div>
    <div class="wk" style="margin-top:12px"><b style="color:var(--ink)">新しい言葉 / 日</b>
    <div class="seg mini">${[5,10,20].map(m=>`<button class="${S.newPer[S.lang]===m?'on':''}" onclick="S.newPer[S.lang]=${m};save();render()">${m}</button>`).join('')}</div></div>
    <div class="wk" style="margin-top:12px"><b style="color:var(--ink)">練習をすべて解放</b>
    <div class="seg mini">${[[false,'順番に'],[true,'全部']].map(([v,l])=>`<button class="${!!S.unlockAll===v?'on':''}" onclick="S.unlockAll=${v};save();render()">${l}</button>`).join('')}</div></div>
    <button class="ghost wide" onclick="go('backup')">💾 バックアップ・別の端末へ移す</button>
  </div>
  <div class="small" style="margin-top:14px">記録はこの端末のブラウザに保存されます。</div>`;
}
function savePlan(){const c=($('#pcue')||{}).value,a=($('#pact')||{}).value;if(!c){toast('きっかけを書いてください');return}S.plan={cue:c.trim(),act:(a||'').trim()};save();render();toast('プランを保存しました')}
function editPlan(){S.plan={cue:'',act:''};save();render()}
function addListen(m){const l=logT();l.listen=(l.listen||0)+m;save();render();toast('ネイティブ音声 +'+m+'分')}
function introView(){
  const cards=[['🧩','語順は日本語とほぼ同じ','「私は・学校に・行きます」＝「저는 학교에 가요」。単語を置きかえるだけで文になります。英語のように順番を入れかえる必要がありません。'],
   ['🔗','「は・が・を・に」にあたる助詞がある','저는（私は）、물을（水を）、학교에（学校に）。日本語と同じ感覚で使えます。'],
   ['🀄','漢字から来た言葉がたくさん','約束＝약속（ヤクソク）、家族＝가족（カジョク）、無理＝무리（ムリ）。音が似ているので、日本語を知っているだけで覚えやすい言葉が多くあります。'],
   ['🔤','文字（ハングル）は組み合わせ式','覚える部品は24個＋その組み合わせ。ㄱ(k)＋ㅏ(a)＝가(ka) のように、ローマ字と同じ考え方です。1ステップ10分ほど、10ステップで全部読めるようになります。'],
   ['🗺️','このコースの進め方','① まずハングルを「読む・聞く・書く」で覚える → ② 日本語と似た言葉で語彙を増やす → ③ 短い文を覚えて、読む・聞く・書く・言うの4つで練習 → ④ 場面ごとの会話へ。毎回、前に習ったことの復習が自動で出ます。']];
  return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>韓国語ってどんな言葉？</h1>
  ${cards.map(c=>`<div class="card"><b>${c[0]} ${c[1]}</b><div class="small" style="margin-top:6px;color:var(--ink)">${c[2]}</div></div>`).join('')}
  <button class="big-btn" onclick="S.intro.ko=true;save();go('day',1)">▶ 最初のステップへ</button>`;
}
function chartView(){
  return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>🔤 ハングル表</h1>
  <div class="tip">タップすると音が出ます。まだ習っていない字は薄く表示されます。</div>
  ${L().days.filter(d=>d.hunit&&d.letters.length).map(d=>`<h2>${esc(d.title)}</h2><div class="chart">${d.letters.map(l=>`<button class="${unitDone(d.n)?'':'dim'}" onclick="speak('${l[1]||'아'}')"><b>${l[0]}</b><span>${esc(l[2])}</span></button>`).join('')}</div>`).join('')}`;
}

// ===================== lesson day =====================
function dayView(d){
  const items=pool(d),f=showFuri(d.n);
  const done=unitDone(d.n),sc=S.score[S.lang][d.n];
  const head=`<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button><span class="small">${L().name} · ステップ ${d.n} / ${total()}</span></div>
  <h1>${esc(T(d))}</h1><div class="tip">${esc(TIP(d))}</div>${baseToggle()}`;
  const foot=`${sc!=null?`<div class="small" style="text-align:center;margin-top:10px">前回：${sc}%</div>`:''}`;
  if(d.review)return head+`<div class="card"><b>${items.length}個から出題</b><div class="small" style="margin-top:4px">聞く・読む・書くをまぜて出題します。</div></div>
    <button class="big-btn" onclick="startDay(${d.n})">▶ テストを始める</button>`+foot;
  if(d.hunit)return head+`<button class="big-btn" onclick="startDay(${d.n})">▶ はじめる（10〜15分）</button>
    <div class="small" style="margin-top:8px">流れ：文字を知る → 聞いて選ぶ → 読む → 組み立てて書く → 手で書く → 本物の単語を読む</div>
    ${d.letters.length?`<h2>このステップの文字</h2>${d.letters.map(l=>`<div class="item"><div class="jm">${l[0]}</div><div class="tx"><div class="r">${esc(l[4])}　${esc(l[2])}</div><div class="m">${esc(l[5])}</div></div><button class="spk" onclick="speak('${l[1]||'아'}')">🔊</button></div>`).join('')}`:''}
    <h2>読めるようになる単語</h2>${d.words.map(it=>itemHtml(it,true)).join('')}
    ${done?'':`<button class="ghost wide" onclick="markDone(${d.n})">もう知っているので飛ばす</button>`}`+foot;
  return head+`<button class="big-btn" onclick="startDay(${d.n})">▶ 練習を始める（読む→聞く→書く→言う）</button>
  <div class="tools">
    <button class="ghost" onclick="playAll(L().days[${d.n-1}].items)">${playing?'⏹ 停止':'▶ 全部再生'}</button>
    <button class="ghost" onclick="S.slow=!S.slow;save();render()">${S.slow?'🐢 ゆっくり':'🐇 ふつう'}</button>
  </div>${f?'':'<div class="small" style="margin-top:8px">まずハングルを自分で読んでみよう。灰色の部分をタップすると読み仮名が出ます。</div>'}
  ${items.map(it=>itemHtml(it,f)).join('')}
  ${done?'':`<button class="ghost wide" onclick="markDone(${d.n})">練習なしで完了にする</button>`}`+foot;
}
function markDone(n){S.done[S.lang][n]=1;logT().lesson=1;const d=L().days[n-1];if(d.items)d.items.forEach(initCard);save();toast('ステップ '+n+' 完了');go('home')}

// ===================== session engine =====================
// I=文字の紹介 H=聞いて字を選ぶ R=読んで意味を選ぶ L=聞いて意味を選ぶ N=はじめての言葉（先に推測）
// S=音節を聞いて選ぶ W=書く（組み立て） D=手で書く A=声に出して読む P=言う
let SS=null;
function mk(k,it,extra){const t={k,it,...extra};if(k==='L'||k==='R'||k==='N')t.opts=buildOpts(it);if(k==='H')t.opts=buildForms(it);return t}
function startSession(mode,tasks,extra){
  if(!tasks.length){toast('出題するものがありません');return}
  stop();COMBO=0;COMBOMAX=0;SXP=0;SS={mode,tasks,i:0,ans:null,shown:false,hint:0,plays:0,typed:'',ok:0,cnt:0,...extra};
  view={v:'sess'};render();window.scrollTo(0,0);autoPlay();
}
function curT(){return SS.tasks[SS.i]}
function gradeS(it,dir,g){if((dir==='W'||dir==='P')&&!card(it,dir)&&(SS.mode==='day'||SS.mode==='new'))return;grade(it,dir,g)}
function autoPlay(){const t=curT();if(!t)return;let s=null;
  if(t.k==='L'||t.k==='N'||t.k==='H')s=t.it.t;else if(t.k==='S')s=t.syl;else if(t.k==='W'){wInit(t);if(t.audio)s=t.it.t}
  if(s)setTimeout(()=>{SS.plays++;speak(s)},300)}
function spaceOut(tasks){for(let i=1;i<tasks.length;i++){if(tasks[i].it&&tasks[i].it===tasks[i-1].it){const j=tasks.findIndex((x,k)=>k>i&&x.it!==tasks[i].it);if(j>0)[tasks[i],tasks[j]]=[tasks[j],tasks[i]]}}return tasks}
function startReview(){
  const due=shuffle(dueCards()).slice(0,40);
  startSession('review',spaceOut(due.map(x=>mk(x.dir,x.it))));
}
function startNew(){
  const deck=L().deck;const out=[];let i=0;
  while(out.length<5&&i<deck.length){if(!card(deck[i],'L')&&!card(deck[i],'R'))out.push(deck[i]);i++}
  if(!out.length){toast('単語はすべて学習済みです');return}
  const tasks=out.map(it=>mk('N',it));
  shuffle(out).forEach(it=>tasks.push(mk('R',it)));
  shuffle(out).forEach(it=>tasks.push(mk('W',it)));
  shuffle(out).forEach(it=>tasks.push(mk('P',it)));
  startSession('new',tasks,{count:out.length,items:out});
}
function sylOpts(syl,n){
  const all=[...new Set(L().days.filter(d=>d.hunit&&d.n<=n).flatMap(d=>d.syl))].filter(s=>s!==syl);
  const k=hKeys(syl);const sc=s=>{const q=hKeys(s);return (q[0]===k[0]?1:0)+(q[1]===k[1]?1:0)+((q[2]||'')===(k[2]||'')?1:0)+Math.random()};
  return shuffle([syl,...all.sort((a,b)=>sc(b)-sc(a)).slice(0,3)]);
}
function startDay(n){
  const d=L().days[n-1];let tasks=[];
  if(d.hunit){
    for(let i=0;i<d.letters.length;i+=3){const ch=d.letters.slice(i,i+3);
      ch.forEach(l=>tasks.push({k:'I',letter:l}));
      shuffle(ch.filter(l=>l[1])).forEach(l=>tasks.push(mk('H',L().byT[l[1]])))}
    shuffle(d.chars).forEach(it=>tasks.push(mk('R',it)));
    shuffle(d.syl).slice(0,4).forEach(s=>tasks.push({k:'S',syl:s,opts:sylOpts(s,n)}));
    shuffle(d.syl).slice(0,3).forEach(s=>tasks.push({k:'W',it:{t:s,r:'',m:'',kind:'syl',n},pseudo:1}));
    shuffle(d.chars).slice(0,3).forEach(it=>tasks.push({k:'D',it}));
    const ws=d.words;
    ws.forEach(it=>tasks.push({k:'A',it}));
    shuffle(ws).slice(0,4).forEach(it=>tasks.push(mk('H',it)));
    shuffle(ws).slice(0,4).forEach(it=>tasks.push(mk('W',it)));
    if(!d.letters.length)shuffle(ws).slice(0,5).forEach(it=>tasks.push(mk('R',it)));
  }else if(d.review){
    const p=shuffle(pool(d)).slice(0,d.review==='final'?20:14);
    tasks=p.map((it,i)=>mk(it.kind==='char'?['R','H','W'][i%3]:['R','L','W'][i%3],it));
  }else{
    const p=d.items.slice(0,10);
    const r1=[];shuffle(p).forEach(it=>r1.push(mk('R',it)));shuffle(p).forEach(it=>r1.push(mk('L',it)));
    tasks=spaceOut(shuffle(r1));
    shuffle(p).forEach(it=>tasks.push(mk('W',it)));
    shuffle(p).slice(0,6).forEach(it=>tasks.push(mk('P',it)));
  }
  startSession('day',tasks,{n});
}
function startDrill(items){startSession('drill',items.map(it=>({k:'P',it,drill:1})))}
function sessTitle(){return {review:'復習',new:'新しい言葉',day:'ステップ '+(SS.n||''),drill:'言う練習'}[SS.mode]}
// ---- 書く（組み立て） ----
function wInit(t){
  if(t.mode)return;const it=t.it,c=t.pseudo?null:card(it,'W'),mature=!!(c&&c.reps&&c.s>=7);
  const clean=stripP(it.t);t.ans=clean;const words=clean.split(' ');t.audio=!mature;
  if(words.length>=2&&(S.lang!=='ko'||clean.length>6)){
    const others=shuffle(L().all.filter(x=>x!==it&&x.kind==='sent').flatMap(x=>stripP(x.t).split(' ')).filter(w=>!words.includes(w)));
    t.mode='words';t.tiles=shuffle([...words,...[...new Set(others)].slice(0,mature?4:2)]);t.pick=[];
  }else if(S.lang==='ko'){
    t.keys=[];const need=[...new Set(hKeys(clean).filter(k=>k!==' '))];
    if(mature)t.mode='kb';
    else{t.mode='bank';const lrn=it.n<=10?L().days.filter(d=>d.hunit&&d.n<=it.n).flatMap(d=>d.letters.map(l=>l[0])).join(''):'';const pool=lrn.length>=4?lrn:'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅎㅏㅓㅗㅜㅡㅣㅐㅔ';const dis=shuffle([...new Set(pool)].filter(k=>!need.includes(k))).slice(0,Math.min(4,Math.max(2,6-need.length)));
      t.bank=shuffle([...need,...dis]);t.space=clean.includes(' ')}
  }else t.mode='text';
}
function wKey(k){const t=curT();if(SS.ans!==null)return;if(k==='BS')t.keys.pop();else t.keys.push(k);const e=$('#wout');if(e)e.textContent=hCompose(t.keys)||'　'}
function wTile(i){const t=curT();if(SS.ans!==null)return;const p=t.pick.indexOf(i);if(p>=0)t.pick.splice(p,1);else t.pick.push(i);render()}
function wGot(t){return t.mode==='words'?t.pick.map(i=>t.tiles[i]).join(' '):t.mode==='text'?(($('#win')||{}).value||''):hCompose(t.keys)}
function wCheck(){
  const t=curT(),got=stripP(wGot(t));if(!got){toast('まず書いてみよう');return}
  const ok=(t.mode==='text')?norm(got)===norm(t.ans):got===t.ans;
  t.got=got;SS.ans=ok?1:0;hit(ok,3);
  if(!t.re&&!t.pseudo){SS.cnt++;if(ok)SS.ok++;gradeS(t.it,'W',ok?(SS.hint?2:3):1);if(SS.mode==='review'){const l=logT();l.rev=(l.rev||0)+1}}
  if(!ok&&!t.re)SS.tasks.splice(Math.min(SS.tasks.length,SS.i+3),0,{k:'W',it:t.it,pseudo:t.pseudo,re:1});
  save();render();speak(t.it.t);
}
function wView(t){
  wInit(t);const it=t.it,answered=SS.ans!==null;
  const prompt=it.kind==='syl'?'聞こえた音を、部品を組み立てて書こう':(t.audio?'聞いて、意味を見て、書いてみよう':'意味を見て、思い出して書こう');
  let body='';
  if(t.mode==='words')body=`<div class="wout">${t.pick.length?t.pick.map(i=>`<button class="tile on" ${answered?'disabled':''} onclick="wTile(${i})">${esc(t.tiles[i])}</button>`).join(''):'<span class="small">下の言葉を順番にタップ</span>'}</div>
    <div class="tiles">${t.tiles.map((w,i)=>`<button class="tile ${t.pick.includes(i)?'used':''}" ${answered||t.pick.includes(i)?'disabled':''} onclick="wTile(${i})">${esc(w)}</button>`).join('')}</div>`;
  else if(t.mode==='text')body=`<div class="inrow"><input id="win" class="inp" placeholder="ここに入力" value="${esc(t.got||'')}" ${answered?'disabled':''} autocapitalize="off" autocomplete="off"></div>`;
  else body=`<div class="wout big" id="wout">${esc(hCompose(t.keys))||'　'}</div>${answered?'':(t.mode==='kb'?kbHtml('wKey'):
    `<div class="tiles">${t.bank.map(k=>`<button class="tile jm" onclick="wKey('${k}')">${k}</button>`).join('')}${t.space?`<button class="tile" onclick="wKey(' ')">スペース</button>`:''}<button class="tile bs" onclick="wKey('BS')">⌫</button></div>`)}`;
  return `<div class="card qbig"><div class="kind">✍️ 書く</div>
    ${t.audio?`<button class="spk" onclick="speak(curT().it.t)">🔊</button>`:''}
    <div class="small" style="margin-top:8px">${prompt}</div>
    ${it.m?`<div class="pm">${esc(M(it))}</div>`:''}
    ${SS.hint&&!answered?`<div class="small">ヒント：最初の文字は「${esc(t.ans[0])}」</div>`:''}
    ${body}
    ${answered?`<div class="res2 ${SS.ans?'ok':'ng'}">${SS.ans?'✅ 正解！':'❌ おしい'}<div class="reveal">${esc(it.t)}<span class="r">${esc(R(it))}</span></div></div>`:''}
  </div>
  ${answered?`<button class="big-btn" onclick="nextTask()">次へ</button>`:
   `<div class="tools" style="justify-content:center">${SS.hint?'':`<button class="ghost" onclick="SS.hint=1;render()">ヒント</button>`}<button class="big-btn" style="flex:1;margin-top:0" onclick="wCheck()">確認する</button></div>
    <button class="lnk" style="display:block;margin:8px auto" onclick="curT().keys=[];curT().pick=[];wGiveUp()">わからない（答えを見る）</button>`}`;
}
function wGiveUp(){const t=curT();t.got='';SS.ans=0;hit(false,0);if(!t.re&&!t.pseudo){SS.cnt++;gradeS(t.it,'W',1)}if(!t.re)SS.tasks.splice(Math.min(SS.tasks.length,SS.i+3),0,{k:'W',it:t.it,pseudo:t.pseudo,re:1});save();render();speak(t.it.t)}
function sessView(){
  if(SS.i>=SS.tasks.length)return sessEnd();
  const t=curT(),it=t.it,a=SS.ans,answered=a!==null;
  const head=`<div class="top"><button class="back" onclick="endEarly()">‹ やめる</button><span class="small">${sessTitle()} · ${SS.i+1} / ${SS.tasks.length}${t.re?' · もう一度':''}</span>${COMBO>=3?`<span class="combo">🔥${COMBO}</span>`:''}</div>
  <div class="bar"><i style="width:${SS.i/SS.tasks.length*100}%"></i></div>`;
  if(t.k==='I'){const l=t.letter,g=(l[1]&&hKeys(l[1]).length===3)?l[1]:l[0];
    return head+`<div class="card qbig"><div class="kind">🆕 新しい文字</div><div class="jbig">${l[0]}</div>
      <div class="pm" style="margin:4px 0">${esc(l[4])}　${esc(l[2])}</div>
      <button class="spk" onclick="speak('${l[1]||'아'}')">🔊</button> <span class="small">${l[1]?esc(l[1]):'아（ㅇ＋ㅏ）'}</span>
      <div class="note" style="margin-top:10px;text-align:left">💡 ${esc(l[5])}</div>
      <div class="small" style="margin-top:12px">指でなぞって書いてみよう（上から下、左から右へ）</div>${canvasHtml(g,true)}</div>
    <button class="big-btn" onclick="nextTask()">次へ</button>`}
  if(t.k==='A')return head+`<div class="card qbig"><div class="kind">📖 読む</div><div class="small">声に出して読んでみよう</div>
      <div class="jbig" style="font-size:${it.t.length>3?44:64}px">${esc(it.t)}</div>
      ${SS.shown?`<div class="reveal"><span class="r" style="font-size:18px">${esc(R(it))}</span></div><div class="pm">${esc(M(it))}</div>`:''}</div>
    ${SS.shown?`<div class="rate two"><button class="r2" onclick="aRate(0)">まだ難しい</button><button class="r3" onclick="aRate(1)">読めた！</button></div>`:
      `<button class="big-btn" onclick="SS.shown=true;render();speak(curT().it.t)">🔊 答えを聞く</button>`}`;
  if(t.k==='D')return head+`<div class="card qbig"><div class="kind">✍️ 手で書く</div><div class="small">何も見ずに書いてみよう</div>
      <div class="pm">「${esc(it.m)}」 <button class="spk s" onclick="speak(curT().it.t)">🔊</button></div>${canvasHtml(it.t,false)}
      <div class="small">書けたら「見本を重ねる」で確かめよう</div></div>
    <div class="rate two"><button class="r2" onclick="aRate(0)">まだ難しい</button><button class="r3" onclick="aRate(1)">書けた！</button></div>`;
  if(t.k==='W')return head+wView(t);
  if(t.k==='P'){
    const hintTxt=SS.hint?esc(it.t.split(' ').map(w=>w[0]+w.slice(1).replace(/./g,'・')).join(' ')):'';
    return head+`<div class="card qbig"><div class="kind">🗣 言う</div>
      <div class="small">${t.drill?'場面で使うフレーズ。':''}次の意味を<b>${L().name}で声に出して</b>言ってみよう</div>
      <div class="pm">${esc(M(it))}</div>
      ${SS.shown?`<div class="reveal">${esc(it.t)}<span class="r">${esc(R(it))}</span></div>`:
        `${SS.hint?`<div class="small" style="margin-top:8px">ヒント：${hintTxt}</div>`:''}${DICT?`<div class="inrow"><input id="pin" class="inp" placeholder="🎤 で音声入力もできます" value="${esc(SS.typed)}">${micBtn('pin')}</div>`:''}`}
    </div>
    ${SS.shown?`<div class="small" style="text-align:center">言えたかどうか、正直に選んでください（次に出る時期が変わります）</div>
      <div class="rate">${[[1,'もう一度','r1'],[2,'難しい','r2'],[3,'言えた','r3'],[4,'簡単','r4']].map(([g,l,c])=>`<button class="${c}" onclick="rateP(${g})">${l}<span>${g===1?'あとで':ivLabel(previewIv(it,'P',g))}</span></button>`).join('')}</div>
      ${X(it)?`<div class="card">${exHtml(it)}</div>`:''}`:
      `<div class="tools" style="justify-content:center">${SS.hint?'':`<button class="ghost" onclick="SS.hint=1;keepTyped();render()">ヒント</button>`}
      <button class="big-btn" style="flex:1;margin-top:0" onclick="revealP()">答えを見る</button></div>`}`;
  }
  // 選択式：L N R H S
  const k=t.k,target=k==='S'?t.syl:it;
  const lab={L:['👂 聞く',EN()?'What does it mean?':'聞こえた言葉の意味は？'],N:['🤔 推測','はじめての言葉。音を聞いて意味を当ててみよう（外れてOK）'],R:['📖 読む',it&&it.kind==='char'?'この文字の読み方は？':'読んでみよう。意味はどれ？'],H:['👂 聞いて選ぶ','聞こえたのはどれ？'],S:['👂 聞いて選ぶ','聞こえた音はどれ？']}[k];
  const stim=k==='R'?`<div class="jbig" style="font-size:${it.t.length>5?30:it.t.length>2?44:72}px">${esc(it.t)}</div>${answered?`<div class="reveal"><span class="r" style="font-size:16px">${esc(R(it))}</span></div>`:''}`:
    `<button class="spk" onclick="SS.plays++;speak(${k==='S'?'curT().syl':'curT().it.t'})">🔊</button>`;
  const optTxt=o=>k==='S'?`<span class="ob">${o}</span>`:k==='H'?`<span class="ob" style="font-size:${o.t.length>4?20:26}px">${esc(o.t)}</span>`:esc(M(o));
  return head+`<div class="card qbig"><div class="kind">${lab[0]}</div>${stim}
      <div class="small" style="margin-top:8px">${lab[1]}</div>
      ${(k==='L'||k==='N')?`<div class="reveal">${answered?esc(it.t)+`<span class="r">${esc(R(it))}</span>`:`<button class="ghost" style="font-size:13px" onclick="SS.hint=1;this.outerHTML=curT().it.t.replace(/[&<>]/g,'')">ヒント：文字を見る</button>`}</div>`:''}
      ${k==='R'&&!answered?`<button class="ghost" style="font-size:13px;margin-top:8px" onclick="SS.hint=1;speak(curT().it.t)">ヒント：音を聞く</button>`:''}
      ${k==='H'&&answered&&it.m?`<div class="small">${esc(it.kind==='char'?it.r:M(it))}</div>`:''}</div>
    <div class="opts ${k==='S'||k==='H'?'grid2':''}">${t.opts.map((o,i)=>`<button class="opt ${answered?(o===target?'ok':(i===a?'ng':'')):''}" ${answered?'disabled':''} onclick="answerL(${i})">${optTxt(o)}</button>`).join('')}
    ${answered||k==='S'||k==='H'?'':`<button class="opt idk" onclick="answerL(-1)">わからない</button>`}</div>
    ${answered?`${k==='N'?`<div class="card" style="margin-top:12px"><div class="small">${a>=0&&t.opts[a]===it?'🎯 当たり！':'外れてもOK。今の推測が記憶を強くします。'}</div>${itemHtml(it,true)}</div>`:''}
      ${k!=='N'&&it&&X(it)?`<div class="card" style="margin-top:12px"><b>${EN()?'Explanation':'解説'}：${esc(it.t)}＝${esc(M(it))}</b>${exHtml(it)}</div>`:''}
      <button class="big-btn" onclick="nextTask()">${SS.i+1<SS.tasks.length?'次へ':'結果を見る'}</button>`:''}`;
}
function keepTyped(){const e=$('#pin');if(e)SS.typed=e.value}
function revealP(){keepTyped();if(dictOn&&DICT)DICT.stop().catch(()=>{});SS.shown=true;render();speak(curT().it.t)}
function aRate(ok){const t=curT();hit(!!ok,1);if(!ok&&!t.re)SS.tasks.splice(Math.min(SS.tasks.length,SS.i+4),0,{...t,re:1});nextTask()}
function answerL(i){
  const t=curT(),it=t.it,k=t.k;SS.ans=i;const ok=i>=0&&t.opts[i]===(k==='S'?t.syl:it);
  if(k==='S'){hit(ok,1);if(!ok&&!t.re)SS.tasks.splice(Math.min(SS.tasks.length,SS.i+3),0,{...t,opts:shuffle(t.opts),re:1});render();speak(t.syl);return}
  const dir=k==='N'?'L':k;hit(ok,2);
  if(!t.re){
    SS.cnt++;if(ok)SS.ok++;
    grade(it,dir,k==='N'?(ok?3:1):(ok?((SS.hint||SS.plays>2)?2:3):1));
    if(SS.mode==='review'){const l=logT();l.rev=(l.rev||0)+1}
    if(!ok||k==='N')SS.tasks.splice(Math.min(SS.tasks.length,SS.i+(k==='N'?3:4)),0,{...mk(k==='N'?'L':k,it),re:1});
  }
  save();render();speak(it.t);
}
function rateP(g){
  const t=curT(),it=t.it;
  hit(g>=3,3);if(!t.re){SS.cnt++;if(g>=3)SS.ok++;gradeS(it,'P',g);if(SS.mode==='review'){const l=logT();l.rev=(l.rev||0)+1}}
  if(g===1&&!t.re)SS.tasks.splice(Math.min(SS.tasks.length,SS.i+4),0,{k:'P',it,re:1});
  save();nextTask();
}
function nextTask(){
  SS.i++;SS.ans=null;SS.shown=false;SS.hint=0;SS.plays=0;SS.typed='';
  if(SS.i>=SS.tasks.length)finishSess();
  render();window.scrollTo(0,0);autoPlay();
}
function finishSess(){
  const l=logT();
  if(SS.mode==='day'){const d=L().days[SS.n-1];S.score[S.lang][SS.n]=Math.round(SS.ok/Math.max(1,SS.cnt)*100);S.done[S.lang][SS.n]=1;l.lesson=1;if(d.items)d.items.forEach(initCard)}
  if(SS.mode==='new'){l.new=(l.new||0)+SS.count;SS.items.forEach(initCard)}
  if(SS.mode==='drill')l.talk=1;
  bonus({day:20,review:10,new:10,drill:10}[SS.mode]||0);
  save();
}
function endEarly(){if(SS&&SS.mode==='day')go('day',SS.n);else go('home')}
function sessEnd(){
  const pct=Math.round(SS.ok/Math.max(1,SS.cnt)*100);
  let btns='',msg='できなかったものほど早く、できたものは間隔をあけて、復習に出てきます。';
  if(SS.mode==='day'){const nx=Math.min(SS.n+1,total());const d=L().days[SS.n-1];
    if(d.hunit)msg=`${d.letters.filter(l=>l[1]).length?d.letters.map(l=>l[0]).join(' ')+' が読めるようになりました。':''}今日の文字と単語は、明日から「復習」に出てきます。`;
    btns=`<button class="big-btn" onclick="go('home')">ホームへ</button>${SS.n<total()?`<button class="ghost wide" onclick="go('day',${nx})">続けて次のステップへ</button>`:''}`}
  else if(SS.mode==='new')btns=`<button class="big-btn" onclick="go('home')">ホームへ</button><button class="ghost wide" onclick="startNew()">さらに +5</button>`;
  else btns=`<button class="big-btn" onclick="go('home')">ホームへ</button>`;
  return `<div class="top"><button class="back" onclick="go('home')">‹ ホーム</button></div>
  <h1>${sessTitle()} おつかれさま！</h1><div class="card"><div class="score">${pct}%</div>
  <div class="small" style="text-align:center">${SS.cnt}問中 ${SS.ok}問できた</div>${xpSummary()}
  <div class="small" style="text-align:center;margin-top:8px">${msg}</div></div>${btns}`;
}

// ===================== ear training (HVPT) =====================
let ET=null;
function earView(){
  if(!ET){
    const sets=EAR[S.lang];
    return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>👂 耳トレ</h1>
    <div class="tip">紛らわしい音を、声・速さ・高さを変えながら聞き分けます。1問ごとに正解が分かり、聞き比べもできます。1セット16問、約3分です。</div>
    ${sets.map((s,i)=>{const h=(S.ear[S.lang][s.id]||[]);const last=h[h.length-1];return `<button class="setb" onclick="startEar(${i})"><b>${esc(s.name)}</b><span class="small">${esc(EN()&&s.noteEn?s.noteEn:s.note)}</span>${last!=null?`<span class="acc">前回 ${last}%${h.length>1?'（'+h.length+'回）':''}</span>`:''}</button>`}).join('')}
    <div class="small" style="margin-top:10px">${voices().length>1?'この端末では '+voices().length+' 種類の声を使います。':'この端末の声は1種類です。速さと高さを変えて変化をつけます。'}</div>`;
  }
  const set=EAR[S.lang][ET.set];
  if(ET.i>=ET.n){const pct=Math.round(ET.ok/ET.n*100);
    return `<div class="top"><button class="back" onclick="ET=null;go('ear')">‹ 耳トレ</button></div><h1>${esc(set.name)}</h1>
    <div class="card"><div class="score">${pct}%</div><div class="small" style="text-align:center">${ET.n}問中 ${ET.ok}問正解。90%を超えるまで、日をあけてくり返すのが効果的です。</div></div>
    <button class="big-btn" onclick="startEar(${ET.set})">もう一度</button><button class="ghost wide" onclick="ET=null;render()">ほかのセット</button>`}
  const items=set.items,cur=items[ET.cur],a=ET.ans;
  const lab=x=>S.lang==='fr'?(EN()?x[4]:x[3]):x[2];
  const rd=x=>S.lang==='fr'?(EN()?x[2]:x[1]):x[1];
  return `<div class="top"><button class="back" onclick="ET=null;stop();render()">‹ やめる</button><span class="small">${esc(set.name)} · ${ET.i+1} / ${ET.n}</span></div>
  <div class="bar"><i style="width:${ET.i/ET.n*100}%"></i></div>
  <div class="card qbig"><button class="spk" onclick="speakVar(EAR[S.lang][ET.set].items[ET.cur][0])">🔊</button><div class="small" style="margin-top:8px">どれが聞こえた？</div></div>
  <div class="opts">${items.map((x,i)=>`<button class="opt ${a!=null?(i===ET.cur?'ok':(i===a?'ng':'')):''}" ${a!=null?'disabled':''} onclick="earAns(${i})"><b>${esc(x[0])}</b> <span class="small">${esc(lab(x))}</span></button>`).join('')}</div>
  ${a!=null?`<div class="card"><div class="small">${a===ET.cur?'✅ 正解！':'❌ 正解は '+esc(cur[0])+'（'+esc(rd(cur))+'）'}</div><div class="small" style="margin:6px 0">聞き比べ：</div>
    <div class="tools">${items.map(x=>`<button class="ghost" onclick="speakVar('${esc(x[0]).replace(/'/g,"\\'")}')">🔊 ${esc(x[0])}</button>`).join('')}</div>
    <div class="note" style="margin-top:8px">${esc(EN()&&set.noteEn?set.noteEn:set.note)}</div></div>
    <button class="big-btn" onclick="earNext()">${ET.i+1<ET.n?'次へ':'結果を見る'}</button>`:''}`;
}
function startEar(i){stop();ET={set:i,i:0,n:16,ok:0,ans:null,cur:Math.floor(Math.random()*EAR[S.lang][i].items.length)};view={v:'ear'};render();setTimeout(()=>speakVar(EAR[S.lang][i].items[ET.cur][0]),300)}
function earAns(i){ET.ans=i;hit(i===ET.cur,1);if(i===ET.cur)ET.ok++;render()}
function earNext(){ET.i++;ET.ans=null;const set=EAR[S.lang][ET.set];
  if(ET.i>=ET.n){const h=S.ear[S.lang][set.id]||[];h.push(Math.round(ET.ok/ET.n*100));S.ear[S.lang][set.id]=h.slice(-20);logT().ear=1;bonus(10);render();return}
  ET.cur=Math.floor(Math.random()*set.items.length);render();setTimeout(()=>speakVar(set.items[ET.cur][0]),250)}

// ===================== conversation missions (AI roleplay) =====================
let CH=null;
function readingSpec(){return S.lang==='en'?'leave this as an empty string':S.lang==='ko'?'Japanese katakana reading':EN()?'English-style pronunciation respelling with stressed syllable in CAPS':'Japanese katakana reading'}
function explLang(){return EN()?'English':'Japanese'}
function rolePrompt(sc){
  const known=knownWords().slice(-150);
  const goals=(EN()&&sc.goalsEn?sc.goalsEn:sc.goals).map((g,i)=>i+': '+g).join('; ');
  return `You are a warm, patient ${LN()} conversation partner for ${S.lang==='en'?'a learner at level '+enLv()+'/10 ['+EL[enLv()].ai+']':'a BEGINNER learner'} (native Japanese speaker${S.lang==='fr'?', fluent in English':''}).
Scenario: ${sc.desc} You play: ${sc.role}.
Learner's mission goals (numbered): ${goals}.
RULES
- "reply": ${S.lang==='en'?'English only, pitched exactly at the learner level described above (at levels 9-10 be idiomatic and intellectually demanding); at most '+(enLv()<4?2:enLv()<8?3:4)+' sentences; ask ONE question':S.lang==='ko'?'Korean only, polite 해요-style; at most 2 short sentences (about 12 words total); ask ONE simple question':'French only, simple and natural; at most 2 short sentences (about 12 words total); ask ONE simple question'} that moves the learner toward an unmet goal.
${S.lang==='en'?'':'- Learner level: knows about '+knownWords().length+' words.'}${S.lang!=='en'&&knownWords().length<60?' ABSOLUTE BEGINNER: reply with ONE very short sentence (max 5 words), only the most basic words, and always give 3 suggestions.':''}
- Prefer words the learner knows: ${known.join(', ')||'(very few yet)'}.
- If the learner wrote in Japanese or English, they don't know how to say it: put the ${LN()} sentence they could say in "help" and gently continue.
- Feedback on the learner's LAST message (skip on the first turn): if there is a real error (grammar, wrong word, unnatural), set has_error true, write a short "hint" in ${explLang()} that helps them self-correct WITHOUT giving the answer (e.g. point to which part / which particle / verb form), and put the corrected sentence in "correct" with its reading and a one-line "why" in ${explLang()}. Ignore spacing, punctuation and missing accents. If it is fine or nearly fine, has_error false and a very short praise in ${explLang()}.
- "goals_done": numbers of ALL goals the learner has achieved so far in the whole conversation.
- "suggestions": 2 short things the learner could say next, in the target language.
Return ONLY JSON:
{"reply":"","reply_reading":"(${readingSpec()})","reply_translation":"(${explLang()})","feedback":{"has_error":false,"praise":"","hint":"","correct":"","correct_reading":"","why":""},"help":null,"goals_done":[],"suggestions":[{"t":"","r":"(${readingSpec()})","m":"(${explLang()})"}]}
"help", when used: {"t":"","r":"","m":""}.`;
}
function chatMessages(){
  const msgs=[{role:'user',content:rolePrompt(CH.sc)+'\n\nStart the conversation now with your first line (no feedback yet).'}];
  CH.turns.forEach(t=>{if(t.who==='ai')msgs.push({role:'assistant',content:JSON.stringify(t.raw)});else msgs.push({role:'user',content:'Learner: '+t.text})});
  return msgs;
}
async function aiTurn(){
  CH.busy=true;CH.err='';render();
  try{
    const res=await askAI(chatMessages());
    if(!res||!res.reply)throw {code:'parse'};
    const fb=res.feedback||{};
    const lastU=[...CH.turns].reverse().find(t=>t.who==='me');
    if(lastU&&CH.turns.length>1){lastU.fb=fb;lastU.help=res.help}
    CH.turns.push({who:'ai',raw:res});
    (res.goals_done||[]).forEach(g=>{if(typeof g==='number')CH.goals[g]=true});
    const gl=(CH.sc.goals||[]).length;
    if(gl&&Object.keys(CH.goals).filter(k=>CH.goals[k]).length>=gl&&!S.mission[S.lang][CH.sc.id]){S.mission[S.lang][CH.sc.id]=today();CH.complete=true;bonus(30)}
    logT().talk=1;addXP(5);save();
    speak(res.reply);
  }catch(e){CH.err=aiErr(e)}
  CH.busy=false;render();
  const el=document.getElementById('chatend');if(el)el.scrollIntoView({block:'end'});
}
function chatKb(){const e=$('#cin');CH.kbOn=!CH.kbOn;CH.pre=e?e.value:'';CH.kb=[];render();const e2=$('#cin');if(e2)e2.value=CH.pre}
function chatKey(k){const e=$('#cin');if(!e)return;if(e.value!==(CH.pre||'')+hCompose(CH.kb||[])){CH.pre=e.value;CH.kb=[]}
  if(k==='BS'){if(CH.kb.length)CH.kb.pop();else CH.pre=CH.pre.slice(0,-1)}else CH.kb.push(k);e.value=CH.pre+hCompose(CH.kb)}
function startChat(i){stop();CH={sc:SCEN[S.lang][i],idx:i,turns:[],goals:{},busy:false,err:'',showTr:false};view={v:'chat'};render();if(AI)aiTurn()}
function sendChat(text){
  const e=$('#cin');text=(text!=null?text:(e?e.value:'')).trim();if(!text||CH.busy)return;
  if(dictOn&&DICT)DICT.stop().catch(()=>{});
  CH.turns.push({who:'me',text});CH.kb=[];CH.pre='';render();aiTurn();
}
function chatView(){
  const scen=SCEN[S.lang];
  if(!CH){
    return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>💬 会話ミッション</h1>
    <div class="tip">場面ごとの目標を全部達成したらクリアです。言い方が分からないときは<b>日本語${S.lang==='fr'?'か英語':''}で書いてOK</b>。言い方を教えてくれます。間違えると、まずヒントが出ます。自分で言い直すほうが身につきます。</div>
    ${AIstate==='off'?`<div class="card small">この画面ではAIを呼び出せません（Claudeアプリ内で開くと使えます）。代わりに、各場面の決まり文句を「言う練習」で覚えられます。</div>`:''}
    ${scen.map((s,i)=>`<div class="setb"><b>${s.icon} ${esc(tr(s.title,s.titleEn))} ${S.mission[S.lang][s.id]?'✅':''}</b>
      <span class="small">目標：${esc((EN()&&s.goalsEn?s.goalsEn:s.goals).join(' / '))}</span>
      <div class="tools">${AIstate!=='off'?`<button class="ghost" onclick="startChat(${i})">AIと話す</button>`:''}${s.drill.length?`<button class="ghost" onclick="startDrill(SCEN[S.lang][${i}].drill.map(t=>L().byT[t]).filter(Boolean))">言う練習（AIなし）</button>`:''}</div></div>`).join('')}
    <div class="small" style="margin-top:8px">${DICT?'🎤 で声で入力できます。':'スマホでは、キーボードのマイクで声入力できます（'+L().name+'のキーボードを追加すると精度が上がります）。'}</div>`;
  }
  const sc=CH.sc,goals=EN()&&sc.goalsEn?sc.goalsEn:sc.goals;
  const turns=CH.turns.map((t,ti)=>{
    if(t.who==='ai'){const r=t.raw;return `<div class="bub ai"><div class="bt">${esc(r.reply)} <button class="spk s" data-t="${esc(r.reply)}" onclick="speak(this.dataset.t)">🔊</button></div>
      <div class="br">${esc(r.reply_reading||'')}</div>${CH.showTr?`<div class="bm">${esc(r.reply_translation||'')}</div>`:''}
      <button class="lnk" onclick="addCustom(${esc(JSON.stringify(r.reply))},${esc(JSON.stringify(r.reply_reading||''))},${esc(JSON.stringify(r.reply_translation||''))})">＋復習に追加</button></div>`}
    const fb=t.fb;let fbh='';
    if(fb){if(fb.has_error){fbh=`<div class="fb err"><b>💡 ヒント：</b>${esc(fb.hint||'')}
      <div class="fbr" id="fbr${ti}" style="display:none"><b>${esc(fb.correct||'')}</b> <button class="spk s" data-t="${esc(fb.correct||'')}" onclick="speak(this.dataset.t)">🔊</button><div class="small">${esc(fb.correct_reading||'')}</div><div class="small">${esc(fb.why||'')}</div>
      <button class="lnk" onclick="addCustom(${esc(JSON.stringify(fb.correct||''))},${esc(JSON.stringify(fb.correct_reading||''))},${esc(JSON.stringify(fb.why||''))})">＋復習に追加</button></div>
      <div class="tools"><button class="ghost s" onclick="const e=document.getElementById('cin');e.value=${esc(JSON.stringify(t.text))};e.focus()">自分で言い直す</button><button class="ghost s" onclick="document.getElementById('fbr${ti}').style.display='block';this.remove()">正解を見る</button></div></div>`}
      else if(fb.praise)fbh=`<div class="fb ok">👍 ${esc(fb.praise)}</div>`}
    const hp=t.help&&t.help.t?`<div class="fb help">📝 こう言えます：<b>${esc(t.help.t)}</b> <button class="spk s" data-t="${esc(t.help.t)}" onclick="speak(this.dataset.t)">🔊</button><div class="small">${esc(t.help.r||'')}　${esc(t.help.m||'')}</div>
      <div class="tools"><button class="ghost s" onclick="const e=document.getElementById('cin');e.value=${esc(JSON.stringify(t.help.t))};e.focus()">これを使う</button><button class="lnk" onclick="addCustom(${esc(JSON.stringify(t.help.t))},${esc(JSON.stringify(t.help.r||''))},${esc(JSON.stringify(t.help.m||''))})">＋復習に追加</button></div></div>`:'';
    return `<div class="bub me">${esc(t.text)}</div>${fbh}${hp}`;
  }).join('');
  const lastAi=[...CH.turns].reverse().find(t=>t.who==='ai');
  const sugg=lastAi&&lastAi.raw.suggestions&&!CH.busy?`<div class="sugg">${lastAi.raw.suggestions.slice(0,3).map(s=>`<button onclick="const e=document.getElementById('cin');e.value=${esc(JSON.stringify(s.t||''))};e.focus()"><b>${esc(s.t||'')}</b><span>${esc(s.m||'')}</span></button>`).join('')}</div>`:'';
  return `<div class="top"><button class="back" onclick="CH=null;stop();render()">‹ ミッション一覧</button><button class="lnk" onclick="CH.showTr=!CH.showTr;render()">${CH.showTr?'訳を隠す':'訳を表示'}</button></div>
  <h1 style="font-size:17px">${sc.icon} ${esc(tr(sc.title,sc.titleEn))}</h1>
  <div class="goals">${goals.map((g,i)=>`<span class="${CH.goals[i]?'gd':''}">${CH.goals[i]?'✅':'⬜'} ${esc(g)}</span>`).join('')}</div>
  ${CH.complete?`<div class="tip">🎉 ミッション達成！「できるようになったこと」に追加しました。このまま続けてもOKです。</div>`:''}
  <div class="chat">${turns}${CH.busy?'<div class="bub ai typing">…</div>':''}${CH.err?`<div class="fb err">${esc(CH.err)} <button class="lnk" onclick="aiTurn()">再試行</button></div>`:''}<div id="chatend"></div></div>
  ${sugg}
  <div class="inrow sticky"><input id="cin" class="inp" placeholder="${L().name}で入力（分からなければ日本語${S.lang==='fr'?'/英語':''}）" onkeydown="if(event.key==='Enter'&&!event.isComposing)sendChat()">${S.lang==='ko'?`<button class="mic ${CH.kbOn?'on':''}" onclick="chatKb()">한</button>`:''}${micBtn('cin')}<button class="send" onclick="sendChat()" ${CH.busy?'disabled':''}>送信</button></div>
  ${CH.kbOn?kbHtml('chatKey'):(S.lang==='ko'?'<div class="small">「한」を押すと、アプリ内のハングルキーボードが出ます。</div>':'')}`;
}

// ===================== 1-minute speech ×3 (4/3/2 adapted) =====================
let SP=null;
const SPT=[60,45,30];
function speechView(){
  if(!SP){const tp=TOPICS[S.lang];
    return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>⏱ 1分スピーチ ×3</h1>
    <div class="tip">同じテーマを、<b>60秒→45秒→30秒</b>と時間を縮めながら3回、声に出して話します。2回目以降は同じ内容をもっとなめらかに言うのが目的です。完璧でなくてOK。知っている言葉だけで話してください。</div>
    ${tp.map((t,i)=>`<button class="setb" onclick="SP={topic:${i},round:0,left:0,notes:'',fb:null};render()"><b>${esc(t)}</b></button>`).join('')}`}
  const topic=TOPICS[S.lang][SP.topic];
  if(SP.round>=3)return `<div class="top"><button class="back" onclick="SP=null;go('speech')">‹ テーマ一覧</button></div><h1>🎉 3回完了！</h1>
    <div class="card small">同じ話をくり返して時間を縮めると、言葉を探す時間が減り、なめらかに話せるようになります。明日もう一度同じテーマでやると、さらに効果的です。</div>
    ${SP.fb?speechFb():''}<button class="big-btn" onclick="SP=null;go('home')">ホームへ</button>`;
  const r=SP.round;
  return `<div class="top"><button class="back" onclick="stop();SP=null;render()">‹ やめる</button><span class="small">${r+1}回目 / 3</span></div>
  <h1 style="font-size:18px">${esc(topic)}</h1>
  <div class="card qbig"><div class="timer ${SP.timer?'run':''}">${SP.timer?SP.left:SPT[r]}<span>秒</span></div>
  ${SP.timer?'<div class="small">🗣 声に出して話し続けよう！</div>':`<button class="big-btn" onclick="startRound()">${r+1}回目スタート（${SPT[r]}秒）</button>`}</div>
  ${r===0&&!SP.timer?`<div class="card small"><b style="color:var(--ink)">準備（30秒ほど）</b>：言いたいことを3つ、${L().name}か日本語でメモしてもOK。<br>例：名前・出身・好きなもの</div>`:''}
  ${!SP.timer&&r>0?`<div class="card"><b>言えなかったことは？</b><div class="small" style="margin:4px 0 6px">話した内容や、言えなかったことを書く（日本語でもOK）。AIが見本と直しをくれます。</div>
    <div class="inrow"><input id="spn" class="inp" value="${esc(SP.notes)}" placeholder="例：私は会社員です、映画が好き…">${micBtn('spn')}</div>
    ${AI?`<button class="ghost wide" onclick="speechAI()" ${SP.busy?'disabled':''}>${SP.busy?'作成中…':'🤖 見本と直しをもらう'}</button>`:'<div class="small">（AIが使えない環境です。下の見本フレーズ集を参考に）</div>'}
    ${SP.err?`<div class="small" style="color:var(--bad)">${esc(SP.err)}</div>`:''}</div>${SP.fb?speechFb():''}`:''}`;
}
function startRound(){
  stop();SP.left=SPT[SP.round];
  SP.timer=setInterval(()=>{SP.left--;if(SP.left<=0){clearInterval(SP.timer);SP.timer=null;SP.round++;if(SP.round>=3){logT().speech=1;bonus(20)}try{navigator.vibrate&&navigator.vibrate(200)}catch(e){}toast('時間です！');}render()},1000);
  render();
}
async function speechAI(){
  const e=$('#spn');SP.notes=e?e.value:SP.notes;SP.busy=true;SP.err='';render();
  const prompt=`A ${S.lang==='en'?'level '+enLv()+'/10 ['+EL[enLv()].ai+']':'BEGINNER'} learner of ${LN()} (native Japanese${S.lang==='fr'?', fluent English':''}) is doing a 1-minute talk on: "${TOPICS[S.lang][SP.topic]}". What they said or wanted to say (may be in Japanese/English/target language): "${SP.notes||'(nothing written)'}".
Known words: ${knownWords().slice(-120).join(', ')}.
Return ONLY JSON: {"model":[{"t":"target-language sentence","r":"${readingSpec()}","m":"${explLang()} meaning"}],"corrections":[{"wrong":"","right":"","why":"${explLang()}"}],"tip":"one short tip in ${explLang()}"}
"model": 5-7 ${S.lang==='en'?'sentences at the learner level':'very short, beginner-level sentences'} that express the learner's own content naturally. "corrections": only for target-language sentences they wrote that contain errors (max 3).`;
  try{SP.fb=await askAI(prompt)}catch(err){SP.err=aiErr(err)}
  SP.busy=false;render();
}
function speechFb(){const f=SP.fb||{};
  return `<div class="card"><b>🤖 見本</b>${(f.model||[]).map(m=>`<div class="exl"><button class="spk s" data-t="${esc(m.t)}" onclick="speak(this.dataset.t)">🔊</button><div><b>${esc(m.t)}</b><div class="r2">${esc(m.r)}</div><div class="m">${esc(m.m)}</div>
  <button class="lnk" onclick="addCustom(${esc(JSON.stringify(m.t))},${esc(JSON.stringify(m.r||''))},${esc(JSON.stringify(m.m||''))})">＋復習に追加</button></div></div>`).join('')}
  ${(f.corrections||[]).length?`<div class="exh">直し</div>${f.corrections.map(c=>`<div class="note" style="margin-top:4px">✗ ${esc(c.wrong)}<br>✓ <b>${esc(c.right)}</b><br><span class="small">${esc(c.why)}</span></div>`).join('')}`:''}
  ${f.tip?`<div class="exh">ヒント</div><div class="note">${esc(f.tip)}</div>`:''}</div>`}

// ===================== easy story (AI comprehensible input) =====================
let ST=null;
function storyView(){
  if(!ST){
    return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>📖 やさしい物語</h1>
    <div class="tip">あなたが覚えた言葉を中心に、新しい言葉は少しだけ入った短い話をAIが作ります。まず文字を見ずに聞き、内容の質問に答えてから文字で確認します。</div>
    ${AIstate==='off'?`<div class="card small">この画面ではAIを呼び出せません。代わりにホームの「ネイティブ音声」のリンクから、やさしい動画を聞いてください。</div>`:
    STORY_TOPICS[S.lang].map((t,i)=>`<button class="setb" onclick="makeStory(${i})"><b>${esc(t)}</b></button>`).join('')}`;
  }
  if(ST.busy)return `<div class="top"><button class="back" onclick="ST=null;render()">‹ 戻る</button></div><div class="card qbig">📝 物語を作っています…</div>`;
  if(ST.err)return `<div class="top"><button class="back" onclick="ST=null;render()">‹ 戻る</button></div><div class="card">${esc(ST.err)}</div><button class="big-btn" onclick="makeStory(ST.topic)">もう一度</button>`;
  const s=ST.data,lines=s.lines||[];
  return `<div class="top"><button class="back" onclick="stop();ST=null;render()">‹ 戻る</button><button class="lnk" onclick="ST.showText=!ST.showText;render()">${ST.showText?'文字を隠す':'文字を見る'}</button></div>
  <h1 style="font-size:18px">${esc(s.title||'')}</h1>
  <div class="tools"><button class="ghost" onclick="playAll(ST.data.lines)">${playing?'⏹ 停止':'▶ 全部聞く'}</button><button class="ghost" onclick="S.slow=!S.slow;save();render()">${S.slow?'🐢 ゆっくり':'🐇 ふつう'}</button></div>
  ${ST.showText?lines.map(l=>`<div class="item"><div class="tx"><div class="t" style="font-size:18px">${esc(l.t)}</div><div class="r">${esc(l.r)}</div><div class="m">${esc(l.m)}</div></div><button class="spk" data-t="${esc(l.t)}" onclick="speak(this.dataset.t)">🔊</button></div>`).join(''):
   `<div class="card small">まずは文字を見ずに2回聞いてみよう。分からない部分があっても止めずに、全体の流れをつかむのがコツです。</div>`}
  ${(s.questions||[]).length?`<h2>内容の質問</h2>${s.questions.map((q,qi)=>`<div class="card"><b>${esc(q.q)}</b><div class="opts">${(q.options||[]).map((o,oi)=>{const a=ST.ans[qi];return `<button class="opt ${a!=null?(oi===q.answer?'ok':(oi===a?'ng':'')):''}" ${a!=null?'disabled':''} onclick="ST.ans[${qi}]=${oi};storyCheck();render()">${esc(o)}</button>`}).join('')}</div></div>`).join('')}`:''}
  ${(s.new_words||[]).length?`<h2>新しい言葉</h2>${s.new_words.map(w=>`<div class="item"><div class="tx"><div class="t" style="font-size:18px">${esc(w.t)}</div><div class="r">${esc(w.r)}</div><div class="m">${esc(w.m)}</div></div><button class="ghost s" onclick="addCustom(${esc(JSON.stringify(w.t))},${esc(JSON.stringify(w.r||''))},${esc(JSON.stringify(w.m||''))})">＋復習</button></div>`).join('')}`:''}
  <button class="big-btn" onclick="makeStory(ST.topic)">同じテーマで別の話（くり返し聞くと効果的）</button>`;
}
function storyCheck(){const q=ST.data.questions||[];if(q.length&&q.every((_,i)=>ST.ans[i]!=null)){logT().story=1;bonus(15)}}
async function makeStory(i){
  stop();ST={topic:i,busy:true,ans:{},showText:false};render();
  const prompt=`Write a very easy story in ${S.lang==='ko'?'Korean (polite 해요 style)':'French'} for a BEGINNER (native Japanese${S.lang==='fr'?', fluent English':''}). Topic: ${STORY_TOPICS[S.lang][i]}.
Use mostly these words the learner already knows: ${knownWords().slice(-200).join(', ')||'basic greetings and very common words'}. Introduce at most 3 new words. 6-8 short sentences (max 10 words each), present a tiny event with a small surprise.
Return ONLY JSON: {"title":"","lines":[{"t":"sentence","r":"${readingSpec()}","m":"${explLang()} translation"}],"new_words":[{"t":"","r":"","m":""}],"questions":[{"q":"question in ${explLang()}","options":["","","",""],"answer":0}]}
Give 2-3 comprehension questions (answer = index of the correct option, vary the position).`;
  try{const d=await askAI(prompt);if(!d||!d.lines)throw {code:'parse'};ST={topic:i,data:d,ans:{},showText:false};setTimeout(()=>playAll(d.lines),300)}
  catch(e){ST={topic:i,err:aiErr(e)}}
  render();
}

// ===================== shadowing =====================
let SH=null;
function shadowItems(n){
  const days=L().days.filter(d=>d.items);
  if(n)return L().days[n-1].items.filter(x=>x.kind!=='char');
  const doneDays=days.filter(d=>S.done[S.lang][d.n]);
  const pickD=doneDays.length?doneDays.slice(-2):[L().days[nextDay()-1]].filter(d=>d.items);
  return (pickD.length?pickD:[days[0]]).flatMap(d=>d.items).filter(x=>x.kind!=='char').slice(-12);
}
function startShadow(n,items){stop();SH={items:items||shadowItems(n),i:0,rep:0,phase:'listen',run:true};view={v:'shadow'};render();window.scrollTo(0,0);setTimeout(shStep,300)}
function shStep(){
  if(!SH||!SH.run)return;
  if(SH.i>=SH.items.length){SH.run=false;logT().shadow=1;bonus(10);render();return}
  const it=SH.items[SH.i];SH.phase='listen';render();
  speak(it.t,()=>{
    if(!SH||!SH.run)return;SH.phase='say';render();
    const gap=Math.max(1800,it.t.length*260)*(S.slow?1.4:1);
    SH.timer=setTimeout(()=>{if(SH.rep<1){SH.rep++}else{SH.rep=0;SH.i++}shStep()},gap);
  });
}
function shadowView(){
  if(!SH.run&&SH.i>=SH.items.length)return `<div class="top"><button class="back" onclick="go('home')">‹ ホーム</button></div>
    <h1>シャドーイング完了！</h1><div class="card small">${SH.items.length}フレーズを2回ずつ真似しました。抑揚とリズムが自然になっていきます。</div>
    <button class="big-btn" onclick="startShadow(null,SH.items)">もう一周</button><button class="ghost wide" onclick="go('home')">ホームへ</button>`;
  const it=SH.items[Math.min(SH.i,SH.items.length-1)];
  return `<div class="top"><button class="back" onclick="go('home')">‹ やめる</button><span class="small">シャドーイング ${SH.i+1} / ${SH.items.length}（${SH.rep+1}回目）</span></div>
  <div class="bar"><i style="width:${SH.i/SH.items.length*100}%"></i></div>
  <div class="card qbig">
    <div class="phase ${SH.phase}">${SH.phase==='listen'?'🔊 聞いて':'🗣 今、声に出して真似！'}</div>
    <div class="reveal" style="font-size:28px">${esc(it.t)}<span class="r">${esc(R(it))}</span></div>
    <div class="small" style="margin-top:4px">${esc(M(it))}</div>
  </div>
  <div class="tip">コツ：意味は考えず、音・リズム・抑揚をそっくり真似します。小声でもOK。</div>
  <div class="tools"><button class="ghost" onclick="if(SH.run){stop();render()}else{SH.run=true;shStep()}">${SH.run?'⏸ 一時停止':'▶ 再開'}</button>
  <button class="ghost" onclick="stop();SH.rep=0;SH.i++;SH.run=true;shStep()">次へ ›</button>
  <button class="ghost" onclick="S.slow=!S.slow;save();render()">${S.slow?'🐢 ゆっくり':'🐇 ふつう'}</button></div>`;
}

// ===================== science & backup =====================
function scienceView(){
  return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>🔬 なぜこの方法？</h1>
  <div class="tip">「ただ勉強する」だけでは話せるようになりません。このアプリは、記憶と第二言語習得の研究で効果が確かめられた方法を組み合わせています。</div>
  ${SCIENCE.map(s=>`<div class="card"><b>${s[0]} ${esc(s[1])}</b><div class="small" style="margin-top:6px;color:var(--ink)">${esc(s[2])}</div><div class="note" style="margin-top:8px">→ ${esc(s[3])}</div></div>`).join('')}
  <div class="small" style="margin-top:12px">効果の大きさ（g や d）は研究全体の平均で、個人差があります。</div>`;
}
function backupView(){
  return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>💾 バックアップ</h1>
  <div class="card small"><b style="color:var(--ink)">コピーする</b>：下のボタンで学習記録をコピーし、メモアプリなどに貼り付けて保存します。<button class="big-btn" onclick="copyBackup()">学習記録をコピー</button></div>
  <div class="card small"><b style="color:var(--ink)">復元する／別の端末へ移す</b>：コピーした文字をここに貼り付けて「復元」を押します（今の記録は置き換わります）。
  <textarea id="bk" class="inp" style="height:90px;margin-top:6px"></textarea><button class="ghost wide" onclick="restoreBackup()">復元</button></div>`;
}
function copyBackup(){try{navigator.clipboard.writeText(JSON.stringify(S)).then(()=>toast('コピーしました'),()=>toast('コピーできませんでした'))}catch(e){toast('コピーできませんでした')}}
function restoreBackup(){const v=($('#bk')||{}).value;try{const o=JSON.parse(v);if(!o||!o.cards)throw 0;S=JSON.parse(JSON.stringify(DEF));loadState(o);save();toast('復元しました');go('home')}catch(e){toast('形式が正しくありません')}}

// ===================== 楽しさ・成長の実感 =====================
var COMBO=0,COMBOMAX=0,SXP=0,CELQ=[],AC=null;
const GOAL=50;
const rankOf=xp=>Math.floor((Math.sqrt(1+xp/5)-1)/2)+1;
const rankFloor=r=>20*(r-1)*r;
const myXp=()=>S.xp[S.lang]||0;
function fx(kind){if(S.mute)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;
  const notes=kind==='ok'?[[660,0],[880,.07]]:kind==='ng'?[[196,0]]:[[523,0],[659,.1],[784,.2],[1047,.32]];
  notes.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=kind==='ng'?'triangle':'sine';o.frequency.value=f;g.gain.setValueAtTime(kind==='ng'?.06:.11,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.2);o.connect(g);g.connect(AC.destination);o.start(t+d);o.stop(t+d+.22)});
  if(kind!=='ng'&&navigator.vibrate)navigator.vibrate(kind==='up'?[40,40,80]:15)}catch(e){}}
// お祝いは練習の途中では出さず、区切り（終了時）にまとめて1回だけ出す
function celebrate(icon,title,sub){if(title==='ランクアップ！')CELQ=CELQ.filter(c=>c[1]!==title);CELQ.push([icon,title,sub])}
function celShow(){try{let o=document.getElementById('cel');if(!o||!o.classList){o=document.createElement('div');o.id='cel';document.body.appendChild(o)}
  if(!CELQ.length){o.className='';o.innerHTML='';return}
  const q=CELQ;CELQ=[];const cols=['#d9534f','#2b5fb8','#2e8b57','#d68910','#8e44ad'];
  o.innerHTML=`<div class="conf">${Array.from({length:28},(_,i)=>`<i style="left:${Math.random()*100}%;background:${cols[i%5]};animation-delay:${Math.random()*.6}s;animation-duration:${1.6+Math.random()*1.2}s"></i>`).join('')}</div>
    <div class="celbox"><div class="celi">${q[q.length>1&&q[0][0]==='⭐'?1:0][0]}</div>${q.map(c=>`<div class="celr"><b>${c[0]} ${c[1]}</b><div class="small">${c[2]||''}</div></div>`).join('')}
    <button class="big-btn" onclick="celShow()">やった！</button></div>`;
  o.className='show';fx('up')}catch(e){CELQ=[]}}
function addXP(n){
  if(!n)return;const before=rankOf(myXp());S.xp[S.lang]=myXp()+n;SXP+=n;const l=logT();l.xp=(l.xp||0)+n;
  const after=rankOf(myXp());if(after>before)celebrate('⭐','ランクアップ！','ランク '+after+' になりました');
  if(l.xp>=GOAL&&!l.goal){l.goal=1;celebrate('🎯','今日の目標達成！','今日は '+GOAL+' XP をクリアしました')}
}
// 1問ごとの手ごたえ：音・連続正解・XP
function hit(ok,xp){
  if(ok){COMBO++;COMBOMAX=Math.max(COMBOMAX,COMBO);addXP(xp+(COMBO>0&&COMBO%5===0?2:0));fx('ok');if(COMBO===5||COMBO===10||COMBO===20)toast('🔥 '+COMBO+'問連続！')}
  else{COMBO=0;fx('ng')}
}
function snap(){try{S.hist[S.lang][today()]={w:wordsKnown(),c:S.lang==='ko'?charsRead():0,xp:myXp(),s:speakable()}}catch(e){}}
function bonus(n,msg){addXP(n);snap();checkBadges();save();celShow()}
const BADGES=[
 ['first','👣','最初の一歩','はじめて練習を終える',()=>myXp()>0],
 ['h20','🔤','ハングル半分','文字を20個読める',()=>S.lang==='ko'&&charsRead()>=20,'ko'],
 ['hall','🎓','ハングル読破','ハングルの10ステップを完了',()=>S.lang==='ko'&&[1,2,3,4,5,6,7,8,9,10].every(n=>S.done.ko[n]),'ko'],
 ['w10','🌱','言葉 10','言葉を10個覚える',()=>wordsKnown()>=10],
 ['w50','🌿','言葉 50','言葉を50個覚える',()=>wordsKnown()>=50],
 ['w100','🌳','言葉 100','言葉を100個覚える',()=>wordsKnown()>=100],
 ['w300','🏞️','言葉 300','言葉を300個覚える',()=>wordsKnown()>=300],
 ['say10','🗣','言える 10','10個のフレーズを自分で言える',()=>speakable()>=10],
 ['say50','🎤','言える 50','50個のフレーズを自分で言える',()=>speakable()>=50],
 ['c10','🔥','10問連続','10問連続で正解する',()=>COMBOMAX>=10],
 ['s3','📅','3日連続','3日続けて練習する',()=>streak()>=3],
 ['s7','🗓️','7日連続','7日続けて練習する',()=>streak()>=7],
 ['s30','🏅','30日連続','30日続けて練習する',()=>streak()>=30],
 ['m1','💬','初ミッション','会話ミッションを1つ達成',()=>Object.keys(S.mission[S.lang]).length>=1],
 ['mall','🏆','全ミッション','会話ミッションをすべて達成',()=>Object.keys(S.mission[S.lang]).length>=SCEN[S.lang].length],
 ['r1','📖','初長文','長文を1本読み切る',()=>S.lang==='en'&&Object.keys(S.enRead).length>=1,'en'],
 ['r10','📚','長文 10本','長文を10本読み切る',()=>S.lang==='en'&&Object.keys(S.enRead).length>=10,'en'],
 ['l5','🎧','耳が育つ','リスニングで80%以上を5回',()=>S.lang==='en'&&Object.values(S.enLis).filter(v=>v>=80).length>=5,'en'],
 ['up','🚀','レベルアップ','英語のレベルを1つ上げる',()=>S.lang==='en'&&!!S.enUp,'en']
];
function checkBadges(){const b=S.badges[S.lang];BADGES.forEach(x=>{try{if(!b[x[0]]&&x[4]()){b[x[0]]=today();celebrate(x[1],'バッジ獲得：'+x[2],x[3])}}catch(e){}})}
function weekGain(){const h=S.hist[S.lang],lim=addDays(-7);const ks=Object.keys(h).filter(k=>k<=lim).sort();const old=ks.length?h[ks[ks.length-1]]:(Object.keys(h).length?{w:0,c:0,s:0}:null);
  if(!old)return null;return {w:wordsKnown()-(old.w||0),c:(S.lang==='ko'?charsRead():0)-(old.c||0),s:speakable()-(old.s||0)}}
function xpCard(){
  const xp=myXp(),r=rankOf(xp),a=rankFloor(r),b=rankFloor(r+1),t=logT().xp||0,g=weekGain();
  const gain=g&&(g.w>0||g.c>0||g.s>0)?`<div class="gain">この1週間で ${[g.c>0?'文字 +'+g.c:'',g.w>0?'言葉 +'+g.w:'',g.s>0?'言える +'+g.s:''].filter(Boolean).join('・')}</div>`:'';
  return `<button class="xpc" onclick="go('grow')"><div class="xr"><span class="lvb">ランク ${r}</span><span class="xpbar"><i style="width:${(xp-a)/(b-a)*100}%"></i></span><span class="small">あと ${b-xp} XP</span></div>
    <div class="xr"><span class="small">今日 ${Math.min(t,999)} / ${GOAL} XP ${t>=GOAL?'🎯':''}</span><span class="xpbar day"><i style="width:${Math.min(100,t/GOAL*100)}%"></i></span><span class="small">成長を見る ›</span></div>${gain}</button>`;
}
function xpSummary(){const xp=myXp(),r=rankOf(xp),a=rankFloor(r),b=rankFloor(r+1);
  return `<div class="xpgain">+${SXP} XP${COMBOMAX>=3?'　🔥 最大'+COMBOMAX+'問連続':''}</div><div class="xr" style="margin-top:8px"><span class="lvb">ランク ${r}</span><span class="xpbar"><i style="width:${(xp-a)/(b-a)*100}%"></i></span><span class="small">あと ${b-xp}</span></div>`}
function growView(){
  const days=[];for(let i=13;i>=0;i--){const d=addDays(-i);days.push([d,(S.log[S.lang][d]||{}).xp||0])}
  const mx=Math.max(GOAL,...days.map(d=>d[1]));const b=S.badges[S.lang];
  const hs=Object.keys(S.hist[S.lang]).sort().slice(-14).map(k=>[k,S.hist[S.lang][k].w||0]);const hm=Math.max(1,...hs.map(h=>h[1]));
  const list=BADGES.filter(x=>!x[5]||x[5]===S.lang);
  return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>📈 成長の記録（${L().name}）</h1>
  ${xpCard().replace('成長を見る ›','')}
  <div class="stats"><div><b>${streak()}</b><span>連続日数</span></div>${S.lang==='ko'?`<div><b>${charsRead()}</b><span>読める文字</span></div>`:`<div><b>${mastered()}</b><span>定着</span></div>`}<div><b>${wordsKnown()}</b><span>覚えた言葉</span></div><div><b>${speakable()}</b><span>言える</span></div></div>
  <div class="card"><b>この2週間の練習量</b><div class="chartb">${days.map(d=>`<div class="cb"><i class="${d[1]>=GOAL?'hit':''}" style="height:${Math.max(2,d[1]/mx*100)}%"></i><span>${+d[0].slice(8)}</span></div>`).join('')}</div><div class="small">濃い色は目標（${GOAL} XP）を達成した日です。</div></div>
  ${hs.length>1?`<div class="card"><b>覚えた言葉の数</b><div class="chartb">${hs.map(h=>`<div class="cb"><i class="hit" style="height:${Math.max(2,h[1]/hm*100)}%"></i><span>${h[1]}</span></div>`).join('')}</div><div class="small">練習した日ごとの記録です。</div></div>`:''}
  <div class="card"><b>バッジ（${list.filter(x=>b[x[0]]).length} / ${list.length}）</b><div class="bgrid">${list.map(x=>`<div class="bd ${b[x[0]]?'on':''}"><div class="bi">${b[x[0]]?x[1]:'🔒'}</div><b>${x[2]}</b><span>${x[3]}</span></div>`).join('')}</div></div>
  <div class="card small"><div class="wk"><b style="color:var(--ink)">効果音</b><div class="seg mini">${[[false,'あり'],[true,'なし']].map(([v,l])=>`<button class="${!!S.mute===v?'on':''}" onclick="S.mute=${v};save();render()">${l}</button>`).join('')}</div></div></div>`;
}
function enLevelUp(n){S.enLv=n;S.enUp=1;save();celebrate('🚀','レベル '+n+' へ！',EL[n].name+'（'+EL[n].guide+'）に進みます。');checkBadges();save();render();celShow()}
// ===================== 英語コース =====================
var PL=null,RD=null,LS=null,ENB={};
const enLv=()=>S.enLv||5;
function enReg(p){(p.vocab||[]).forEach(v=>{const D=DATA.en;if(!v||!v.t||D.byT[v.t])return;const it={t:v.t,r:'',m:v.m||'',n:p.lv,kind:/ /.test(v.t)?'sent':'word'};D.all.push(it);D.byT[v.t]=it})}
(S.enGen||[]).forEach(enReg);(S.enGenL||[]).forEach(enReg);
function langSeg(){return `<div class="seg">${[['ko','🇰🇷 韓国語'],['fr','🇫🇷 仏語'],['en','🇬🇧 英語']].map(([k,l])=>`<button class="${S.lang===k?'on':''}" onclick="setLang('${k}')">${l}</button>`).join('')}</div>`}
const enReads=()=>[...EN_R,...(S.enGen||[])].filter(p=>p.lv===S.enLv);
const enLists=()=>[...EN_L,...(S.enGenL||[])].filter(p=>p.lv===S.enLv);
function enHome(){
  if(!S.enLv)return `<h1>話せるようになる語学</h1>${langSeg()}
    <div class="card hero"><b>英語コース（レベル1〜10）</b><div class="small" style="margin:6px 0">まずレベルを合わせましょう。20問・約3分の診断テストで、中学1年からTOEIC 990超までの10段階のどこから始めるかを決めます。</div>
    <button class="big-btn" onclick="plStart()">▶ レベル診断テストを受ける</button></div>${enLevelGrid()}`;
  const lv=S.enLv,e=EL[lv],lg=logT(),due=dueCards().length,reads=enReads(),lis=enLists();
  const rdone=reads.filter(p=>S.enRead[p.id]!=null).length;
  const ls=lis.filter(p=>S.enLis[p.id]!=null),lavg=ls.length?Math.round(ls.reduce((a,p)=>a+S.enLis[p.id],0)/ls.length):null;
  const up=lv<10&&rdone>=2&&ls.length>=2&&lavg>=80;
  const pn={2:'Part 2 応答問題',3:'Part 3 会話問題',4:'Part 4 説明文問題'};
  return `<h1>話せるようになる語学</h1>${langSeg()}
  <div class="card hero"><div class="wk"><b>レベル ${lv}：${e.name}</b><button class="lnk" onclick="PL=null;go('enplace')">変更</button></div><div class="small">目安：${e.guide}</div>
    ${due?`<button class="big-btn alt" onclick="startReview()">🔁 単語の復習 ${Math.min(due,40)}枚</button>`:''}
    ${up?`<div class="tip">このレベルの長文とリスニングができています。<button class="lnk" onclick="S.enLv=${lv+1};save();render()">レベル ${lv+1} に上げる ›</button></div>`:''}</div>
  <div class="stats"><div><b>${streak()}</b><span>連続日数</span></div><div><b>${wordsKnown()}</b><span>覚えた語句</span></div><div><b>${Object.keys(S.enRead).length}</b><span>読んだ長文</span></div><div><b>${lavg==null?'–':lavg+'%'}</b><span>リスニング</span></div></div>
  <div class="card"><b>📖 長文読解</b><div class="small">英文を読む → 分からない語句をタップ → 和訳で確認 → 復習に追加。</div>
    ${reads.map(p=>`<button class="urow ${S.enRead[p.id]!=null?'done':''}" style="width:100%;margin-top:6px" onclick="rdOpen('${p.id}')"><span class="un">${S.enRead[p.id]!=null?'✓':'読'}</span><span class="ut">${esc(p.title)}</span><span class="tag">${esc(p.type||'AI作成')}</span></button>`).join('')}
    ${AI?`<button class="ghost wide" onclick="enGenRead()" ${ENB.read?'disabled':''}>${ENB.read?'作成中…（20秒ほど）':'🤖 このレベルの新しい長文を作る'}</button>`:`<div class="small" style="margin-top:8px">AIが使える環境では、このレベルの新しい長文をいくつでも作れます。</div>`}
    ${ENB.err?`<div class="small" style="color:var(--bad)">${esc(ENB.err)}</div>`:''}</div>
  <div class="card"><b>🎧 リスニング（TOEIC形式）</b><div class="small">問題文は見えません。音声だけで答え、あとでスクリプトと和訳を確認します。</div>
    ${lis.map(p=>`<button class="urow ${S.enLis[p.id]!=null?'done':''}" style="width:100%;margin-top:6px" onclick="lsOpen('${p.id}')"><span class="un">${S.enLis[p.id]!=null?'✓':'聞'}</span><span class="ut">${pn[p.part]}${p.title?'：'+esc(p.title):''}</span>${S.enLis[p.id]!=null?`<span class="tag">${S.enLis[p.id]}%</span>`:''}</button>`).join('')}
    ${AI?`<div class="tools">${[2,3,4].map(n=>`<button class="ghost s" onclick="enGenLis(${n})" ${ENB.lis?'disabled':''}>🤖 Part ${n} を作る</button>`).join('')}</div>${ENB.lis?'<div class="small">作成中…</div>':''}`:''}
    <div class="small" style="margin-top:8px">Part 1（写真描写）は写真が必要なため、このアプリにはありません。</div></div>
  <div class="card"><b>💬 スピーキング</b>
    ${task('💬','会話ミッション','AIと場面ごとに英語で話す',0,!!lg.talk,`<button class="ghost" onclick="go('chat')">開く</button>`)}
    ${task('⏱','1分スピーチ ×3','同じ話を 60→45→30秒 で3回',0,!!lg.speech,`<button class="ghost" onclick="go('speech')">開く</button>`)}
    ${task('👂','耳トレ（r/l・b/v など）','日本人が混同しやすい音の聞き分け',0,!!lg.ear,`<button class="ghost" onclick="go('ear')">開く</button>`)}
    <div class="small" style="margin-top:6px">シャドーイングは、長文やリスニングを終えたあとの画面から、その英文でできます。</div></div>
  <div class="card"><b>🎧 生の英語を聞く</b>${RES.en.map(r=>`<a class="res" href="${r[1]}" target="_blank" rel="noopener">${esc(r[0])} ›</a>`).join('')}</div>
  <button class="sci" onclick="go('science')">🔬 なぜこの方法？（研究の根拠）</button>
  <button class="ghost wide" onclick="go('backup')">💾 バックアップ・別の端末へ移す</button>
  <div class="small" style="margin-top:14px">長文・問題はすべてこのアプリ用の書き下ろしで、学校の教科書やTOEIC公式問題そのものではありません。形式とレベルを合わせています。</div>`;
}
function enLevelGrid(){return `<h2>自分でレベルを選ぶ</h2><div class="path">${EL.slice(1).map((e,i)=>`<button class="urow ${S.enLv===i+1?'next':''}" onclick="S.enLv=${i+1};save();go('home')"><span class="un">${i+1}</span><span class="ut">${e.name}<span class="small">　${e.guide}</span></span></button>`).join('')}</div>`}
// ---- レベル診断 ----
function plStart(){PL={i:0,sc:{},ans:null,done:false};view={v:'enplace'};render();window.scrollTo(0,0)}
function plResult(){let prevFull=true;for(let l=1;l<=10;l++){const c=PL.sc[l];if(c===undefined)return l;const pass=c===2||(c===1&&prevFull);if(!pass)return l;prevFull=c===2}return 10}
function plAns(i){const q=EN_PLACE[PL.i];PL.ans=i;PL.sc[q[0]]=(PL.sc[q[0]]||0)+(i===q[3]?1:0);render()}
function plNext(){const q=EN_PLACE[PL.i];PL.i++;PL.ans=null;
  const lvDone=PL.i%2===0,l=q[0];
  if(PL.i>=EN_PLACE.length||(lvDone&&plResult()<=l))PL.done=true;
  render();window.scrollTo(0,0)}
function enPlaceView(){
  if(!PL)return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button></div><h1>レベルを決める</h1>
    <button class="big-btn" onclick="plStart()">▶ レベル診断テスト（約3分）</button>${enLevelGrid()}`;
  if(PL.done){const r=plResult(),e=EL[r];
    return `<div class="top"><button class="back" onclick="PL=null;go('home')">‹ 戻る</button></div><h1>診断結果</h1>
    <div class="card qbig"><div class="small">おすすめのスタート</div><div class="score">レベル ${r}</div><div class="pm">${e.name}</div><div class="small">目安：${e.guide}</div></div>
    <div class="small">いちばん下で引っかかったレベルから始めます。長文を読んでみて簡単すぎる・難しすぎると感じたら、ホームの「変更」でいつでも変えられます。</div>
    <button class="big-btn" onclick="S.enLv=${r};save();PL=null;go('home')">このレベルで始める</button>
    <div class="tools" style="justify-content:center">${r>1?`<button class="ghost" onclick="S.enLv=${r-1};save();PL=null;go('home')">1つ下（${r-1}）から</button>`:''}${r<10?`<button class="ghost" onclick="S.enLv=${r+1};save();PL=null;go('home')">1つ上（${r+1}）から</button>`:''}</div>`}
  const q=EN_PLACE[PL.i],a=PL.ans,an=a!==null;
  return `<div class="top"><button class="back" onclick="PL=null;go('home')">‹ やめる</button><span class="small">診断 ${PL.i+1} / ${EN_PLACE.length}</span></div>
  <div class="bar"><i style="width:${PL.i/EN_PLACE.length*100}%"></i></div>
  <div class="card qbig"><div class="small">空所に入る最も適切なものは？</div><div class="pm" style="font-size:19px">${esc(q[1])}</div></div>
  <div class="opts">${q[2].map((o,i)=>`<button class="opt ${an?(i===q[3]?'ok':(i===a?'ng':'')):''}" ${an?'disabled':''} onclick="plAns(${i})">${esc(o)}</button>`).join('')}
  ${an?'':`<button class="opt idk" onclick="plAns(-1)">わからない</button>`}</div>
  ${an?`<button class="big-btn" onclick="plNext()">次へ</button>`:''}`;
}
// ---- 長文読解 ----
function enFind(id){return [...EN_R,...(S.enGen||[]),...EN_L,...(S.enGenL||[])].find(p=>p.id===id)}
function rdOpen(id){stop();RD={p:enFind(id),showAll:false,open:{},sel:null,ans:{}};view={v:'enread'};render();window.scrollTo(0,0)}
function enStem(w){w=w.toLowerCase();return [w,w.replace(/ies$/,'y'),w.replace(/(es|ed|ing|ly)$/,''),w.replace(/[sdn]$/,''),w.replace(/(ed|ing)$/,'e'),w.replace(/(.)\1(ed|ing)$/,'$1'),w.replace(/ied$/,'y')]}
function enGloss(p,si,w){
  const st=enStem(w);const one=p.vocab.find(v=>!v.t.includes(' ')&&st.includes(v.t.toLowerCase()));if(one)return one;
  const toks=p.sents[si].e.toLowerCase().split(/[^a-z'’-]+/).flatMap(enStem);
  return p.vocab.find(v=>{if(!v.t.includes(' '))return false;const ws=v.t.toLowerCase().split(' ');const lg=ws.filter(x=>x.length>3||ws.length<3);return ws.some(x=>x.length>2&&st.includes(x))&&lg.filter(x=>toks.includes(x)).length>=Math.ceil(lg.length/2)})||null;
}
function rdWord(el){const si=+el.dataset.s,w=el.dataset.w;const g=enGloss(RD.p,si,w);RD.sel={si,w,g,d:g?null:enDictLook(w,el.dataset.i!=='0')};render()}
function senHtml(p,si,cls){
  const s=p.sents[si];
  let wi=-1;return s.e.split(/(\s+)/).map(tok=>{if(/\S/.test(tok))wi++;const m=tok.match(/^([^A-Za-z]*)([A-Za-z][A-Za-z'’-]*)(.*)$/);if(!m)return esc(tok);
    const g=enGloss(p,si,m[2]),sel=RD&&RD.sel&&RD.sel.si===si&&RD.sel.w===m[2];
    return `${esc(m[1])}<span class="w ${g?'g':''} ${sel?'sel':''}" data-s="${si}" data-i="${wi}" data-w="${esc(m[2])}" onclick="rdWord(this)">${esc(m[2])}</span>${esc(m[3])}`}).join('');
}
function vocabRow(v){const it=L().byT[v.t],has=it&&(card(it,'R')||card(it,'L'));
  return `<div class="item"><div class="tx"><div class="t" style="font-size:17px">${esc(v.t)}</div><div class="m">${esc(v.m)}</div></div><button class="spk s" data-t="${esc(v.t)}" onclick="speak(this.dataset.t)">🔊</button>${has?'<span class="tag">復習中</span>':`<button class="ghost s" data-t="${esc(v.t)}" data-m="${esc(v.m)}" onclick="addCustom(this.dataset.t,'',this.dataset.m);render()">＋復習</button>`}</div>`}
function qsHtml(p,ans,fn){return p.qs.map((q,qi)=>{const a=ans[qi];return `<div class="card"><b>${qi+1}. ${esc(q.q)}</b><div class="opts">${q.o.map((o,oi)=>`<button class="opt ${a!=null?(oi===q.a?'ok':(oi===a?'ng':'')):''}" ${a!=null?'disabled':''} onclick="${fn}(${qi},${oi})">(${'ABCD'[oi]}) ${esc(o)}</button>`).join('')}</div></div>`}).join('')}
function rdAns(qi,oi){RD.ans[qi]=oi;const p=RD.p;if(p.qs.every((_,i)=>RD.ans[i]!=null)){S.enRead[p.id]=Math.round(p.qs.filter((q,i)=>RD.ans[i]===q.a).length/p.qs.length*100);logT().read=1;save()}render()}
function enReadView(){
  const p=RD.p,sel=RD.sel,done=p.qs.length&&p.qs.every((_,i)=>RD.ans[i]!=null);
  const panel=()=>{const g=sel.g,d=sel.d,x=g||d;
    return `<div class="gl"><b>${esc(x?x.t:sel.w)}</b> <button class="spk s" data-t="${esc(x&&!x.name?x.t:sel.w)}" onclick="speak(this.dataset.t)">🔊</button>
    ${x?`<div>${esc(x.m)}</div>${d&&!d.name?'<div class="small">辞書の一般的な意味です。この文での訳は「訳」で確かめてください。</div>':''}`:`<div class="small">この語は内蔵の辞書にありません。文の和訳で確かめてください。</div>`}
    <div class="tools">${x&&!x.name?`<button class="ghost s" data-t="${esc(x.t)}" data-m="${esc(x.m)}" onclick="addCustom(this.dataset.t,'',this.dataset.m)">＋復習に追加</button>`:''}
    ${RD.showAll||RD.open[sel.si]?'':`<button class="ghost s" onclick="RD.open[${sel.si}]=true;render()">この文の和訳を見る</button>`}
    <button class="lnk" onclick="RD.sel=null;render()">閉じる</button></div></div>`};
  return `<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button><span class="small">レベル ${p.lv} · ${esc(p.type||'AI作成')}</span></div>
  <h1 style="font-size:19px">${esc(p.title)}</h1>
  <div class="tools"><button class="ghost" onclick="playAll(RD.p.sents.map(s=>({t:s.e})))">${playing?'⏹ 停止':'▶ 全文を聞く'}</button>
    <button class="ghost" onclick="RD.showAll=!RD.showAll;render()">${RD.showAll?'和訳を隠す':'和訳をすべて表示'}</button>
    <button class="ghost" onclick="S.slow=!S.slow;save();render()">${S.slow?'🐢':'🐇'}</button></div>
  <div class="small" style="margin-top:8px">まず和訳なしで読んでみましょう。どの単語もタップすると意味が出ます（点線はこの文章の重要語句）。</div>
  <div class="card psg">${p.sents.map((s,si)=>`<div class="sen"><span class="en">${senHtml(p,si)}</span>
    <span class="sb"><button data-t="${esc(s.e)}" onclick="speak(this.dataset.t)">🔊</button><button onclick="RD.open[${si}]=!RD.open[${si}];render()">訳</button></span>
    ${RD.showAll||RD.open[si]?`<div class="tr">${esc(s.j)}</div>`:''}${sel&&sel.si===si?panel():''}</div>`).join('')}</div>
  ${p.qs.length?`<h2>内容理解</h2>${qsHtml(p,RD.ans,'rdAns')}`:''}
  <h2>重要語句（${p.vocab.length}）</h2>
  <button class="ghost wide" style="margin-top:0" onclick="RD.p.vocab.forEach(v=>{const it=L().byT[v.t];if(it)initCard(it)});save();toast('語句を復習に追加しました');render()">すべて復習に追加</button>
  ${p.vocab.map(vocabRow).join('')}
  ${done?`<div class="tip">読了！ 正答率 ${S.enRead[p.id]}%。仕上げに、和訳を見ずにもう一度通して読む → 音読やシャドーイングをすると定着します。</div>`:''}
  <button class="big-btn" onclick="startShadow(null,RD.p.sents.map(s=>({t:s.e,r:'',m:s.j})))">🗣 この英文でシャドーイング</button>
  <button class="ghost wide" onclick="go('home')">ホームへ</button>`;
}
// ---- リスニング ----
function lsOpen(id){stop();LS={p:enFind(id),idx:0,ans:{},a2:null,played:false,playing:false,ok:0,plays:0,nv:Math.floor(Math.random()*5)};view={v:'enlis'};render();window.scrollTo(0,0)}
function enSeq(parts){
  stop();LS.playing=true;LS.plays++;render();let i=0;const vs=voices(),rate=EL[LS.p.lv].rate*(S.slow?.8:1);
  const next=()=>{if(!LS||!LS.playing)return;if(i>=parts.length){LS.playing=false;LS.played=true;render();return}
    const p=parts[i++],o={rate};
    if(vs.length>1)o.voice=vs[(p.sp==='W'?LS.nv+1:LS.nv)%vs.length];else o.pitch=p.sp==='W'?1.25:p.sp==='M'?0.8:1;
    speak(p.t,()=>setTimeout(next,p.gap||450),o)};
  next();
}
function lsPlay(){const p=LS.p;
  if(LS.playing){LS.playing=false;try{speechSynthesis.cancel()}catch(e){}render();return}
  if(p.part===2){const it=p.items[LS.idx];enSeq([{t:it.q,sp:'W',gap:700},...it.o.map((o,i)=>({t:'ABC'[i]+'. '+o,sp:'M',gap:500}))])}
  else enSeq(p.sents.map(s=>({t:s.e,sp:s.s||'N'})))}
function ls2Ans(i){const it=LS.p.items[LS.idx];LS.a2=i;if(i===it.a)LS.ok++;LS.playing=false;try{speechSynthesis.cancel()}catch(e){}render()}
function ls2Next(){LS.idx++;LS.a2=null;LS.played=false;LS.plays=0;if(LS.idx>=LS.p.items.length){S.enLis[LS.p.id]=Math.round(LS.ok/LS.p.items.length*100);logT().lis=1;save()}render();window.scrollTo(0,0)}
function lsAns(qi,oi){LS.ans[qi]=oi;const p=LS.p;if(p.qs.every((_,i)=>LS.ans[i]!=null)){S.enLis[p.id]=Math.round(p.qs.filter((q,i)=>LS.ans[i]===q.a).length/p.qs.length*100);logT().lis=1;save();LS.playing=false;try{speechSynthesis.cancel()}catch(e){}}render()}
function enLisView(){
  const p=LS.p,pn={2:'Part 2 応答問題',3:'Part 3 会話問題',4:'Part 4 説明文問題'}[p.part];
  const head=`<div class="top"><button class="back" onclick="go('home')">‹ 戻る</button><span class="small">レベル ${p.lv} · ${pn}</span></div>`;
  const playBtn=`<button class="spk" style="width:84px;height:84px;font-size:34px" onclick="lsPlay()">${LS.playing?'⏹':'▶'}</button><div class="small" style="margin-top:8px">${LS.playing?'再生中…':LS.plays?'もう一度聞く（'+LS.plays+'回再生）':'タップして再生'}</div>
    <button class="lnk" onclick="S.slow=!S.slow;save();render()">${S.slow?'🐢 ゆっくり':'🐇 本番の速さ'}</button>`;
  if(p.part===2){
    if(LS.idx>=p.items.length)return head+`<h1>${pn}</h1><div class="card"><div class="score">${S.enLis[p.id]}%</div><div class="small" style="text-align:center">${p.items.length}問中 ${LS.ok}問正解</div></div>
      <button class="big-btn" onclick="startShadow(null,LS.p.items.flatMap(it=>[{t:it.q,r:'',m:it.jq},{t:it.o[it.a],r:'',m:it.ja}]))">🗣 質問と応答をシャドーイング</button><button class="ghost wide" onclick="go('home')">ホームへ</button>`;
    const it=p.items[LS.idx],a=LS.a2,an=a!==null;
    return head+`<div class="bar"><i style="width:${LS.idx/p.items.length*100}%"></i></div>
    <div class="card qbig"><div class="kind">No. ${LS.idx+1}　質問を聞いて、最も適切な応答を選ぶ</div>${playBtn}</div>
    <div class="opts" style="grid-template-columns:repeat(3,1fr)">${it.o.map((o,i)=>`<button class="opt ${an?(i===it.a?'ok':(i===a?'ng':'')):''}" style="text-align:center;font-weight:700" ${an||!LS.plays?'disabled':''} onclick="ls2Ans(${i})">(${'ABC'[i]})</button>`).join('')}</div>
    ${an?`<div class="card"><div class="small">スクリプト</div><div class="sen"><b>Q.</b> ${esc(it.q)} <span class="sb"><button data-t="${esc(it.q)}" onclick="speak(this.dataset.t)">🔊</button></span><div class="tr">${esc(it.jq)}</div></div>
      ${it.o.map((o,i)=>`<div class="sen" style="${i===it.a?'font-weight:700;color:var(--ok)':''}">(${'ABC'[i]}) ${esc(o)}${i===it.a?`<div class="tr">${esc(it.ja)}</div>`:''}</div>`).join('')}</div>
      <button class="big-btn" onclick="ls2Next()">${LS.idx+1<p.items.length?'次の問題':'結果を見る'}</button>`:''}`;
  }
  const done=p.qs.every((_,i)=>LS.ans[i]!=null);
  return head+`<h1 style="font-size:18px">${esc(p.title)}</h1>
  <div class="card qbig"><div class="kind">${p.part===3?'2人の会話':'1人の話'}を聞いて、設問に答える</div>${playBtn}</div>
  ${qsHtml(p,LS.ans,'lsAns')}
  ${done?`<div class="tip">正答率 ${S.enLis[p.id]}%。スクリプトを見ながらもう一度聞き、聞き取れなかった箇所を確かめましょう。</div>
    <h2>スクリプトと和訳</h2><div class="card psg">${p.sents.map(s=>`<div class="sen">${s.s&&s.s!=='N'?`<b>${s.s==='M'?'男性':'女性'}：</b>`:''}${esc(s.e)} <span class="sb"><button data-t="${esc(s.e)}" onclick="speak(this.dataset.t)">🔊</button></span><div class="tr">${esc(s.j)}</div></div>`).join('')}</div>
    ${p.vocab.length?`<h2>重要語句</h2>${p.vocab.map(vocabRow).join('')}`:''}
    <button class="big-btn" onclick="startShadow(null,LS.p.sents.map(s=>({t:s.e,r:'',m:s.j})))">🗣 この英文でシャドーイング</button>`:`<div class="small" style="margin-top:8px">すべての設問に答えると、スクリプトと和訳が出ます。</div>`}
  <button class="ghost wide" onclick="go('home')">ホームへ</button>`;
}
// ---- AIで教材を追加 ----
const EN_TOPICS=[['school life','a hobby','family','a weekend','food','a pet','seasons'],['travel','the environment','technology in daily life','health','a store notice','an e-mail about an order','volunteering','a cultural difference'],['a business article','a company memo','a customer letter','economics','workplace trends','science and society','urban planning','psychology of decision-making']];
function enTopic(lv){return pick(EN_TOPICS[lv<=3?0:lv<=6?1:2])}
async function enGenRead(){
  const lv=S.enLv,e=EL[lv];ENB.read=true;ENB.err='';render();
  const prompt=`Write an ORIGINAL English reading passage for a Japanese learner. Level ${lv}/10: ${e.ai} Length about ${e.len} words. Topic area: ${enTopic(lv)}. ${lv>=4?'Style: like a Japanese high-school textbook passage or a TOEIC Part 7 text (e-mail, notice, article).':'Style: like a Japanese junior-high textbook passage.'} Do not copy any existing text.
Return ONLY JSON: {"title":"","sents":[{"e":"one English sentence","j":"natural Japanese translation"}],"vocab":[{"t":"word or phrase in dictionary form","m":"Japanese meaning in this context"}],"qs":[{"q":"comprehension question in English","o":["","","",""],"a":0}]}
"vocab": the ${lv<=3?8:14} words/phrases a learner at this level is most likely not to know. "qs": 2 or 3 questions with 4 options; "a" = index of the correct option, vary its position.`;
  try{const d=await askAI(prompt);if(!d||!d.sents||!d.sents.length)throw {code:'parse'};
    const p={id:'g'+Date.now()+Math.floor(Math.random()*1000),lv,title:d.title||'New passage',type:'AI作成',sents:d.sents.map(s=>({e:String(s.e||''),j:String(s.j||''),s:''})),vocab:(d.vocab||[]).filter(v=>v&&v.t),qs:(d.qs||[]).filter(q=>q&&q.o&&q.o.length===4),items:[]};
    S.enGen=[...(S.enGen||[]),p].slice(-15);enReg(p);save();ENB.read=false;rdOpen(p.id);return}
  catch(err){ENB.err=aiErr(err)}
  ENB.read=false;render();
}
async function enGenLis(part){
  const lv=S.enLv,e=EL[lv];ENB.lis=true;ENB.err='';render();
  const base=`Create ORIGINAL listening material in the format of TOEIC Listening Part ${part} for a Japanese learner. Level ${lv}/10: ${e.ai} Do not copy real test items.`;
  const prompt=part===2?`${base}
Return ONLY JSON: {"items":[{"q":"a spoken question or statement","jq":"Japanese translation","o":["response A","response B","response C"],"a":0,"ja":"Japanese translation of the correct response"}]}
Exactly 3 items. Wrong responses should be plausible distractors (similar sounds, wrong question type). Vary the position of the correct answer.`:
  `${base} ${part===3?'A conversation between a man (M) and a woman (W), 4-6 turns.':'A single talk by one speaker (N): announcement, voicemail, news or speech excerpt, 5-8 sentences.'}
Return ONLY JSON: {"title":"short Japanese label of the scene","sents":[{"s":"${part===3?'M or W':'N'}","e":"English","j":"Japanese translation"}],"vocab":[{"t":"","m":""}],"qs":[{"q":"question in English","o":["","","",""],"a":0}]}
3 questions; vary the correct position. "vocab": up to 8 useful words/phrases in dictionary form with Japanese meanings.`;
  try{const d=await askAI(prompt);const p={id:'gl'+Date.now()+Math.floor(Math.random()*1000),lv,part,title:d.title||'',sents:[],vocab:[],qs:[],items:[]};
    if(part===2){p.items=(d.items||[]).filter(x=>x&&x.o&&x.o.length===3);if(!p.items.length)throw {code:'parse'}}
    else{p.sents=(d.sents||[]).map(s=>({e:String(s.e||''),j:String(s.j||''),s:['M','W','N'].includes(s.s)?s.s:'N'}));p.vocab=(d.vocab||[]).filter(v=>v&&v.t);p.qs=(d.qs||[]).filter(q=>q&&q.o&&q.o.length===4);if(!p.sents.length||!p.qs.length)throw {code:'parse'}}
    S.enGenL=[...(S.enGenL||[]),p].slice(-15);enReg(p);save();ENB.lis=false;lsOpen(p.id);return}
  catch(err){ENB.err=aiErr(err)}
  ENB.lis=false;render();
}

render();
