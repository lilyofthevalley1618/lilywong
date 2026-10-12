(function(){
var sec=document.getElementById('contact');if(!sec)return;
var cv=document.createElement('canvas');cv.className='bee-plane';cv.setAttribute('aria-hidden','true');sec.insertBefore(cv,sec.firstChild);
var ctx=cv.getContext('2d'),W=0,H=0,DPR=Math.min(devicePixelRatio||1,2),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){var r=sec.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
new ResizeObserver(size).observe(sec);size();
var TN=160,hx=new Float32Array(TN),hy=new Float32Array(TN),hn=0,hi=0;
var p={};function newPath(){p.x=-60;p.base=H*(.22+Math.random()*.56);p.a1=12+Math.random()*22;p.f1=.004+Math.random()*.004;p.a2=4+Math.random()*8;p.f2=.011+Math.random()*.008;p.ph=Math.random()*6.28;
 p.speed=70+Math.random()*30;p.nextLoop=W*(.15+Math.random()*.4);p.loopT=-1;p.loopR=22+Math.random()*14;p.loops=Math.random()<.75?1:0;hn=0;}
newPath();
var cnt=0,px=0,py=0,ang=0,last=0,visible=false,raf=0;
function pathY(x){return p.base+p.a1*Math.sin(x*p.f1+p.ph)+p.a2*Math.sin(x*p.f2+p.ph*1.7);}
function plane(x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle='rgba(185,160,255,.85)';ctx.lineWidth=1.3;ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(16,0);ctx.quadraticCurveTo(8,-3.2,-10,-2.4);ctx.lineTo(-14,-7);ctx.lineTo(-16,-7);ctx.lineTo(-14,0);ctx.lineTo(-16,7);ctx.lineTo(-14,7);ctx.lineTo(-10,2.4);ctx.quadraticCurveTo(8,3.2,16,0);ctx.stroke();
 ctx.beginPath();ctx.moveTo(3,-2.6);ctx.lineTo(-4,-13);ctx.lineTo(-7,-13);ctx.lineTo(-4,-2.6);ctx.moveTo(3,2.6);ctx.lineTo(-4,13);ctx.lineTo(-7,13);ctx.lineTo(-4,2.6);ctx.stroke();
 ctx.fillStyle='rgba(167,123,255,.9)';ctx.beginPath();ctx.arc(9,-.6,1.4,0,6.283);ctx.fill();ctx.restore();}
function frame(now){raf=requestAnimationFrame(frame);if(!visible)return;var dt=Math.min((now-(last||now))/1000,1/30);last=now;if(reduce)dt=0;
 p.x+=p.speed*dt;var tx=p.x,ty=pathY(p.x);
 // soft loop: a circle blended in/out with a smooth envelope
 if(p.loops&&p.loopT<0&&p.x>p.nextLoop){p.loopT=0;}
 if(p.loopT>=0){p.loopT+=dt/2.4;var u=Math.min(p.loopT,1),th=u*Math.PI*2,env=Math.sin(u*Math.PI);env*=env;
  tx+=-Math.sin(th)*p.loopR*1.2*env*1.4;ty+=-(1-Math.cos(th))*p.loopR*env;p.x-=p.speed*dt*.55*Math.sin(u*Math.PI);
  if(p.loopT>=1){p.loopT=-1;p.loops=Math.random()<.5?1:0;p.nextLoop=p.x+W*(.2+Math.random()*.3);}}
 var k=1-Math.exp(-14*dt);var nx=px+(tx-px)*k,ny=py+(ty-py)*k;if(hn===0){nx=tx;ny=ty;}
 var dx=nx-px,dy=ny-py;if(dx*dx+dy*dy>.01){var ta=Math.atan2(dy,dx),da=Math.atan2(Math.sin(ta-ang),Math.cos(ta-ang));ang+=da*(1-Math.exp(-10*dt));}
 px=nx;py=ny;
 if(hn===0||Math.hypot(px-hx[hi],py-hy[hi])>3){hi=(hi+1)%TN;cnt++;hx[hi]=px;hy[hi]=py;if(hn<TN)hn++;}
 ctx.clearRect(0,0,W,H);
 // fading dashed trail (bee-style), drawn as short segments with decreasing alpha
 ctx.lineWidth=1.8;ctx.lineCap='round';
 for(var i=2;i<hn;i+=1){if((((cnt-i)>>1)&1))continue;var a=(hi-i+TN)%TN,b=(hi-i+1+TN)%TN;var f=1-i/hn;
  ctx.strokeStyle='rgba(167,123,255,'+(f*.9).toFixed(3)+')';ctx.beginPath();ctx.moveTo(hx[a],hy[a]);ctx.lineTo(hx[b],hy[b]);ctx.stroke();}
 plane(px,py,ang);
 if(px>W+60){newPath();px=p.x;py=pathY(p.x);}
}
new IntersectionObserver(function(en){visible=en[0].isIntersecting;last=0;}).observe(sec);
raf=requestAnimationFrame(frame);
})();
