// Rocket Star Blitz — game core: world, entities, stages, bosses, render loop.
'use strict';
const cv=$('c'),cx=cv.getContext('2d',{alpha:false});
const GW=360;let GH=640,SC=1,DPR=1,SAFE_T=0,SAFE_B=0,QUAL=2;
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
// ---------- pools (preallocated: no GC churn in combat) ----------
function pool(n,f){const a=[];for(let i=0;i<n;i++){const o=f();o.a=false;a.push(o);}a.h=0;return a;}
function take(p){for(let k=0;k<p.length;k++){const i=(p.h+k)%p.length;if(!p[i].a){p.h=i+1;p[i].a=true;return p[i];}}return null;}
const PB=pool(260,()=>({x:0,y:0,vx:0,vy:0,dmg:1,s:null,pierce:0,hom:0,w:4,h:12,t:0})),
 EB=pool(700,()=>({x:0,y:0,vx:0,vy:0,ax:0,ay:0,r:3,s:null,t:0})),
 EN=pool(90,()=>({})),PT=pool(700,()=>({x:0,y:0,vx:0,vy:0,l:0,m:1,sz:1,g:null,k:0,c:''})),
 PK=pool(80,()=>({x:0,y:0,vx:0,vy:0,k:'C',v:1,t:0})),HZ=pool(12,()=>({x:0,t:0,w:18,dur:.7,warn:1.3,sfx:0})),TX=pool(16,()=>({x:0,y:0,t:0,s:'',c:''}));
function clearAll(){[PB,EB,EN,PT,PK,HZ,TX].forEach(p=>p.forEach(o=>o.a=false));}
// ---------- world state ----------
const DIFF=[{hp:.8,spd:.82,fire:.6,gap:1.25,lives:4,name:'easy'},{hp:1,spd:1,fire:1,gap:1,lives:3,name:'normal'},{hp:1.2,spd:1.15,fire:1.4,gap:.82,lives:2,name:'hard'}];
const G={mode:'menu',stage:1,endless:false,sector:0,t:0,dur:80,boss:null,warnT:0,score:0,combo:0,comboT:0,deaths:0,credits:0,shake:0,flash:0,bg:0,ev:[],evI:0,
 contUsed:false,clearT:0,pity:0,scroll:0,lvlSpeed:1,dm:DIFF[1],kills:0,stats:{t:0}};
const P={x:180,y:540,tx:180,ty:540,ship:0,lives:3,shield:0,inv:0,wt:'B',wl:1,bombs:1,spd:0,fcd:0,mcd:0,laser:false,alive:true,bank:0,hitR:3.5,bombT:0,evoT:0,magT:0,x2T:0,downT:0};
const tierOf=()=>clamp(P.wl-1,0,4);const MAXWL=5;
function sf(){return G.endless?1.75+G.sector*.12:1+(G.stage-1)*.085;} // stage difficulty factor
// ---------- particles ----------
function part(x,y,vx,vy,life,sz,g,k){if(PT.lim<=0)return null;const p=take(PT);if(!p)return null;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.l=life;p.m=life;p.sz=sz;p.g=g;p.k=k||0;return p;}
const RINGS=[];function ring(x,y,r,c){RINGS.push({x,y,r,c,t:0});if(RINGS.length>8)RINGS.shift();}
function drawRings(dt){for(let k=RINGS.length-1;k>=0;k--){const o=RINGS[k];o.t+=dt;const p=o.t/.7;if(p>=1){RINGS.splice(k,1);continue;}cx.globalCompositeOperation='lighter';cx.globalAlpha=1-p;cx.strokeStyle=o.c;cx.lineWidth=6*(1-p)+1;cx.beginPath();cx.arc(o.x,o.y,o.r*(.2+p*.8),0,TAU);cx.stroke();cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}}
function boom(x,y,size,cols){const n=Math.round((10+size*1.4)*(QUAL>1?1:.5));const G2=ART.glow;cols=cols||['o','y','p'];
 for(let i=0;i<n;i++){const a=Math.random()*TAU,s=rnd(20,90)*(.5+size/20);part(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(.3,.8),rnd(2,5)*(.6+size/30),G2[cols[i%cols.length]],0);}
 for(let i=0;i<n/2;i++){const a=Math.random()*TAU,s=rnd(80,220)*(.6+size/40);part(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(.2,.45),1.4,G2.w,1);}
 const r=part(x,y,0,0,.35,size*1.6,null,2);if(r)r.c=cols[0];part(x,y,0,0,.18,size*1.2,G2.w,0);}
function text(x,y,s,c){const o=take(TX);if(!o)return;o.x=x;o.y=y;o.t=1.1;o.s=s;o.c=c||'#fff';}
// ---------- enemies ----------
const ED={ // hp, r, score, sprite
 zig:[3,11,100],sine:[4,11,120],vwing:[3,11,110],diver:[6,12,160],kami:[4,11,150],saucer:[20,18,400],shield:[34,15,500],split:[12,12,250],mini:[3,7,60],mine:[8,11,200],
 rock0:[16,20,150],rock1:[7,12,80],rock2:[3,7,40]};
function spawnE(type,x,y,o){const e=take(EN);if(!e)return null;const d=ED[type];for(const k in e)if(k!=='a')delete e[k];
 e.type=type;e.x=x;e.y=y;e.vx=0;e.vy=0;e.t=0;e.fl=0;e.hp=Math.ceil(d[0]*sf()*G.dm.hp*(type.startsWith('rock')?.8:1));e.mhp=e.hp;e.r=d[1];e.sc=d[2];e.x0=x;e.fcd=rnd(.8,2.2)/(G.dm.fire);e.rot=0;
 if(type.startsWith('rock')){const si=+type[4];e.si=si;e.var=(Math.random()*3)|0;e.vr=rnd(-1.5,1.5);e.ice=G.bg===2;}
 if(o)Object.assign(e,o);return e;}
function eShoot(e,ang,spd,spr,r){const b=take(EB);if(!b)return null;spd*=G.dm.spd*(1+(sf()-1)*.35);b.x=e.x;b.y=e.y;b.vx=Math.cos(ang)*spd;b.vy=Math.sin(ang)*spd;b.ax=0;b.ay=0;b.r=r||3;b.s=spr||ART.spr.eb;b.t=0;return b;}
function aim(e){return Math.atan2(P.y-e.y,P.x-e.x);}
function updE(e,dt){e.t+=dt;if(e.fl>0)e.fl-=dt;const t=e.t,f=sf();
 switch(e.type){
  case'zig':e.y+=(70+f*12)*dt;e.x+=e.dir*(90+f*10)*dt;if(e.x<20||e.x>GW-20){e.dir*=-1;e.x=clamp(e.x,20,GW-20);}break;
  case'sine':e.y+=(60+f*10)*dt;e.x=e.x0+Math.sin(t*2.4+e.ph)*e.amp;break;
  case'mini':e.y+=95*dt;e.x+=e.vx*dt;if(e.x<12||e.x>GW-12)e.vx*=-1;break;
  case'vwing':if(t<1.6)e.y+=(e.ty-e.y)*dt*2.4;else if(t<5)e.x+=Math.sin(t*1.5)*40*dt;else e.y+=(t-5)*160*dt;break;
  case'diver':if(t<1.1)e.y+=(e.ty-e.y)*dt*3;else{if(!e.dv){e.dv=1;e.vx=(P.x-e.x)*.9;e.vy=60;}e.vy+=420*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;}break;
  case'kami':if(t<.8){e.y+=80*dt;e.ang=aim(e);}else{const s=Math.min(520,(t-.8)*700+60)*(.85+f*.1);e.x+=Math.cos(e.ang)*s*dt;e.y+=Math.sin(e.ang)*s*dt;}break;
  case'saucer':if(t<1.5)e.y+=(e.ty-e.y)*dt*2.5;else if(t<7)e.x=e.x0+Math.sin((t-1.5)*1.3)*60;else e.y+=120*dt;e.x0=clamp(e.x0,70,GW-70);break;
  case'shield':e.y+=26*dt;e.shOn=(t%3.2)<2.2;break;
  case'split':e.y+=45*dt;e.x=e.x0+Math.sin(t*1.6)*40;break;
  case'mine':e.y+=40*dt;e.x+=Math.sin(t*2)*15*dt;if(t>6.5){mineBurst(e,1);e.a=false;return;}break;
  default:e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot+=e.vr*dt;}
 // firing
 if(e.y>20&&e.y<GH*.7&&!e.type.startsWith('rock')&&e.type!=='kami'&&e.type!=='mine'){e.fcd-=dt;if(e.fcd<=0){const fr=G.dm.fire*(.6+f*.4);
  switch(e.type){
   case'saucer':{const a=aim(e);const n=G.stage>=5||G.endless?5:3;for(let i=0;i<n;i++)eShoot(e,a+(i-(n-1)/2)*.2,150,ART.spr.eb2);e.fcd=1.3/fr;break;}
   case'shield':{for(let i=-1;i<=1;i++)eShoot(e,Math.PI/2+i*.35,120,ART.spr.eb3,4);e.fcd=1.5/fr;break;}
   case'vwing':if(t>1.5&&t<5){eShoot(e,aim(e),140,ART.spr.ebN,2.8);e.fcd=rnd(1.6,2.8)/fr;}else e.fcd=.3;break;
   default:if(G.stage>=2||G.endless||Math.random()<.4)eShoot(e,aim(e),130);e.fcd=rnd(2,3.6)/fr;}}}
 if(e.y>GH+40||e.y<-140||e.x<-80||e.x>GW+80)e.a=false;}
function mineBurst(e,big){const n=big?12:8;for(let i=0;i<n;i++)eShoot(e,i/n*TAU+e.t,big?110:90,ART.spr.eb);boom(e.x,e.y,10,['p','v','w']);AU.sfx('pop');}
function killE(e){e.a=false;G.kills++;G.combo++;G.comboT=1.7;const m=comboMul();const sc=e.sc*m*(P.x2T>0?2:1);G.score+=sc;AU.sfx(e.r>14?'boom':'pop');
 const cm={zig:['g','c','w'],sine:['v','p','w'],vwing:['p','y','w'],diver:['y','o','w'],kami:['r','o','y'],saucer:['c','b','w'],shield:['b','c','y'],split:['o','y','w'],mini:['o','y'],mine:['p','v']}[e.type]||['o','y','w'];
 boom(e.x,e.y,e.r,cm);if(e.r>14)G.shake=Math.max(G.shake,4);
 if(e.type==='split')for(let s=-1;s<=1;s+=2)spawnE('mini',e.x+s*8,e.y,{vx:s*80});
 if(e.type==='mine')mineBurst(e,0);
 if(e.type.startsWith('rock')&&e.si<2)for(let s=-1;s<=1;s+=2)spawnE('rock'+(e.si+1),e.x,e.y,{vx:e.vx+s*rnd(30,70),vy:e.vy*.8+rnd(-10,20)});
 // drops
 const nc=e.r>14?4:e.type.startsWith('rock')?(e.si===0?2:0):1;for(let i=0;i<nc;i++)drop(e.x+rnd(-8,8),e.y+rnd(-8,8),'C');
 const big=e.type==='saucer'||e.type==='shield';G.pity+=big?3:1;
 if(Math.random()<(big?.55:.06)||G.pity>34){G.pity=0;drop(e.x,e.y,pickPU());}
 if(m>1&&e.r>10)text(e.x,e.y-10,'+'+sc,'#ffe14a');}
function pickPU(){const r=Math.random()*100;return r<17?'S':r<32?'L':r<45?'H':r<56?'W':r<66?'P':r<74?'B':r<80?'V':r<85?'U':r<93?'M':'X';}
function drop(x,y,k){const p=take(PK);if(!p)return;p.x=x;p.y=y;p.vx=rnd(-30,30);p.vy=k==='C'?rnd(-60,-20):-40;p.k=k;p.t=0;p.v=1;}
function comboMul(){return Math.min(8,1+Math.floor(G.combo/8));}
// ---------- hazards ----------
function laserHaz(x){const h=take(HZ);if(!h)return;h.x=x;h.t=0;h.w=20;h.warn=1.35/Math.min(1.3,G.dm.spd);h.dur=.75;h.sfx=0;}
// ---------- stage scripting ----------
const STAGE_NAMES=['n1','n2','n3','n4','n5','n6','n7','n8','n9','n10'];
function wave(kind){const f=sf(),cx2=rnd(60,GW-60);
 switch(kind){
  case'zigline':{const n=4+Math.min(4,f|0);for(let i=0;i<n;i++)later(i*.28,()=>spawnE('zig',cx2,-20,{dir:i%2?1:-1}));break;}
  case'sine':{const n=5+Math.min(3,f|0),x=rnd(90,GW-90);for(let i=0;i<n;i++)later(i*.3,()=>spawnE('sine',x,-20,{amp:rnd(50,80),ph:0}));break;}
  case'vform':{const n=5+(f>1.5?2:0);for(let i=0;i<n;i++){const k=i-(n-1)/2;spawnE('vwing',GW/2+k*38,-30-Math.abs(k)*24,{ty:GH*.18+Math.abs(k)*-14+60});}break;}
  case'divers':{for(let i=0;i<3+(f>1.6?1:0);i++)later(i*.45,()=>spawnE('diver',rnd(40,GW-40),-20,{ty:rnd(70,170)}));break;}
  case'kami':{for(let i=0;i<3+Math.min(3,(f*1.2)|0);i++)later(i*.35,()=>spawnE('kami',rnd(30,GW-30),-20));break;}
  case'saucer':{const n=f>1.5?2:1;for(let i=0;i<n;i++)spawnE('saucer',n===1?cx2:(i?GW*.72:GW*.28),-24,{ty:rnd(110,190)});break;}
  case'shield':{spawnE('shield',cx2,-20);for(let i=0;i<3;i++)later(.5+i*.3,()=>spawnE('zig',cx2,-20,{dir:i%2?1:-1}));break;}
  case'split':{for(let i=0;i<2+(f>1.5?1:0);i++)later(i*.6,()=>spawnE('split',rnd(70,GW-70),-20));break;}
  case'mines':{for(let i=0;i<3;i++)later(i*.5,()=>spawnE('mine',rnd(40,GW-40),-20));break;}
  case'rocks':{const n=6+Math.min(6,(f*2)|0);for(let i=0;i<n;i++)later(i*.35,()=>spawnE(Math.random()<.45?'rock0':'rock1',rnd(10,GW-10),-30,{vx:rnd(-35,35),vy:rnd(60,110)*(G.bg===6?1.6:1)}));break;}
  case'laser':{const n=f>1.7?2:1;for(let i=0;i<n;i++)later(i*.9,()=>laserHaz(clamp(P.x+rnd(-60,60),20,GW-20)));break;}
  case'swarm':{for(let i=0;i<10;i++)later(i*.18,()=>spawnE('mini',rnd(20,GW-20),-15,{vx:rnd(-60,60)}));break;}}}
const LATER=[];function later(d,fn){LATER.push([G.t+d,fn]);}
function stagePools(s){const p=['zigline','sine','vform'];if(s>=1)p.push('saucer');if(s>=2)p.push('rocks','divers');if(s>=3)p.push('kami','shield');if(s>=4)p.push('split','laser');if(s>=5)p.push('mines');if(s>=7)p.push('swarm');
 const extra={2:['rocks','rocks'],3:['rocks','kami'],4:['saucer','laser'],5:['split','mines'],6:['laser','laser','kami'],7:['rocks','rocks','swarm'],8:['rocks','saucer','shield'],9:['swarm','swarm','split','divers'],10:['laser','mines','shield','saucer']}[s]||[];return p.concat(extra);}
function buildStage(){G.ev=[];const s=G.endless?1+((G.sector)%10):G.stage;const f=sf();G.dur=G.endless?62:(66+G.stage*4.5);
 const pools=stagePools(G.endless?10:s);let t=2.2;const gap=Math.max(1.35,3.3-f*.55)*G.dm.gap;
 G.ev.push([1.2,'zigline']);while(t<G.dur-3){const k=pools[(Math.random()*pools.length)|0];G.ev.push([t,k]);if(f>1.35&&Math.random()<(f-1.2)*.45)G.ev.push([t+.6,pools[(Math.random()*pools.length)|0]]);t+=gap*rnd(.8,1.25);}
 if(s===1)G.ev=G.ev.filter(e=>e[0]>26||e[1]!=='saucer');G.ev.sort((a,b)=>a[0]-b[0]);G.evI=0;}
// ---------- boss ----------
const BOSS_PAT=[['aimFan','turrets','ring'],['rain','aimFan','minionsD'],['ring','wall','turrets'],['spiral','aimFan','beam'],['flower','minionsK','rain'],['beam','wall','spiral'],['spiral','flower','aimFan'],['wall','turrets','beam','rain'],['minionsK','flower','spiral','ring'],['spiral','beam','flower','wall','aimFan','turrets']];
const BOSS_EXTRA=['spiral','wall','beam','spiral','aimFan','ring','beam','flower','beam','minionsD'];
function startBoss(){const i=G.endless?G.sector%10:G.stage-1;const D=BOSS_DEF[i];const f=sf();
 const nt=2+Math.min(2,Math.floor((G.endless?10:G.stage)/3));const tur=[];const hw=D[1]/2,hh=D[2]/2;
 for(let k=0;k<nt;k++){const fx=nt===1?0:(k/(nt-1)-.5)*1.5;tur.push({ox:fx*hw*.8,oy:hh*(.15+Math.abs(fx)*-.05)+(k%2?10:-6),hp:Math.round((30+f*18)*G.dm.hp),mhp:0,alive:true,ang:Math.PI/2,cd:rnd(.5,1.5),fl:0});}
 tur.forEach(t=>t.mhp=t.hp);
 const hp=Math.round((300+(G.endless?11:G.stage)*105)*G.dm.hp*(G.endless?1+G.sector*.1:1));
 G.boss={i,D,x:GW/2,y:-hh-20,w:D[1],h:D[2],hp,mhp:hp,phase:0,t:0,pt:0,pi:0,pat:BOSS_PAT[i].slice(),cur:null,cur2:null,fl:0,spr:ART.bossSpr[i]||(ART.bossSpr[i]=bossSpr(i)),tur,dead:0,sa:0,beam:null,coreOy:hh*.25};
 if(G.endless&&G.sector>=10)G.boss.pat.push(BOSS_EXTRA[i]);
 AU.play(100+i);}
function bossFireCore(B,a,spd,spr,r){const b=eShoot({x:B.x,y:B.y+B.coreOy},a,spd,spr,r);return b;}
function bossUpd(B,dt){B.t+=dt;if(B.fl>0)B.fl-=dt;const hh=B.h/2;
 if(B.dead){B.dead+=dt;if(Math.random()<.32)boom(B.x+rnd(-B.w/2,B.w/2)*.8,B.y+rnd(-hh,hh)*.8,rnd(10,22),['o','y','p','c']);if(Math.random()<.15)AU.sfx('boom');G.shake=6;
  if(!B.dk)B.dk=0;const st=[.05,.9,1.8,2.5];while(B.dk<st.length&&B.dead>st[B.dk]){const k=B.dk++;ring(B.x+(k%3?rnd(-B.w,B.w)*.3:0),B.y+rnd(-10,10),40+k*30,k===3?'#ffffff':B.D[3]);boom(B.x+rnd(-B.w,B.w)*.3,B.y+rnd(-hh,hh)*.5,26+k*6,['w','y','o']);AU.sfx('bigboom');G.flash=Math.max(G.flash,.35);G.shake=10;}
  if(B.dead>2.9){boom(B.x,B.y,60,['w','y','o','p']);boom(B.x,B.y,40,['c','w']);ring(B.x,B.y,260,'#ffffff');ring(B.x,B.y,170,B.D[3]);ring(B.x,B.y,110,B.D[4]);AU.sfx('bigboom');G.flash=1;G.shake=14;vib(300);G.boss=null;stageClear();}return;}
 const ent=B.t<3;if(ent){B.y+=((GH*.2)-B.y)*dt*1.6;return;}
 B.x=GW/2+Math.sin((B.t-3)*.45)*GW*.16;B.y=GH*.2+Math.sin(B.t*1.3)*8;
 const fr=B.hp/B.mhp;const ph=fr<.34?2:fr<.67?1:0;if(ph>B.phase){B.phase=ph;if(ph===1)B.pat.push(BOSS_EXTRA[B.i]);text(B.x,B.y+hh,'!!','#ff4f6a');AU.sfx('warn');G.shake=8;
  for(let i=0;i<10;i++)bossFireCore(B,i/10*TAU+.15,90,ART.spr.eb3,3.6);B.pt=Math.max(B.pt,1.2);B.cur=null;B.cur2=null;B.beam=null;}
 const spdM=(1+B.phase*.1)*(G.dm.fire>1?1.15:G.dm.fire<1?.8:1);
 // pattern scheduler
 B.pt-=dt;if(B.pt<=0){B.pi++;B.cur={k:B.pat[B.pi%B.pat.length],t:0,c:0,a:Math.random()*TAU};B.pt=4.6;B.cur2=null;
  if(B.phase===2&&(G.stage>=7||G.endless))B.cur2={k:B.pat[(B.pi+1)%B.pat.length],t:0,c:0,a:0};if(B.cur2&&B.cur2.k===B.cur.k)B.cur2=null;
  if(B.cur2&&(B.cur2.k==='beam'||B.cur.k==='beam'))B.cur2=null;}
 [B.cur,B.cur2].forEach(c=>{if(c&&c.t<3.2)runPat(B,c,dt*spdM,c===B.cur2);});
 // turrets
 B.tur.forEach(t=>{if(!t.alive)return;if(t.fl>0)t.fl-=dt;const tx=B.x+t.ox,ty=B.y+t.oy;t.ang=Math.atan2(P.y-ty,P.x-tx);t.cd-=dt*spdM;
  if(t.cd<=0){t.cd=(B.cur&&B.cur.k==='turrets'?.62:2.3)/G.dm.fire;eShoot({x:tx,y:ty},t.ang,125,ART.spr.eb2);}});
 // beam
 if(B.beam){const bm=B.beam;bm.t+=dt;if(bm.t<1.15){bm.x+=(P.x-bm.x)*dt*1.5;}if(bm.t>2.9)B.beam=null;}}
function runPat(B,c,dt,sec){c.t+=dt;const f=sf(),hh=B.h/2;const every=(iv)=>{if(c.t>=c.c*iv){c.c++;return true;}return false;};
 switch(c.k){
  case'aimFan':if(every(.95)){const n=3+B.phase,a=Math.atan2(P.y-B.y-B.coreOy,P.x-B.x);for(let i=0;i<n;i++)bossFireCore(B,a+(i-(n-1)/2)*.22,125+f*6);}break;
  case'ring':if(every(1.2)){const n=10+Math.min(6,(f*3)|0);for(let i=0;i<n;i++)bossFireCore(B,c.a+i/n*TAU+(c.c%2)*Math.PI/n,88+f*6,ART.spr.eb4,2.8);}break;
  case'spiral':if(every(.14)){const arms=2+(B.phase>1&&B.i>=4?1:0);for(let k=0;k<arms;k++)bossFireCore(B,c.a+k*TAU/arms+c.t*1.6*(sec?-1:1),100+f*5,ART.spr.eb,3);}break;
  case'flower':if(every(1.0)){const n=8;for(let i=0;i<n;i++){bossFireCore(B,c.a+i/n*TAU+c.c*.2,78,ART.spr.eb3,3.6);bossFireCore(B,c.a+(i+.5)/n*TAU+c.c*.2,120,ART.spr.eb,3);}}break;
  case'turrets':break;
  case'wall':if(every(1.6)){const gx=clamp(P.x+rnd(-70,70),55,GW-55),gw=Math.max(84,104-f*4);for(let x=8;x<GW;x+=19){if(Math.abs(x-gx)<gw/2)continue;const b=take(EB);if(!b)break;b.x=x;b.y=B.y+hh*.5;b.vx=0;b.vy=(82+f*5)*G.dm.spd;b.ax=0;b.ay=0;b.r=3.2;b.s=ART.spr.eb3;b.t=0;}}break;
  case'rain':if(every(.17)){const b=take(EB);if(b){b.x=B.x+rnd(-B.w/2,B.w/2)*.9;b.y=B.y+hh*.4;b.vx=rnd(-20,20);b.vy=rnd(95,150)*G.dm.spd;b.ax=0;b.ay=0;b.r=3;b.s=ART.spr.eb2;b.t=0;}}break;
  case'minionsD':if(every(1.6)&&c.c<3){spawnE('diver',B.x+(c.c%2?-1:1)*B.w*.35,B.y,{ty:B.y+60});}break;
  case'minionsK':if(every(1.6)&&c.c<3){spawnE('kami',B.x+(c.c%2?-1:1)*B.w*.3,B.y+20);}break;
  case'beam':if(c.c===0){c.c=1;B.beam={x:P.x,t:0};AU.sfx('charge');setTimeout(()=>{if(G.boss===B)AU.sfx('beam');},1600);}
   if(B.i>=6&&c.t>1.7&&c.t<2.8&&every(.5)){const a=Math.atan2(P.y-B.y,P.x-B.x);bossFireCore(B,a+.5,130);bossFireCore(B,a-.5,130);}break;}}
function bossHit(B,x,y,dmg){if(B.t<3||B.dead)return false;const hh=B.h/2;
 for(const t of B.tur){if(!t.alive)continue;const dx=x-(B.x+t.ox),dy=y-(B.y+t.oy);if(dx*dx+dy*dy<13*13){t.hp-=dmg;t.fl=.06;if(t.hp<=0){t.alive=false;boom(B.x+t.ox,B.y+t.oy,22,['o','y','w']);AU.sfx('boom');G.shake=7;damageBoss(B,B.mhp*.06);G.score+=2000;}return true;}}
 const cdx=x-B.x,cdy=y-(B.y+B.coreOy);if(cdx*cdx+cdy*cdy<18*18){damageBoss(B,dmg*1.6);return true;}
 const ex=(x-B.x)/(B.w*.48),ey=(y-B.y)/(hh*.78);if(ex*ex+ey*ey<1){damageBoss(B,dmg*.75);return true;}return false;}
function damageBoss(B,d){B.hp-=d;B.fl=.05;G.score+=Math.round(d*5);if(B.hp<=0&&!B.dead){B.hp=0;B.dead=.01;B.beam=null;B.cur=null;B.cur2=null;EB.forEach(b=>{if(b.a){b.a=false;part(b.x,b.y,0,-20,.3,2,ART.glow.y);}});AU.play(-1);G.score+=20000*(G.endless?2:1)*(1+G.stage*.2|0);
  const n=30+G.stage*4;for(let i=0;i<n;i++)drop(B.x+rnd(-B.w/3,B.w/3),B.y+rnd(-30,30),'C');drop(B.x,B.y,'W');}}
// ---------- player ----------
const SHIPS=[{n:'Blaze Kite',fi:.11,hp:0},{n:'Zephyr Dart',fi:.085,hp:0},{n:'Ember Titan',fi:.16,hp:1}];
function pShot(x,y,a,spd,dmg,s,pierce,w,h){const b=take(PB);if(!b)return;b.x=x;b.y=y;b.vx=Math.sin(a)*spd;b.vy=-Math.cos(a)*spd;b.dmg=dmg;b.s=s;b.pierce=pierce||0;b.hom=0;b.w=w||5;b.h=h||14;b.t=0;}
function fire(dt){const sh=P.ship,L=P.wl,dm=(1+SAVE.upg.dmg*.12),S=ART.spr;P.fcd-=dt;P.mcd-=dt;P.laser=P.wt==='L';
 const fi=SHIPS[sh].fi*(1-SAVE.upg.rate*.07);
 if(P.wt==='H'&&P.mcd<=0){P.mcd=.42-L*.04;for(let i=0;i<Math.min(5,L+(sh===1?1:0));i++){const b=take(PB);if(!b)break;const s=i%2?1:-1;b.x=P.x+s*12;b.y=P.y;b.vx=s*120;b.vy=-140;b.dmg=2.6*dm;b.s=S.mis;b.pierce=0;b.hom=1;b.w=5;b.h=10;b.t=0;}AU.sfx('missile');}
 if(P.fcd>0)return;P.fcd=fi*(P.wt==='S'?1.12:1);const y=P.y-20;
 if(P.wt==='L'){P.fcd=fi*1.6;pShot(P.x-9,y+8,0,700,.6*dm,S.pb);pShot(P.x+9,y+8,0,700,.6*dm,S.pb);return;}
 if(P.wt==='S'){const n=Math.min(9,1+L*2),sp=.1+L*.03;for(let i=0;i<n;i++)pShot(P.x,y,(i-(n-1)/2)*sp,620,.8*dm,S.pbS);AU.sfx('shot');return;}
 if(P.wt==='H'){pShot(P.x-5,y,0,700,.8*dm,S.pb);pShot(P.x+5,y,0,700,.8*dm,S.pb);AU.sfx('shot');return;}
 // base weapon per ship
 if(sh===0){pShot(P.x-6,y,0,720,dm,S.pb);pShot(P.x+6,y,0,720,dm,S.pb);if(L>=2){pShot(P.x-12,y+8,-.12,700,dm,S.pb);pShot(P.x+12,y+8,.12,700,dm,S.pb);}if(L>=3){pShot(P.x-2,y-4,0,720,dm,S.pb);pShot(P.x+2,y-4,0,720,dm,S.pb);}if(L>=4){pShot(P.x-16,y+10,-.25,680,dm,S.pb);pShot(P.x+16,y+10,.25,680,dm,S.pb);}if(L>=5){pShot(P.x-22,y+12,-.4,660,dm,S.pb);pShot(P.x+22,y+12,.4,660,dm,S.pb);}}
 else if(sh===1){const n=Math.min(9,1+L*2);for(let i=0;i<n;i++)pShot(P.x+(i-(n-1)/2)*3,y,(i-(n-1)/2)*.075,700,.85*dm,S.pbS);}
 else{const n=Math.min(3,L);for(let i=0;i<n;i++)pShot(P.x+(i-(n-1)/2)*12,y,0,640,2.8*dm,S.pbT,1,8,20);if(L>=4){pShot(P.x-14,y+8,-.2,620,1.6*dm,S.pbT,0,8,20);pShot(P.x+14,y+8,.2,620,1.6*dm,S.pbT,0,8,20);}if(L>=5){pShot(P.x-22,y+12,-.4,600,1.4*dm,S.pbT,0,8,20);pShot(P.x+22,y+12,.4,600,1.4*dm,S.pbT,0,8,20);}}
 AU.sfx('shot');}
function laserDmg(dt){const L=P.wl,w=7+L*4,dps=(30+L*11)*(1+SAVE.upg.dmg*.12)*(P.ship===2?1.25:1),d=dps*dt;let top=-20;
 // beam stops at first boss hull; pierces small enemies
 EN.forEach(e=>{if(!e.a||e.y>P.y)return;if(Math.abs(e.x-P.x)<w/2+e.r){hitE(e,d,true);}});
 const B=G.boss;if(B&&!B.dead&&B.t>=3&&Math.abs(B.x-P.x)<B.w*.45){let hitT=false;for(const t of B.tur){if(t.alive&&Math.abs(B.x+t.ox-P.x)<w/2+10){bossHit(B,B.x+t.ox,B.y+t.oy,d);hitT=true;top=B.y+t.oy;break;}}if(!hitT){const cy=Math.abs(B.x-P.x)<18?B.y+B.coreOy:B.y+B.h*.3;bossHit(B,P.x,cy,d);top=cy;}}
 P.ltop=top;if(Math.random()<.5)part(P.x+rnd(-w/2,w/2),top+4,rnd(-40,40),rnd(20,80),.25,2,ART.glow.c);AU.sfx('laser');}
function hitE(e,d,beam){if(e.type==='shield'&&e.shOn&&!beam){AU.sfx('deflect');e.fl=.04;return false;}if(e.type==='shield'&&e.shOn&&beam)d*=.25;
 e.hp-=d;e.fl=.06;if(e.hp<=0)killE(e);else if(!beam)AU.sfx('hit');return true;}
function hurt(){if(P.inv>0||!P.alive)return;if(DBG.god){P.inv=.5;return;}
 if(P.shield>0){P.shield--;P.inv=1.3;AU.sfx('shieldhit');vib(40);clearNear(80);return;}
 if(P.wl>1){P.wl--;setTier();P.inv=1.6;P.downT=.6;G.combo=0;G.shake=9;G.flash=.35;boom(P.x,P.y,18,['o','c','w']);AU.sfx('tierdown');vib(90);clearNear(110);text(P.x,P.y-34,T('tierDown'),'#ffb35a');return;}
 P.lives--;G.deaths++;G.combo=0;P.wl=1;setTier();P.inv=2.4;P.spd=Math.max(0,P.spd-1);G.shake=12;G.flash=.6;boom(P.x,P.y,26,['o','c','w']);AU.sfx('hurt');vib(160);clearNear(140);P.bombs=Math.max(P.bombs,2);
 if(P.lives<0){P.alive=false;P.lives=0;setTimeout(()=>gameOver(),1200);}}
function clearNear(r){EB.forEach(b=>{if(b.a&&Math.hypot(b.x-P.x,b.y-P.y)<r){b.a=false;part(b.x,b.y,0,0,.25,2.5,ART.glow.c);}});}
function useBomb(){if(G.mode!=='play'||P.bombs<=0||!P.alive||P.bombT>0)return;P.bombs--;P.bombT=1.2;P.inv=Math.max(P.inv,1.6);AU.sfx('bomb');vib(120);G.shake=14;G.flash=.9;
 EB.forEach(b=>{if(b.a){b.a=false;if(Math.random()<.4)part(b.x,b.y,0,-30,.4,3,ART.glow.y);}});HZ.forEach(h=>h.a=false);
 EN.forEach(e=>{if(e.a&&e.y>-10)hitE(e,40*sf(),true);});if(G.boss&&!G.boss.dead&&G.boss.t>=3)damageBoss(G.boss,G.boss.mhp*.04);const r=part(P.x,P.y,0,0,.9,220,null,2);if(r)r.c='y';}
function setTier(){P.hitR=3.5+tierOf()*.3;}
function evolve(){P.evoT=.9;setTier();AU.sfx('evolve');vib(60);G.flash=Math.max(G.flash,.25);const r=part(P.x,P.y,0,0,.6,70,null,2);if(r)r.c='255,255,255';const r2=part(P.x,P.y,0,0,.45,45,null,2);if(r2)r2.c=hexRGB(TIER_COL[tierOf()]);
 for(let i=0;i<14;i++){const a=i/14*TAU;part(P.x,P.y,Math.cos(a)*140,Math.sin(a)*140,.5,3,ART.glow[i%2?'c':'y'],0);}text(P.x,P.y-64,T('evolve'),TIER_COL[tierOf()]);}
function hexRGB(h){const n=parseInt(h.slice(1),16);return (n>>16)+','+((n>>8)&255)+','+(n&255);}
function pickup(k,x,y){AU.sfx(k==='C'?'coin':'power');
 if(k==='C'){G.credits+=1;G.score+=10*(P.x2T>0?2:1);if(QUAL>0)part(x,y,0,0,.18,2.5,ART.glow.y,0);return;}
 // pickup burst
 const r=part(x,y,0,0,.4,30,null,2);if(r)r.c=hexRGB(PU_COL[k]);if(QUAL>0)for(let i=0;i<8;i++){const a=i/8*TAU;part(x,y,Math.cos(a)*90,Math.sin(a)*90,.35,1.4,ART.glow.w,1);}
 const nm={S:'pSpread',L:'pLaser',H:'pHoming',W:'pPower',P:'pShield',B:'pBomb',V:'pSpeed',U:'pLife',M:'pMagnet',X:'pScore2'}[k];const t0=tierOf();
 if('SLHW'.includes(k)){if(k!=='W')P.wt=k;P.wl=Math.min(MAXWL,P.wl+1);text(x,y-16,T(nm)+(P.wl>=MAXWL?' MAX':' Lv'+P.wl),PU_COL[k]);if(tierOf()>t0)evolve();}
 else{if(k==='P')P.shield=Math.min(4,P.shield+1);if(k==='B')P.bombs=Math.min(5,P.bombs+1);if(k==='V')P.spd=Math.min(3,P.spd+1);if(k==='U')P.lives=Math.min(9,P.lives+1);if(k==='M')P.magT=12;if(k==='X')P.x2T=12;text(x,y-16,T(nm),PU_COL[k]);}
 G.score+=500;}
// ---------- stage flow ----------
function startStage(n,endless){G.endless=!!endless;G.stage=endless?10:n;G.sector=endless?(G.sector||0):0;G.dm=DIFF[SAVE.diff];
 clearAll();RINGS.length=0;LATER.length=0;G.t=0;G.boss=null;G.warnT=0;G.deaths=0;G.combo=0;G.contUsed=false;G.clearT=0;G.pity=0;G.kills=0;G.credits=0;G.bg=endless?G.sector%10:n-1;
 if(!endless||G.sector===0){G.score=0;P.ship=SAVE.ship;P.lives=G.dm.lives-1+SHIPS[P.ship].hp;P.wt='B';P.wl=1;P.bombs=2;P.spd=0;}setTier();P.evoT=0;P.magT=0;P.x2T=0;P.downT=0;
 P.shield=[0,1,1,2,3][SAVE.upg.shd]+(P.ship===2?1:0);P.x=P.tx=GW/2;P.y=P.ty=GH-110;P.inv=2;P.alive=true;P.bombT=0;
 Ads.stageRewards=0;buildStage();setBG(G.bg);G.mode='play';AU.play(G.endless?1+(G.sector%10):G.stage);UI.hud(true);LOG('stage',G.stage,'endless',G.endless,G.sector);}
function stageClear(){G.mode='clear';G.clearT=0;AU.play(-1);AU.sfx('clear');const s=G.stage;
 if(G.endless){G.sector++;SAVE.endBest=Math.max(SAVE.endBest,G.sector);SAVE.cr+=G.credits;if(G.score>SAVE.hi)SAVE.hi=G.score;persist();setTimeout(()=>UI.endlessNext(),1800);return;}
 const stars=G.deaths===0?3:G.deaths===1?2:1;SAVE.stars[s-1]=Math.max(SAVE.stars[s-1]||0,stars);const nb=G.score>(SAVE.best[s-1]||0);if(nb)SAVE.best[s-1]=G.score;if(G.score>SAVE.hi)SAVE.hi=G.score;
 SAVE.reached=Math.max(SAVE.reached,Math.min(10,s+1));if(s===10)SAVE.cleared=1;SAVE.cr+=G.credits;persist();
 setTimeout(()=>UI.result(true,{stars,nb}),1800);}
function gameOver(){if(G.mode!=='play')return;G.mode='over';AU.play(-1);AU.sfx('over');SAVE.cr+=G.credits;if(G.score>SAVE.hi)SAVE.hi=G.score;if(G.endless)SAVE.endBest=Math.max(SAVE.endBest,G.sector);persist();UI.result(false,{});}
function revive(){G.mode='play';P.alive=true;P.lives=1;P.inv=3;P.bombs=Math.max(P.bombs,2);P.x=P.tx=GW/2;P.y=P.ty=GH-110;EB.forEach(b=>b.a=false);G.contUsed=true;SAVE.cr-=G.credits;G.credits=0;AU.play(G.boss?100+G.boss.i:G.endless?1+G.sector%10:G.stage);UI.hud(true);}
// ---------- update ----------
function update(dt){if(G.mode!=='play'&&G.mode!=='clear'&&G.mode!=='over'&&G.mode!=='menu')return;G.scroll+=dt;
 if(G.mode==='menu'){menuUpd(dt);return;}
 G.t+=dt;G.stats.t+=dt;if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0;}if(G.shake>0)G.shake=Math.max(0,G.shake-dt*30);if(G.flash>0)G.flash-=dt*2.2;
 // timeline
 if(G.mode==='play'){while(G.evI<G.ev.length&&G.ev[G.evI][0]<=G.t){wave(G.ev[G.evI][1]);G.evI++;}
  for(let i=LATER.length-1;i>=0;i--)if(LATER[i][0]<=G.t){const f=LATER[i][1];LATER.splice(i,1);f();}
  if(!G.boss&&G.warnT===0&&G.t>=G.dur+2.5){G.warnT=3;AU.play(-1);AU.sfx('warn');}
  if(G.warnT>0){G.warnT-=dt;if(G.warnT<=0){G.warnT=-1;startBoss();}}}
 // player
 if(P.alive&&G.mode==='play'){const kx=(KEY.r-KEY.l),ky=(KEY.d-KEY.u);const ms=(300+P.spd*70);if(kx||ky){P.tx+=kx*ms*dt;P.ty+=ky*ms*dt;}
  P.tx=clamp(P.tx,14,GW-14);P.ty=clamp(P.ty,60+SAFE_T,GH-24-SAFE_B);const dx=P.tx-P.x,dy=P.ty-P.y,d=Math.hypot(dx,dy),mx=(560+P.spd*130)*dt;
  if(d>mx){P.x+=dx/d*mx;P.y+=dy/d*mx;}else{P.x=P.tx;P.y=P.ty;}P.bank+=((clamp(dx*.08,-1,1))-P.bank)*Math.min(1,dt*10);
  if(P.inv>0)P.inv-=dt;if(P.bombT>0)P.bombT-=dt;if(P.evoT>0)P.evoT-=dt;if(P.downT>0)P.downT-=dt;if(P.magT>0)P.magT-=dt;if(P.x2T>0)P.x2T-=dt;fire(dt);if(P.laser)laserDmg(dt);
  if(QUAL>0&&Math.random()<.8){const tr=tierOf(),gc=ART.glow[['b','c','g','y','w'][tr]],ey=P.y+18+tr*1.5;part(P.x-5+rnd(-1,1),ey,rnd(-10,10),rnd(120,200),.22,3+tr*.3,gc);part(P.x+5+rnd(-1,1),ey,rnd(-10,10),rnd(120,200),.22,3+tr*.3,ART.glow.c);}}
 // player bullets
 for(const b of PB){if(!b.a)continue;b.t+=dt;
  if(b.hom){let best=null,bd=1e9;EN.forEach(e=>{if(e.a&&e.y>0){const dd=(e.x-b.x)**2+(e.y-b.y)**2;if(dd<bd){bd=dd;best=e;}}});let tx,ty;if(best){tx=best.x;ty=best.y;}else if(G.boss&&G.boss.t>3){tx=G.boss.x;ty=G.boss.y+G.boss.coreOy;}
   if(tx!==undefined){const a=Math.atan2(ty-b.y,tx-b.x),sp=Math.min(520,Math.hypot(b.vx,b.vy)+500*dt);const ca=Math.atan2(b.vy,b.vx);let da=a-ca;while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;const na=ca+clamp(da,-6*dt,6*dt);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;}else b.vy-=400*dt;
   if(Math.random()<.5)part(b.x,b.y,0,0,.25,2,ART.glow.g);}
  b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y<-20||b.x<-20||b.x>GW+20||b.y>GH+20||b.t>3){b.a=false;continue;}
  for(const e of EN){if(!e.a)continue;const dx=e.x-b.x,dy=e.y-b.y,r=e.r+3;if(dx*dx+dy*dy<r*r){const hit=hitE(e,b.dmg);if(!hit){b.vy=-b.vy*.5;b.vx=rnd(-150,150);b.dmg=0;b.hom=0;}part(b.x,b.y,rnd(-40,40),rnd(-40,40),.15,2,ART.glow.w);if(b.pierce>0&&hit){b.pierce--;b.dmg*=.7;}else{b.a=false;}break;}}
  if(b.a&&b.dmg>0&&G.boss&&bossHit(G.boss,b.x,b.y,b.dmg)){b.a=false;part(b.x,b.y,rnd(-60,60),rnd(10,60),.2,2.5,ART.glow.y);}}
 // enemies
 for(const e of EN){if(!e.a)continue;updE(e,dt);if(e.a&&P.alive&&G.mode==='play'){const dx=e.x-P.x,dy=e.y-P.y,r=e.r*.8+P.hitR;if(dx*dx+dy*dy<r*r){hurt();if(!e.type.startsWith('rock')||e.si>0)hitE(e,8,true);}}}
 if(G.boss){bossUpd(G.boss,dt);const B=G.boss;if(B&&!B.dead&&P.alive){const ex=(P.x-B.x)/(B.w*.42),ey=(P.y-B.y)/(B.h*.38);if(ex*ex+ey*ey<1)hurt();
   if(B.beam&&B.beam.t>1.6&&B.beam.t<2.8&&Math.abs(P.x-B.beam.x)<10&&P.y>B.y)hurt();}}
 // enemy bullets
 const hr=P.hitR;for(const b of EB){if(!b.a)continue;b.t+=dt;b.vx+=b.ax*dt;b.vy+=b.ay*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.y<-30||b.y>GH+30||b.x<-30||b.x>GW+30){b.a=false;continue;}
  if(P.alive&&G.mode==='play'){const dx=b.x-P.x,dy=b.y-P.y,r=b.r*.7+hr;if(dx*dx+dy*dy<r*r){b.a=false;hurt();}}}
 // hazards
 for(const h of HZ){if(!h.a)continue;h.t+=dt;if(!h.sfx&&h.t>0.02){h.sfx=1;AU.sfx('charge');}if(h.sfx===1&&h.t>h.warn){h.sfx=2;AU.sfx('beam');G.shake=Math.max(G.shake,4);}
  if(h.t>h.warn&&h.t<h.warn+h.dur&&P.alive&&Math.abs(P.x-h.x)<h.w/2+2)hurt();if(h.t>h.warn+h.dur+.2)h.a=false;}
 // pickups
 const mr=(P.magT>0?150:34+SAVE.upg.mag*26)+(P.magT>0?0:6);for(const p of PK){if(!p.a)continue;p.t+=dt;const dx=P.x-p.x,dy=P.y-p.y,d=Math.hypot(dx,dy)||1;
  if(p.k==='C'&&QUAL>0&&Math.random()<.06)part(p.x+rnd(-3,3),p.y+rnd(-3,3),0,20,.35,1.6,ART.glow.y,0);
  if(P.alive&&(d<(p.k==='C'?mr:Math.min(mr,60))||(p.k==='C'&&G.boss&&G.boss.dead)||(G.mode==='clear'))){const s=460,k2=Math.min(1,dt*9);p.vx+=(dx/d*s-p.vx)*k2;p.vy+=(dy/d*s-p.vy)*k2;}else{p.vy=Math.min(p.vy+140*dt,p.k==='C'?110:70);p.vx*=.98;if(p.k!=='C'&&(p.x<14||p.x>GW-14))p.vx*=-1;}
  p.x+=p.vx*dt;p.y+=p.vy*dt;if(P.alive&&d<18+tierOf()*1.5){p.a=false;pickup(p.k,p.x,p.y);continue;}if(p.y>GH+20)p.a=false;}
 // particles
 for(const p of PT){if(!p.a)continue;p.l-=dt;if(p.l<=0){p.a=false;continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k===0){p.vx*=.96;p.vy*=.96;}}
 for(const o of TX){if(o.a){o.t-=dt;o.y-=30*dt;if(o.t<=0)o.a=false;}}
 if(G.mode==='clear'){G.clearT+=dt;P.ty-=dt*(G.clearT>1?400:0);P.y+=(P.ty-P.y)*dt*3;}}
// ---------- menu attract ----------
const MENU={t:0};function menuUpd(dt){MENU.t+=dt;P.x=GW/2+Math.sin(MENU.t*.7)*40;P.y=GH*.62+Math.sin(MENU.t*1.3)*10;P.bank=Math.cos(MENU.t*.7)*.5;
 if(QUAL>0){part(P.x-5,P.y+18,rnd(-10,10),rnd(120,200),.25,3,ART.glow.b);part(P.x+5,P.y+18,rnd(-10,10),rnd(120,200),.25,3,ART.glow.c);}
 for(const p of PT){if(!p.a)continue;p.l-=dt;if(p.l<=0){p.a=false;continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;}}
// ---------- background ----------
const BGS={i:-1,neb:null,body:null,grad:null,stars:null,deco:[]};
function setBG(i){BGS.i=i;BGS.neb=ART.bg['n'+i]||(ART.bg['n'+i]=nebulaTile(i));BGS.body=ART.bg['b'+i]||(ART.bg['b'+i]=bodySpr(STAGE_BG[i].body,i));BGS.grad=null;
 BGS.stars=[];const n=QUAL>1?150:80;for(let l=0;l<3;l++){const a=new Float32Array(n/(l+1)*2);for(let k=0;k<a.length;k+=2){a[k]=Math.random()*GW;a[k+1]=Math.random()*GH;}BGS.stars.push(a);}
 BGS.deco=[];const cfg=STAGE_BG[i];for(let k=0;k<(cfg.rocks?9:cfg.flakes?26:cfg.comets?4:cfg.bolts?2:0);k++)BGS.deco.push({x:Math.random()*GW,y:Math.random()*GH,s:rnd(.3,1),v:Math.random()*3|0,r:Math.random()*TAU});}
function drawBG(dt){const cfg=STAGE_BG[BGS.i],t=G.scroll;
 if(!BGS.grad){BGS.grad=cx.createLinearGradient(0,0,0,GH);BGS.grad.addColorStop(0,cfg.b[0]);BGS.grad.addColorStop(1,cfg.b[1]);}
 cx.fillStyle=BGS.grad;cx.fillRect(0,0,GW,GH);
 const nh=GW*2,oy=(t*10)%nh;cx.drawImage(BGS.neb,0,oy-nh,GW,nh);cx.drawImage(BGS.neb,0,oy,GW,nh);
 if(QUAL>0){const o2=(t*26)%(nh*1.3);cx.globalCompositeOperation='lighter';cx.globalAlpha=.5;cx.save();cx.scale(-1,1);cx.drawImage(BGS.neb,-GW,o2-nh*1.3,GW,nh*1.3);cx.drawImage(BGS.neb,-GW,o2,GW,nh*1.3);cx.restore();cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
 // far stars
 const st=BGS.stars;cx.fillStyle=cfg.st;for(let l=0;l<3;l++){const a=st[l],sp=[8,22,0][l],sz=[1,1.4,0][l];if(l===2)break;cx.globalAlpha=l?.9:.55;for(let k=0;k<a.length;k+=2){const y=(a[k+1]+t*sp)%GH;cx.fillRect(a[k],y,sz,sz);}}cx.globalAlpha=1;
 // celestial body (slow parallax)
 const bw=260*(cfg.body==='hive'?1.6:1),by=-40+((t*3)%(GH+bw))-bw*.2;cx.globalAlpha=.95;cx.drawImage(BGS.body.c,(cfg.body.startsWith('binary')?GW*.58:GW*.62)-bw/2,by-bw/2+GH*.05,bw,bw);cx.globalAlpha=1;
 // deco
 for(const d of BGS.deco){d.y+=dt*(cfg.flakes?40:cfg.comets?160:24)*d.s;if(d.y>GH+40){d.y=-40;d.x=Math.random()*GW;}
  if(cfg.rocks){const s=ART.spr.rocks[1][d.v];d.r+=dt*.3*d.s;cx.save();cx.globalAlpha=.4*d.s;cx.translate(d.x,d.y);cx.rotate(d.r);const sz=s.w*d.s*.9;cx.drawImage(s.c,-sz/2,-sz/2,sz,sz);cx.restore();}
  else if(cfg.flakes){cx.fillStyle='rgba(220,245,255,'+(.3+d.s*.5)+')';cx.fillRect(d.x+Math.sin(t+d.r)*6,d.y,1.5*d.s+.5,1.5*d.s+.5);}
  else if(cfg.comets){cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba(140,255,230,'+(.3*d.s)+')';cx.lineWidth=2*d.s;cx.beginPath();cx.moveTo(d.x,d.y);cx.lineTo(d.x-24*d.s,d.y-70*d.s);cx.stroke();cx.drawImage(ART.glow.c.c,d.x-6,d.y-6,12,12);cx.globalCompositeOperation='source-over';}
  else if(cfg.bolts&&Math.random()<.01){cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba(180,220,255,.6)';cx.lineWidth=1.5;cx.beginPath();let x=d.x,y=0;cx.moveTo(x,y);while(y<GH*.6){x+=rnd(-18,18);y+=rnd(14,30);cx.lineTo(x,y);}cx.stroke();cx.globalCompositeOperation='source-over';}}
 // near star streaks
 const a=st[2];cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(200,220,255,.35)';const sp=(G.mode==='play'?260:140)*(G.mode==='clear'&&G.clearT>1?4:1);for(let k=0;k<a.length;k+=6){const y=(a[k+1]+t*sp*(1+(k%5)*.15))%GH;cx.fillRect(a[k],y,1,Math.max(2,sp*.025));}cx.globalCompositeOperation='source-over';}
// ---------- render ----------
function spr(s,x,y,sc,rot){const w=s.w*(sc||1),h=s.h*(sc||1);if(rot){cx.save();cx.translate(x,y);cx.rotate(rot);cx.drawImage(s.c,-w/2,-h/2,w,h);cx.restore();}else cx.drawImage(s.c,x-w/2,y-h/2,w,h);}
function render(dt){cx.globalAlpha=1;cx.globalCompositeOperation='source-over';cx.shadowBlur=0;cx.setTransform(SC*DPR,0,0,SC*DPR,0,0);let sx=0,sy=0;if(G.shake>0&&QUAL>0){sx=rnd(-1,1)*G.shake*.6;sy=rnd(-1,1)*G.shake*.6;}cx.translate(sx,sy);
 drawBG(dt);const S=ART.spr;
 // hazards
 for(const h of HZ){if(!h.a)continue;if(h.t<h.warn){const a=.35+.35*Math.sin(h.t*30);cx.fillStyle='rgba(255,60,90,'+a*.35+')';cx.fillRect(h.x-h.w/2,0,h.w,GH);cx.fillStyle='rgba(255,90,120,'+a+')';cx.fillRect(h.x-1,0,2,GH);cx.fillRect(h.x-h.w/2,0,1,GH);cx.fillRect(h.x+h.w/2-1,0,1,GH);
   cx.font='10px PS2P';cx.textAlign='center';cx.fillStyle='#ff6a8a';cx.fillText('!',h.x,70+SAFE_T);}
  else if(h.t<h.warn+h.dur){const k=1-Math.abs((h.t-h.warn)/h.dur-.5)*2;cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(255,40,80,.5)';cx.fillRect(h.x-h.w*(.5+k*.3),0,h.w*(1+k*.6),GH);cx.fillStyle='rgba(255,170,60,.6)';cx.fillRect(h.x-h.w*.3,0,h.w*.6,GH);cx.fillStyle='#fff';cx.fillRect(h.x-2,0,4,GH);cx.globalCompositeOperation='source-over';}}
 // pickups
 for(const p of PK){if(!p.a)continue;if(p.k==='C'){const ph=p.t*5+p.x*.1,sxx=Math.max(.15,Math.abs(Math.cos(ph))),c=S.coin;cx.save();cx.translate(p.x,p.y);cx.scale(sxx,1);cx.drawImage(c.c,-c.w/2,-c.h/2,c.w,c.h);cx.restore();
   if(sxx>.93){cx.globalCompositeOperation='lighter';spr(S.glint,p.x+2,p.y-2,.6+Math.sin(ph*3)*.2);cx.globalCompositeOperation='source-over';}}
  else{const s=S.pu[p.k],by=p.y+Math.sin(p.t*4)*2.5;cx.globalCompositeOperation='lighter';cx.globalAlpha=.75;spr(S.puGlow[p.k],p.x,by,.9+Math.sin(p.t*7)*.12);cx.globalAlpha=1;
   const oa=p.t*3;spr(S.glint,p.x+Math.cos(oa)*14,by+Math.sin(oa)*14*.5,.5);cx.globalCompositeOperation='source-over';spr(s,p.x,by,.95,Math.sin(p.t*2.5)*.15);
   if(Math.sin(p.t*2.2)>.96){cx.globalCompositeOperation='lighter';spr(S.glint,p.x-4,by-6,1);cx.globalCompositeOperation='source-over';}}}
 // boss
 const B=G.boss;if(B){drawBoss(B);}drawRings(dt);
 // enemies
 for(const e of EN){if(!e.a)continue;let s;if(e.type.startsWith('rock'))s=e.ice?S.ice[e.si]:S.rocks[e.si][e.var];else s=S[e.type];
  const rot=e.type.startsWith('rock')?e.rot:e.type==='kami'&&e.t>.8?e.ang-Math.PI/2:e.type==='diver'&&e.dv?Math.atan2(e.vy,e.vx)-Math.PI/2:e.type==='mine'?e.t*2:0;
  const sq=e.type==='sine'?1+Math.sin(e.t*8)*.06:1;spr(s,e.x,e.y,sq,rot);
  if(e.fl>0){cx.globalCompositeOperation='lighter';cx.globalAlpha=.8;spr(s,e.x,e.y,sq,rot);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
  if(e.type==='shield'&&e.shOn){cx.strokeStyle='rgba(120,220,255,'+(.55+Math.sin(e.t*12)*.2)+')';cx.lineWidth=3;cx.beginPath();cx.arc(e.x,e.y,22,.15*Math.PI,.85*Math.PI);cx.stroke();cx.lineWidth=1;cx.beginPath();cx.arc(e.x,e.y,25,.2*Math.PI,.8*Math.PI);cx.stroke();}
  if(e.type==='kami'&&e.t>.5&&e.t<.8){cx.strokeStyle='rgba(255,60,60,.5)';cx.lineWidth=1;cx.setLineDash([4,4]);cx.beginPath();cx.moveTo(e.x,e.y);cx.lineTo(P.x,P.y);cx.stroke();cx.setLineDash([]);}}
 // player bullets & laser
 cx.globalCompositeOperation='lighter';for(const b of PB){if(!b.a)continue;const r=b.hom||b.vx?Math.atan2(b.vx,-b.vy):0;spr(b.s,b.x,b.y,1,r);}
 if(P.laser&&P.alive&&G.mode==='play'){const w=7+P.wl*4,top=P.ltop||0,fl=1+Math.sin(G.t*50)*.15;const gr=cx.createLinearGradient(P.x-w,0,P.x+w,0);gr.addColorStop(0,'rgba(40,120,255,0)');gr.addColorStop(.3,'rgba(60,200,255,.6)');gr.addColorStop(.5,'rgba(255,255,255,.95)');gr.addColorStop(.7,'rgba(60,200,255,.6)');gr.addColorStop(1,'rgba(40,120,255,0)');
  cx.fillStyle=gr;cx.fillRect(P.x-w*fl,top,w*2*fl,P.y-22-top);spr(ART.glow.c,P.x,P.y-22,2.2*fl);spr(ART.glow.w,P.x,top+4,2*fl);}
 cx.globalCompositeOperation='source-over';
 // player
 if(P.alive&&(G.mode!=='over')&&(P.inv<=0||P.evoT>0||((G.t*14)|0)%2===0||G.mode==='menu')){const tr=G.mode==='menu'?0:tierOf(),s=S.shipT[P.ship][tr],tc=TIER_COL[tr],ga=ART.glow[['b','c','g','y','w'][tr]];
  cx.globalCompositeOperation='lighter';const fl=1+Math.sin(G.scroll*40)*.2;
  if(tr>=3){const pr=.35+Math.sin(G.scroll*5)*.12;cx.globalAlpha=pr;spr(S.puGlow[tr>=4?'M':'X'],P.x,P.y,2.4+tr*.2);cx.globalAlpha=1;}
  const nz=[[0],[0],[-6,6],[-6,6],[-9,0,9]][tr];for(const ox of nz){cx.drawImage(ga.c,P.x+ox-9,P.y+12+tr*1.5,18,(24+tr*4)*fl);cx.drawImage(ART.glow.w.c,P.x+ox-4,P.y+14+tr*1.5,8,12*fl);}
  cx.globalCompositeOperation='source-over';
  let pop=1;if(P.evoT>0){const k=P.evoT/.9;pop=1+Math.sin(k*Math.PI)*.25;}if(P.downT>0)pop*=1-P.downT*.15;
  cx.save();cx.translate(P.x,P.y);cx.scale((1-Math.abs(P.bank)*.14)*pop,pop);cx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);
  if(P.evoT>0){cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.min(1,P.evoT*1.6);cx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);cx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
  cx.restore();
  if(P.evoT>0){const k=1-P.evoT/.9;cx.strokeStyle=tc;cx.globalAlpha=1-k;cx.lineWidth=3;cx.beginPath();cx.arc(P.x,P.y,20+k*50,0,TAU);cx.stroke();cx.globalAlpha=1;}
  if(P.shield>0){cx.strokeStyle='rgba(120,180,255,'+(.35+Math.sin(G.scroll*6)*.15)+')';cx.lineWidth=2;cx.beginPath();cx.arc(P.x,P.y,28+tr*3,0,TAU);cx.stroke();}
  if(G.mode==='play'){cx.fillStyle='#fff';cx.beginPath();cx.arc(P.x,P.y+2,P.hitR,0,TAU);cx.fill();cx.strokeStyle='#ff4fb8';cx.lineWidth=1.2;cx.stroke();}}
 // enemy bullets
 const ROT1=S.eb4,ROT2=S.ebN,SPN=S.eb2,PLS=S.eb3;for(const b of EB){if(!b.a)continue;const s=b.s;if(s===ROT1||s===ROT2){spr(s,b.x,b.y,1,Math.atan2(b.vy,b.vx));}else if(s===SPN){spr(s,b.x,b.y,1,b.t*7);}else if(s===PLS){spr(s,b.x,b.y,1+Math.sin(b.t*14)*.08,b.t*3);}else{const sz=s.w*(1+Math.sin(b.t*18)*.06);cx.drawImage(s.c,b.x-sz/2,b.y-sz/2,sz,sz);}}
 // particles
 cx.globalCompositeOperation='lighter';for(const p of PT){if(!p.a)continue;const k=p.l/p.m;
  if(p.k===2){cx.strokeStyle=p.c.length>2?'rgba('+p.c+','+k+')':p.c==='y'?'rgba(255,230,120,'+k+')':p.c==='c'?'rgba(120,230,255,'+k+')':'rgba(255,160,80,'+k+')';cx.lineWidth=3*k+1;cx.beginPath();cx.arc(p.x,p.y,p.sz*(1-k)+4,0,TAU);cx.stroke();}
  else if(p.k===1){cx.globalAlpha=k;cx.drawImage(p.g.c,p.x-2,p.y-2,4,4);cx.fillStyle='#fff';cx.fillRect(p.x-p.vx*.02,p.y-p.vy*.02,1.2,1.2);cx.globalAlpha=1;}
  else{const s=p.sz*(.4+k*.8)*2;cx.globalAlpha=Math.min(1,k*1.5);cx.drawImage(p.g.c,p.x-s,p.y-s,s*2,s*2);cx.globalAlpha=1;}}
 cx.globalCompositeOperation='source-over';
 for(const o of TX){if(!o.a)continue;cx.globalAlpha=Math.min(1,o.t*2);cx.font='9px PS2P, system-ui';cx.textAlign='center';cx.fillStyle='#000';cx.fillText(o.s,o.x+1,o.y+1);cx.fillStyle=o.c;cx.fillText(o.s,o.x,o.y);cx.globalAlpha=1;}
 cx.setTransform(SC*DPR,0,0,SC*DPR,0,0);
 if(G.flash>0){cx.fillStyle='rgba(255,240,220,'+Math.min(.7,G.flash)+')';cx.fillRect(0,0,GW,GH);}
 if(G.mode!=='menu')drawHUD();}
function drawBoss(B){const hh=B.h/2;cx.save();let jx=0,jy=0;if(B.dead){jx=rnd(-1,1)*B.dead*2;jy=rnd(-1,1)*B.dead*2;}cx.translate(B.x+jx,B.y+jy);
 bossDraw(cx,B.i,{t:G.t,ph:B.phase,la:Math.atan2(P.y-B.y-B.coreOy,P.x-B.x),fl:B.fl,dead:B.dead});
 if(B.phase>0&&!B.dead&&Math.random()<.05*B.phase)part(B.x+rnd(-B.w,B.w)*.32,B.y+rnd(-hh,hh)*.5,rnd(-40,40),rnd(-60,-10),.45,2.2,ART.glow.o);
 // turrets
 const ts=ART.turSpr[B.i]||(ART.turSpr[B.i]=turretSpr(B.D[3]));for(const t of B.tur){if(t.alive){cx.save();cx.translate(t.ox,t.oy);cx.rotate(t.ang-Math.PI/2);cx.drawImage(ts.c,-ts.w/2,-ts.h/2,ts.w,ts.h);if(t.fl>0){cx.globalCompositeOperation='lighter';cx.drawImage(ts.c,-ts.w/2,-ts.h/2,ts.w,ts.h);}cx.restore();}
  else{cx.fillStyle='rgba(20,10,30,.9)';cx.beginPath();cx.arc(t.ox,t.oy,8,0,TAU);cx.fill();if(Math.random()<.3)part(B.x+t.ox,B.y+t.oy,rnd(-10,10),rnd(-40,-10),.5,3,ART.glow.o);}}
 cx.restore();
 if(B.beam){const bm=B.beam;if(bm.t<1.6){cx.fillStyle='rgba(255,80,160,'+(.25+Math.sin(bm.t*40)*.15)+')';cx.fillRect(bm.x-15,B.y,30,GH);cx.fillStyle='rgba(255,120,200,.8)';cx.fillRect(bm.x-1,B.y,2,GH);}
  else if(bm.t<2.8){cx.globalCompositeOperation='lighter';const w=15+Math.sin(bm.t*60)*3;cx.fillStyle='rgba(255,50,150,.55)';cx.fillRect(bm.x-w*1.5,B.y+hh*.3,w*3,GH);cx.fillStyle='rgba(255,200,240,.9)';cx.fillRect(bm.x-w*.5,B.y+hh*.3,w,GH);spr(ART.glow.p,bm.x,B.y+hh*.4,5);cx.globalCompositeOperation='source-over';}}}
function drawHUD(){const top=SAFE_T+8;cx.textBaseline='top';cx.font='10px PS2P';cx.textAlign='left';
 const sh=(s,x,y,c)=>{cx.fillStyle='#120020';cx.fillText(s,x+1,y+1);cx.fillStyle=c;cx.fillText(s,x,y);};
 sh(String(G.score).padStart(7,'0'),8,top,'#fff');cx.font='7px PS2P';sh('HI '+String(Math.max(SAVE.hi,G.score)).padStart(7,'0'),8,top+14,'#ff9ad8');
 cx.textAlign='center';cx.font='8px PS2P, system-ui';sh(G.endless?'∞ '+(G.sector+1):(G.stage+''),GW/2,top,'#7ae8ff');
 if(G.combo>=8){const m=comboMul();cx.font='8px PS2P';sh('x'+m+' '+G.combo,GW/2,top+13,['#fff','#ffe14a','#ffb04a','#ff7a4a','#ff4fb8','#c86bff','#7ae8ff','#7dff6a'][m-1]);}
 // stage progress
 if(!G.boss&&G.mode==='play'){const pr=Math.min(1,G.t/G.dur);cx.fillStyle='rgba(255,255,255,.15)';cx.fillRect(GW/2-50,top+24,100,3);cx.fillStyle='#ff8a2a';cx.fillRect(GW/2-50,top+24,100*pr,3);}
 // boss bar
 const B=G.boss;if(B&&B.t>1){const bw=GW-40,y=top+34;cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(18,y-2,bw+4,12);const fr=B.hp/B.mhp;const g=cx.createLinearGradient(20,0,20+bw,0);g.addColorStop(0,'#ff3a8a');g.addColorStop(.5,'#ff8a2a');g.addColorStop(1,'#ffe14a');cx.fillStyle=g;cx.fillRect(20,y,bw*fr,8);
  cx.fillStyle='rgba(255,255,255,.5)';[.34,.67].forEach(m=>cx.fillRect(20+bw*m,y,1,8));cx.font='7px PS2P';cx.textAlign='center';sh(B.D[0].toUpperCase(),GW/2,y+12,'#ffd0e8');}
 // bottom: lives, bombs, weapon
 const by=GH-SAFE_B-22;cx.textAlign='left';for(let i=0;i<Math.min(P.lives,6);i++)spr(ART.spr.ship[P.ship],14+i*16,by,.32);
 cx.font='7px PS2P';if(P.lives>6)sh('x'+P.lives,108,by-3,'#fff');
 for(let i=0;i<P.shield;i++){cx.strokeStyle='#7ab8ff';cx.lineWidth=1.5;cx.beginPath();cx.arc(12+i*12,by-18,4,0,TAU);cx.stroke();}
 const wn={B:'BLT',S:'SPR',L:'LSR',H:'MSL'}[P.wt];sh(wn+' '+(P.wl>=MAXWL?'MAX':'L'+P.wl),8,by+11,P.wt==='B'?'#ffb35a':PU_COL[P.wt]);
 let ix=GW-20;for(const [k,v] of [['M',P.magT],['X',P.x2T]]){if(v>0){spr(ART.spr.pu[k],ix,by,.5);cx.fillStyle=PU_COL[k];cx.fillRect(ix-8,by+10,16*Math.min(1,v/12),2);ix-=22;}}
 for(let i=0;i<5;i++){cx.fillStyle=i<=tierOf()?TIER_COL[i]:'rgba(255,255,255,.18)';cx.fillRect(92+i*7,by+12,5,5);}
 // warning banner
 if(G.warnT>0){const a=Math.abs(Math.sin(G.warnT*5));cx.fillStyle='rgba(255,30,80,'+(.25*a)+')';cx.fillRect(0,GH*.38,GW,70);cx.fillStyle='rgba(255,60,100,'+a+')';cx.fillRect(0,GH*.38,GW,3);cx.fillRect(0,GH*.38+67,GW,3);
  cx.textAlign='center';cx.font='20px PS2P, system-ui';sh(T('warning'),GW/2,GH*.38+14,'#fff');cx.font='8px PS2P, system-ui';sh(T('bossApproach'),GW/2,GH*.38+44,'#ffd0e0');}
 if(G.mode==='clear'&&G.clearT>.3){cx.textAlign='center';cx.font='16px PS2P, system-ui';sh(T(G.endless?'sectorClear':'clear'),GW/2,GH*.4,'#ffe14a');}
 if(G.t<2.5&&G.mode==='play'){cx.globalAlpha=Math.min(1,(2.5-G.t)*1.5);cx.textAlign='center';cx.font='9px PS2P, system-ui';sh((G.endless?T('endless')+' '+(G.sector+1):T('stage')+' '+G.stage),GW/2,GH*.36,'#7ae8ff');cx.font='14px PS2P, system-ui';
  sh(T(STAGE_NAMES[G.bg]),GW/2,GH*.36+18,'#fff');cx.globalAlpha=1;}
 cx.textBaseline='alphabetic';}
// ---------- input ----------
const KEY={l:0,r:0,u:0,d:0};const PTR={id:null,x:0,y:0};
function toGame(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/SC,(e.clientY-r.top)/SC];}
cv.addEventListener('pointerdown',e=>{AU.init();if(G.mode!=='play')return;PTR.id=e.pointerId;[PTR.x,PTR.y]=toGame(e);try{cv.setPointerCapture(e.pointerId);}catch(_){}});
cv.addEventListener('pointermove',e=>{if(PTR.id!==e.pointerId||G.mode!=='play')return;const[x,y]=toGame(e);P.tx+=(x-PTR.x)*1.2;P.ty+=(y-PTR.y)*1.2;PTR.x=x;PTR.y=y;});
['pointerup','pointercancel'].forEach(k=>cv.addEventListener(k,e=>{if(PTR.id===e.pointerId)PTR.id=null;}));
const KM={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d'};
addEventListener('keydown',e=>{AU.init();const k=KM[e.code];if(k){KEY[k]=1;e.preventDefault();}if(e.code==='Space'||e.code==='KeyX'||e.code==='KeyB'){useBomb();e.preventDefault();}if(e.code==='Escape'||e.code==='KeyP')UI.pauseToggle();});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)KEY[k]=0;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(G.mode==='play')UI.pause();if(AU.ac)AU.ac.suspend();VOICE.stop();}else if(AU.ac&&G.mode!=='paused')AU.ac.resume();});
// ---------- layout ----------
function layout(){const vv=window.visualViewport;const vw=vv?vv.width:innerWidth,vh=vv?vv.height:innerHeight;
 const pr=$('probe');const cs=getComputedStyle(pr);const st=parseFloat(cs.paddingTop)||0,sb=parseFloat(cs.paddingBottom)||0;
 GH=Math.round(clamp(GW*vh/vw,560,800));SC=Math.min(vw/GW,vh/GH);const cw=GW*SC,ch=GH*SC;
 const ratio=window.devicePixelRatio||1;DPR=Math.min(ratio,QUAL>=2?2:QUAL===1?1.5:1);cv.width=Math.round(cw*DPR);cv.height=Math.round(ch*DPR);
 cv.style.width=cw+'px';cv.style.height=ch+'px';const L=(vw-cw)/2,Tp=(vh-ch)/2;cv.style.left=L+'px';cv.style.top=Tp+'px';
 const ui=$('ui');ui.style.left=L+'px';ui.style.top=Tp+'px';ui.style.width=cw+'px';ui.style.height=ch+'px';ui.style.setProperty('--s',SC);
 SAFE_T=Math.max(0,st-Tp)/SC;SAFE_B=Math.max(0,sb-(vh-Tp-ch))/SC;ui.style.setProperty('--st',SAFE_T*SC+'px');ui.style.setProperty('--sb',SAFE_B*SC+'px');BGS.grad=null;if(BGS.i>=0&&BGS.stars)setBG(BGS.i);}
addEventListener('resize',layout);window.visualViewport&&visualViewport.addEventListener('resize',layout);
// ---------- quality ----------
function setQuality(){const q=SAVE.q;QUAL=q==='low'?0:q==='high'?2:(PERF.auto);PT.lim=QUAL>1?700:QUAL===1?420:220;layout();}
const PERF={auto:2,acc:0,n:0,slow:0,ft:[]};
function perf(ms){PERF.ft.push(ms);if(PERF.ft.length>240)PERF.ft.shift();if(SAVE.q!=='auto'||G.mode!=='play')return;PERF.acc+=ms;PERF.n++;
 if(PERF.n>=90){const avg=PERF.acc/PERF.n;PERF.acc=0;PERF.n=0;if(avg>21&&PERF.auto>0){PERF.slow++;if(PERF.slow>=2){PERF.auto--;PERF.slow=0;setQuality();LOG('quality ->',PERF.auto);}}else PERF.slow=0;}}
// ---------- loop ----------
let last=performance.now();
function frame(now){const raw=now-last;last=now;const dt=Math.min(.05,raw/1000);
 if(!DBG.fast){update(dt);if(BGS.i>=0)render(dt);}AU.tick();perf(raw);requestAnimationFrame(frame);}
// ---------- debug hook (?debug=1) ----------
const DBG={god:false,fast:false,auto:false,
 sim(sec,step){step=step||1/60;const n=Math.round(sec/step);for(let i=0;i<n;i++){if(this.auto)this.pilot(step);update(step);if(G.mode!=='play'&&G.mode!=='clear')break;}return this.state();},
 pilot(dt){if(!P.alive)return;let tx=GW/2;const B=G.boss;if(B&&!B.dead){tx=B.x+(B.tur.find(t=>t.alive)||{ox:0}).ox;}else{let best=null,bd=1e9;EN.forEach(e=>{if(e.a&&e.y>0&&e.y<P.y){const d=Math.abs(e.x-P.x);if(d<bd){bd=d;best=e;}}});if(best)tx=best.x;}
  P.tx=clamp(tx,14,GW-14);P.ty=GH-110;},
 state(){return{mode:G.mode,stage:G.stage,endless:G.endless,sector:G.sector,t:+G.t.toFixed(1),boss:G.boss?{hp:Math.round(G.boss.hp),mhp:G.boss.mhp,ph:G.boss.phase,name:G.boss.D[0]}:null,score:G.score,lives:P.lives,en:EN.filter(e=>e.a).length,eb:EB.filter(e=>e.a).length,pt:PT.filter(e=>e.a).length,cr:SAVE.cr,reached:SAVE.reached};},
 start(n,e){UI.hideAll();startStage(n,e);},killBoss(){if(G.boss)damageBoss(G.boss,1e9);},toBoss(){G.t=G.dur+2.4;G.evI=G.ev.length;LATER.length=0;EN.forEach(e=>e.a=false);},
 shot(stage,sec){this.start(stage);this.sim(sec);}};
if(DEBUG)window.DBG=DBG;window.__G=G;window.__P=P;
