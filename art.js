// Rocket Star Blitz — procedural art (all original). Sprites are pre-rendered once to offscreen canvases.
'use strict';
const ART={R:2.5,spr:{},glow:{},bg:{},bossSpr:[],turSpr:[]};
function mkC(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c;}
function mk(w,h,fn,R){R=R||ART.R;const c=mkC(w*R,h*R),g=c.getContext('2d');g.scale(R,R);g.translate(w/2,h/2);g.lineJoin='round';g.lineCap='round';fn(g,w,h);return{c,w,h};}
function poly(g,pts,mirror){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);if(mirror){for(let i=pts.length-2;i>=0;i-=2)g.lineTo(-pts[i],pts[i+1]);}g.closePath();}
function lg(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>gr.addColorStop(i/(st.length-1),c));return gr;}
function rg(g,x,y,r0,r1,st){const gr=g.createRadialGradient(x,y,r0,x,y,r1);st.forEach((c,i)=>gr.addColorStop(i/(st.length-1),c));return gr;}
function fillGlow(g,col,blur,fn){g.save();g.shadowColor=col;g.shadowBlur=blur;fn();g.restore();}
function eyes(g,x,y,r,sp,look){[-1,1].forEach(s=>{g.fillStyle='#fff';g.beginPath();g.ellipse(x+s*sp,y,r,r*1.15,0,0,7);g.fill();g.fillStyle='#1a1030';g.beginPath();g.arc(x+s*sp+(look||0),y+r*.25,r*.55,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+s*sp+(look||0)-r*.2,y,r*.2,0,7);g.fill();});}
const OUT='#140a2a';
// ---------- player ships ----------
function shipKite(g){ // Blaze Kite: orange/blue geometric delta
 fillGlow(g,'#ff8a2a',8,()=>{g.fillStyle=lg(g,0,-10,0,16,['#ffb347','#ff6a1a','#c53d10']);poly(g,[0,-6,-21,11,-19,16,-6,13,0,13],true);g.fill();});
 g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke();
 g.fillStyle='#2b7bff';poly(g,[-6,0,-17,12,-9,12]);g.fill();poly(g,[6,0,17,12,9,12]);g.fill();
 g.fillStyle='#7fe0ff';poly(g,[-12,9,-17,12,-13,12]);g.fill();poly(g,[12,9,17,12,13,12]);g.fill();
 g.fillStyle=lg(g,-7,0,7,0,['#a83a10','#ff9a3a','#ffd08a','#ff9a3a','#a83a10']);poly(g,[0,-25,5,-12,7,6,6,16,-6,16,-7,6,-5,-12]);g.fill();g.stroke();
 g.fillStyle='#1d5cff';poly(g,[0,-3,5,6,-5,6]);g.fill();g.fillStyle='#ffe0a0';poly(g,[0,-21,2,-15,-2,-15]);g.fill();
 g.fillStyle=lg(g,0,-14,0,-2,['#e8ffff','#56d8ff','#1a4cbf']);g.beginPath();g.ellipse(0,-8,3,6,0,0,7);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
 g.fillStyle='#fff';g.globalAlpha=.8;g.beginPath();g.ellipse(-1,-10,1,2.2,0,0,7);g.fill();g.globalAlpha=1;
 g.fillStyle='#2a2a44';g.fillRect(-6,14,4,5);g.fillRect(2,14,4,5);g.fillStyle='#8fe8ff';g.fillRect(-5.5,18,3,1.5);g.fillRect(2.5,18,3,1.5);}
function shipDart(g){ // Zephyr Dart: pink/yellow/blue swept
 fillGlow(g,'#ff4fb8',8,()=>{g.fillStyle=lg(g,0,-8,0,16,['#ff8ad8','#ff3fa6','#b0176e']);poly(g,[0,-4,-23,4,-22,9,-8,12,0,12],true);g.fill();});
 g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke();
 g.fillStyle='#ffe14a';poly(g,[-8,2,-22,5,-21,8,-9,8]);g.fill();poly(g,[8,2,22,5,21,8,9,8]);g.fill();
 g.fillStyle='#3a9bff';poly(g,[-4,8,-12,17,-6,15]);g.fill();poly(g,[4,8,12,17,6,15]);g.fill();
 g.fillStyle=lg(g,-5,0,5,0,['#7a1a8a','#ffd84a','#fff4b0','#ffd84a','#7a1a8a']);poly(g,[0,-26,4,-10,5,10,3,17,-3,17,-5,10,-4,-10]);g.fill();g.stroke();
 g.fillStyle=lg(g,0,-16,0,-4,['#ffffff','#9ef0ff','#2460d0']);g.beginPath();g.ellipse(0,-9,2.6,6.5,0,0,7);g.fill();g.lineWidth=1;g.stroke();
 g.fillStyle='#3a9bff';g.fillRect(-1,4,2,8);g.fillStyle='#2a2a44';g.fillRect(-3,15,6,4);}
function shipTitan(g){ // Ember Titan: heavy purple/orange
 fillGlow(g,'#a35bff',8,()=>{g.fillStyle=lg(g,0,-12,0,18,['#b78bff','#6a2ed0','#33106e']);poly(g,[0,-10,-14,-8,-24,6,-22,16,-10,18,0,15],true);g.fill();});
 g.strokeStyle=OUT;g.lineWidth=1.5;g.stroke();
 g.fillStyle='#ff7a1a';poly(g,[-14,-6,-22,7,-14,9]);g.fill();poly(g,[14,-6,22,7,14,9]);g.fill();
 g.fillStyle='#ffd36a';g.fillRect(-21,9,5,3);g.fillRect(16,9,5,3);
 g.fillStyle=lg(g,-8,0,8,0,['#40206e','#ff9a3a','#ffe0a0','#ff9a3a','#40206e']);poly(g,[0,-26,6,-16,8,10,6,19,-6,19,-8,10,-6,-16]);g.fill();g.stroke();
 g.fillStyle='#2bd4ff';poly(g,[0,0,6,10,-6,10]);g.fill();
 g.fillStyle=lg(g,0,-18,0,-4,['#fff','#ffcf6a','#c04a10']);g.beginPath();g.ellipse(0,-11,3.4,6,0,0,7);g.fill();g.lineWidth=1;g.stroke();
 g.fillStyle='#2a2a44';[-15,-9,5,11].forEach(x=>g.fillRect(x,16,4,5));g.fillStyle='#ffb35a';[-15,-9,5,11].forEach(x=>g.fillRect(x+.5,20,3,1.5));}
// ---------- aliens (cute, cartoonish) ----------
const AL={
 zig(g){fillGlow(g,'#3dffb0',8,()=>{g.fillStyle=rg(g,-3,-4,1,13,['#c8ffe8','#3ee8a0','#0d7a5a']);g.beginPath();g.arc(0,0,11,0,7);g.fill();});g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke();
  g.fillStyle='#ffde4a';[-1,1].forEach(s=>{poly(g,[s*9,-3,s*17,-9,s*15,3]);g.fill();g.stroke();});
  g.fillStyle='#fff';g.beginPath();g.arc(0,-1,6,0,7);g.fill();g.fillStyle='#2a1040';g.beginPath();g.arc(0,1,3.4,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-1,0,1.2,0,7);g.fill();
  g.strokeStyle='#0d5a40';g.lineWidth=1.2;g.beginPath();g.arc(0,6,3,.3,2.8);g.stroke();},
 sine(g){fillGlow(g,'#c86bff',8,()=>{g.fillStyle=rg(g,0,-6,1,14,['#f3d6ff','#b05cff','#5a1aa0']);g.beginPath();g.ellipse(0,-3,12,9,0,Math.PI,0);g.quadraticCurveTo(12,4,8,4);g.lineTo(-8,4);g.quadraticCurveTo(-12,4,-12,-3);g.fill();});
  g.strokeStyle='#d58cff';g.lineWidth=2.4;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*4,4);g.quadraticCurveTo(i*4+3,9,i*4,14);g.stroke();}
  eyes(g,0,-4,2.8,4.5);g.fillStyle='#ff7ad0';g.beginPath();g.arc(-8,-1,1.6,0,7);g.arc(8,-1,1.6,0,7);g.fill();},
 vwing(g){fillGlow(g,'#ff4f9a',8,()=>{g.fillStyle=lg(g,0,-10,0,10,['#ffb0d8','#ff3f8a','#901050']);poly(g,[0,-6,-8,-9,-18,-2,-15,8,-8,3,-4,9,0,6],true);g.fill();});
  g.strokeStyle=OUT;g.lineWidth=1.3;g.stroke();g.fillStyle='#ffd34a';poly(g,[-15,0,-12,5,-9,1]);g.fill();poly(g,[15,0,12,5,9,1]);g.fill();
  g.fillStyle='#41c8ff';g.beginPath();g.arc(0,-1,5.5,0,7);g.fill();g.stroke();eyes(g,0,-1,1.8,2.4);},
 diver(g){fillGlow(g,'#ffd23a',8,()=>{g.fillStyle=lg(g,0,-12,0,14,['#fff2a0','#ffc21a','#b06a00']);poly(g,[0,15,-6,4,-15,-6,-12,-12,-4,-8,0,-12],true);g.fill();});
  g.strokeStyle=OUT;g.lineWidth=1.3;g.stroke();g.strokeStyle='#3a1a60';g.lineWidth=2;for(let y=-4;y<=6;y+=5){g.beginPath();g.moveTo(-5+Math.abs(y)*.1,y);g.lineTo(5,y);g.stroke();}
  g.fillStyle='rgba(160,230,255,.7)';[-1,1].forEach(s=>{g.beginPath();g.ellipse(s*13,-4,5,3,s*.5,0,7);g.fill();});eyes(g,0,-6,2.4,3.4);},
 kami(g){fillGlow(g,'#ff3a2a',9,()=>{g.fillStyle=lg(g,0,-12,0,14,['#ffa080','#ff3a2a','#8a0a10']);poly(g,[0,16,-12,-4,-9,-12,0,-7],true);g.fill();});
  g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke();g.fillStyle='#ffe14a';poly(g,[0,12,-4,2,4,2]);g.fill();
  eyes(g,0,-4,2.6,4);g.strokeStyle='#2a0010';g.lineWidth=1.6;g.beginPath();g.moveTo(-7,-9);g.lineTo(-2,-7);g.moveTo(7,-9);g.lineTo(2,-7);g.stroke();},
 saucer(g){g.fillStyle=lg(g,0,-14,0,0,['rgba(220,255,255,.95)','rgba(90,200,255,.55)']);g.beginPath();g.ellipse(0,-4,9,9,0,Math.PI,0);g.fill();
  g.fillStyle='#7dff6a';g.beginPath();g.arc(0,-6,5,0,7);g.fill();eyes(g,0,-7,1.6,2.2);
  fillGlow(g,'#36d6ff',8,()=>{g.fillStyle=lg(g,0,-4,0,6,['#d9e4ff','#7a8ad0','#33306a']);g.beginPath();g.ellipse(0,1,19,6,0,0,7);g.fill();});
  g.strokeStyle=OUT;g.lineWidth=1.3;g.stroke();g.fillStyle='#ff9a2a';for(let i=-2;i<=2;i++){g.beginPath();g.arc(i*7,2,1.6,0,7);g.fill();}
  g.fillStyle='#2a2550';g.fillRect(-3,5,6,5);g.fillStyle='#ff4fb8';g.fillRect(-1.5,9,3,3);},
 shield(g){fillGlow(g,'#4f8bff',8,()=>{g.fillStyle=lg(g,0,-14,0,14,['#a8c8ff','#3a6aff','#1a2a8a']);poly(g,[0,-14,-12,-12,-17,-2,-14,10,-6,14,0,12],true);g.fill();});
  g.strokeStyle=OUT;g.lineWidth=1.5;g.stroke();g.fillStyle='#ffcc33';g.fillRect(-12,-3,24,4);g.strokeRect(-12,-3,24,4);
  g.fillStyle='#1a1440';g.beginPath();g.arc(0,-7,5,0,7);g.fill();eyes(g,0,-7,1.6,2.2);g.fillStyle='#7ae8ff';[-10,10].forEach(x=>{g.beginPath();g.arc(x,6,2,0,7);g.fill();});},
 split(g){fillGlow(g,'#ff8a2a',8,()=>{g.fillStyle=rg(g,-3,-4,1,14,['#ffe0a8','#ff8a2a','#b03a00']);g.beginPath();for(let i=0;i<=24;i++){const a=i/24*Math.PI*2,r=12+Math.sin(a*5)*1.6;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.fill();});
  g.strokeStyle=OUT;g.lineWidth=1.4;g.stroke();eyes(g,0,-2,3,4.5);g.strokeStyle='#6a1a00';g.lineWidth=1.3;g.beginPath();g.arc(0,5,3.5,.2,2.9);g.stroke();
  g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-6,-7,3,1.6,-.6,0,7);g.fill();},
 mini(g){fillGlow(g,'#ffb02a',6,()=>{g.fillStyle=rg(g,-2,-2,1,8,['#fff0b8','#ffaa2a','#b85a00']);g.beginPath();g.arc(0,0,7,0,7);g.fill();});g.strokeStyle=OUT;g.lineWidth=1.2;g.stroke();eyes(g,0,-1,1.8,2.6);},
 mine(g){g.strokeStyle='#ff4fd8';g.lineWidth=2.4;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.beginPath();g.moveTo(Math.cos(a)*8,Math.sin(a)*8);g.lineTo(Math.cos(a)*14,Math.sin(a)*14);g.stroke();}
  fillGlow(g,'#ff4fd8',8,()=>{g.fillStyle=rg(g,-2,-3,1,10,['#ffd6f6','#e03ac0','#6a0a5a']);g.beginPath();g.arc(0,0,9,0,7);g.fill();});g.strokeStyle=OUT;g.lineWidth=1.3;g.stroke();eyes(g,0,-1,2,3);},
};
function rockSpr(r,seed,tint){let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};return mk(r*2+6,r*2+6,g=>{const pts=[];const n=11;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr=r*(.78+R()*.28);pts.push(Math.cos(a)*rr,Math.sin(a)*rr);}
 g.fillStyle=rg(g,-r*.35,-r*.35,r*.1,r*1.2,tint);poly(g,pts);g.fill();g.strokeStyle='#1a0e22';g.lineWidth=1.4;g.stroke();
 g.save();poly(g,pts);g.clip();for(let i=0;i<4;i++){const x=(R()-.5)*r,y=(R()-.5)*r,cr=r*(.12+R()*.18);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.arc(x,y,cr,0,7);g.fill();g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(x-cr*.3,y-cr*.3,cr*.6,0,7);g.fill();}
 g.strokeStyle='rgba(255,170,90,.55)';g.lineWidth=1.5;g.beginPath();for(let i=0;i<pts.length/2;i++){const a=i/(pts.length/2)*Math.PI*2;if(a>3.4&&a<5.5)g.lineTo(pts[i*2]*.96,pts[i*2+1]*.96);}g.stroke();g.restore();});}
// ---------- glow dots / bullets ----------
function glowDot(col,r){return mk(r*4,r*4,g=>{g.fillStyle=rg(g,0,0,0,r*2,['rgba(255,255,255,1)',col,col.replace(/[\d.]+\)$/,'0)')]);g.beginPath();g.arc(0,0,r*2,0,7);g.fill();},2);}
function orb(col,r){return mk(r*4,r*4,g=>{g.fillStyle=rg(g,0,0,r*.6,r*2,[col,col.replace(/[\d.]+\)$/,'0)')]);g.beginPath();g.arc(0,0,r*2,0,7);g.fill();g.fillStyle=col;g.beginPath();g.arc(0,0,r,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,0,r*.6,0,7);g.fill();},3);}
function bolt(c1,c2,w,h){return mk(w*3,h+w*2,g=>{fillGlow(g,c1,6,()=>{g.fillStyle=lg(g,0,-h/2,0,h/2,['#fff',c2,c1]);g.beginPath();g.ellipse(0,0,w/2,h/2,0,0,7);g.fill();});g.fillStyle='#fff';g.beginPath();g.ellipse(0,-h*.1,w*.22,h*.35,0,0,7);g.fill();},3);}
// ---------- powerups ----------
const PU_COL={S:'#3dff8a',L:'#3ad8ff',H:'#b8ff3a',W:'#fff08a',P:'#5a8bff',B:'#ffc83a',V:'#3affe0',U:'#6aff9a',M:'#9ad0ff',X:'#ffe14a',C:'#ffd23a'};
function hexA(h){const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+',1)';}
// ---------- enemy bullets: warm danger palette, dark halo so they read on neon ----------
function halo(g,r){g.fillStyle=rg(g,0,0,r*.5,r,['rgba(20,0,12,.9)','rgba(20,0,12,.55)','rgba(20,0,12,0)']);g.beginPath();g.arc(0,0,r,0,7);g.fill();}
function ebOrb(c1,c2,r){return mk(r*5,r*5,g=>{halo(g,r*2.4);fillGlow(g,c1,6,()=>{g.fillStyle=rg(g,-r*.3,-r*.3,0,r*1.25,['#fff',c2,c1,'#5a0024']);g.beginPath();g.arc(0,0,r*1.2,0,7);g.fill();});
 g.strokeStyle='#2a0010';g.lineWidth=1;g.beginPath();g.arc(0,0,r*1.2,0,7);g.stroke();g.strokeStyle=c1;g.lineWidth=.8;g.beginPath();g.arc(0,0,r*1.75,0,7);g.stroke();},3);}
function ebSpike(c1,c2){return mk(20,20,g=>{halo(g,9.5);fillGlow(g,c1,9,()=>{g.fillStyle=rg(g,0,0,0,8,['#fff','#fff6c0',c2,c1]);g.beginPath();for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=i%2?3.2:8;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();});
 g.strokeStyle='#3a0a00';g.lineWidth=1;g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(0,0,1.3,0,7);g.fill();},3);}
function ebPlasma(){return mk(26,26,g=>{halo(g,12.5);fillGlow(g,'#a02aff',10,()=>{g.fillStyle=rg(g,-1.5,-1.5,0,7.5,['#ffe6ff','#e05cff','#8a1ad8','#3a0670']);g.beginPath();g.arc(0,0,7,0,7);g.fill();});
 g.strokeStyle='#ff5ad8';g.lineWidth=1.2;for(let i=0;i<3;i++){g.beginPath();g.arc(0,0,8.6,i*2.1,i*2.1+1.1);g.stroke();}g.strokeStyle='#1a0030';g.lineWidth=1;g.beginPath();g.arc(0,0,7,0,7);g.stroke();},3);}
function ebCrescent(){return mk(20,20,g=>{halo(g,9.5); // points toward +x
 fillGlow(g,'#ff2a2a',6,()=>{g.fillStyle=lg(g,-6,0,7,0,['#7a0010','#ff3a2a','#ffb070']);g.beginPath();g.arc(0,0,6.5,-1.7,1.7);const n=6;for(let i=0;i<=n;i++){const a=1.7-i/n*3.4,r=i%2?2.2:3.6;g.lineTo(Math.cos(a)*r-1.5,Math.sin(a)*r);}g.closePath();g.fill();});
 g.strokeStyle='#2a0006';g.lineWidth=.9;g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(5,0,1,0,7);g.fill();},3);}
function ebNeedle(){return mk(22,12,g=>{halo(g,6);fillGlow(g,'#ff5a1a',6,()=>{g.fillStyle=lg(g,-9,0,9,0,['rgba(255,60,20,0)','#ff3a1a','#ffd08a','#fff']);poly(g,[9,0,-2,3,-9,0,-2,-3]);g.fill();});g.strokeStyle='#3a0800';g.lineWidth=.8;g.stroke();},3);}
ART.ebRot={}; // which enemy bullet sprites orient to velocity / spin
// ---------- rewards: gems, crystals, badges (cool/gold/green, never red) ----------
function gemShape(g,k){switch(k){
 case'S':poly(g,[0,-12,9,-8,12,0,9,8,0,12,-9,8,-12,0,-9,-8]);break;            // octagon emerald
 case'L':poly(g,[0,-14,7,-4,5,11,0,14,-5,11,-7,-4]);break;                       // tall crystal
 case'H':poly(g,[0,-12,10.4,-6,10.4,6,0,12,-10.4,6,-10.4,-6]);break;             // hex gem
 case'W':g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*Math.PI*2,r=i%2?6:13;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();break; // star crystal
 case'P':g.beginPath();g.moveTo(0,-12);g.lineTo(11,-8);g.lineTo(10,3);g.quadraticCurveTo(7,10,0,13);g.quadraticCurveTo(-7,10,-10,3);g.lineTo(-11,-8);g.closePath();break; // shield badge
 case'V':poly(g,[0,-13,11,-2,6,12,-6,12,-11,-2]);break;                          // pentagon
 default:g.beginPath();g.arc(0,0,12,0,7);}}                                       // round badge B,U,M,X
function puSpr(k){const col=PU_COL[k];return mk(34,34,g=>{
 fillGlow(g,col,10,()=>{g.fillStyle=rg(g,-4,-5,1,15,['#ffffff',col,'#0a1a3a']);gemShape(g,k);g.fill();});
 g.strokeStyle='#08102a';g.lineWidth=2.4;g.stroke();g.strokeStyle='#fff';g.lineWidth=1.1;g.stroke();
 // facets
 g.save();gemShape(g,k);g.clip();g.fillStyle='rgba(255,255,255,.28)';poly(g,[-14,-14,14,-14,-14,4]);g.fill();g.fillStyle='rgba(0,10,40,.25)';poly(g,[14,14,-14,14,14,-2]);g.fill();g.restore();
 if('BUMX'.includes(k)){g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1;g.beginPath();g.arc(0,0,9,0,7);g.stroke();}
 const ink='#0a1430',W='#fff';g.lineWidth=1.2;
 const S=(f)=>{g.strokeStyle=ink;g.fillStyle=W;f();};
 switch(k){
  case'S':S(()=>{[-.5,0,.5].forEach(a=>{g.save();g.rotate(a);poly(g,[0,-8,3,-3,1,-3,1,4,-1,4,-1,-3,-3,-3]);g.fill();g.stroke();g.restore();});});break;
  case'L':S(()=>{g.fillRect(-1.6,-9,3.2,16);g.strokeRect(-1.6,-9,3.2,16);g.beginPath();g.arc(0,8,2.6,0,7);g.fill();g.stroke();});break;
  case'H':S(()=>{g.lineWidth=2.2;g.strokeStyle=W;g.beginPath();g.arc(0,0,5.5,0,7);g.stroke();g.beginPath();g.moveTo(0,-9);g.lineTo(0,-3);g.moveTo(0,3);g.lineTo(0,9);g.moveTo(-9,0);g.lineTo(-3,0);g.moveTo(3,0);g.lineTo(9,0);g.stroke();g.fillStyle=W;g.beginPath();g.arc(0,0,1.6,0,7);g.fill();});break;
  case'W':S(()=>{poly(g,[0,-7,5,0,2,0,2,6,-2,6,-2,0,-5,0]);g.fill();g.stroke();});break;
  case'P':S(()=>{g.lineWidth=1.8;g.strokeStyle=W;g.beginPath();g.moveTo(0,-7);g.lineTo(6,-4.5);g.lineTo(5.5,2);g.quadraticCurveTo(3.5,6,0,8);g.quadraticCurveTo(-3.5,6,-5.5,2);g.lineTo(-6,-4.5);g.closePath();g.stroke();});break;
  case'B':S(()=>{g.beginPath();g.arc(0,1.5,5.5,0,7);g.fill();g.stroke();g.fillRect(-1.5,-6.5,3,3);g.strokeStyle='#ffe14a';g.lineWidth=1.4;g.beginPath();g.moveTo(0,-6.5);g.quadraticCurveTo(3,-9,4,-7);g.stroke();});break;
  case'V':S(()=>{[-4,1].forEach(y=>{poly(g,[0,y-4,7,y+3,4,y+3,0,y-.5,-4,y+3,-7,y+3]);g.fill();g.stroke();});});break;
  case'U':S(()=>{poly(g,[-2.5,-8,2.5,-8,2.5,-2.5,8,-2.5,8,2.5,2.5,2.5,2.5,8,-2.5,8,-2.5,2.5,-8,2.5,-8,-2.5,-2.5,-2.5]);g.fill();g.stroke();});break;
  case'M':S(()=>{g.lineWidth=4.5;g.strokeStyle=ink;g.beginPath();g.arc(0,-1,5,Math.PI,0,true);g.lineTo(5,-1);g.stroke();g.lineWidth=3;g.strokeStyle=W;g.beginPath();g.moveTo(-5,-6);g.lineTo(-5,-1);g.arc(0,-1,5,Math.PI,0,true);g.lineTo(5,-6);g.stroke();g.fillStyle='#3ad8ff';g.fillRect(-6.5,-9,3,3);g.fillRect(3.5,-9,3,3);});break;
  case'X':g.font='bold 9px "PS2P",monospace';g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle=ink;g.strokeText('x2',0,1);g.fillStyle=W;g.fillText('x2',0,1);break;}
},3);}
function coinSpr(){return mk(16,16,g=>{fillGlow(g,'#ffd23a',5,()=>{g.fillStyle=rg(g,-2,-2,0,7,['#fffbd0','#ffd23a','#c08a00']);g.beginPath();g.arc(0,0,6.5,0,7);g.fill();});
 g.strokeStyle='#5a3a00';g.lineWidth=1.1;g.stroke();g.strokeStyle='#fff2a0';g.lineWidth=.8;g.beginPath();g.arc(0,0,4.6,0,7);g.stroke();
 g.fillStyle='#ffb000';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*Math.PI*2,r=i%2?1.4:3.2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();g.strokeStyle='#7a4a00';g.lineWidth=.5;g.stroke();
 g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(-2.5,-3,1.6,.8,-.7,0,7);g.fill();},3);}
function glintSpr(){return mk(14,14,g=>{g.fillStyle='#fff';poly(g,[0,-7,1,-1,7,0,1,1,0,7,-1,1,-7,0,-1,-1]);g.fill();g.fillStyle=rg(g,0,0,0,3,['rgba(255,255,255,1)','rgba(255,255,255,0)']);g.beginPath();g.arc(0,0,3,0,7);g.fill();},3);}
// ---------- ship growth tiers (0..4): bigger hull, pods, wings, crests ----------
const TIER_COL=['#36b0ff','#3ad8ff','#3dff9a','#ffd23a','#e8d8ff'];
const SHIP_ACC=[['#ff8a2a','#2b7bff','#ffd08a'],['#ff4fb8','#ffe14a','#3a9bff'],['#a35bff','#ff7a1a','#2bd4ff']];
function shipTier(i,t){const base=[shipKite,shipDart,shipTitan][i],sc=1+t*.09,W=(50+t*14)*1.0,H=(56+t*8);const [a1,a2,a3]=SHIP_ACC[i],tc=TIER_COL[t];
 return mk(W,H,g=>{
  // big rear wings (tier 2+), shape per ship
  if(t>=2){const k=t>=4?1.25:t>=3?1.1:1;[-1,1].forEach(s=>{g.save();g.scale(s,1);
   fillGlow(g,tc,6,()=>{g.fillStyle=lg(g,8,0,34*k,0,[a1,a3,tc]);
    if(i===0)poly(g,[8,2,34*k,14,30*k,20,10,16]);else if(i===1)poly(g,[6,-2,36*k,-12,32*k,-6,10,12]);else poly(g,[10,-6,30*k,-2,32*k,14,22*k,20,10,18]);g.fill();});
   g.strokeStyle=OUT;g.lineWidth=1.2;g.stroke();g.fillStyle=tc;g.globalAlpha=.85;if(i===1)g.fillRect(28*k,-11,4,3);else g.fillRect(26*k,14,5,3);g.globalAlpha=1;g.restore();});}
  // tier 4 crest prongs
  if(t>=4){[-1,1].forEach(s=>{g.fillStyle=lg(g,0,-32,0,-10,['#fff',tc,a2]);poly(g,[s*5,-14,s*12,-34,s*10,-14]);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();});}
  g.save();g.scale(sc,sc);base(g);g.restore();
  // cannon pods (tier 1+), outer cannons (tier 3+)
  const pod=(x,y,len,col)=>{g.fillStyle='#2a2a44';g.fillRect(x-2.5,y-len,5,len+6);g.strokeStyle=OUT;g.lineWidth=1;g.strokeRect(x-2.5,y-len,5,len+6);fillGlow(g,col,6,()=>{g.fillStyle=col;g.fillRect(x-1.5,y-len-2,3,3);});g.fillStyle=a2;g.beginPath();g.arc(x,y+4,3.2,0,7);g.fill();g.stroke();};
  if(t>=1){const px=13*sc;[-1,1].forEach(s=>pod(s*px,0,11+t,tc));}
  if(t>=3){const px=21*sc;[-1,1].forEach(s=>pod(s*px,8,8+t,tc));}
  // glowing gem core on the hull (tier 2+)
  if(t>=2){fillGlow(g,tc,8,()=>{g.fillStyle=rg(g,0,4,0,4,['#fff',tc]);poly(g,[0,0,3,4,0,8,-3,4]);g.fill();});}
 },2.5);}
// ---------- boss motherships (original, procedural) ----------
const BOSS_DEF=[ // name, width, height, accent, accent2, hull style seed
 ['Gloomjaw Carrier',240,130,'#ff8a2a','#3ad8ff',1],['Rockmaw Hauler',250,140,'#ff6a3a','#ffd23a',2],['Frostback Warden',240,140,'#7ae8ff','#ffffff',3],
 ['Twinflare Bastion',270,145,'#ffa030','#3ad8ff',4],['Coral Leviathan',260,150,'#ff4fb8','#ffd23a',5],['Stormcrown Citadel',270,150,'#4f8bff','#e0f0ff',6],
 ['Prism Reaver',250,150,'#3dffd0','#ff4fd8',7],['Forgeheart Dreadnought',290,160,'#ff4a1a','#ffcc33',8],['Hive Matriarch',280,160,'#9bff4a','#c86bff',9],['Oblivion Ark',320,180,'#ff3a8a','#3ad8ff',10]];
function bossSpr(i){const [nm,w,h,a1,a2,sd]=BOSS_DEF[i];let s=sd*7919;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 return mk(w+20,h+20,g=>{const hw=w/2,hh=h/2;
  // hull silhouette: symmetric, built from random-ish plates
  const pts=[0,-hh*.55];const n=7;for(let k=1;k<=n;k++){const t=k/n;pts.push(hw*t*(.75+R()*.35),-hh*(.6-t*.4)+(R()-.5)*hh*.35);}
  pts.push(hw,hh*.15,hw*.82,hh*.45,hw*.55,hh*.35,hw*.38,hh*.85,hw*.18,hh*.6,0,hh);
  g.fillStyle='rgba(0,0,0,0)';
  fillGlow(g,a1,14,()=>{g.fillStyle=lg(g,0,-hh,0,hh,['#4a3a6e','#221a3a','#120c22','#2a1e44']);poly(g,pts,true);g.fill();});
  g.strokeStyle=a1;g.lineWidth=1.6;g.globalAlpha=.8;g.stroke();g.globalAlpha=1;
  g.save();poly(g,pts,true);g.clip();
  // armor plates
  for(let k=0;k<26;k++){const x=(R()-.5)*w,y=(R()-.5)*h,pw=12+R()*40,ph=6+R()*20;[1,-1].forEach(sg=>{g.fillStyle=`rgba(${120+R()*60|0},${100+R()*50|0},${170+R()*60|0},${.08+R()*.16})`;g.fillRect(sg*Math.abs(x)-pw/2,y,pw,ph);g.strokeStyle='rgba(10,5,20,.6)';g.lineWidth=1;g.strokeRect(sg*Math.abs(x)-pw/2,y,pw,ph);});}
  // panel lines
  g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;for(let y=-hh;y<hh;y+=9){g.beginPath();g.moveTo(-hw,y);g.lineTo(hw,y+R()*4);g.stroke();}
  // window strips
  for(let k=0;k<10;k++){const y=(R()-.4)*h*.7,x0=R()*hw*.7,len=10+R()*30;[1,-1].forEach(sg=>{for(let x=0;x<len;x+=4){g.fillStyle=R()<.7?a2:a1;g.globalAlpha=.55+R()*.45;g.fillRect(sg*(x0+x)-1,y,2,1.6);}});}g.globalAlpha=1;
  // rim light
  g.strokeStyle=a2;g.lineWidth=3;g.globalAlpha=.25;poly(g,pts,true);g.stroke();g.globalAlpha=1;g.restore();
  // spine
  g.fillStyle=lg(g,-12,0,12,0,['#1a1030','#5a4a80','#1a1030']);poly(g,[0,-hh*.6,10,-hh*.2,12,hh*.5,0,hh*.95],true);g.fill();g.strokeStyle='#0a0614';g.lineWidth=1.2;g.stroke();
  // engines (top)
  [-.5,-.2,.2,.5].forEach(fx=>{g.fillStyle='#1a1030';g.fillRect(fx*hw-6,-hh*.62,12,10);fillGlow(g,a2,10,()=>{g.fillStyle=a2;g.fillRect(fx*hw-4,-hh*.66,8,3);});});
  // wing tips claws
  [-1,1].forEach(sg=>{g.fillStyle='#2a1e44';poly(g,[sg*hw*.95,hh*.1,sg*hw*1.04,hh*.55,sg*hw*.82,hh*.42]);g.fill();g.strokeStyle=a1;g.lineWidth=1;g.stroke();});
  // core socket (core drawn live)
  g.fillStyle='#0a0614';g.beginPath();g.arc(0,hh*.25,17,0,7);g.fill();g.strokeStyle=a1;g.lineWidth=2.5;g.stroke();
  g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;g.beginPath();g.arc(0,hh*.25,21,0,7);g.stroke();},2);}
function turretSpr(a1){return mk(26,26,g=>{g.fillStyle=lg(g,0,-10,0,10,['#6a5a90','#2a2044','#140c24']);g.beginPath();for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;g.lineTo(Math.cos(a)*10,Math.sin(a)*10);}g.closePath();g.fill();g.strokeStyle=a1;g.lineWidth=1.5;g.stroke();
 g.fillStyle='#120a20';g.fillRect(-2.5,0,5,12);g.strokeStyle='#8a7ab0';g.lineWidth=1;g.strokeRect(-2.5,0,5,12);fillGlow(g,a1,8,()=>{g.fillStyle=a1;g.beginPath();g.arc(0,0,4,0,7);g.fill();});g.fillStyle='#fff';g.beginPath();g.arc(-1,-1,1.4,0,7);g.fill();},2.5);}
// ---------- stage backgrounds ----------
const STAGE_BG=[ // base top,bottom ; nebula colors ; body ; stars tint
 {b:['#0a0420','#1a0838'],n:['rgba(150,60,255,.5)','rgba(255,90,180,.35)','rgba(255,140,40,.25)'],body:'binary0',st:'#e8dcff'},
 {b:['#140808','#2a1010'],n:['rgba(255,110,40,.4)','rgba(150,50,30,.4)','rgba(255,200,90,.2)'],body:'ringed',st:'#ffe0c8',rocks:1},
 {b:['#020a1c','#06223a'],n:['rgba(80,180,255,.38)','rgba(170,240,255,.25)','rgba(90,90,255,.3)'],body:'ice',st:'#d8f4ff',flakes:1},
 {b:['#0c0614','#1a0a20'],n:['rgba(255,150,40,.4)','rgba(60,200,255,.38)','rgba(160,60,200,.3)'],body:'binary',st:'#fff0d8'},
 {b:['#18041a','#2a0830'],n:['rgba(255,70,170,.45)','rgba(255,200,60,.22)','rgba(120,60,255,.3)'],body:'gas',st:'#ffd8f0'},
 {b:['#02061a','#0a1440'],n:['rgba(60,120,255,.45)','rgba(150,220,255,.28)','rgba(160,80,255,.3)'],body:'storm',st:'#d8e8ff',bolts:1},
 {b:['#021414','#082a2a'],n:['rgba(60,255,210,.3)','rgba(255,80,220,.3)','rgba(80,140,255,.3)'],body:'comet',st:'#d8fff4',comets:1},
 {b:['#140404','#2a0a06'],n:['rgba(255,60,20,.4)','rgba(255,170,40,.3)','rgba(120,20,60,.4)'],body:'forge',st:'#ffd8c0',rocks:1},
 {b:['#061008','#14081e'],n:['rgba(130,255,80,.28)','rgba(180,80,255,.38)','rgba(255,90,200,.22)'],body:'hive',st:'#e8ffd8'},
 {b:['#050010','#14001c'],n:['rgba(255,50,140,.4)','rgba(60,200,255,.35)','rgba(255,150,40,.3)','rgba(150,60,255,.4)'],body:'core',st:'#ffffff'}];
function nebulaTile(i){const cfg=STAGE_BG[i];let s=i*131+7;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};const w=120,h=240,c=mkC(w,h),g=c.getContext('2d');
 g.globalCompositeOperation='lighter';
 for(let k=0;k<46;k++){const col=cfg.n[k%cfg.n.length];const side=k%cfg.n.length===0?.25:k%cfg.n.length===2?.8:R();const x=side*w+(R()-.5)*w*.5,y=R()*h,r=12+R()*46;
  for(const oy of[-h,0,h]){const gr=g.createRadialGradient(x,y+oy,0,x,y+oy,r);gr.addColorStop(0,col.replace(/[\d.]+\)$/,(m)=>(parseFloat(m)*.8)+')'));gr.addColorStop(.45,col.replace(/[\d.]+\)$/,(m)=>(parseFloat(m)*.3)+')'));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y+oy-r,r*2,r*2);}}
 // dust filaments
 g.globalCompositeOperation='source-over';for(let k=0;k<20;k++){const x=R()*w,y=R()*h,r=6+R()*18;for(const oy of[-h,0,h]){const gr=g.createRadialGradient(x,y+oy,0,x,y+oy,r);gr.addColorStop(0,'rgba(0,0,0,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y+oy-r,r*2,r*2);}}
 return c;}
function bodySpr(kind,i){const cfg=STAGE_BG[i];return mk(260,260,g=>{
 const sun=(x,y,r,c1,c2)=>{g.globalCompositeOperation='lighter';g.fillStyle=rg(g,x,y,0,r*3.2,[c1,c2,'rgba(0,0,0,0)']);g.beginPath();g.arc(x,y,r*3.2,0,7);g.fill();g.globalCompositeOperation='source-over';
  g.fillStyle=rg(g,x-r*.3,y-r*.3,0,r,['#fff',c1,c2]);g.beginPath();g.arc(x,y,r,0,7);g.fill();
  g.globalCompositeOperation='lighter';g.strokeStyle=c1;g.globalAlpha=.35;g.lineWidth=1.2;g.beginPath();g.moveTo(x-r*3.5,y);g.lineTo(x+r*3.5,y);g.moveTo(x,y-r*2.4);g.lineTo(x,y+r*2.4);g.stroke();g.globalAlpha=1;g.globalCompositeOperation='source-over';};
 const planet=(x,y,r,st,ring)=>{if(ring){g.strokeStyle=ring;g.lineWidth=5;g.globalAlpha=.55;g.beginPath();g.ellipse(x,y,r*1.9,r*.45,-.3,Math.PI,0);g.stroke();g.globalAlpha=1;}
  g.fillStyle=rg(g,x-r*.4,y-r*.4,r*.1,r*1.05,st);g.beginPath();g.arc(x,y,r,0,7);g.fill();
  g.save();g.beginPath();g.arc(x,y,r,0,7);g.clip();g.globalAlpha=.18;for(let k=-4;k<5;k++){g.fillStyle=k%2?'#fff':'#000';g.fillRect(x-r,y+k*r*.22,r*2,r*.1);}g.globalAlpha=1;
  g.fillStyle=rg(g,x+r*.5,y+r*.5,r*.2,r*1.3,['rgba(0,0,0,0)','rgba(0,0,0,.75)']);g.fillRect(x-r,y-r,r*2,r*2);g.restore();
  if(ring){g.strokeStyle=ring;g.lineWidth=5;g.globalAlpha=.75;g.beginPath();g.ellipse(x,y,r*1.9,r*.45,-.3,0,Math.PI);g.stroke();g.globalAlpha=1;}};
 switch(kind){
  case'binary0':sun(-30,-10,16,'rgba(255,150,60,1)','rgba(255,80,20,.5)');sun(40,30,10,'rgba(90,210,255,1)','rgba(40,120,255,.5)');break;
  case'binary':sun(-40,0,26,'rgba(255,160,50,1)','rgba(255,90,10,.55)');sun(45,20,17,'rgba(100,220,255,1)','rgba(30,120,255,.55)');
   g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,200,150,.35)';g.lineWidth=3;g.beginPath();g.moveTo(-15,4);g.quadraticCurveTo(5,-12,30,16);g.stroke();break;
  case'ringed':planet(0,0,50,['#ffd0a0','#c0602a','#3a1008'],'#e8b080');break;
  case'ice':planet(0,0,62,['#ffffff','#9ad8ff','#1a4a8a']);g.save();g.beginPath();g.arc(0,0,62,0,7);g.clip();g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;for(let k=0;k<12;k++){g.beginPath();g.moveTo(-60+k*11,-50);g.lineTo(-40+k*9,40);g.stroke();}g.restore();break;
  case'gas':planet(0,0,70,['#ffd0f0','#e050b0','#40104a'],'#ffcc66');break;
  case'storm':planet(0,0,58,['#d0e8ff','#4070e0','#0a1a5a']);g.globalCompositeOperation='lighter';g.strokeStyle='rgba(200,230,255,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(-20,-40);g.lineTo(-8,-10);g.lineTo(-18,0);g.lineTo(5,30);g.stroke();break;
  case'comet':sun(30,-30,12,'rgba(120,255,220,1)','rgba(30,160,160,.5)');g.globalCompositeOperation='lighter';for(let k=0;k<3;k++){g.strokeStyle=lg(g,-80+k*30,40+k*20,-10+k*30,-10+k*20,['rgba(0,0,0,0)','rgba(160,255,240,.6)']);g.lineWidth=4-k;g.beginPath();g.moveTo(-80+k*30,40+k*20);g.lineTo(-10+k*30,-10+k*20);g.stroke();}break;
  case'forge':planet(0,0,64,['#ffb070','#a02a10','#200404']);g.save();g.beginPath();g.arc(0,0,64,0,7);g.clip();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,140,40,.8)';g.lineWidth=2;for(let k=0;k<7;k++){g.beginPath();g.moveTo(-64,-40+k*14);g.bezierCurveTo(-20,-30+k*12,10,-50+k*16,64,-35+k*13);g.stroke();}g.restore();break;
  case'hive':g.strokeStyle='rgba(160,255,90,.35)';g.lineWidth=2;for(let y=-100;y<110;y+=20)for(let x=-110;x<120;x+=24){const ox=(Math.round(y/20)%2)*12;g.beginPath();for(let k=0;k<6;k++){const a=k/6*Math.PI*2;g.lineTo(x+ox+Math.cos(a)*9,y+Math.sin(a)*9);}g.closePath();if((x*7+y*3)%5===0){g.fillStyle='rgba(200,90,255,.25)';g.fill();}g.stroke();}
   g.globalCompositeOperation='destination-in';g.fillStyle=rg(g,0,0,10,120,['#000','rgba(0,0,0,0)']);g.fillRect(-130,-130,260,260);break;
  case'core':g.globalCompositeOperation='lighter';for(let k=0;k<5;k++){g.strokeStyle=['rgba(255,60,150,.5)','rgba(60,200,255,.45)','rgba(255,150,40,.4)','rgba(150,60,255,.5)','rgba(255,255,255,.3)'][k];g.lineWidth=3;g.beginPath();g.ellipse(0,0,40+k*16,14+k*6,k*.6,0,7);g.stroke();}
   g.fillStyle=rg(g,0,0,0,40,['#fff','rgba(255,80,160,.8)','rgba(0,0,0,0)']);g.beginPath();g.arc(0,0,40,0,7);g.fill();break;}
},2);}
function buildArt(){const S=ART.spr;S.ship=[mk(46,52,shipKite),mk(48,52,shipDart),mk(50,54,shipTitan)];
 for(const k in AL)S[k]=mk(k==='saucer'?42:k==='mini'?18:36,k==='saucer'?30:k==='mini'?18:34,AL[k]);
 const tints=[['#c8a890','#7a5444','#2a1a18'],['#b0a0c8','#5a4a7a','#1a1430'],['#ffd0a0','#a05030','#301008']];
 S.rocks=[];[22,14,8].forEach((r,si)=>{S.rocks[si]=[];for(let v=0;v<3;v++)S.rocks[si].push(rockSpr(r,v*97+si*13+5,tints[v]));});
 S.ice=[22,14,8].map((r,si)=>rockSpr(r,si*31+3,['#ffffff','#8ad0ff','#1a3a7a']));
 S.pb=bolt('#2a8bff','#9ef0ff',4,14);S.pbS=bolt('#16e88a','#c8ffe6',4,11);S.pbT=bolt('#14b8ff','#e6ffff',7,18);S.mis=bolt('#3aff6a','#d0ffd0',4,9);
 S.eb=ebOrb('#ff2a7a','#ff9ad0',3.2);S.eb2=ebSpike('#ff8a1a','#ffe08a');S.eb3=ebPlasma();S.eb4=ebCrescent();S.ebN=ebNeedle();
 const cols={w:'rgba(255,255,255,1)',o:'rgba(255,140,40,1)',p:'rgba(255,70,180,1)',b:'rgba(60,170,255,1)',c:'rgba(80,240,255,1)',y:'rgba(255,220,60,1)',g:'rgba(100,255,120,1)',v:'rgba(170,90,255,1)',r:'rgba(255,60,50,1)'};
 for(const k in cols)ART.glow[k]=glowDot(cols[k],4);
 S.pu={};S.puGlow={};for(const k in PU_COL){S.pu[k]=puSpr(k);S.puGlow[k]=glowDot(hexA(PU_COL[k]),5);}S.coin=coinSpr();S.glint=glintSpr();
 S.shipT=[0,1,2].map(i=>[0,1,2,3,4].map(t=>shipTier(i,t)));}
