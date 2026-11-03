// Starzoomer — DOM menus / screens.
'use strict';
const MHUE=[275,20,195,40,320,215,165,8,95,300];function MSTAR(R,r){let p=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,q=k%2?r:R;p.push((Math.cos(a)*q).toFixed(1)+','+(Math.sin(a)*q).toFixed(1));}return p.join(' ');}
const UI={cur:null,
 el(){return $('scr');},
 show(html,cls){const s=this.el();s.className='scr '+(cls||'');s.innerHTML=html;s.style.display='flex';this.cur=cls;s.scrollTop=0;
  s.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',e=>{AU.init();AU.sfx('ui');this.act(b.dataset.a,b);}));},
 hideAll(){this.el().style.display='none';this.el().innerHTML='';this.cur=null;$('pz').style.display='none';},
 hud(on){$('hudb').style.display=on?'flex':'none';if(on){this.el().style.display='none';Ads.banner(false);}},
 ttl(){return`<div class="logo"><div class="l1">STAR</div><div class="l2">ZOOMER</div></div>`;},
 menu(){G.mode='menu';this.hud(false);if(BGS.i!==4)setBG(4);P.ship=SAVE.ship;P.alive=true;P.inv=0;clearAll();AU.play(50);Ads.banner(true);
  this.show(`${this.ttl()}<div class="tag">${T('tag')}</div><div class="sp"></div>
  <button class="b big" data-a="play">▶ ${T('play')}</button>
  <div class="row"><button class="b" data-a="map">${T('select')}</button><button class="b" data-a="hangar">${T('hangar')}</button></div>
  ${SAVE.cleared?`<button class="b pink" data-a="endless">∞ ${T('endless')}</button>`:''}
  <div class="row"><button class="b sm" data-a="settings">⚙ ${T('settings')}</button></div>
  <div class="hi">${T('best')} <b>${SAVE.hi}</b> · ◆ ${SAVE.cr}</div>
  <div class="studio"><img src="studio-logo.png" alt=""><span>P-Prece Studio</span></div>`,'menu');},
 map(){G.mode='menu';this.hud(false);Ads.banner(true);
  let h=`<div class="mtop"><div class="hd"><button class="b sm" data-a="menu">◀</button><h2>${T('select')}</h2><span class="cr">◆ ${SAVE.cr}</span></div>
  <div class="diff">${['easy','normal','hard'].map((d,i)=>`<button class="chip ${SAVE.diff===i?'on':''}" data-a="diff" data-i="${i}">${T(d)}</button>`).join('')}</div></div><div class="path" id="spath"><svg class="pl" id="spl"></svg>`;
  const STAR=(c1,c2,id)=>`<svg viewBox="-50 -50 100 100" class="sv"><defs><radialGradient id="g${id}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><polygon class="sp0" points="${MSTAR(46,21)}" fill="url(#g${id})"/><polygon class="sp1" points="${MSTAR(36,16)}" fill="none"/></svg>`;
  const cur=Math.min(10,Math.max(1,SAVE.reached)),seen=SAVE.mapSeen||0,fresh=seen&&SAVE.reached>seen&&SAVE.reached<=10?SAVE.reached:0;
  for(let i=1;i<=10;i++){const lock=i>SAVE.reached&&!DEBUG,st=SAVE.stars[i-1]||0,done=i<SAVE.reached,hu=MHUE[i-1];
   const c1=lock?'#6a6a86':`hsl(${hu},100%,68%)`,c2=lock?'#23203a':`hsl(${hu+25},90%,38%)`;
   h+=`<button class="snode ${lock?'lock':done?'done':'cur'}${i===fresh?' fresh':''}" data-a="stage" data-i="${i}" ${lock?'disabled':''} style="--hu:${hu}">${STAR(c1,c2,i)}<span class="num">${lock?'🔒':i}</span><span class="lbl"><span class="nm">${T('n'+i)}</span><span class="st">${[0,1,2].map(j=>`<i class="${j<st?'on':''}">★</i>`).join('')}</span></span></button>`;}
  const eo=SAVE.cleared||DEBUG;
  h+=`<button class="snode end ${eo?'':'lock'}" data-a="endless" ${eo?'':'disabled'}><span class="portal"><i></i><i></i><i></i></span><span class="num">${eo?'∞':'🔒'}</span><span class="lbl"><span class="nm">${T('endless')}</span><span class="st2">${SAVE.cleared?T('best')+' '+SAVE.endBest:''}</span></span></button></div>`;
  this.show(h,'map');SAVE.mapSeen=SAVE.reached;persist();this.mapLayout(cur);},
 mapLayout(cur){const pth=$('spath');if(!pth)return;document.body.classList.toggle('lowq',QUAL===0);const W=pth.clientWidth,step=Math.max(112,Math.min(150,innerHeight*.17)),top=200,H=top+10*step+70;pth.style.height=H+'px';
  const X=[.3,.5,.7,.5],rtl=document.documentElement.dir==='rtl',pos=[];
  for(let i=1;i<=10;i++){let x=X[(i-1)%4];if(rtl)x=1-x;pos[i]={x:Math.round(W*.5+(x-.5)*Math.min(W,520)),y:top+(10-i)*step+step*.5};}
  pos[11]={x:Math.round(W/2),y:72};
  const ns=pth.querySelectorAll('.snode');ns.forEach((n,k)=>{const p=pos[k+1];n.style.left=p.x+'px';n.style.top=p.y+'px';});
  let s='';for(let i=1;i<=10;i++){const a=pos[i],b=pos[i+1],lit=i<SAVE.reached||(i===10&&SAVE.cleared),my=(a.y+b.y)/2,d=`M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
   s+=`${lit?`<path d="${d}" class="pgw" style="--hu:${MHUE[i-1]}"/>`:''}<path d="${d}" class="pg ${lit?'lit':''}" style="--hu:${MHUE[i-1]}"/><path d="${d}" class="pd ${lit?'lit':''}"/>`;}
  const sv=$('spl');sv.setAttribute('width',W);sv.setAttribute('height',H);sv.innerHTML=s;
  const sc=this.el();requestAnimationFrame(()=>{const p=pos[cur];sc.scrollTop=Math.max(0,pth.offsetTop+p.y-sc.clientHeight*.55);});},
 hangar(){G.mode='menu';this.hud(false);Ads.banner(true);const costs=[0,800,2000],req=[0,3,6];
  let h=`<div class="hd"><button class="b sm" data-a="menu">◀</button><h2>${T('hangar')}</h2><span class="cr">◆ ${SAVE.cr}</span></div><h3>${T('ships')}</h3><div class="ships">`;
  SHIPS.forEach((s,i)=>{const own=SAVE.ships[i],can=SAVE.reached>=req[i]||DEBUG;h+=`<div class="ship ${SAVE.ship===i?'sel':''}"><img src="${ART.spr.ship[i].c.toDataURL()}" alt=""><b>${s.n}</b><small>${T('sh'+(i+1))}</small>
   ${own?(SAVE.ship===i?`<span class="ok">${T('equipped')}</span>`:`<button class="b sm" data-a="equip" data-i="${i}">${T('equip')}</button>`):can?`<button class="b sm gold${SAVE.cr<costs[i]?' poor':''}" data-a="buyship" data-i="${i}">◆ ${costs[i]}</button>`:`<small class="lk">🔒 ${T('unlockAt').replace('{n}',req[i]-1)}</small>`}</div>`;});
  h+=`</div><h3>${T('upgrades')}</h3><div class="upg">`;const UC=[150,350,700,1200];
  [['rate','fireRate'],['dmg','damage'],['shd','shield'],['mag','magnet']].forEach(([k,n])=>{const lv=SAVE.upg[k];h+=`<div class="u"><span class="un">${T(n)}</span><span class="pips">${[0,1,2,3].map(j=>`<i class="${j<lv?'on':''}"></i>`).join('')}</span>${lv>=4?`<span class="ok">${T('max')}</span>`:`<button class="b sm gold" data-a="upg" data-k="${k}" ${SAVE.cr<UC[lv]?'disabled':''}>◆ ${UC[lv]}</button>`}</div>`;});
  this.show(h+'</div>','hangar');this.UC=UC;this.SC=costs;},
 settings(from){this.from=from||'menu';const tg=(k,n)=>`<div class="set"><span>${T(n)}</span><button class="tg ${SAVE[k]?'on':''}" data-a="tog" data-k="${k}">${SAVE[k]?'ON':'OFF'}</button></div>`;
  const langs=Object.keys(LANG_NAMES).map(l=>`<option value="${l}" ${l===LANG&&localStorage.getItem('rsb_lang')?'selected':''}>${LANG_NAMES[l]}</option>`).join('');
  this.show(`<div class="hd"><button class="b sm" data-a="back">◀</button><h2>${T('settings')}</h2><span></span></div><div class="sets">
  ${tg('snd','sound')}${tg('mus','music')}${tg('vib','vibration')}${tg('shake','shake')}
  <div class="set"><span>${T('quality')}</span><select id="sQ">${['auto','low','high'].map(q=>`<option value="${q}" ${SAVE.q===q?'selected':''}>${T('q_'+q)}</option>`).join('')}</select></div>
  <div class="set"><span>${T('language')}</span><select id="sL"><option value="auto">${T('auto')}</option>${langs}</select></div>
  <div class="set"><span>${T('difficulty')}</span><select id="sD">${['easy','normal','hard'].map((d,i)=>`<option value="${i}" ${SAVE.diff===i?'selected':''}>${T(d)}</option>`).join('')}</select></div></div>
  <div class="howto">${T('howto')}</div>
  <div class="studio big"><img src="studio-logo.png" alt=""><span>${T('madeBy')} <b>P-Prece Studio</b><br>พีพีช Studio</span></div><a class="priv" href="privacy.html" target="_blank">${T('privacy')}</a>`,'settings');
  $('sQ').onchange=e=>{SAVE.q=e.target.value;persist();setQuality();};$('sD').onchange=e=>{SAVE.diff=+e.target.value;persist();};
  $('sL').onchange=e=>{const v=e.target.value;try{if(v==='auto')localStorage.removeItem('rsb_lang');else localStorage.setItem('rsb_lang',v);}catch(_){}LANG=v==='auto'?detectLang():v;applyLang();this.settings(this.from);};},
 result(win,o){Ads.banner(true);this.hud(false);const s=G.stage;const canR=Ads.canReward();
  const sc=`<div class="res"><div class="rs">${T('score')} <b>${G.score}</b></div><div class="rs">${T('credits')} <b>◆ ${G.credits}</b></div><div class="rs">${T('best')} <b>${G.endless?SAVE.endBest:SAVE.best[s-1]||0}</b></div></div>`;
  if(win){FX.fw=4;const L=G.tally||{base:G.score,kb:0,cr:G.credits,bk:'comboBonus',bv:0,tot:G.score};const inst=!!this.tallyDone;
   const row=(lab,v,pre,cls)=>`<div class="tr ${cls||''} ${inst?'in done':''}" data-v="${v}" data-p="${pre||''}"><span>${lab}</span><b>${inst?(pre||'')+v:''}</b></div>`;
   this.show(`<div class="burst"></div><h2 class="big gold">${T('clear')}</h2><div class="tally">${row(T('score'),L.base)}${row(T('killBonus'),L.kb,'+')}${row(T('credits'),L.cr,'◆ ','crr')}${row(T(L.bk),L.bv,'+')}<i class="tl"></i>${row(T('total'),L.tot,'','tot')}</div>
   <div class="stars ${inst?'':'hid'}">${[1,2,3].map(k=>`<span class="${k<=o.stars?'on':''}">★</span>`).join('')}</div><div class="nb ${o.nb&&inst?'':'hid'}">${T('newBest')}</div>
   <div class="tsk ${inst?'hid':''}">${T('tapSkip')}</div><div class="after ${inst?'':'hid'}">${canR&&G.credits>0?`<button class="b pink" data-a="dbl">▶ ${T('double')}</button>`:''}
   <button class="b big" data-a="next">${s>=10?T('victory'):T('next')} ▶</button><div class="row"><button class="b sm" data-a="hangar">${T('hangar')}</button><button class="b sm" data-a="map">${T('map')}</button></div></div>`,'result');
   if(!inst)this.countUp(o);}
  else this.show(`<h2 class="big red">${T('gameover')}</h2>${sc}${!G.contUsed&&canR?`<button class="b pink" data-a="cont">▶ ${T('revive')}</button>`:''}
   <button class="b big" data-a="retry">${T('retry')}</button><div class="row"><button class="b sm" data-a="hangar">${T('hangar')}</button><button class="b sm" data-a="map">${T('map')}</button></div>`,'result');
  },
 // score tally: each line pops in and counts up with ticks; tap skips to the end
 countUp(o){const rows=[...document.querySelectorAll('.tally .tr')],scr=this.el();let i=-1,t0=0,raf=0,dead=false;
  const fmt=(r,v)=>r.dataset.p+Math.round(v);
  const end=()=>{if(dead)return;dead=true;cancelAnimationFrame(raf);rows.forEach(r=>{r.classList.add('in','done');r.querySelector('b').textContent=fmt(r,+r.dataset.v);});
   this.tallyDone=true;scr.onpointerdown=null;const q=c=>scr.querySelector(c);q('.stars').classList.remove('hid');o.nb&&q('.nb').classList.remove('hid');q('.tsk').classList.add('hid');
   setTimeout(()=>{const a=q('.after');a&&a.classList.remove('hid');},350);AU.sfx('power');};
  const step=now=>{if(dead||this.cur!=='result')return;if(i<0||now-t0>(rows[i].classList.contains('tot')?900:640)){if(i>=0){rows[i].classList.add('done');rows[i].querySelector('b').textContent=fmt(rows[i],+rows[i].dataset.v);AU.sfx('coin');}
    i++;if(i>=rows.length){end();return;}rows[i].classList.add('in');t0=now;}
   const r=rows[i],d=r.classList.contains('tot')?750:480,k=Math.min(1,(now-t0)/d),v=+r.dataset.v*(1-Math.pow(1-k,3));r.querySelector('b').textContent=fmt(r,v);if(k<1&&+r.dataset.v>0)AU.sfx('tick');raf=requestAnimationFrame(step);};
  setTimeout(()=>{raf=requestAnimationFrame(step);},350);
  setTimeout(()=>{scr.onpointerdown=e=>{if(!e.target.closest('button'))end();};},150);},
 warpTo(n){WARP.start(n,false,()=>startStage(n));},
 endlessNext(){WARP.start(0,true,()=>startStage(0,true));},
 pause(){if(G.mode!=='play')return;G.mode='paused';$('pz').style.display='flex';$('pz').innerHTML=`<h2>${T('paused')}</h2><button class="b big" data-pa="resume">▶ ${T('resume')}</button><button class="b" data-pa="restart">${T('restart')}</button><button class="b" data-pa="quit">${T('quit')}</button>
  <div class="row"><button class="tg ${SAVE.snd?'on':''}" data-pa="snd">♪ ${T('sound')}</button><button class="tg ${SAVE.mus?'on':''}" data-pa="mus">♫ ${T('music')}</button></div>`;
  $('pz').querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>{AU.sfx('ui');const k=b.dataset.pa;if(k==='resume'){$('pz').style.display='none';G.mode='play';last=performance.now();}
   else if(k==='restart'){$('pz').style.display='none';G.sector=0;startStage(G.endless?0:G.stage,G.endless);}else if(k==='quit'){$('pz').style.display='none';this.map();}
   else{SAVE[k]=SAVE[k]?0:1;persist();AU.setVol();this.pause2();}});},
 pause2(){G.mode='play';this.pause();},
 pauseToggle(){if(G.mode==='play')this.pause();else if(G.mode==='paused'){$('pz').style.display='none';G.mode='play';}},
 begin(n){this.hideAll();startStage(n);},
 act(a,b){const i=+b.dataset.i;
  switch(a){
   case'play':this.begin(Math.min(SAVE.reached,10));break;case'map':this.map();break;case'hangar':this.hangar();break;case'menu':this.menu();break;
   case'settings':this.settings(this.cur);break;case'back':this.from==='map'?this.map():this.menu();break;
   case'diff':SAVE.diff=i;persist();this.map();break;case'stage':this.begin(i);break;
   case'endless':G.sector=0;this.hideAll();startStage(0,true);break;
   case'tog':{const k=b.dataset.k;SAVE[k]=SAVE[k]?0:1;persist();AU.setVol();if(k==='mus'&&SAVE.mus){AU.songId=-2;AU.play(50);}this.settings(this.from);break;}
   case'equip':SAVE.ship=i;persist();P.ship=i;this.hangar();break;
   case'buyship':if(SAVE.cr>=this.SC[i]){SAVE.cr-=this.SC[i];SAVE.ships[i]=1;SAVE.ship=i;persist();AU.sfx('power');}else toast(T('needCr'));this.hangar();break;
   case'upg':{const k=b.dataset.k,c=this.UC[SAVE.upg[k]];if(SAVE.cr>=c){SAVE.cr-=c;SAVE.upg[k]++;persist();AU.sfx('power');}this.hangar();break;}
      case'next':if(G.stage>=10){this.menu();toast(T('victory'));}else{const n=G.stage+1;b.disabled=true;Ads.interThen(G.stage,()=>this.warpTo(n));}break;
   case'retry':G.sector=0;startStage(G.endless?0:G.stage,G.endless);break;
   case'dbl':b.disabled=true;Ads.rewarded().then(ok=>{if(ok){SAVE.cr+=G.credits;G.credits*=2;persist();AU.sfx('coin');toast('◆ x2');}else toast(T('noVideo'));this.result(true,{stars:SAVE.stars[G.stage-1]||1});});break;
   case'cont':b.disabled=true;Ads.rewarded().then(ok=>{if(ok)revive();else{toast(T('noVideo'));b.disabled=false;}});break;}}};
// Back button (Android bridge calls window.onAndroidBack(); browsers: history trap + Escape). Returns true when handled.
UI.back=function(){const m=G.mode,c=this.cur;if(document.querySelector('.adMock.adI'))return true;
 if(m==='warp'){WARP.skip();return true;}if(m==='play'){this.pause();return true;}if(m==='paused'){$('pz').style.display='none';G.mode='play';last=performance.now();return true;}
 if(c==='settings'){this.from==='map'?this.map():this.menu();return true;}if(c==='map'||c==='hangar'){this.menu();return true;}if(c==='result'){this.map();return true;}return false;};
window.onAndroidBack=()=>UI.back();
addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='GoBack'){UI.back();e.preventDefault();}});
try{if(!window.AndroidAds||window.__adTest){history.pushState({rsb:1},'');addEventListener('popstate',()=>{if(UI.back())history.pushState({rsb:1},'');});}}catch(e){}
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1800);}
function applyLang(){document.documentElement.lang=LANG;document.documentElement.dir=LANG==='ar'?'rtl':'ltr';$('bombB').title=T('bomb');}
// ---------- boot ----------
function boot(){applyLang();buildArt();setQuality();setBG(4,1);$('pauseB').onclick=()=>{AU.init();UI.pauseToggle();};
 $('bombB').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();AU.init();useBomb();});
 document.fonts&&document.fonts.load('10px PS2P').then(()=>{});UI.menu();requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame);});
 if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
 document.addEventListener('pointerdown',()=>AU.init(),{once:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
addEventListener('resize',()=>{if(UI.cur==='map')UI.mapLayout(Math.min(10,Math.max(1,SAVE.reached)));});
