// Rocket Star Blitz — DOM menus / screens.
'use strict';
const UI={cur:null,
 el(){return $('scr');},
 show(html,cls){const s=this.el();s.className='scr '+(cls||'');s.innerHTML=html;s.style.display='flex';this.cur=cls;s.scrollTop=0;
  s.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',e=>{AU.init();AU.sfx('ui');this.act(b.dataset.a,b);}));},
 hideAll(){this.el().style.display='none';this.el().innerHTML='';this.cur=null;$('pz').style.display='none';},
 hud(on){$('hudb').style.display=on?'flex':'none';if(on){this.el().style.display='none';Ads.banner(false);}},
 ttl(){return`<div class="logo"><div class="l1">ROCKET</div><div class="l2">STAR BLITZ</div></div>`;},
 menu(){G.mode='menu';VOICE.stop();this.hud(false);if(BGS.i!==0&&BGS.i!==3)setBG(3);P.ship=SAVE.ship;P.alive=true;P.inv=0;clearAll();AU.play(50);Ads.banner(true);
  this.show(`${this.ttl()}<div class="tag">${T('tag')}</div><div class="sp"></div>
  <button class="b big" data-a="play">▶ ${T('play')}</button>
  <div class="row"><button class="b" data-a="map">${T('select')}</button><button class="b" data-a="hangar">${T('hangar')}</button></div>
  ${SAVE.cleared?`<button class="b pink" data-a="endless">∞ ${T('endless')}</button>`:''}
  <div class="row"><button class="b sm" data-a="settings">⚙ ${T('settings')}</button></div>
  <div class="hi">${T('best')} <b>${SAVE.hi}</b> · ◆ ${SAVE.cr}</div>
  <div class="studio"><img src="studio-logo.png" alt=""><span>P-Prece Studio</span></div>`,'menu');},
 map(){G.mode='menu';this.hud(false);Ads.banner(true);let h=`<div class="hd"><button class="b sm" data-a="menu">◀</button><h2>${T('select')}</h2><span class="cr">◆ ${SAVE.cr}</span></div>
  <div class="diff">${['easy','normal','hard'].map((d,i)=>`<button class="chip ${SAVE.diff===i?'on':''}" data-a="diff" data-i="${i}">${T(d)}</button>`).join('')}</div><div class="nodes">`;
  for(let i=1;i<=10;i++){const lock=i>SAVE.reached&&!DEBUG,st=SAVE.stars[i-1]||0;h+=`<button class="node ${lock?'lock':''} n${i}" data-a="stage" data-i="${i}" ${lock?'disabled':''}><span class="num">${i}</span><span class="nm">${T('n'+i)}</span><span class="st">${lock?'🔒':'★'.repeat(st)+'<i>'+'★'.repeat(3-st)+'</i>'}</span></button>`;}
  h+=`<button class="node end ${SAVE.cleared||DEBUG?'':'lock'}" data-a="endless" ${SAVE.cleared||DEBUG?'':'disabled'}><span class="num">∞</span><span class="nm">${T('endless')}</span><span class="st">${SAVE.cleared?T('best')+' '+SAVE.endBest:'🔒'}</span></button></div>`;
  this.show(h,'map');},
 hangar(){G.mode='menu';this.hud(false);Ads.banner(true);const costs=[0,800,2000],req=[0,3,6];
  let h=`<div class="hd"><button class="b sm" data-a="menu">◀</button><h2>${T('hangar')}</h2><span class="cr">◆ ${SAVE.cr}</span></div><h3>${T('ships')}</h3><div class="ships">`;
  SHIPS.forEach((s,i)=>{const own=SAVE.ships[i],can=SAVE.reached>=req[i]||DEBUG;h+=`<div class="ship ${SAVE.ship===i?'sel':''}"><img src="${ART.spr.ship[i].c.toDataURL()}" alt=""><b>${s.n}</b><small>${T('sh'+(i+1))}</small>
   ${own?(SAVE.ship===i?`<span class="ok">${T('equipped')}</span>`:`<button class="b sm" data-a="equip" data-i="${i}">${T('equip')}</button>`):can?`<button class="b sm gold" data-a="buyship" data-i="${i}">◆ ${costs[i]}</button>`:`<small class="lk">🔒 ${T('unlockAt').replace('{n}',req[i]-1)}</small>`}</div>`;});
  h+=`</div><h3>${T('upgrades')}</h3><div class="upg">`;const UC=[150,350,700,1200];
  [['rate','fireRate'],['dmg','damage'],['shd','shield'],['mag','magnet']].forEach(([k,n])=>{const lv=SAVE.upg[k];h+=`<div class="u"><span class="un">${T(n)}</span><span class="pips">${[0,1,2,3].map(j=>`<i class="${j<lv?'on':''}"></i>`).join('')}</span>${lv>=4?`<span class="ok">${T('max')}</span>`:`<button class="b sm gold" data-a="upg" data-k="${k}" ${SAVE.cr<UC[lv]?'disabled':''}>◆ ${UC[lv]}</button>`}</div>`;});
  this.show(h+'</div>','hangar');this.UC=UC;this.SC=costs;},
 settings(from){this.from=from||'menu';const tg=(k,n)=>`<div class="set"><span>${T(n)}</span><button class="tg ${SAVE[k]?'on':''}" data-a="tog" data-k="${k}">${SAVE[k]?'ON':'OFF'}</button></div>`;
  const langs=Object.keys(LANG_NAMES).map(l=>`<option value="${l}" ${l===LANG&&localStorage.getItem('rsb_lang')?'selected':''}>${LANG_NAMES[l]}</option>`).join('');
  this.show(`<div class="hd"><button class="b sm" data-a="back">◀</button><h2>${T('settings')}</h2><span></span></div><div class="sets">
  ${tg('snd','sound')}${tg('mus','music')}${tg('voice','voice')}${tg('vib','vibration')}
  <div class="set"><span>${T('quality')}</span><select id="sQ">${['auto','low','high'].map(q=>`<option value="${q}" ${SAVE.q===q?'selected':''}>${T('q_'+q)}</option>`).join('')}</select></div>
  <div class="set"><span>${T('language')}</span><select id="sL"><option value="auto">${T('auto')}</option>${langs}</select></div>
  <div class="set"><span>${T('difficulty')}</span><select id="sD">${['easy','normal','hard'].map((d,i)=>`<option value="${i}" ${SAVE.diff===i?'selected':''}>${T(d)}</option>`).join('')}</select></div></div>
  <div class="howto">${T('howto')}</div>
  <div class="studio big"><img src="studio-logo.png" alt=""><span>${T('madeBy')} <b>P-Prece Studio</b><br>พีพีช Studio</span></div><a class="priv" href="privacy.html" target="_blank">${T('privacy')}</a>`,'settings');
  $('sQ').onchange=e=>{SAVE.q=e.target.value;persist();setQuality();};$('sD').onchange=e=>{SAVE.diff=+e.target.value;persist();};
  $('sL').onchange=e=>{const v=e.target.value;try{if(v==='auto')localStorage.removeItem('rsb_lang');else localStorage.setItem('rsb_lang',v);}catch(_){}LANG=v==='auto'?detectLang():v;applyLang();this.settings(this.from);};},
 story(key,then,n){G.mode='story';this.hud(false);Ads.banner(false);const txt=T(key);const sc=SART.scene(key,n),bn=SART.bossName(sc);
  this.show(`<div class="story" data-a="snext"><canvas id="scv" class="scv"></canvas><div class="sv"></div><div class="sh"><span class="st">${n?T('stage')+' '+n:n===0?T('endless'):T('storyT')}</span>${bn?`<span class="bn">⚠ ${bn}</span>`:''}</div><div class="cap"><p id="stx"></p><div class="row"><button class="b sm" data-a="sskip">${T('skip')}</button><button class="b" data-a="snext">${T('next')} ▶</button></div><div class="pb"><i id="spb"></i></div></div></div>`,'storyS');
  SART.start($('scv'),sc);this.then=then;const p=$('stx');clearInterval(this.ti);clearTimeout(this.ta);
  // auto-fit caption: shrink font until the full text fits its box
  p.textContent=txt;let fs=1.6;p.style.fontSize=fs+'em';for(let q=0;q<14&&p.scrollHeight>p.clientHeight+1&&fs>.8;q++){fs-=.07;p.style.fontSize=fs+'em';}
  p.textContent='';const sp=document.createElement('span');sp.className='ghost';sp.textContent=txt;p.appendChild(sp);const vis=document.createElement('span');p.insertBefore(vis,sp);
  let i=0;this.sfin=()=>{clearInterval(this.ti);vis.textContent=txt;sp.textContent='';i=txt.length;};
  this.ti=setInterval(()=>{i+=2;vis.textContent=txt.slice(0,i);sp.textContent=txt.slice(i);if(i>=txt.length)clearInterval(this.ti);},30);VOICE.say(txt);
  const dur=Math.max(7000,txt.length*30/2+txt.length*35+2500),k=this.then;let left=dur,ts=performance.now();const pb=$('spb');pb.style.animationDuration=dur+'ms';
  const arm=()=>{clearTimeout(this.ta);ts=performance.now();this.ta=setTimeout(()=>{if(this.cur==='storyS'&&this.then===k)this.sgo(true);},left);};arm();
  const st=document.querySelector('.story');st.onpointerdown=()=>{if(this.cur!=='storyS')return;clearTimeout(this.ta);left=Math.max(1500,left-(performance.now()-ts));pb.style.animationPlayState='paused';};
  st.onpointerup=st.onpointercancel=()=>{if(this.cur!=='storyS'||this.then!==k)return;pb.style.animationPlayState='running';arm();};},
 sgo(force){if(!force&&this.ti&&this.sfin&&$('stx')&&$('stx').querySelector('.ghost')?.textContent){this.sfin();return;}
  clearInterval(this.ti);clearTimeout(this.ta);VOICE.stop();const f=this.then;this.then=null;if(!f&&this.cur==='storyS')return;const st=document.querySelector('.story');if(st)st.classList.add('out');
  setTimeout(()=>{SART.stop();f&&f();},220);},
 result(win,o){Ads.banner(true);this.hud(false);const s=G.stage;const canR=Ads.canReward();
  const sc=`<div class="res"><div class="rs">${T('score')} <b>${G.score}</b></div><div class="rs">${T('credits')} <b>◆ ${G.credits}</b></div><div class="rs">${T('best')} <b>${G.endless?SAVE.endBest:SAVE.best[s-1]||0}</b></div></div>`;
  if(win){this.show(`<h2 class="big gold">${T('clear')}</h2><div class="stars">${[1,2,3].map(k=>`<span class="${k<=o.stars?'on':''}">★</span>`).join('')}</div>${o.nb?`<div class="nb">${T('newBest')}</div>`:''}${sc}
   ${canR&&G.credits>0?`<button class="b pink" data-a="dbl">▶ ${T('double')}</button>`:''}
   <button class="b big" data-a="next">${s>=10?T('victory'):T('next')} ▶</button><div class="row"><button class="b sm" data-a="hangar">${T('hangar')}</button><button class="b sm" data-a="map">${T('map')}</button></div>`,'result');}
  else this.show(`<h2 class="big red">${T('gameover')}</h2>${sc}${!G.contUsed&&canR?`<button class="b pink" data-a="cont">▶ ${T('revive')}</button>`:''}
   <button class="b big" data-a="retry">${T('retry')}</button><div class="row"><button class="b sm" data-a="hangar">${T('hangar')}</button><button class="b sm" data-a="map">${T('map')}</button></div>`,'result');
  setTimeout(()=>{if(this.cur==='result')Ads.maybeInterstitial(G.endless?10:s);},700);},
 endlessNext(){this.story('st'+(11+((G.sector-1)%2)),()=>startStage(0,true),0);},
 pause(){if(G.mode!=='play')return;G.mode='paused';$('pz').style.display='flex';$('pz').innerHTML=`<h2>${T('paused')}</h2><button class="b big" data-pa="resume">▶ ${T('resume')}</button><button class="b" data-pa="restart">${T('restart')}</button><button class="b" data-pa="quit">${T('quit')}</button>
  <div class="row"><button class="tg ${SAVE.snd?'on':''}" data-pa="snd">♪ ${T('sound')}</button><button class="tg ${SAVE.mus?'on':''}" data-pa="mus">♫ ${T('music')}</button></div>`;
  $('pz').querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>{AU.sfx('ui');const k=b.dataset.pa;if(k==='resume'){$('pz').style.display='none';G.mode='play';last=performance.now();}
   else if(k==='restart'){$('pz').style.display='none';G.sector=0;startStage(G.endless?0:G.stage,G.endless);}else if(k==='quit'){$('pz').style.display='none';this.map();}
   else{SAVE[k]=SAVE[k]?0:1;persist();AU.setVol();this.pause2();}});},
 pause2(){G.mode='play';this.pause();},
 pauseToggle(){if(G.mode==='play')this.pause();else if(G.mode==='paused'){$('pz').style.display='none';G.mode='play';}},
 begin(n){if(n===1&&!SAVE.introSeen){SAVE.introSeen=1;persist();this.story('st0',()=>this.story('st1b',()=>startStage(1),1));return;}
  this.story(n===1?'st1b':'st'+(n-1),()=>startStage(n),n);},
 act(a,b){const i=+b.dataset.i;
  switch(a){
   case'play':this.begin(Math.min(SAVE.reached,10));break;case'map':this.map();break;case'hangar':this.hangar();break;case'menu':this.menu();break;
   case'settings':this.settings(this.cur);break;case'back':this.from==='map'?this.map():this.menu();break;
   case'diff':SAVE.diff=i;persist();this.map();break;case'stage':this.begin(i);break;
   case'endless':G.sector=0;this.story('st10',()=>startStage(0,true),0);break;
   case'tog':{const k=b.dataset.k;SAVE[k]=SAVE[k]?0:1;persist();AU.setVol();if(k==='mus'&&SAVE.mus){AU.songId=-2;AU.play(50);}if(k==='voice'&&!SAVE.voice)VOICE.stop();this.settings(this.from);break;}
   case'equip':SAVE.ship=i;persist();P.ship=i;this.hangar();break;
   case'buyship':if(SAVE.cr>=this.SC[i]){SAVE.cr-=this.SC[i];SAVE.ships[i]=1;SAVE.ship=i;persist();AU.sfx('power');}else toast(T('needCr'));this.hangar();break;
   case'upg':{const k=b.dataset.k,c=this.UC[SAVE.upg[k]];if(SAVE.cr>=c){SAVE.cr-=c;SAVE.upg[k]++;persist();AU.sfx('power');}this.hangar();break;}
   case'snext':case'sskip':this.sgo(a==='sskip');break;
   case'next':if(G.stage>=10){this.story('st10',()=>this.menu());}else this.begin(G.stage+1);break;
   case'retry':G.sector=0;startStage(G.endless?0:G.stage,G.endless);break;
   case'dbl':b.disabled=true;Ads.rewarded().then(ok=>{if(ok){SAVE.cr+=G.credits;G.credits*=2;persist();AU.sfx('coin');toast('◆ x2');}else toast(T('noVideo'));this.result(true,{stars:SAVE.stars[G.stage-1]||1});});break;
   case'cont':b.disabled=true;Ads.rewarded().then(ok=>{if(ok)revive();else{toast(T('noVideo'));b.disabled=false;}});break;}}};
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1800);}
function applyLang(){document.documentElement.lang=LANG;document.documentElement.dir=LANG==='ar'?'rtl':'ltr';$('bombB').title=T('bomb');}
// ---------- boot ----------
function boot(){applyLang();buildArt();setQuality();setBG(3);$('pauseB').onclick=()=>{AU.init();UI.pauseToggle();};
 $('bombB').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();AU.init();useBomb();});
 document.fonts&&document.fonts.load('10px PS2P').then(()=>{});UI.menu();requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame);});
 if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
 document.addEventListener('pointerdown',()=>AU.init(),{once:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
