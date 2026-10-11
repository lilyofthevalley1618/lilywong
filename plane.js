(function(){
var host=document.getElementById('planeScene');if(!host||!window.THREE)return;
var PUR=0xa77bff,BLU=0x7aa2ff,GRY=0xc8c4d4,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var scene=new THREE.Scene();scene.fog=new THREE.Fog(0x000000,10,26);
var cam=new THREE.PerspectiveCamera(34,2,0.1,100);cam.position.set(0,7.5,11);cam.lookAt(0,0.6,0);
var R=new THREE.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(R.domElement);
function size(){var w=host.clientWidth,h=host.clientHeight||1;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
new ResizeObserver(size).observe(host);size();
function terrH(x,z){return Math.sin(x*.38+1.6)*.42+Math.cos(z*.62+1.1)*.3+Math.sin((x-z)*.21)*.25;}
var tg=new THREE.PlaneGeometry(44,22,110,56);tg.rotateX(-Math.PI/2);
var P=tg.attributes.position;for(var i=0;i<P.count;i++)P.setY(i,terrH(P.getX(i),P.getZ(i)));
scene.add(new THREE.Mesh(tg,new THREE.MeshBasicMaterial({color:PUR,wireframe:true,transparent:true,opacity:.11})));
// plane built from primitives: edge outline + faint skin
var plane=new THREE.Group();
function part(g,pos,rot,op){var G=new THREE.Group();
 G.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,12),new THREE.LineBasicMaterial({color:GRY,transparent:true,opacity:op||.8})));
 G.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:PUR,wireframe:true,transparent:true,opacity:.08})));
 G.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.035,side:THREE.DoubleSide,depthWrite:false})));
 if(pos)G.position.set(pos[0],pos[1],pos[2]);if(rot)G.rotation.set(rot[0],rot[1],rot[2]);plane.add(G);return G;}
var prof=[[-1.7,0],[-1.6,.06],[-1.2,.14],[-.4,.2],[.5,.21],[1.1,.17],[1.5,.1],[1.75,.03],[1.8,0]],pts=[];
prof.forEach(function(p){pts.push(new THREE.Vector2(p[1],p[0]));});
var fus=new THREE.LatheGeometry(pts,20);fus.rotateZ(-Math.PI/2);part(fus);
var can=new THREE.SphereGeometry(.17,14,8,0,Math.PI*2,0,Math.PI/2);can.scale(2.4,.9,1);part(can,[.9,.12,0]);
function wing(len,root,tip,sweep,dih,th){var g=new THREE.BoxGeometry(root,th,len,1,1,10),p=g.attributes.position;
 for(var i=0;i<p.count;i++){var t=(p.getZ(i)+len/2)/len;p.setX(i,p.getX(i)*(1-(1-tip/root)*t)-sweep*t);p.setY(i,p.getY(i)+dih*t);}
 g.translate(0,0,len/2);return g;}
var wR=wing(2.3,.95,.32,.75,.18,.035),wL=wR.clone();wL.scale(1,1,-1);part(wR,[.15,-.02,.12]);part(wL,[.15,-.02,-.12]);
var hR=wing(.8,.42,.18,.28,.06,.025),hL=hR.clone();hL.scale(1,1,-1);part(hR,[-1.35,.05,.05]);part(hL,[-1.35,.05,-.05]);
var fin=wing(.75,.5,.2,.35,0,.025);part(fin,[-1.3,.1,0],[-Math.PI/2,0,0]);
[[.95],[-.95]].forEach(function(z){part(new THREE.CylinderGeometry(.08,.07,.55,12),[.25,-.16,z[0]],[0,0,Math.PI/2],.5);});
var props=[];[.95,-.95].forEach(function(z){var pr=new THREE.Group();for(var b=0;b<3;b++){var h=new THREE.Group(),bl=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.012,.36,.04)),new THREE.LineBasicMaterial({color:PUR,transparent:true,opacity:.8}));bl.position.y=.18;h.add(bl);h.rotation.x=b*2.094;pr.add(h);}pr.position.set(.54,-.16,z);plane.add(pr);props.push(pr);});
plane.scale.setScalar(.78);scene.add(plane);
// aim reticle on ground
var ret=new THREE.Group();[.25,.45].forEach(function(r,i){var m=new THREE.Mesh(new THREE.RingGeometry(r,r+.02,48),new THREE.MeshBasicMaterial({color:i?BLU:PUR,transparent:true,opacity:.5-i*.15,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;ret.add(m);});scene.add(ret);
var beam=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:PUR,dashSize:.12,gapSize:.1,transparent:true,opacity:.35}));scene.add(beam);
// shooting
var shots=[],booms=[],aim=new THREE.Vector3(0,0,0),aimT=new THREE.Vector3(),hasMouse=false;
var ndc=new THREE.Vector2(),ray=new THREE.Raycaster(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function toGround(cx,cy){var r=host.getBoundingClientRect();ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(ndc,cam);var h=new THREE.Vector3();
 if(!ray.ray.intersectPlane(gp,h))ray.ray.at(24,h);h.x=THREE.MathUtils.clamp(h.x,-20,20);h.z=THREE.MathUtils.clamp(h.z,-10,7);h.y=terrH(h.x,h.z);return h;}
var nose=new THREE.Vector3(1.85,0,0);
function fire(to){var m=new THREE.Group();
 m.add(new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0xe6dcff})));
 var tr=new THREE.Mesh(new THREE.ConeGeometry(.04,.4,6),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.7}));tr.rotation.z=Math.PI/2;tr.position.x=-.22;m.add(tr);
 var from=nose.clone().applyMatrix4(plane.matrixWorld);m.position.copy(from);scene.add(m);
 shots.push({m:m,from:from,to:to.clone(),t:0,dur:.45+from.distanceTo(to)*.03});}
function boom(at){var g=new THREE.Group();g.position.copy(at);
 var fl=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),new THREE.MeshBasicMaterial({color:0xe6dcff,transparent:true}));g.add(fl);
 var rg=new THREE.Mesh(new THREE.RingGeometry(.06,.1,48),new THREE.MeshBasicMaterial({color:PUR,transparent:true,side:THREE.DoubleSide}));rg.rotation.x=-Math.PI/2;rg.position.y=.03;g.add(rg);
 var N=40,pg=new THREE.BufferGeometry(),pp=new Float32Array(N*3),pv=[];for(var i=0;i<N;i++){var a=Math.random()*6.283,s=.8+Math.random()*1.8;pv.push([Math.cos(a)*s,1+Math.random()*2,Math.sin(a)*s]);}
 pg.setAttribute('position',new THREE.BufferAttribute(pp,3));var pt=new THREE.Points(pg,new THREE.PointsMaterial({color:Math.random()<.5?PUR:BLU,size:.06,transparent:true}));g.add(pt);
 scene.add(g);booms.push({g:g,fl:fl,rg:rg,pt:pt,pv:pv,t:0});}
var sec=document.getElementById('about');
sec.addEventListener('click',function(e){if(e.target.closest('a,button'))return;fire(toGround(e.clientX,e.clientY));});
sec.addEventListener('mousemove',function(e){aimT.copy(toGround(e.clientX,e.clientY));hasMouse=true;});
sec.addEventListener('mouseleave',function(){hasMouse=false;});
var scrollDrift=0,lastSY=scrollY;addEventListener('scroll',function(){scrollDrift=THREE.MathUtils.clamp(scrollDrift+(scrollY-lastSY)*.004,-2,2);lastSY=scrollY;},{passive:true});
var visible=true;new IntersectionObserver(function(en){visible=en[0].isIntersecting;}).observe(host);
var t=0,last=performance.now(),px=0,pz=2,py=2.3;
function frame(now){requestAnimationFrame(frame);if(!visible){last=now;return;}
 var dt=Math.min((now-last)/1000,.05);last=now;if(!reduce)t+=dt;
 scrollDrift*=Math.pow(.3,dt);if(!hasMouse)aimT.set(Math.sin(t*.32)*6,0,Math.cos(t*.23)*3.5),aimT.y=terrH(aimT.x,aimT.z);
 aim.lerp(aimT,1-Math.pow(.002,dt));
 var sd=scrollDrift;var wx=THREE.MathUtils.clamp(aim.x*.7,-3.6,3.6)+Math.sin(t*.7)*.3,wz=THREE.MathUtils.clamp(aim.z*.7+.3+sd,-1.4,2.4)+Math.cos(t*.5)*.3;
 var k=1-Math.pow(.55,dt),nx=px+(wx-px)*k,nz=pz+(wz-pz)*k,vx=(nx-px)/dt,vz=(nz-pz)/dt;px=nx;pz=nz;
 var ny=py+((2.4+Math.sin(t*.8)*.15)-py)*k;var vy=(ny-py)/dt;py=ny;plane.position.set(px,py,pz);
 // nose toward aim point: yaw + pitch, bank on turns
 var dx=aim.x-px,dz=aim.z-pz,dy=aim.y-py,head=Math.atan2(-dz,dx);var dyaw=Math.atan2(Math.sin(head-plane.rotation.y),Math.cos(head-plane.rotation.y));
 plane.rotation.order='YZX';plane.rotation.y+=dyaw*Math.min(dt*2.2,1);
 var pitch=THREE.MathUtils.clamp(Math.atan2(dy,Math.hypot(dx,dz))*.6+vy*.1,-.6,.3);plane.rotation.z+=(pitch-plane.rotation.z)*Math.min(dt*2.5,1);
 var bank=THREE.MathUtils.clamp(dyaw*.9,-.6,.6);plane.rotation.x+=(-bank-plane.rotation.x)*Math.min(dt*2.2,1);
 props.forEach(function(p){p.rotation.x+=dt*30;});
 ret.position.set(aim.x,aim.y+.02,aim.z);ret.rotation.y+=dt*.6;var s=1+Math.sin(t*3)*.06;ret.scale.set(s,1,s);
 plane.updateMatrixWorld();var bp=beam.geometry.attributes.position;var nw=nose.clone().applyMatrix4(plane.matrixWorld);
 bp.setXYZ(0,nw.x,nw.y,nw.z);bp.setXYZ(1,aim.x,aim.y,aim.z);bp.needsUpdate=true;beam.computeLineDistances();
 for(var i=shots.length-1;i>=0;i--){var S=shots[i];S.t+=dt/S.dur;var u=Math.min(S.t,1);S.m.position.lerpVectors(S.from,S.to,u);S.m.position.y+=Math.sin(u*Math.PI)*.4;
  S.m.lookAt(S.to);S.m.rotateY(-Math.PI/2);if(S.t>=1){boom(S.to);scene.remove(S.m);shots.splice(i,1);}}
 for(var j=booms.length-1;j>=0;j--){var B=booms[j];B.t+=dt/.9;var e=B.t;B.fl.scale.setScalar(1+e*3);B.fl.material.opacity=Math.max(0,1-e*2.2);
  B.rg.scale.setScalar(1+e*14);B.rg.material.opacity=Math.max(0,.9-e);var a=B.pt.geometry.attributes.position;
  for(var q=0;q<B.pv.length;q++){a.setXYZ(q,B.pv[q][0]*e*.9,Math.max(0,B.pv[q][1]*e-2.4*e*e),B.pv[q][2]*e*.9);}a.needsUpdate=true;B.pt.material.opacity=Math.max(0,1-e);
  if(e>=1){scene.remove(B.g);booms.splice(j,1);}}
 R.render(scene,cam);}
requestAnimationFrame(frame);
window.__fire=function(x,y){fire(toGround(x,y));};
})();
