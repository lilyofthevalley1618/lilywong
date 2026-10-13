(function(){
var sec=document.getElementById('contact');if(!sec)return;
var cv=document.createElement('canvas');cv.className='bee-plane';cv.setAttribute('aria-hidden','true');sec.insertBefore(cv,sec.firstChild);
var ctx=cv.getContext('2d'),W=0,H=0,DPR=Math.min(devicePixelRatio||1,2),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){var r=sec.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
new ResizeObserver(size).observe(sec);size();
var TN=420,hx=new Float32Array(TN),hy=new Float32Array(TN),hn=0,hi=0;
// path = forward wave + full 360-degree loops, parametrised by travelled distance d
var p={};function newPath(){p.base=H*(.35+Math.random()*.3);p.drift=(Math.random()-.5)*H*.3;p.a1=H*(.06+Math.random()*.08);p.f1=.004+Math.random()*.004;p.a2=8+Math.random()*14;p.f2=.009+Math.random()*.008;p.ph=Math.random()*6.28;
 p.speed=165+Math.random()*35;p.loops=[];var n=2+Math.floor(Math.random()*2),xs=[],gap=W*(n>2?.2:.28);
 for(var t=0;t<60&&xs.length<n;t++){var x=W*(.12+Math.random()*.76);if(xs.every(function(v){return Math.abs(v-x)>gap}))xs.push(x);}if(xs.length<2){xs=[W*.3,W*.68];}
 xs.sort(function(a,b){return a-b});var acc=0;xs.forEach(function(x){var R=Math.min(24+Math.random()*14,H*.1);p.loops.push({x:x,R:R,d0:x+60+acc,L:2*Math.PI*R});acc+=2*Math.PI*R;});
 p.d=0;hn=0;}
function pathY(x){var u=Math.max(0,Math.min(1,x/(W||1)));return p.base+p.drift*(u*u*(3-2*u)-.5)+p.a1*Math.sin(x*p.f1+p.ph)+p.a2*Math.sin(x*p.f2+p.ph*1.7);}
function pos(d){var extra=0;for(var i=0;i<p.loops.length;i++){var l=p.loops[i];
  if(d<l.d0)break;
  if(d<l.d0+l.L){var th=(d-l.d0)/l.R,y0=pathY(l.x);return [l.x+l.R*Math.sin(th),y0-l.R+l.R*Math.cos(th)];}
  extra+=l.L;}
 var x=d-60-extra;return [x,pathY(x)];}
newPath();
var cnt=0,px=0,py=0,ang=0,last=0,visible=false,raf=0;
function plane(x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle='rgba(185,160,255,.85)';ctx.lineWidth=1.3;ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(16,0);ctx.quadraticCurveTo(8,-3.2,-10,-2.4);ctx.lineTo(-14,-7);ctx.lineTo(-16,-7);ctx.lineTo(-14,0);ctx.lineTo(-16,7);ctx.lineTo(-14,7);ctx.lineTo(-10,2.4);ctx.quadraticCurveTo(8,3.2,16,0);ctx.stroke();
 ctx.beginPath();ctx.moveTo(3,-2.6);ctx.lineTo(-4,-13);ctx.lineTo(-7,-13);ctx.lineTo(-4,-2.6);ctx.moveTo(3,2.6);ctx.lineTo(-4,13);ctx.lineTo(-7,13);ctx.lineTo(-4,2.6);ctx.stroke();
 ctx.fillStyle='rgba(167,123,255,.9)';ctx.beginPath();ctx.arc(9,-.6,1.4,0,6.283);ctx.fill();ctx.restore();}
function frame(now){raf=requestAnimationFrame(frame);if(!visible)return;var dt=Math.min((now-(last||now))/1000,1/30);last=now;if(reduce)dt=0;
 var inLoop=p.loops.some(function(l){return p.d>l.d0&&p.d<l.d0+l.L});p.d+=p.speed*dt*(inLoop?.9:1);var q=pos(p.d),tx=q[0],ty=q[1];
 var k=1-Math.exp(-14*dt);var nx=px+(tx-px)*k,ny=py+(ty-py)*k;if(hn===0){nx=tx;ny=ty;}
 var dx=nx-px,dy=ny-py;if(dx*dx+dy*dy>.01){var ta=Math.atan2(dy,dx),da=Math.atan2(Math.sin(ta-ang),Math.cos(ta-ang));ang+=da*(1-Math.exp(-18*dt));}
 px=nx;py=ny;
 if(hn===0||Math.hypot(px-hx[hi],py-hy[hi])>3){hi=(hi+1)%TN;cnt++;hx[hi]=px;hy[hi]=py;if(hn<TN)hn++;}
 ctx.clearRect(0,0,W,H);
 // fading dashed trail (bee-style), drawn as short segments with decreasing alpha
 ctx.lineWidth=1.8;ctx.lineCap='round';
 for(var i=2;i<hn;i+=1){if((((cnt-i)>>1)&1))continue;var a=(hi-i+TN)%TN,b=(hi-i+1+TN)%TN;var f=1-i/hn;
  ctx.strokeStyle='rgba(167,123,255,'+(Math.pow(f,.55)*.85).toFixed(3)+')';ctx.beginPath();ctx.moveTo(hx[a],hy[a]);ctx.lineTo(hx[b],hy[b]);ctx.stroke();}
 plane(px,py,ang);
 if(px>W+60){newPath();var q0=pos(0);px=q0[0];py=q0[1];}
}
new IntersectionObserver(function(en){visible=en[0].isIntersecting;last=0;}).observe(sec);
raf=requestAnimationFrame(frame);
})();
