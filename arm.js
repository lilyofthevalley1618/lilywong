(function(){
var host=document.getElementById('armScene');if(!host||!window.THREE)return;
var PUR=0xa77bff,BLU=0x7aa2ff,GRY=0xc8c4d4,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var scene=new THREE.Scene();scene.fog=new THREE.Fog(0x000000,13,26);
var cam=new THREE.PerspectiveCamera(40,1,.1,60);cam.position.set(2.2,8.2,12.6);cam.lookAt(0,1.3,.2);
var R=new THREE.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(R.domElement);
function size(){var w=host.clientWidth,h=host.clientHeight||1;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
new ResizeObserver(size).observe(host);size();
var grid=new THREE.PlaneGeometry(20,20,50,50);grid.rotateX(-Math.PI/2);
scene.add(new THREE.Mesh(grid,new THREE.MeshBasicMaterial({color:PUR,wireframe:true,transparent:true,opacity:.13})));
var pad=new THREE.Mesh(new THREE.RingGeometry(.9,.93,64),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.35,side:THREE.DoubleSide}));pad.rotation.x=-Math.PI/2;pad.position.y=.01;scene.add(pad);
function part(parent,g,pos,rot,op,col){var G=new THREE.Group();
 G.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,15),new THREE.LineBasicMaterial({color:col||GRY,transparent:true,opacity:op||.75})));
 G.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.05,side:THREE.DoubleSide,depthWrite:false})));
 if(pos)G.position.set(pos[0],pos[1],pos[2]);if(rot)G.rotation.set(rot[0],rot[1],rot[2]);parent.add(G);return G;}
function servo(parent,x,y,r){part(parent,new THREE.CylinderGeometry(r,r,.42,20),[x,y,0],[Math.PI/2,0,0]);part(parent,new THREE.CylinderGeometry(r*.55,r*.55,.5,16),[x,y,0],[Math.PI/2,0,0],.5,PUR);
 part(parent,new THREE.BoxGeometry(r*1.3,r*.9,.44),[x-r*.9,y,0],null,.5);}
function pcb(parent,x0,len,y){var b=part(parent,new THREE.BoxGeometry(len,.16,.02),[x0+len/2,y,.135],null,.6,PUR);
 for(var i=0;i<3;i++)part(b,new THREE.BoxGeometry(.08,.06,.02),[-len/2+.12+i*(len/3.4),0,.02],null,.6);
 var tr=[];for(var k=0;k<4;k++){tr.push(new THREE.Vector3(-len/2+.05,-.05+k*.03,.012),new THREE.Vector3(len/2-.05,-.05+k*.03,.012));}
 b.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tr),new THREE.LineBasicMaterial({color:BLU,transparent:true,opacity:.35})));}
var pulses=[];
function wires(parent,len,yOff){[.07,-.07].forEach(function(zz,n){var pts=[];for(var i=0;i<=8;i++){var t=i/8;pts.push(new THREE.Vector3(t*len,yOff+Math.sin(t*Math.PI)*.07+n*.02,zz*1.9));}
 var c=new THREE.CatmullRomCurve3(pts);parent.add(new THREE.Mesh(new THREE.TubeGeometry(c,24,.012,5),new THREE.MeshBasicMaterial({color:0x8a84a0,transparent:true,opacity:.55})));
 var p=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.95}));parent.add(p);pulses.push({c:c,m:p,o:Math.random()});});}
var L1=2.24,L2=1.96,H=.75,G=.55;
var base=new THREE.Group();scene.add(base);
part(scene,new THREE.CylinderGeometry(.62,.72,.22,28),[0,.11,0]);
part(base,new THREE.CylinderGeometry(.4,.48,.45,24),[0,.44,0]);
var sh=new THREE.Group();sh.position.y=H;base.add(sh);servo(sh,0,0,.2);
part(sh,new THREE.BoxGeometry(L1,.2,.22),[L1/2,0,0]);pcb(sh,.3,1.5,0);wires(sh,L1,.16);
var el=new THREE.Group();el.position.x=L1;sh.add(el);servo(el,0,0,.17);
part(el,new THREE.BoxGeometry(L2,.16,.18),[L2/2,0,0]);pcb(el,.25,1.25,0);wires(el,L2,.13);
var wr=new THREE.Group();wr.position.x=L2;el.add(wr);servo(wr,0,0,.12);
var hand=new THREE.Group();wr.add(hand);
part(hand,new THREE.CylinderGeometry(.09,.11,.22,14),[0,-.18,0]);part(hand,new THREE.BoxGeometry(.4,.06,.16),[0,-.3,0]);
var fA=new THREE.Group(),fB=new THREE.Group();hand.add(fA);hand.add(fB);
part(fA,new THREE.BoxGeometry(.04,.26,.12),[0,-.13,0]);part(fB,new THREE.BoxGeometry(.04,.26,.12),[0,-.13,0]);fA.position.y=fB.position.y=-.32;
// component (glowing chip)
var comp=new THREE.Group();part(comp,new THREE.BoxGeometry(.3,.09,.2),null,.95,0xd9c8ff);
for(var i=0;i<4;i++){part(comp,new THREE.BoxGeometry(.02,.05,.06),[-.105+i*.07,-.03,.13],null,.7,PUR);part(comp,new THREE.BoxGeometry(.02,.05,.06),[-.105+i*.07,-.03,-.13],null,.7,PUR);}
var glow=new THREE.Mesh(new THREE.BoxGeometry(.28,.07,.18),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.35}));comp.add(glow);
var halo=new THREE.Mesh(new THREE.RingGeometry(.22,.25,40),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.5,side:THREE.DoubleSide}));halo.rotation.x=-Math.PI/2;scene.add(halo);
comp.position.set(2.6,.045,1.6);scene.add(comp);
var ret=new THREE.Mesh(new THREE.RingGeometry(.12,.14,32),new THREE.MeshBasicMaterial({color:BLU,transparent:true,opacity:.5,side:THREE.DoubleSide}));ret.rotation.x=-Math.PI/2;scene.add(ret);
// input
var ndc=new THREE.Vector2(),ray=new THREE.Raycaster(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function ground(e){var r=host.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,cam);var h=new THREE.Vector3();if(!ray.ray.intersectPlane(gp,h))return null;return clampR(h);}
function clampR(h){var r=Math.hypot(h.x,h.z),a=Math.atan2(h.z,h.x);r=THREE.MathUtils.clamp(r,1.1,3.45);h.set(Math.cos(a)*r,0,Math.sin(a)*r);return h;}
var mouse=null,hold=false,state='idle',goal=new THREE.Vector3(),stT=0;
host.addEventListener('mousemove',function(e){mouse=ground(e);});host.addEventListener('mouseleave',function(){mouse=null;});
function click(p){if(state!=='idle'&&state!=='carry')return;goal.copy(p);state=hold?'lower-drop':'lower-grab';stT=0;
 if(!hold){comp.position.set(p.x,.045,p.z);comp.rotation.y=Math.random()*3;}}
host.addEventListener('click',function(e){var p=ground(e);if(p)click(p);});
window.__armClick=function(x,y){var p=ground({clientX:x,clientY:y});if(p)click(p);};
var visible=false;new IntersectionObserver(function(en){visible=en[0].isIntersecting;}).observe(host);
var wrist=new THREE.Vector3(1.6,1.2,.6),want=new THREE.Vector3(),t=0,last=performance.now(),grip=0,gripT=0;
var curDt=1/60;function ez(k,dt){return 1-Math.exp(-k*dt);}
function ik(p){var yaw=Math.atan2(-p.z,p.x);var r=Math.hypot(p.x,p.z),dy=p.y-H,d=THREE.MathUtils.clamp(Math.hypot(r,dy),.4,L1+L2-.02);
 var a1=Math.atan2(dy,r)+Math.acos((L1*L1+d*d-L2*L2)/(2*L1*d)),inner=Math.acos((L1*L1+L2*L2-d*d)/(2*L1*L2));
 var dyw=Math.atan2(Math.sin(yaw-base.rotation.y),Math.cos(yaw-base.rotation.y));base.rotation.y+=dyw*ez(9,curDt);
 sh.rotation.z=a1;el.rotation.z=-(Math.PI-inner);wr.rotation.z=-(sh.rotation.z+el.rotation.z);}
function frame(now){requestAnimationFrame(frame);if(!visible){last=now;return;}
 var dt=Math.min((now-last)/1000,1/30);last=now;if(!reduce)t+=dt;stT+=dt;
 var hover=1.35;
 if(state==='idle'||state==='carry'){var m=mouse||clampR(new THREE.Vector3(Math.cos(t*.3)*2.6,0,Math.sin(t*.3)*1.8+.5));want.set(m.x,hover+Math.sin(t*1.3)*.06,m.z);}
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
 scene.updateMatrixWorld(true);
 if(hold){var tip=new THREE.Vector3(0,-.5,0);hand.localToWorld(tip);comp.position.copy(tip);comp.rotation.y=base.rotation.y;}
 halo.position.set(comp.position.x,.01,comp.position.z);halo.material.opacity=hold?.15:.35+Math.sin(t*4)*.15;
 glow.material.opacity=.3+Math.sin(t*5)*.15;
 var rp=mouse||want;ret.position.set(rp.x,.012,rp.z);ret.visible=!!mouse;
 pulses.forEach(function(p){var u=(t*.45+p.o)%1;p.m.position.copy(p.c.getPointAt(u));p.m.material.opacity=Math.sin(u*Math.PI);});
 R.render(scene,cam);}
requestAnimationFrame(frame);
})();
