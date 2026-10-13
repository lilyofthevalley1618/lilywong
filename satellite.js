(function(){
var box=document.getElementById('satScene');if(!box||!window.THREE)return;
var hero=document.getElementById('top');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var R=new THREE.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,2));box.appendChild(R.domElement);
var S=new THREE.Scene(),C=new THREE.PerspectiveCamera(34,1,.1,200);C.position.set(0,0,30);C.lookAt(0,0,0);
var PUR=0xa77bff,GOLD=0xd9b8ff;
function lm(c,o){return new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o});}
var LINE=lm(PUR,.95),SOFT=lm(PUR,.45),SEAM=lm(GOLD,.55),
SKIN=new THREE.MeshBasicMaterial({color:0x2a1650,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide});
function part(geo,par,x,y,z,mat){var m=new THREE.Mesh(geo,SKIN);m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,18),mat||LINE));m.position.set(x||0,y||0,z||0);par.add(m);return m;}
function lines(pts,par,mat){var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));var l=new THREE.LineSegments(g,mat);par.add(l);return l;}
// stars
var sp=[];for(var i=0;i<380;i++)sp.push((Math.random()-.5)*90,(Math.random()-.5)*50,-20-Math.random()*30);
var sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
S.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xc9b6ff,size:.09,transparent:true,opacity:.45})));
var sat=new THREE.Group(),core=new THREE.Group();S.add(sat);sat.add(core);core.scale.setScalar(.95);
// --- multi-faceted body: octagonal prism + upper bus + gold-foil seams
var body=part(new THREE.CylinderGeometry(1.15,1.15,2.2,8),core);
part(new THREE.CylinderGeometry(.9,1.15,.4,8),core,0,1.3,0);
part(new THREE.CylinderGeometry(1.15,.85,.35,8),core,0,-1.28,0);
var seam=[];for(var k=0;k<8;k++){var a0=k/8*Math.PI*2+Math.PI/8,a1=(k+1)/8*Math.PI*2+Math.PI/8,r=1.16,cx=Math.cos(a0)*r,cz=Math.sin(a0)*r,dx=Math.cos(a1)*r,dz=Math.sin(a1)*r;
 for(var j=1;j<4;j++){var y=-1.1+j*.55;seam.push(cx,y,cz,dx,y,dz);} // horizontal foil seams
 var mx_=(cx+dx)/2,mz_=(cz+dz)/2;seam.push(mx_,-1.1,mz_,mx_,1.1,mz_); // vertical seam
 // crinkle zigzag on alternating faces
 if(k%2==0)for(var q=0;q<5;q++){var t0=q/5,t1=(q+.5)/5,y0=-.85+q*.12;seam.push(cx+(dx-cx)*t0,y0,cz+(dz-cz)*t0,cx+(dx-cx)*t1,y0+.09,cz+(dz-cz)*t1);}}
lines(seam,core,SEAM);
// --- solar arrays on booms with hinges and cell grids
function array(sx){var g=new THREE.Group();g.position.x=sx*1.15;core.add(g);
 part(new THREE.CylinderGeometry(.06,.06,1.4,6).rotateZ(Math.PI/2),g,sx*.7,0,0);         // boom
 part(new THREE.CylinderGeometry(.13,.13,.22,10).rotateX(Math.PI/2),g,sx*.05,0,0);         // drive (SADA)
 var wing=new THREE.Group();wing.position.x=sx*1.4;g.add(wing);
 for(var p=0;p<3;p++){var cxp=sx*(1.05+p*2.15);
  part(new THREE.BoxGeometry(2.0,.05,1.5),wing,cxp,0,0);
  var gl=[];for(var c=1;c<6;c++){var x=cxp-1+c*(2/6);gl.push(x,.035,-.75,x,.035,.75);}for(var rr=1;rr<4;rr++){var z=-.75+rr*.375;gl.push(cxp-1,.035,z,cxp+1,.035,z);}
  lines(gl,wing,SOFT);
  if(p<2)part(new THREE.CylinderGeometry(.05,.05,.5,6).rotateX(Math.PI/2),wing,cxp+sx*1.075,0,0,SEAM); // hinge
 }
 part(new THREE.BoxGeometry(.12,.08,.5),wing,sx*.02,0,0); // yoke
 return g;}
var aL=array(-1),aR=array(1);
// --- big parabolic dish with feed horn + struts, on a gimbal at the front
var gim=new THREE.Group();gim.position.set(0,.2,1.15);core.add(gim);
part(new THREE.CylinderGeometry(.18,.24,.4,8).rotateX(Math.PI/2),gim,0,0,.15);
var dish=new THREE.Group();dish.position.z=.5;gim.add(dish);
var prof=[];for(i=0;i<=10;i++){var rr2=i/10*1.6;prof.push(new THREE.Vector2(rr2,rr2*rr2*.22));}
var dg=new THREE.LatheGeometry(prof,28);dg.rotateX(Math.PI/2);
var dm=new THREE.Mesh(dg,SKIN);dm.add(new THREE.LineSegments(new THREE.WireframeGeometry(dg),lm(PUR,.22)));dish.add(dm);
var rim=[];for(i=0;i<48;i++){var u0=i/48*Math.PI*2,u1=(i+1)/48*Math.PI*2;rim.push(Math.cos(u0)*1.6,Math.sin(u0)*1.6,.56,Math.cos(u1)*1.6,Math.sin(u1)*1.6,.56);}lines(rim,dish,LINE);
var FZ=1.45,st=[];for(i=0;i<4;i++){var u=i/4*Math.PI*2+Math.PI/4;st.push(Math.cos(u)*1.5,Math.sin(u)*1.5,.5,0,0,FZ-.15);}lines(st,dish,LINE); // struts
part(new THREE.CylinderGeometry(.09,.2,.32,8).rotateX(-Math.PI/2),dish,0,0,FZ);   // feed horn
var feed=part(new THREE.SphereGeometry(.05,6,4),dish,0,0,FZ-.25);
// --- small antennas / whips
part(new THREE.CylinderGeometry(.025,.025,1.5,5),core,.55,2.2,-.3);
part(new THREE.SphereGeometry(.07,6,4),core,.55,2.95,-.3);
part(new THREE.CylinderGeometry(.02,.02,1.1,5).rotateZ(.5),core,-.7,2.0,.2);
var hel=[];for(i=0;i<40;i++){var a1_=i*.5,a2=(i+1)*.5;hel.push(Math.cos(a1_)*.12-.4,-1.5-i*.02,Math.sin(a1_)*.12-.6,Math.cos(a2)*.12-.4,-1.5-(i+1)*.02,Math.sin(a2)*.12-.6);}lines(hel,core,LINE); // helical whip
// --- thrusters / nozzles
var noz=new THREE.CylinderGeometry(.08,.18,.3,10);
part(noz,core,0,-1.65,0);part(new THREE.CylinderGeometry(.22,.3,.18,10),core,0,-1.5,0);
[[.8,-1.3,.8],[-.8,-1.3,.8],[.8,-1.3,-.8],[-.8,-1.3,-.8]].forEach(function(p){var n=part(new THREE.CylinderGeometry(.03,.07,.16,6),core,p[0],p[1],p[2]);n.rotation.z=p[0]>0?-.6:.6;});
// --- star tracker (baffled tube) + sensor boxes
var trk=part(new THREE.CylinderGeometry(.16,.12,.55,10),core,-.6,1.75,-.45);trk.rotation.set(-.5,0,.3);
part(new THREE.CylinderGeometry(.19,.19,.04,10),trk,0,.22,0);part(new THREE.CylinderGeometry(.18,.18,.04,10),trk,0,.08,0);
part(new THREE.BoxGeometry(.4,.3,.3),core,.75,1.6,.45);
part(new THREE.BoxGeometry(.28,.22,.36),core,-1.2,-.5,.55);
part(new THREE.BoxGeometry(.3,.3,.2),core,1.2,.5,-.6,SEAM);
part(new THREE.CylinderGeometry(.1,.1,.18,8).rotateX(Math.PI/2),core,.4,-.7,1.2); // sun sensor
// --- signal rings
var RN=5,rings=[],rg=new THREE.RingGeometry(.92,1,48);
for(i=0;i<RN;i++){var rm=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));rm.userData.t=i/RN;S.add(rm);rings.push(rm);}
// --- input across hero (canvas is pointer-events:none, so listen on hero)
var nx=0,ny=0,tnx=.4,tny=.1,has=false;
hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();tnx=((e.clientX-r.left)/r.width)*2-1;tny=-(((e.clientY-r.top)/r.height)*2-1);has=true;});
hero.addEventListener('pointerleave',function(){has=false;});
function ez(k,dt){return 1-Math.exp(-k*dt);}
var hw=10,hh=6,mob=false;
function size(){var w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix();
 hh=Math.tan(C.fov*Math.PI/360)*C.position.z;hw=hh*C.aspect;mob=w<880;sat.scale.setScalar(mob?.55:1);}
size();new ResizeObserver(size).observe(box);
var visible=false,last=0,T=0,px=6,py=1,vx=0,vy=0,yaw=0,pit=0,dyaw=0,dpit=0,ray=new THREE.Vector3(),tgt=new THREE.Vector3(),wp=new THREE.Vector3(),wq=new THREE.Quaternion(),fwd=new THREE.Vector3(),raf=0;
function frame(now){if(!visible){raf=0;return;}raf=requestAnimationFrame(frame);
 var dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;if(reduce)dt*=.25;T+=dt;
 if(!has){tnx=.45+Math.sin(T*.21)*.35;tny=Math.sin(T*.33)*.45;}
 nx+=(tnx-nx)*ez(3,dt);ny+=(tny-ny)*ez(3,dt);
 // cursor in world at z=0
 tgt.set(nx*hw,ny*hh,0);
 // roam: follow cursor with an offset orbit so it never sits on the pointer, kept inside the hero
 var ox=Math.cos(T*.3)*3.2*(mob?.5:1),oy=Math.sin(T*.37)*1.8*(mob?.5:1);
 var gx=Math.max(-hw*.85,Math.min(hw*.85,tgt.x*.75+ox+(mob?0:2))),gy=Math.max(-hh*.7,Math.min(hh*.7,tgt.y*.7+oy));
 var opx=px,opy=py;px+=(gx-px)*ez(1.2,dt);py+=(gy-py)*ez(1.2,dt);vx+=((px-opx)/dt-vx)*ez(4,dt);vy+=((py-opy)/dt-vy)*ez(4,dt);
 sat.position.set(px,py,0);
 yaw+=((-.55+Math.max(-.5,Math.min(.5,vx*.08)))-yaw)*ez(2,dt);pit+=((.28-vy*.04)-pit)*ez(2,dt);
 sat.rotation.set(pit,yaw,Math.sin(T*.25)*.08-vx*.02);
 aL.rotation.x=aR.rotation.x=Math.sin(T*.2)*.15;
 // dish aims at cursor (pushed toward camera a bit)
 var aim=tgt.clone();aim.z=6;sat.updateMatrixWorld();var loc=core.worldToLocal(aim).sub(gim.position);
 var ay=Math.max(-1.25,Math.min(1.25,Math.atan2(loc.x,loc.z))),ap=Math.max(-1,Math.min(1,Math.atan2(-loc.y,Math.hypot(loc.x,loc.z))));
 dyaw+=(ay-dyaw)*ez(5,dt);dpit+=(ap-dpit)*ez(5,dt);gim.rotation.set(dpit,dyaw,0,'YXZ');
 feed.getWorldPosition(wp);dish.getWorldQuaternion(wq);fwd.set(0,0,1).applyQuaternion(wq);var ss=sat.scale.x;
 for(var i=0;i<RN;i++){var r=rings[i];r.userData.t+=dt*.4;
  if(r.userData.t>=1||!r.userData.o){r.userData.t%=1;r.userData.o=wp.clone();r.userData.f=fwd.clone();r.userData.q=wq.clone();}
  var t=r.userData.t;r.position.copy(r.userData.o).addScaledVector(r.userData.f,t*3.5*ss);r.quaternion.copy(r.userData.q);
  var s=(.3+t*1.1)*ss;r.scale.set(s,s,s);r.material.opacity=Math.sin(Math.PI*t)*.5*(1-t*.4);}
 R.render(S,C);}
new IntersectionObserver(function(en){visible=en[0].isIntersecting;last=0;if(visible&&!raf)raf=requestAnimationFrame(frame);}).observe(hero);
})();
