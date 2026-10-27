// Rocket Star Blitz — original game by P-Prece Studio (พีพีช Studio). All art is procedural canvas drawing; all music/SFX are WebAudio synthesis.
'use strict';
const $=id=>document.getElementById(id);
const Q=new URLSearchParams(location.search);
const DEBUG=Q.get('debug')==='1';
// ================= AD CONFIG (edit here before release) =================
// Exactly 3 AdMob ad units. The values below are GOOGLE'S PUBLIC TEST IDs only.
// >>> Replace with this app's own AdMob unit IDs in the Android project before publishing. <<<
// The Android side reads them via AndroidAds.configure(json) if it implements it.
window.RSB_AD_UNITS=window.RSB_AD_UNITS||{
 banner:      'ca-app-pub-3940256099942544/6300978111', // rsb_banner_menu      (TEST ID)
 interstitial:'ca-app-pub-3940256099942544/1033173712', // rsb_inter_stage_end  (TEST ID)
 rewarded:    'ca-app-pub-3940256099942544/5224354917'  // rsb_reward_continue  (TEST ID)
};
// Ad preview mode: ?test=1 shows labelled mock ads at each placement (no real ads). Persists in localStorage
// (survives reloads / home-screen launch); ?test=0 turns it off. &fill=fail|nofill simulates failures; &fast=0 = realistic interstitial cap.
(function(){let ls={};try{ls=JSON.parse(localStorage.getItem('rsb_adtest')||'null')||{};}catch(e){}
 if(Q.get('test')==='0'){try{localStorage.removeItem('rsb_adtest');}catch(e){}return;}
 if(Q.get('test')==='1'){ls={on:1,fill:Q.get('fill')||'ok',fast:Q.get('fast')==='0'?0:1};try{localStorage.setItem('rsb_adtest',JSON.stringify(ls));}catch(e){}}
 if(!ls.on||window.AndroidAds)return;const fill=ls.fill||'ok';window.__adTest={fast:ls.fast!==0,fill};
 const box=(cls,txt)=>{const d=document.createElement('div');d.className='adMock '+cls;d.innerHTML=txt;document.body.appendChild(d);return d;};let bn=null;
 window.__adLog=[];const lg=k=>window.__adLog.push([k,Date.now()]);
 window.AndroidAds={configure(){},
  showBanner(){lg('banner');if(fill!=='ok')return;if(!bn)bn=box('adB','AD TEST · Banner &nbsp;<b>rsb_banner_menu</b>&nbsp; 320×50');bn.style.display='flex';},
  hideBanner(){if(bn)bn.style.display='none';},
  showInterstitial(){lg('inter');if(fill!=='ok'||document.querySelector('.adMock.adI'))return;const d=box('adI','<div><div class="adT">AD TEST · Interstitial</div><b>rsb_inter_stage_end</b><br><small>full screen · stage clear / game over (from stage 3, ≥90 s apart, ≤1 per 2 stages)</small></div><button class="adX">✕</button>');d.querySelector('button').onclick=()=>d.remove();},
  isRewardedReady(){return fill!=='nofill';},
  showRewarded(){lg('reward');if(fill==='fail'){setTimeout(()=>window.onRewardedFailed&&window.onRewardedFailed(),200);return true;}
   const d=box('adI','<div><div class="adT">AD TEST · Rewarded</div><b>rsb_reward_continue</b><br><small>continue · revive · x2 credits</small><br><br><span class="adW">▶ watching… 3</span><br><button class="adC" disabled>Claim reward</button><br><button class="adS">Skip (no reward)</button></div>');
   let n=3;const w=d.querySelector('.adW'),c=d.querySelector('.adC');const iv=setInterval(()=>{n--;if(n>0)w.textContent='▶ watching… '+n;else{clearInterval(iv);w.textContent='✓ finished';c.disabled=false;}},1000);
   c.onclick=()=>{d.remove();window.onRewardEarned&&window.onRewardEarned();window.onRewardedClosed&&window.onRewardedClosed();};
   d.querySelector('.adS').onclick=()=>{clearInterval(iv);d.remove();window.onRewardedClosed&&window.onRewardedClosed();};return true;}};
 const st=document.createElement('style');st.textContent='.adMock{position:fixed;z-index:2147483000;display:flex;align-items:center;justify-content:center;text-align:center;font:600 13px system-ui,sans-serif;color:#fff}.adB{left:0;right:0;bottom:env(safe-area-inset-bottom);height:56px;background:repeating-linear-gradient(45deg,#2a7a3a,#2a7a3a 10px,#2f8a42 10px,#2f8a42 20px);border-top:2px dashed #fff;pointer-events:none}.adI{inset:0;background:rgba(10,40,20,.97);font-size:18px;padding:20px}.adT{font-size:22px;font-weight:900;color:#ffe27a;margin-bottom:8px}.adI button{font:700 16px system-ui;border:0;border-radius:14px;padding:10px 18px;margin-top:8px}.adX{position:absolute;top:calc(14px + env(safe-area-inset-top));right:14px;width:44px;height:44px;padding:0!important;border-radius:22px!important}.adC{background:#ffd23f}.adC:disabled{opacity:.4}.adS{background:#555;color:#fff}'
 +'#adChip{position:fixed;z-index:2147483001;top:calc(1px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);font:800 10px system-ui;color:#000;background:#ffd23f;border-radius:0 0 10px 10px;padding:2px 9px;opacity:.92;border:1px solid #000;box-shadow:0 2px 6px rgba(0,0,0,.5)}#adPan{position:fixed;z-index:2147483001;top:calc(22px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);background:rgba(0,0,0,.88);border:1px solid #ffd23f;border-radius:14px;padding:8px;display:none;flex-direction:column;gap:6px;width:200px}#adPan.on{display:flex}#adPan button{font:700 13px system-ui;border:0;border-radius:10px;padding:9px;background:#2f8a42;color:#fff}#adPan .off{background:#7a2a2a}';
 document.head.appendChild(st);
 const ui=()=>{const ch=document.createElement('button');ch.id='adChip';ch.textContent='AD TEST MODE ▾';const pn=document.createElement('div');pn.id='adPan';
  pn.innerHTML='<button data-k="b">Show / hide banner</button><button data-k="i">Show interstitial</button><button data-k="r">Show rewarded</button><button data-k="o" class="off">Turn test mode off</button>';
  ch.onclick=e=>{e.stopPropagation();pn.classList.toggle('on');};pn.onclick=e=>{const k=e.target.dataset&&e.target.dataset.k;if(!k)return;e.stopPropagation();pn.classList.remove('on');
   if(k==='b'){if(bn&&bn.style.display!=='none')AndroidAds.hideBanner();else AndroidAds.showBanner();}
   else if(k==='i')AndroidAds.showInterstitial();
   else if(k==='r'){window.onRewardEarned=()=>{try{toast('Reward granted (test)');}catch(e){}};window.onRewardedClosed=()=>{window.onRewardEarned=null;};AndroidAds.showRewarded();}
   else if(k==='o'){try{localStorage.removeItem('rsb_adtest');}catch(e){}location.href=location.pathname+'?test=0';}};
  ['pointerdown','touchstart'].forEach(ev=>{ch.addEventListener(ev,e=>e.stopPropagation());pn.addEventListener(ev,e=>e.stopPropagation());});
  document.body.appendChild(ch);document.body.appendChild(pn);};
 if(document.body)ui();else document.addEventListener('DOMContentLoaded',ui);})();
try{window.AndroidAds&&AndroidAds.configure&&AndroidAds.configure(JSON.stringify(window.RSB_AD_UNITS));}catch(e){}
const LOG=(...a)=>{try{console.log('[RocketStarBlitz]',...a);}catch(e){}};
// ---------- Save ----------
const SAVE=(()=>{let s={};try{s=JSON.parse(localStorage.getItem('rsb_save')||'{}');}catch(e){}
 const d={reached:1,stars:[],best:[],hi:0,cr:0,ships:[1,0,0],ship:0,upg:{rate:0,dmg:0,shd:0,mag:0},snd:1,mus:1,voice:1,vib:1,q:'auto',diff:1,endBest:0,introSeen:0,cleared:0};
 for(const k in d)if(s[k]===undefined)s[k]=d[k];for(const k in d.upg)if(s.upg[k]===undefined)s.upg[k]=0;return s;})();
function persist(){try{localStorage.setItem('rsb_save',JSON.stringify(SAVE));}catch(e){}}
// ---------- Ads (AndroidAds bridge, same conventions as earlier P-Prece games; web stub grants rewards) ----------
const Ads={lastInter:Date.now(),minGap:90000,cleared:0,stageRewards:0,
 banner(show){try{if(window.AndroidAds){show?AndroidAds.showBanner&&AndroidAds.showBanner():AndroidAds.hideBanner&&AndroidAds.hideBanner();}}catch(e){}},
 maybeInterstitial(stageNo){if(stageNo<3)return false;this.cleared++;const n=Date.now();
  if(window.__adTest&&__adTest.fast&&n-this.lastInter<2500)return false;if(!(window.__adTest&&__adTest.fast)&&(this.cleared<2||n-this.lastInter<this.minGap))return false;this.cleared=0;this.lastInter=n;
  try{if(window.AndroidAds&&AndroidAds.showInterstitial){AndroidAds.showInterstitial();}else LOG('AdsStub: interstitial (no ad on web)');}catch(e){}return true;},
 canReward(){return this.stageRewards<2;},
 rewarded(){this.stageRewards++;return new Promise(res=>{if(!(window.AndroidAds&&AndroidAds.showRewarded)){LOG('AdsStub: rewarded granted without ad');setTimeout(()=>res(true),300);return;}
   let done=false,earned=false,tm=0;const fin=ok=>{if(done)return;done=true;clearTimeout(tm);['onRewardedResult','onRewardEarned','onRewardedClosed','onRewardedFailed'].forEach(k=>window[k]=null);res(!!ok);};
   try{if(AndroidAds.isRewardedReady&&!AndroidAds.isRewardedReady()){fin(false);return;}}catch(e){}
   window.onRewardedResult=ok=>fin(ok);window.onRewardEarned=()=>{earned=true;};window.onRewardedClosed=()=>setTimeout(()=>fin(earned),50);window.onRewardedFailed=()=>fin(false);
   tm=setTimeout(()=>fin(earned),90000);try{const r=AndroidAds.showRewarded();if(r===false)fin(false);}catch(e){fin(false);}});}};
// ---------- Audio ----------
// Every voice: osc -> env gain -> music/sfx gain -> bus (headroom .55) -> compressor -> limiter -> tanh soft-clip -> out.
// Envelopes always ramp (attack >= 6 ms, release >= 25 ms), polyphony capped, finished nodes disconnected.
const AU={ac:null,on:false,voices:0,maxVoices:30,next:0,step:0,song:null,songId:-1,lastSfx:{},
 build(ac){this.ac=ac;const bus=ac.createGain();bus.gain.value=.55;
  const c=ac.createDynamicsCompressor();c.threshold.value=-16;c.knee.value=8;c.ratio.value=5;c.attack.value=.004;c.release.value=.18;
  const l=ac.createDynamicsCompressor();l.threshold.value=-4;l.knee.value=0;l.ratio.value=20;l.attack.value=.001;l.release.value=.08;
  const ws=ac.createWaveShaper();const n=1024,cu=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;cu[i]=Math.tanh(x*1.1)/Math.tanh(1.1)*.97;}ws.curve=cu;
  bus.connect(c);c.connect(l);l.connect(ws);ws.connect(ac.destination);this.bus=bus;
  this.mg=ac.createGain();this.mg.gain.value=SAVE.mus?.42:0;this.mg.connect(bus);this.sg=ac.createGain();this.sg.gain.value=SAVE.snd?.8:0;this.sg.connect(bus);
  const nb=ac.createBuffer(1,ac.sampleRate*1,ac.sampleRate),d=nb.getChannelData(0);let r=12345;for(let i=0;i<d.length;i++){r=(r*1103515245+12345)&0x7fffffff;d[i]=r/0x3fffffff-1;}this.nb=nb;},
 init(){if(this.ac){if(this.ac.state==='suspended')this.ac.resume();return;}try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;this.build(new A({latencyHint:'interactive'}));this.on=true;}catch(e){}},
 setVol(){if(!this.ac)return;const t=this.ac.currentTime;this.mg.gain.setTargetAtTime(SAVE.mus?.42:0,t,.05);this.sg.gain.setTargetAtTime(SAVE.snd?.8:0,t,.05);},
 env(g,t,a,h,r,v){a=Math.max(a,.006);r=Math.max(r,.025);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+a+h);g.gain.linearRampToValueAtTime(0,t+a+h+r);return t+a+h+r;},
 tone(dest,type,f,t,a,h,r,v,f2,filt){const ac=this.ac;if(this.voices>=this.maxVoices)return;this.voices++;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+a+h+r);let last=o;if(filt){const bq=ac.createBiquadFilter();bq.type='lowpass';bq.frequency.value=filt;bq.Q.value=2;o.connect(bq);last=bq;}
  last.connect(g);g.connect(dest);const end=this.env(g,t,a,h,r,v);o.start(t);o.stop(end+.02);o.onended=()=>{this.voices--;try{o.disconnect();g.disconnect();last!==o&&last.disconnect();}catch(e){}};},
 noise(dest,t,a,h,r,v,ftype,fq,fq2){const ac=this.ac;if(this.voices>=this.maxVoices)return;this.voices++;const s=ac.createBufferSource();s.buffer=this.nb;s.loop=true;const bq=ac.createBiquadFilter();bq.type=ftype||'lowpass';bq.frequency.setValueAtTime(fq||2000,t);
  if(fq2)bq.frequency.exponentialRampToValueAtTime(fq2,t+a+h+r);const g=ac.createGain();s.connect(bq);bq.connect(g);g.connect(dest);const end=this.env(g,t,a,h,r,v);s.start(t,Math.random()*.5);s.stop(end+.02);s.onended=()=>{this.voices--;try{s.disconnect();bq.disconnect();g.disconnect();}catch(e){}};},
 sfx(k){if(!this.ac||!SAVE.snd||this.ac.state!=='running')return;const t=this.ac.currentTime+.005,n=performance.now();const gap={shot:75,hit:45,pop:40,boom:70,coin:50}[k]||30;if(this.lastSfx[k]&&n-this.lastSfx[k]<gap)return;this.lastSfx[k]=n;
  if(this.voices>this.maxVoices-6&&(k==='shot'||k==='hit'||k==='coin'))return;const D=this.sg;
  switch(k){
   case'shot':this.tone(D,'square',880,t,.006,.01,.04,.05,440,3000);break;
   case'laser':this.tone(D,'sawtooth',220,t,.01,.05,.06,.035,330,1400);break;
   case'missile':this.noise(D,t,.01,.03,.08,.08,'bandpass',1800,600);break;
   case'hit':this.tone(D,'triangle',300,t,.006,.01,.03,.08,150);break;
   case'pop':this.noise(D,t,.006,.02,.12,.22,'lowpass',2600,300);this.tone(D,'sine',220,t,.006,.02,.12,.18,60);break;
   case'boom':this.noise(D,t,.008,.1,.5,.45,'lowpass',1800,90);this.tone(D,'sine',120,t,.008,.08,.4,.45,30);break;
   case'bigboom':this.noise(D,t,.01,.3,1.2,.55,'lowpass',2400,60);this.tone(D,'sine',90,t,.01,.3,1,.5,25);this.tone(D,'sawtooth',60,t+.1,.02,.2,.8,.15,30,400);break;
   case'coin':this.tone(D,'square',1320,t,.006,.02,.05,.05);this.tone(D,'square',1760,t+.05,.006,.02,.08,.05);break;
   case'power':[523,659,784,1047].forEach((f,i)=>this.tone(D,'square',f,t+i*.055,.006,.03,.06,.07,0,4000));break;
   case'hurt':this.tone(D,'sawtooth',400,t,.006,.05,.3,.25,70,1800);this.noise(D,t,.006,.05,.3,.25,'lowpass',1500,200);break;
   case'shieldhit':this.tone(D,'triangle',900,t,.006,.03,.2,.18,400);break;
   case'deflect':this.tone(D,'square',1800,t,.006,.005,.03,.03,1200,5000);break;
   case'bomb':this.noise(D,t,.02,.3,1.4,.6,'lowpass',3000,80);this.tone(D,'sine',160,t,.02,.2,1.2,.5,30);break;
   case'warn':for(let i=0;i<3;i++){this.tone(D,'square',660,t+i*.5,.01,.18,.06,.12,0,2000);this.tone(D,'square',440,t+i*.5+.25,.01,.15,.06,.12,0,2000);}break;
   case'charge':this.tone(D,'sawtooth',110,t,.2,.6,.1,.06,440,1200);break;
   case'beam':this.noise(D,t,.02,.6,.2,.15,'bandpass',900);this.tone(D,'sawtooth',80,t,.02,.6,.2,.12,70,700);break;
   case'ui':this.tone(D,'square',660,t,.006,.02,.05,.07,0,3000);this.tone(D,'square',990,t+.04,.006,.02,.06,.06,0,3000);break;
   case'clear':[392,523,659,784,1047,784,1047].forEach((f,i)=>this.tone(D,'square',f,t+i*.11,.01,.07,.08,.08,0,3500));break;
   case'over':[392,349,311,262].forEach((f,i)=>this.tone(D,'triangle',f,t+i*.22,.01,.15,.12,.15));break;
  }},
 // ---- music: seeded procedural synthwave/arcade songs per stage ----
 makeSong(id){let r=id*977+13;const R=()=>{r=(r*16807)%2147483647;return r/2147483647;};const boss=id>=100,menu=id===50;
  const roots=[45,43,41,47,44,42,46,40,48,43];const root=menu?45:boss?40+(id%3):roots[(id-1)%10];
  const minor=[0,2,3,5,7,8,10],phryg=[0,1,3,5,7,8,10];const sc=boss?phryg:minor;
  const progs=[[0,5,2,6],[0,6,5,4],[0,3,5,4],[0,5,3,4],[0,2,5,6]];const pr=boss?[0,1,0,6]:progs[Math.floor(R()*progs.length)];
  const bpm=menu?112:boss?168:136+((id*7)%5)*6;const lead=[];for(let b=0;b<4;b++){const bar=[];for(let s=0;s<16;s++){const on=s%4===0?R()<.85:s%2===0?R()<.55:R()<.25;bar.push(on?(pr[b]+[0,2,4,7][Math.floor(R()*4)]):null);}lead.push(bar);}
  return{root,sc,pr,bpm,lead,boss,menu,arp:R()<.5,dens:boss?1:menu?.4:.75};},
 play(id){if(this.songId===id)return;this.songId=id;this.song=id<0?null:this.makeSong(id);this.step=0;if(this.ac)this.next=this.ac.currentTime+.08;},
 tick(){const ac=this.ac;if(!ac||!this.song||ac.state!=='running'||!SAVE.mus)return;const S=this.song,spb=60/S.bpm/4;if(this.next<ac.currentTime-.2)this.next=ac.currentTime+.05;
  while(this.next<ac.currentTime+.12){this.note(S,this.step,this.next,spb,this.mg);this.next+=spb;this.step++;}},
 nf(S,deg,oct){const d=((deg%7)+7)%7,o=Math.floor(deg/7);return 440*Math.pow(2,(S.root+S.sc[d]+12*(o+oct)-69)/12);},
 note(S,st,t,spb,D){const s=st%16,bar=Math.floor(st/16)%4,sec=Math.floor(st/64)%4,ch=S.pr[bar];
  // drums
  if(!S.menu||sec>0){if(s%4===0)this.tone(D,'sine',150,t,.006,.02,.16,.55,42);
   if(s===4||s===12)this.noise(D,t,.006,.02,.12,.22,'bandpass',1800);
   if(s%2===0||S.boss)this.noise(D,t,.006,.005,.03,s%4===2?.09:.05,'highpass',7000);}
  // bass: octave pumping 8ths
  if(s%2===0){const f=this.nf(S,ch,-2)*(s%4===2?2:1);this.tone(D,'sawtooth',f,t,.006,spb*1.2,.04,.16,0,S.boss?900:700);}
  // pad chord on bar start
  if(s===0&&!S.boss){[0,2,4].forEach(k=>this.tone(D,'triangle',this.nf(S,ch+k,0),t,.08,spb*12,.3,.035));}
  // arp
  if(S.arp&&sec%2===1){const k=[0,2,4,7][s%4];this.tone(D,'square',this.nf(S,ch+k,1),t,.006,spb*.4,.04,.03,0,2500);}
  // lead
  if(sec!==0||S.boss){const n=S.lead[bar][s];if(n!==null&&Math.random()<S.dens+.25){this.tone(D,'square',this.nf(S,n,1),t,.008,spb*1.1,.06,.06,0,3200);this.tone(D,'sawtooth',this.nf(S,n,1)*1.005,t,.008,spb*1.1,.06,.025,0,1800);}}},
};
// ---------- Speech ----------
const VOICE={say(txt){try{if(!SAVE.voice||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(txt);u.lang=voiceLang();u.rate=1.02;u.pitch=1.05;
  const vs=speechSynthesis.getVoices();const b=u.lang.split('-')[0];const v=vs.find(v=>v.lang&&v.lang.toLowerCase().startsWith(b));if(v)u.voice=v;speechSynthesis.speak(u);}catch(e){}},
 stop(){try{window.speechSynthesis&&speechSynthesis.cancel();}catch(e){}}};
function voiceLang(){const m={en:'en-US',th:'th-TH',zh:'zh-CN',hi:'hi-IN',es:'es-ES',ar:'ar-SA',fr:'fr-FR',pt:'pt-BR',ru:'ru-RU',ja:'ja-JP',de:'de-DE',id:'id-ID',ko:'ko-KR',tr:'tr-TR',vi:'vi-VN',it:'it-IT',pl:'pl-PL',nl:'nl-NL',fil:'fil-PH',ms:'ms-MY',bn:'bn-BD'};
 const dev=[...(navigator.languages||[]),navigator.language].filter(Boolean).find(d=>d.toLowerCase().split('-')[0]===LANG||(LANG==='fil'&&/^(tl|fil)/i.test(d)));return dev&&dev.includes('-')?dev:m[LANG]||'en-US';}
function vib(ms){try{SAVE.vib&&navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}
