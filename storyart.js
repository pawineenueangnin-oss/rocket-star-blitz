'use strict';
// Story illustration panel: small animated canvas scenes built from the game's own sprites (original art).
const SART={raf:0,cache:{},
 scene(key,n){if(key==='st0')return{k:'intro',bg:9};if(key==='st1b')return{k:'launch',bg:0};if(key==='st10'&&n!==0)return{k:'win',bg:9};
  if(n===0)return{k:'fleet',bg:(G.sector||0)%10,b:Math.min(9,(G.sector||0)%10)};return{k:'boss',bg:n-1,b:n-1};},
 bossName(sc){return sc.k==='boss'?BOSS_DEF[sc.b][0]:'';},
 get(id,fn){return this.cache[id]||(this.cache[id]=fn());},
 start(cv,sc){this.stop();if(!cv)return;const g=cv.getContext('2d');let W=320,H=480,u=1,dpr=1,cw=0,ch=0;
  // full-bleed: logical space keeps art scale ~constant; W/H follow the viewport aspect
  const fit=()=>{const r=cv.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);if(w===cw&&h===ch)return false;cw=w;ch=h;
   const d=Math.min(window.devicePixelRatio||1,w*h>600000?1.25:1.75);u=Math.min(w/320,h/430);W=w/u;H=h/u;dpr=u*d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);return true;};fit();
  const neb=this.get('n'+sc.bg,()=>nebulaTile(sc.bg)),body=this.get('b'+sc.bg,()=>bodySpr(STAGE_BG[sc.bg].body,sc.bg));
  const boss=sc.b!=null?(ART.bossSpr[sc.b]||(ART.bossSpr[sc.b]=bossSpr(sc.b))):sc.k==='intro'||sc.k==='win'?(ART.bossSpr[9]||(ART.bossSpr[9]=bossSpr(9))):null;
  const S=ART.spr,ship=S.shipT[SAVE.ship||0][sc.k==='win'?4:sc.k==='boss'?Math.min(4,(sc.b/2)|0):0];
  let sd=7;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};const stars=[];for(let i=0;i<160;i++)stars.push([R(),R(),.3+R()*1.4,R()]);
  const foes=['zig','vwing','diver','sine','kami','saucer'];const fleet=[];for(let i=0;i<9;i++)fleet.push([(.12+(i%5)*.19+(i>4?.095:0)),(i>4?40:0),foes[i%foes.length],R()*6]);
  const t0=performance.now();
  const dr=(o,x,y,s,a)=>{if(!o)return;g.globalAlpha=a==null?1:a;g.drawImage(o.c,x-o.w*s/2,y-o.h*s/2,o.w*s,o.h*s);g.globalAlpha=1;};
  const glow=(x,y,r,c)=>{const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,7);g.fill();};
  const fr=now=>{fit();const t=(now-t0)/1000,e=Math.min(1,t/.7),ez=1-Math.pow(1-e,3);g.setTransform(dpr,0,0,dpr,0,0);
   const b=STAGE_BG[sc.bg].b;const lgr=g.createLinearGradient(0,0,0,H);lgr.addColorStop(0,b[0]);lgr.addColorStop(1,b[1]);g.fillStyle=lgr;g.fillRect(0,0,W,H);
   const ny=(t*6)%neb.height*(W/neb.width);g.globalAlpha=.9;const nh=neb.height*(W/neb.width);for(let k=-1;k*nh<H+nh;k++)g.drawImage(neb,0,(ny%nh)+k*nh,W,nh);g.globalAlpha=1;
   for(let L=0;L<2;L++)for(const s of stars){const x=((s[0]+L*.37)%1)*W,y=((s[1]+L*.53)*H+t*s[2]*(L?22:9))%H;g.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+s[3]*9));g.fillStyle='#fff';g.fillRect(x,y,s[2]*(L?1:.7),s[2]*(L?1:.7));}g.globalAlpha=1;
   const bs=sc.k==='intro'?.75:.5;dr(body,W*.8,H*.2+Math.sin(t*.3)*3,bs*1.4,.85);const ST=H*(W/H>1.3?.72:.56),CX=W/H>1.3?W*.3:W*.5;
   const sx=CX+Math.sin(t*1.3)*14,sy=ST+(1-ez)*80+Math.sin(t*2.1)*3,fl=.7+.3*Math.sin(t*40);
   const drawShip=(x,y,s)=>{glow(x,y+s*24,s*14*fl,'rgba(90,200,255,.9)');glow(x,y+s*30,s*7*fl,'rgba(255,255,255,.9)');dr(ship,x,y,s);};
   if(sc.k==='boss'||sc.k==='fleet'||sc.k==='intro'){const bx=CX-W*.04+Math.sin(t*.5)*10,by=-90+ez*(90+H*(sc.k==='intro'?.26:.29))+Math.sin(t*.8)*3,s=Math.min(1.5,Math.min(W*.85,420)/boss.w,H*.36/boss.h)*(sc.k==='intro'?.8:1);
    const pulse=.55+.45*Math.sin(t*5);g.save();g.translate(bx,by);g.scale(s,s);bossDraw(g,sc.b!=null?sc.b:9,{t,ph:0,la:Math.PI/2});g.restore();const a1=BOSS_DEF[sc.b!=null?sc.b:9][3];
    g.globalCompositeOperation='lighter';g.globalCompositeOperation='source-over';
    if(sc.k==='intro'){g.fillStyle='rgba(255,230,120,.12)';g.beginPath();g.moveTo(bx-10,by+30);g.lineTo(W*.8-30,H*.2+40);g.lineTo(W*.8+30,H*.2+40);g.lineTo(bx+10,by+30);g.fill();}}
   if(sc.k==='launch'||sc.k==='fleet'||sc.k==='intro'){for(const f of fleet){const fy=f[1]-30+ez*30+Math.sin(t*2+f[3])*4+(sc.k==="launch"?H*.2:H*.42),fx=(W/H>1.3?f[0]*.55:f[0])*W+Math.sin(t+f[3])*6;dr(S[f[2]],fx,fy,.8);}}
   if(sc.k==='win'){for(let k=0;k<5;k++){const p=((t*.9+k*.37)%1.6)/1.6,x=W*(.15+((k*97)%200)/280),y=H*(.12+((k*53)%60)/200);g.globalCompositeOperation='lighter';glow(x,y,8+p*50,`rgba(255,${150+k*20},60,${(1-p)*.9})`);glow(x,y,3+p*12,`rgba(255,255,255,${1-p})`);g.globalCompositeOperation='source-over';}
    dr(boss,CX,H*.2+t*4,.8,Math.max(0,.5-t*.05));}
   drawShip(sc.k==='win'?CX:sx,sc.k==='win'?ST+Math.sin(t*2)*4:sy,sc.k==='intro'?1:1.25);
   g.fillStyle='rgba(0,0,0,'+(1-ez)+')';g.fillRect(0,0,W,H);
   if(UI.cur==='storyS'&&document.body.contains(cv))this.raf=requestAnimationFrame(fr);};
  this.raf=requestAnimationFrame(fr);},
 stop(){cancelAnimationFrame(this.raf);this.raf=0;}};
