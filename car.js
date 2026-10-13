(function(){
var host=document.getElementById('carScene');if(!host||!window.THREE)return;

var PUR=0xa77bff,BLU=0x7aa2ff,GRY=0xc8c4d4,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var scene=new THREE.Scene();scene.fog=new THREE.Fog(0x000000,9,22);
var cam=new THREE.PerspectiveCamera(24,4,.1,100);cam.position.set(0,2.1,8.2);cam.lookAt(0,.5,0);
var R=new THREE.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(R.domElement);
function size(){var w=host.clientWidth,h=host.clientHeight||1;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
new ResizeObserver(size).observe(host);size();
var gg=new THREE.PlaneGeometry(60,16,150,40);gg.rotateX(-Math.PI/2);
scene.add(new THREE.Mesh(gg,new THREE.MeshBasicMaterial({color:PUR,wireframe:true,transparent:true,opacity:.11})));
function lineMat(c,o){return new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o});}
function skinMat(o){return new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:o,side:THREE.DoubleSide,depthWrite:false});}
function part(par,geo,pos,rot,op,col){var G=new THREE.Group();G.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,18),lineMat(col||GRY,op||.7)));G.add(new THREE.Mesh(geo,skinMat(.04)));
 if(pos)G.position.set(pos[0],pos[1],pos[2]);if(rot)G.rotation.set(rot[0],rot[1],rot[2]);par.add(G);return G;}
var car=new THREE.Group();
// ---- smooth lofted body (x = forward) ----
function interp(pts,x){if(x<=pts[0][0])return pts[0][1];for(var i=1;i<pts.length;i++){if(x<=pts[i][0]){var a=pts[i-1],b=pts[i],u=(x-a[0])/(b[0]-a[0]);u=(1-Math.cos(u*Math.PI))/2;return a[1]+(b[1]-a[1])*u;}}return pts[pts.length-1][1];}
// track-car body profile (x = forward): very low, wide, cab forward
var TOP=[[-1.2,.36],[-1.1,.4],[-.7,.42],[-.4,.47],[-.12,.5],[.12,.47],[.38,.3],[.75,.22],[1.05,.17],[1.25,.12]];
var BOT=[[-1.2,.17],[-1.05,.1],[1.05,.09],[1.25,.11]];
var WID=[[-1.2,.46],[-1.0,.6],[-.6,.6],[-.25,.5],[.3,.5],[.8,.55],[1.05,.5],[1.25,.36]];
var CAB=[[-1.2,0],[-.52,0],[-.3,.66],[.22,.66],[.44,0],[1.3,0]];var NX=44,NT=36,sp=new Float32Array((NX+1)*NT*3);
function surf(x,th){var top=interp(TOP,x),bot=interp(BOT,x),w=interp(WID,x),cab=interp(CAB,x),mid=(top+bot)/2+.02,h=(top-bot)/2;
 var c=Math.cos(th),s=Math.sin(th),up=s>0,n=up?2.4:5;var z=w*Math.sign(c)*Math.pow(Math.abs(c),2/n),y=mid+h*Math.sign(s)*Math.pow(Math.abs(s),2/n);
 if(up)z*=1-cab*.42*Math.pow(s,1.5);return [x,y,z];}
var X0=-1.2,X1=1.25;for(var i=0;i<=NX;i++)for(var j=0;j<NT;j++){var p=surf(X0+(X1-X0)*i/NX,j/NT*Math.PI*2);sp.set(p,(i*NT+j)*3);}
var idx=[];for(i=0;i<NX;i++)for(j=0;j<NT;j++){var a=i*NT+j,b=i*NT+(j+1)%NT,c2=(i+1)*NT+j,d=(i+1)*NT+(j+1)%NT;idx.push(a,c2,b,b,c2,d);}
var body=new THREE.BufferGeometry();body.setAttribute('position',new THREE.BufferAttribute(sp,3));body.setIndex(idx);
car.add(new THREE.Mesh(body,skinMat(.05)));
// flowing longitudinal lines + a few section rings
var ls=[];function seg(a,b){ls.push(a[0],a[1],a[2],b[0],b[1],b[2]);}
[2,5,7,9,11,13,16,20,23,27,31,34].forEach(function(jj){for(var i=0;i<NX;i++)seg(surf(X0+(X1-X0)*i/NX,jj/NT*Math.PI*2),surf(X0+(X1-X0)*(i+1)/NX,jj/NT*Math.PI*2));});
[-1.05,-.6,-.1,.42,.9].forEach(function(x){for(var j=0;j<NT;j++)seg(surf(x,j/NT*Math.PI*2),surf(x,(j+1)/NT*Math.PI*2));});
var bl=new THREE.BufferGeometry();bl.setAttribute('position',new THREE.Float32BufferAttribute(ls,3));car.add(new THREE.LineSegments(bl,lineMat(GRY,.42)));
// glass: windshield + side windows outline (blue)
var gl=[];function gseg(a,b){gl.push(a[0],a[1]+.004,a[2],b[0],b[1]+.004,b[2]);}
var thA=Math.PI*.24,thB=Math.PI*.76;for(var i=0;i<20;i++){var xa=-.62+i*(.86/20),xb=xa+.86/20;gseg(surf(xa,thA),surf(xb,thA));gseg(surf(xa,thB),surf(xb,thB));}
for(var k=0;k<14;k++){var t1=thA+(thB-thA)*k/14,t2=thA+(thB-thA)*(k+1)/14;gseg(surf(.36,t1),surf(.36,t2));gseg(surf(-.62,t1),surf(-.62,t2));}
[[.36,-.05],[-.62,-.0]].forEach(function(q){});gseg(surf(.36,thA),surf(.22,Math.PI/2));gseg(surf(.36,thB),surf(.22,Math.PI/2));
var gg2=new THREE.BufferGeometry();gg2.setAttribute('position',new THREE.Float32BufferAttribute(gl,3));car.add(new THREE.LineSegments(gg2,lineMat(BLU,.7)));
// side intakes
[1,-1].forEach(function(sd){var pts=[];[[-.42,.24],[-.12,.3],[-.12,.36],[-.5,.32]].forEach(function(q){pts.push(new THREE.Vector3(q[0],q[1],sd*.53));});
 car.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),lineMat(PUR,.85)));
 for(var m=1;m<4;m++){var x=-.42+m*.075;car.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,.25+m*.012,sd*.535),new THREE.Vector3(x+.02,.33,sd*.535)]),lineMat(PUR,.5)));}});
// LED light bar front + rear strip
var glowM=function(c,o){return new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false});};
var fb=new THREE.Mesh(new THREE.BoxGeometry(.02,.022,.78),glowM(0xffffff,.95));fb.position.set(1.2,.24,0);car.add(fb);
var rb=new THREE.Mesh(new THREE.BoxGeometry(.02,.03,.66),glowM(BLU,.95));rb.position.set(-1.19,.4,0);car.add(rb);
// wheels: flush, 5 spokes
var wheels=[];[[.72,.47],[.72,-.47],[-.72,.47],[-.72,-.47]].forEach(function(p){var wg=new THREE.Group();wg.position.set(p[0],.2,p[1]);var wh=new THREE.Group();
 var tire=new THREE.TorusGeometry(.17,.045,8,28);wh.add(new THREE.LineSegments(new THREE.EdgesGeometry(tire,30),lineMat(GRY,.6)));wh.add(new THREE.Mesh(tire,skinMat(.06)));
 var rim=new THREE.Mesh(new THREE.RingGeometry(.15,.16,32),new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:.7,side:THREE.DoubleSide}));rim.position.z=p[1]>0?.03:-.03;wh.add(rim);
 var sl=[];for(var k=0;k<5;k++){var a=k*Math.PI*2/5;sl.push(.03*Math.cos(a),.03*Math.sin(a),0,.15*Math.cos(a+.25),.15*Math.sin(a+.25),0,.03*Math.cos(a+.5),.03*Math.sin(a+.5),0,.15*Math.cos(a+.25),.15*Math.sin(a+.25),0);}
 var sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sl,3));var spk=new THREE.LineSegments(sg,lineMat(0xd9c8ff,.8));spk.position.z=p[1]>0?.035:-.035;wh.add(spk);
 wg.add(wh);car.add(wg);wheels.push({g:wg,w:wh,front:p[0]>0});});
// EE: battery pack, motors, wires with pulses
var bat=part(car,new THREE.BoxGeometry(1.3,.06,.62),[-.02,.15,0],null,.8,PUR);
var cl=[];for(i=-5;i<=5;i++)cl.push(i*.115,.032,-.29,i*.115,.032,.29);for(j=-2;j<=2;j++)cl.push(-.63,.032,j*.12,.63,.032,j*.12);
var cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cl,3));bat.add(new THREE.LineSegments(cg,lineMat(PUR,.45)));
part(car,new THREE.CylinderGeometry(.1,.1,.3,18),[-.72,.2,0],[Math.PI/2,0,0],.85,PUR);part(car,new THREE.CylinderGeometry(.085,.085,.26,16),[.72,.2,0],[Math.PI/2,0,0],.75,PUR);
var pulses=[];function wire(pts){var c=new THREE.CatmullRomCurve3(pts.map(function(a){return new THREE.Vector3(a[0],a[1],a[2]);}));
 car.add(new THREE.Mesh(new THREE.TubeGeometry(c,30,.01,5),new THREE.MeshBasicMaterial({color:0x8a84a0,transparent:true,opacity:.6})));
 var m=new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),glowM(PUR,1));car.add(m);pulses.push({c:c,m:m,o:Math.random()});}
wire([[-.6,.18,.12],[-.66,.24,.1],[-.72,.27,.05]]);wire([[.6,.18,-.12],[.66,.24,-.1],[.72,.26,-.05]]);
wire([[.55,.18,.25],[.9,.22,.3],[1.18,.24,.3]]);wire([[-.55,.18,-.25],[-.95,.3,-.26],[-1.17,.4,-.25]]);
// headlight beams
[.26,-.26].forEach(function(z){var core=new THREE.ConeGeometry(.14,1.1,16,1,true);core.translate(0,-.55,0);var cm=new THREE.Mesh(core,glowM(0xd9c8ff,.14));cm.rotation.z=Math.PI/2;cm.position.set(1.21,.24,z);car.add(cm);
 var cn=new THREE.ConeGeometry(.5,2.3,24,1,true);cn.translate(0,-1.15,0);var b=new THREE.Mesh(cn,skinMat(.06));b.rotation.z=Math.PI/2;b.position.set(1.21,.24,z);car.add(b);});
// ---- track-car aero: big rear wing, splitter, canards, intakes, diffuser ----
{var xl=[];function xs(a,b){xl.push(a[0],a[1],a[2],b[0],b[1],b[2]);}
 function fins(n,y0,y1){for(var q=0;q<n;q++){var z=-.3+q*(.6/(n-1));xs([-1.2,y0,z],[-1.02,y1,z]);}}
var wg2=part(car,new THREE.BoxGeometry(.26,.03,1.1),[-1.08,.62,0],[0,0,.12],.9,PUR); // big rear wing
  part(car,new THREE.BoxGeometry(.16,.02,1.06),[-.96,.655,0],[0,0,.28],.6,PUR);
  [1,-1].forEach(function(sd){part(car,new THREE.BoxGeometry(.32,.15,.012),[-1.03,.6,sd*.56],null,.85,PUR); // endplates
   part(car,new THREE.BoxGeometry(.04,.2,.03),[-1.04,.5,sd*.22],[0,0,.15],.75,PUR); // swan-neck struts
   var pts=[[-.7,.2],[-.28,.22],[-.26,.42],[-.6,.4]].map(function(q){return new THREE.Vector3(q[0],q[1],sd*.56);});
   car.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),lineMat(PUR,.9)));
   part(car,new THREE.BoxGeometry(.5,.012,.08),[.95,.13,sd*.42],null,.7,PUR); // canards / dive planes
  });
  part(car,new THREE.BoxGeometry(.2,.014,1.0),[1.2,.085,0],null,.85,PUR); // front splitter
  [.5,.62].forEach(function(x){xs([x,.3,-.28],[x,.3,.28]);}); // bonnet vents
  fins(7,.1,.22);
 var xg=new THREE.BufferGeometry();xg.setAttribute('position',new THREE.Float32BufferAttribute(xl,3));car.add(new THREE.LineSegments(xg,lineMat(PUR,.75)));}
car.scale.setScalar(1.35);scene.add(car);
// ---- road: lane edges + dashed centre ----
function lineX(z,op,dash){var g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-30,.012,z),new THREE.Vector3(30,.012,z)]);
 var m=dash?new THREE.LineDashedMaterial({color:PUR,dashSize:.6,gapSize:.5,transparent:true,opacity:op}):new THREE.LineBasicMaterial({color:PUR,transparent:true,opacity:op});var l=new THREE.Line(g,m);if(dash)l.computeLineDistances();scene.add(l);}
lineX(1.25,.55);lineX(-1.25,.55);lineX(0,.4,true);
var road=new THREE.Mesh(new THREE.PlaneGeometry(60,2.5),new THREE.MeshBasicMaterial({color:0x1a1030,transparent:true,opacity:.45,depthWrite:false}));road.rotation.x=-Math.PI/2;road.position.y=.006;scene.add(road);
// ---- trail ring buffer ----
var TN=80,tp=new Float32Array(TN*3),tc=new Float32Array(TN*3),tg=new THREE.BufferGeometry();
tg.setAttribute('position',new THREE.BufferAttribute(tp,3));tg.setAttribute('color',new THREE.BufferAttribute(tc,3));
var tmat=new THREE.PointsMaterial({size:.22,vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});var tpts=new THREE.Points(tg,tmat);tpts.frustumCulled=false;scene.add(tpts);
var lmat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending});var tline=new THREE.Line(tg,lmat);tline.frustumCulled=false;scene.add(tline);
var cA=new THREE.Color(0xe6dcff),cB=new THREE.Color(PUR),cT=new THREE.Color();
// ---- lane extent from the camera frustum ----
var XL=6,OFF=9;function lane(){var d=cam.position.z,hw=Math.tan(THREE.MathUtils.degToRad(cam.fov/2))*d*cam.aspect;XL=Math.max(1.5,hw-1.9-.4);OFF=hw+2.6;}
new ResizeObserver(lane).observe(host);lane();
// ---- state ----
var pos=new THREE.Vector3(0,0,0),yaw=0,dir=1,spd=0,boostLvl=0,boostE=0,yawRate=0,steerA=0,roll=0,pitch=0,lastSpd=0,laneZ=0,trailLive=0,t=0;
var CRUISE=3.1,BOOST=3.0,CAP=3,pv=new THREE.Vector3();
for(var i=0;i<TN;i++){tp[i*3]=0;tp[i*3+1]=.42;tp[i*3+2]=0;}
function ez(k,dt){return 1-Math.exp(-k*dt);}
function sstep(a,b,x){x=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}
host.addEventListener('click',function(e){var r=host.getBoundingClientRect();pv.copy(pos).project(cam);var cx=r.left+(pv.x+1)/2*r.width;
 dir=e.clientX<cx?-1:1;boostLvl=Math.min(CAP,boostLvl+1);});
var scrollV=0,lsy=scrollY;addEventListener('scroll',function(){scrollV=Math.min(scrollV+Math.abs(scrollY-lsy)*.006,1.2);lsy=scrollY;},{passive:true});
var visible=false;new IntersectionObserver(function(en){visible=en[0].isIntersecting;}).observe(host);
var clock=new THREE.Clock();
function frame(){requestAnimationFrame(frame);var dt=clock.getDelta();if(!visible)return;dt=Math.min(dt,1/30);t+=dt;
 scrollV*=Math.exp(-2.5*dt);
 boostLvl=Math.max(0,boostLvl-dt*.7);boostE+=(boostLvl-boostE)*ez(boostLvl>boostE?6:1.8,dt);
 // wrap: drive fully off-screen, flip unseen, come back from the same side
 if((dir>0&&pos.x>OFF)||(dir<0&&pos.x<-OFF)){dir=-dir;yaw=dir>0?0:Math.PI;yawRate=0;laneZ=0;trailLive=0;pos.x=dir>0?-OFF:OFF;
  for(var j=0;j<TN;j++){tp[j*3]=pos.x;tp[j*3+2]=0;}}
 var wantYaw=dir>0?0:Math.PI,err=Math.atan2(Math.sin(wantYaw-yaw),Math.cos(wantYaw-yaw));
 var turnRate=THREE.MathUtils.clamp(err*6,-(3.2+3*boostE),3.2+3*boostE);yawRate+=(turnRate-yawRate)*ez(10,dt);yaw+=yawRate*dt;
 var aligned=Math.max(0,Math.cos(err));aligned*=aligned;
 var vt=(CRUISE+scrollV*1.5+boostE*BOOST)*Math.max(aligned,.15);
 spd+=(vt-spd)*ez(vt>spd?2+2*boostE:3.2,dt);
 var acc=(spd-lastSpd)/Math.max(dt,1e-4);lastSpd=spd;
 // U-turn swings out of the lane a little, then settles back
 laneZ+=((Math.abs(err)>.15?Math.sin(Math.abs(err))*.7*(dir>0?-1:1):0)-laneZ)*ez(4,dt);
 pos.x+=Math.cos(yaw)*spd*dt+(Math.abs(err)>.15?Math.cos(yaw)*.35*dt:0);pos.x=THREE.MathUtils.clamp(pos.x,-OFF-.5,OFF+.5);pos.z=laneZ;
 roll+=(THREE.MathUtils.clamp(yawRate*.03,-.08,.08)-roll)*ez(6,dt);pitch+=(THREE.MathUtils.clamp(-acc*.01,-.05,.05)-pitch)*ez(5,dt);
 car.position.copy(pos);car.rotation.set(roll,yaw,pitch,'YXZ');
 steerA+=(THREE.MathUtils.clamp(yawRate*.18,-.5,.5)-steerA)*ez(10,dt);
 var spin=(spd+Math.abs(yawRate)*.4)*dt/(.21*1.35);for(var w=0;w<wheels.length;w++){wheels[w].w.rotation.z-=spin;if(wheels[w].front)wheels[w].g.rotation.y=steerA;}
 for(var q=0;q<pulses.length;q++){var p=pulses[q],u=(t*(.6+spd*.12)+p.o)%1;p.c.getPointAt(u,p.m.position);p.m.material.opacity=Math.sin(u*Math.PI);}
 tp.copyWithin(3,0,(TN-1)*3);tp[0]=pos.x-Math.cos(yaw)*1.6;tp[1]=.42;tp[2]=pos.z+Math.sin(yaw)*1.6;
 if(boostE>.05&&Math.abs(err)<.15)trailLive=Math.min(TN,trailLive+1);else if(boostE<.05||Math.abs(err)>.4)trailLive=0;
 for(var k=0;k<TN;k++){var f=k<trailLive?Math.pow(1-k/TN,1.4):0;cT.copy(cA).lerp(cB,k/TN).multiplyScalar(f);tc[k*3]=cT.r;tc[k*3+1]=cT.g;tc[k*3+2]=cT.b;}
 tg.attributes.position.needsUpdate=true;tg.attributes.color.needsUpdate=true;var to=Math.min(1,boostE*1.2);tmat.opacity=to;lmat.opacity=to;
 if(window.__carLog)window.__carLog.push(pos.x,yaw,spd);
 R.render(scene,cam);}
requestAnimationFrame(frame);
})();
