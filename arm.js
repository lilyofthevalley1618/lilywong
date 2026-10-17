(function(){
var host=document.getElementById('armScene');if(!host||!window.THREE)return;
var PUR=0xa77bff,BLU=0x7aa2ff,GRY=0xc8c4d4,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var scene=new THREE.Scene();scene.fog=new THREE.Fog(0x000000,14,30);
var M=1.75,W=new THREE.Group();W.scale.setScalar(M);scene.add(W);
var cam=new THREE.PerspectiveCamera(40,1,.1,60);cam.position.set(2.0,8.6,13.4);cam.lookAt(0,2.4,.4);
var R=new THREE.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(R.domElement);
function size(){var w=host.clientWidth,h=host.clientHeight||1;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
new ResizeObserver(size).observe(host);size();
var grid=new THREE.PlaneGeometry(20,20,50,50);grid.rotateX(-Math.PI/2);
W.add(new THREE.Mesh(grid,new THREE.MeshBasicMaterial({color:PUR,wireframe:true,transparent:true,opacity:.13})));
var pad=new THREE.Mesh(new THREE.RingGeometry(.9,.93,64),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.35,side:THREE.DoubleSide}));pad.rotation.x=-Math.PI/2;pad.position.y=.01;W.add(pad);
function part(parent,g,pos,rot,op,col){var G=new THREE.Group();
 G.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,15),new THREE.LineBasicMaterial({color:col||GRY,transparent:true,opacity:op||.75})));
 G.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.05,side:THREE.DoubleSide,depthWrite:false})));
 if(pos)G.position.set(pos[0],pos[1],pos[2]);if(rot)G.rotation.set(rot[0],rot[1],rot[2]);parent.add(G);return G;}
var pulses=[];
var L1=2.7,L2=2.36,H=.75,G=.55;
var anim=[];
var base=new THREE.Group();W.add(base);
var sh=new THREE.Group();sh.position.y=H;base.add(sh);
var el=new THREE.Group();el.position.x=L1;sh.add(el);
var wr=new THREE.Group();wr.position.x=L2;el.add(wr);
var hand=new THREE.Group();wr.add(hand);
var fA=new THREE.Group(),fB=new THREE.Group();hand.add(fA);hand.add(fB);fA.position.y=fB.position.y=-.32;
function bolts(parent,x,y,z,r,n){for(var i=0;i<n;i++){var a=i/n*Math.PI*2;part(parent,new THREE.CylinderGeometry(.022,.022,.03,6),[x+Math.cos(a)*r,y+Math.sin(a)*r,z],[Math.PI/2,0,0],.8,PUR);}}
function housing(parent,x,y,r,w,nb){part(parent,new THREE.CylinderGeometry(r,r,w,24),[x,y,0],[Math.PI/2,0,0],.8);part(parent,new THREE.CylinderGeometry(r*.62,r*.62,w+.04,20),[x,y,0],[Math.PI/2,0,0],.55,PUR);bolts(parent,x,y,w/2+.02,r*.8,nb);bolts(parent,x,y,-w/2-.02,r*.8,nb);}
function tube(parent,pts,r,col,op){var c=new THREE.CatmullRomCurve3(pts.map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);}));parent.add(new THREE.Mesh(new THREE.TubeGeometry(c,30,r,6),new THREE.MeshBasicMaterial({color:col||0x8a84a0,transparent:true,opacity:op||.55})));return c;}
function lineSet(parent,arr,col,op){var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));parent.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:col||PUR,transparent:true,opacity:op||.6})));}
// ---- industrial 6-axis arm ----
 part(W,new THREE.BoxGeometry(1.7,.1,1.7),[0,.05,0],null,.7);[[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]].forEach(function(c){part(W,new THREE.CylinderGeometry(.05,.05,.04,8),[c[0],.12,c[1]],null,.8,PUR);});
 part(base,new THREE.CylinderGeometry(.6,.62,.18,32),[0,.19,0],null,.8);
 var gear=new THREE.TorusGeometry(.6,.025,6,48);gear.rotateX(Math.PI/2);part(base,gear,[0,.28,0],null,.7,PUR);
 var tk=[];for(var i=0;i<36;i++){var a=i/36*Math.PI*2;tk.push(Math.cos(a)*.6,.28,Math.sin(a)*.6,Math.cos(a)*.66,.28,Math.sin(a)*.66);}lineSet(base,tk,PUR,.5);
 part(base,new THREE.BoxGeometry(.5,.4,.56),[0,.5,0],null,.8);
 housing(sh,0,0,.33,.5,8);
 part(sh,new THREE.BoxGeometry(L1*.55,.38,.34),[L1*.3,0,0],null,.8);part(sh,new THREE.BoxGeometry(L1*.5,.28,.28),[L1*.72,0,0],null,.8);
 var pl=[];[.1,-.1].forEach(function(y){pl.push(.35,y,.172,L1-.3,y*.7,.142);});lineSet(sh,pl,PUR,.5);
 var cr=tube(sh,[[-.1,.36,.1],[L1*.3,.3,.12],[L1*.7,.24,.12],[L1-.05,.3,.1]],.025,BLU,.6);
 [.6,1.3,2.0].forEach(function(x){part(sh,new THREE.BoxGeometry(.05,.1,.2),[x,.25,.12],null,.6,PUR);});
 housing(el,0,0,.26,.42,6);
 part(el,new THREE.CylinderGeometry(.14,.16,L2*.8,18),[L2*.45,0,0],[0,0,Math.PI/2],.8);
 var roll=new THREE.Group();roll.position.x=L2*.86;el.add(roll);part(roll,new THREE.CylinderGeometry(.17,.17,.12,18),null,[0,0,Math.PI/2],.8,PUR);
 var rl=[];for(var i=0;i<6;i++){var a=i/6*Math.PI*2;rl.push(0,Math.cos(a)*.17,Math.sin(a)*.17,0,Math.cos(a)*.12,Math.sin(a)*.12);}lineSet(roll,rl,PUR,.7);
 anim.push(function(t){roll.rotation.x=Math.sin(t*.8)*.6;});
 tube(el,[[.05,.2,.1],[L2*.5,.2,.1],[L2-.1,.18,.08]],.022,BLU,.6);
 housing(wr,0,0,.18,.34,6);
 part(hand,new THREE.CylinderGeometry(.11,.11,.16,16),[0,-.14,0],null,.8);var wroll=new THREE.Group();hand.add(wroll);
 part(wroll,new THREE.BoxGeometry(.46,.09,.2),[0,-.27,0],null,.85);part(wroll,new THREE.BoxGeometry(.42,.02,.05),[0,-.32,.07],null,.6,PUR);part(wroll,new THREE.BoxGeometry(.42,.02,.05),[0,-.32,-.07],null,.6,PUR);
 [fA,fB].forEach(function(f){part(f,new THREE.BoxGeometry(.05,.28,.13),[0,-.14,0],null,.85);part(f,new THREE.BoxGeometry(.02,.12,.11),[0,-.22,0],null,.8,PUR);});
// component (glowing chip)
var comp=new THREE.Group();part(comp,new THREE.BoxGeometry(.3,.09,.2),null,.95,0xd9c8ff);
for(var i=0;i<4;i++){part(comp,new THREE.BoxGeometry(.02,.05,.06),[-.105+i*.07,-.03,.13],null,.7,PUR);part(comp,new THREE.BoxGeometry(.02,.05,.06),[-.105+i*.07,-.03,-.13],null,.7,PUR);}
var glow=new THREE.Mesh(new THREE.BoxGeometry(.28,.07,.18),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.35}));comp.add(glow);
var halo=new THREE.Mesh(new THREE.RingGeometry(.22,.25,40),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.5,side:THREE.DoubleSide}));halo.rotation.x=-Math.PI/2;W.add(halo);
comp.position.set(2.2,.045,1.9);W.add(comp);
var ret=new THREE.Mesh(new THREE.RingGeometry(.12,.14,32),new THREE.MeshBasicMaterial({color:BLU,transparent:true,opacity:.5,side:THREE.DoubleSide}));ret.rotation.x=-Math.PI/2;W.add(ret);
// input
var ndc=new THREE.Vector2(),ray=new THREE.Raycaster(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function ground(e){var r=host.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,cam);var h=new THREE.Vector3();if(!ray.ray.intersectPlane(gp,h))return null;h.divideScalar(M);return clampR(h);}
function clampR(h){var r=Math.hypot(h.x,h.z),a=Math.atan2(h.z,h.x);r=THREE.MathUtils.clamp(r,1.1,RMAX);h.set(Math.cos(a)*r,0,Math.sin(a)*r);return fit(h);}
var RMAX=4.6,pv=new THREE.Vector3();
function inFrame(x,y,z){pv.set(x*M,y*M,z*M).project(cam);return Math.abs(pv.x)<.8&&pv.y>-.82&&pv.y<.8;}
function fit(h){cam.updateMatrixWorld();for(var i=0;i<60;i++){if(inFrame(h.x,0,h.z)&&inFrame(h.x,1.6,h.z))break;var rr=Math.hypot(h.x,h.z);if(rr<=1.15)break;h.multiplyScalar(.97);}return h;}
var mouse=null,hold=false,state='idle',goal=new THREE.Vector3(),stT=0;
host.addEventListener('mousemove',function(e){mouse=ground(e);});host.addEventListener('mouseleave',function(){mouse=null;});
function click(p){if(state!=='idle'&&state!=='carry')return;goal.copy(p);state=hold?'lower-drop':'lower-grab';stT=0;
 if(!hold){comp.position.set(p.x,.045,p.z);comp.rotation.y=Math.random()*3;}}
host.addEventListener('click',function(e){var p=ground(e);if(p)click(p);});
window.__armClick=function(x,y){var p=ground({clientX:x,clientY:y});if(p)click(p);};
var visible=false;new IntersectionObserver(function(en){visible=en[0].isIntersecting;}).observe(host);
var wrist=new THREE.Vector3(1.6,1.2,.6),want=new THREE.Vector3(),t=0,last=performance.now(),grip=0,gripT=0;
var curDt=1/60,tip=new THREE.Vector3();function ez(k,dt){return 1-Math.exp(-k*dt);}
function ik(p){var yaw=Math.atan2(-p.z,p.x);var r=Math.hypot(p.x,p.z),dy=p.y-H,d=THREE.MathUtils.clamp(Math.hypot(r,dy),.4,L1+L2-.02);
 var a1=Math.atan2(dy,r)+Math.acos((L1*L1+d*d-L2*L2)/(2*L1*d)),inner=Math.acos((L1*L1+L2*L2-d*d)/(2*L1*L2));
 var dyw=Math.atan2(Math.sin(yaw-base.rotation.y),Math.cos(yaw-base.rotation.y));base.rotation.y+=dyw*ez(9,curDt);
 sh.rotation.z=a1;el.rotation.z=-(Math.PI-inner);wr.rotation.z=-(sh.rotation.z+el.rotation.z);}
function frame(now){requestAnimationFrame(frame);if(!visible){last=now;return;}
 var dt=Math.min((now-last)/1000,1/30);last=now;if(!reduce)t+=dt;stT+=dt;
 var hover=1.35;
 if(state==='idle'||state==='carry'){var m=mouse||clampR(new THREE.Vector3(Math.cos(t*.3)*2.4,0,Math.sin(t*.3)*2.2+.6));want.set(m.x,hover+Math.sin(t*1.3)*.06,m.z);}
 else{var low=(state==='lower-grab'||state==='close')?.09+G:.12+G;
  if(state==='lower-grab'||state==='lower-drop')want.set(goal.x,low,goal.z);
  if(state==='lower-grab'&&wrist.distanceTo(want)<.04){state='close';stT=0;}
  if(state==='close'){gripT=1;if(stT>.35){hold=true;state='lift';stT=0;}}
  if(state==='lower-drop'&&wrist.distanceTo(want)<.04){state='open';stT=0;}
  if(state==='open'){gripT=0;if(stT>.3){hold=false;comp.position.set(goal.x,.045,goal.z);state='lift';stT=0;}}
  if(state==='lift'){want.set(goal.x,hover,goal.z);if(stT>.6){state=hold?'carry':'idle';}}}
 var k=ez(state==='idle'||state==='carry'?2.6:4.2,dt);wrist.lerp(want,k);
 curDt=dt;ik(wrist);
 grip+=(gripT-grip)*ez(10,dt);var sp=.15-grip*.13;fA.position.x=sp;fB.position.x=-sp;
 scene.updateMatrixWorld(true);for(var ai=0;ai<anim.length;ai++)anim[ai](t,grip);
 if(hold){tip.set(0,-.5,0);hand.localToWorld(tip);W.worldToLocal(tip);comp.position.copy(tip);comp.rotation.y=base.rotation.y;}
 halo.position.set(comp.position.x,.01,comp.position.z);halo.material.opacity=hold?.15:.35+Math.sin(t*4)*.15;
 glow.material.opacity=.3+Math.sin(t*5)*.15;
 var rp=mouse||want;ret.position.set(rp.x,.012,rp.z);ret.visible=!!mouse;
 pulses.forEach(function(p){var u=(t*.45+p.o)%1;p.m.position.copy(p.c.getPointAt(u));p.m.material.opacity=Math.sin(u*Math.PI);});
 R.render(scene,cam);}
requestAnimationFrame(frame);
})();
