(function(){
var host=document.getElementById('carScene');if(!host||!window.THREE)return;
var sec=document.getElementById('projects');
var PUR=0xa77bff,BLU=0x7aa2ff,GRY=0xc8c4d4,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var scene=new THREE.Scene();scene.fog=new THREE.Fog(0x000000,11,26);
var cam=new THREE.PerspectiveCamera(34,2,.1,100);cam.position.set(0,8,11);cam.lookAt(0,0,.4);
var R=new THREE.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(R.domElement);
function size(){var w=host.clientWidth,h=host.clientHeight||1;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
new ResizeObserver(size).observe(host);size();
var gg=new THREE.PlaneGeometry(44,22,110,56);gg.rotateX(-Math.PI/2);
scene.add(new THREE.Mesh(gg,new THREE.MeshBasicMaterial({color:PUR,wireframe:true,transparent:true,opacity:.11})));
function lineMat(c,o){return new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o});}
function skinMat(o){return new THREE.MeshBasicMaterial({color:PUR,transparent:true,opacity:o,side:THREE.DoubleSide,depthWrite:false});}
function part(par,geo,pos,rot,op,col){var G=new THREE.Group();G.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,18),lineMat(col||GRY,op||.7)));G.add(new THREE.Mesh(geo,skinMat(.04)));
 if(pos)G.position.set(pos[0],pos[1],pos[2]);if(rot)G.rotation.set(rot[0],rot[1],rot[2]);par.add(G);return G;}
var car=new THREE.Group();
// ---- smooth lofted body (x = forward) ----
function interp(pts,x){if(x<=pts[0][0])return pts[0][1];for(var i=1;i<pts.length;i++){if(x<=pts[i][0]){var a=pts[i-1],b=pts[i],u=(x-a[0])/(b[0]-a[0]);u=(1-Math.cos(u*Math.PI))/2;return a[1]+(b[1]-a[1])*u;}}return pts[pts.length-1][1];}
var TOP=[[-1.2,.36],[-1.12,.44],[-.95,.47],[-.55,.56],[-.2,.62],[.12,.6],[.42,.42],[.8,.33],[1.12,.26],[1.25,.17]];
var BOT=[[-1.2,.2],[-1.05,.12],[1.05,.11],[1.25,.15]];
var WID=[[-1.2,.34],[-1.0,.47],[-.7,.52],[.6,.5],[1.0,.44],[1.25,.22]];
var CAB=[[-1.2,0],[-.85,0],[-.6,.7],[.25,.7],[.5,0],[1.3,0]];
var NX=44,NT=36,sp=new Float32Array((NX+1)*NT*3);
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
car.scale.setScalar(1.35);scene.add(car);
// ---- trail: fixed ring buffer, reused every frame ----
var TN=70,tp=new Float32Array(TN*3),tc=new Float32Array(TN*3),tg=new THREE.BufferGeometry();
tg.setAttribute('position',new THREE.BufferAttribute(tp,3));tg.setAttribute('color',new THREE.BufferAttribute(tc,3));
var tmat=new THREE.PointsMaterial({size:.26,vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});var tpts=new THREE.Points(tg,tmat);tpts.frustumCulled=false;scene.add(tpts);
var lmat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending});var tline=new THREE.Line(tg,lmat);tline.frustumCulled=false;scene.add(tline);
var cA=new THREE.Color(0xe6dcff),cB=new THREE.Color(PUR),cT=new THREE.Color();
var ret=new THREE.Mesh(new THREE.RingGeometry(.25,.28,40),new THREE.MeshBasicMaterial({color:BLU,transparent:true,opacity:.45,side:THREE.DoubleSide}));ret.rotation.x=-Math.PI/2;scene.add(ret);
// ---- input (whole section) ----
var BX=3.7,BZ0=-2.0,BZ1=2.6;
var ndc=new THREE.Vector2(),ray=new THREE.Raycaster(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),0);
var mouseRaw=new THREE.Vector3(),hasMouse=false,goal=new THREE.Vector3(),hasGoal=false,boostReq=0,boostClock=0;
function ground(e,out){var r=host.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,cam);
 if(!ray.ray.intersectPlane(gp,out))ray.ray.at(20,out);out.y=0;out.x=THREE.MathUtils.clamp(out.x,-BX,BX);out.z=THREE.MathUtils.clamp(out.z,BZ0,BZ1);return out;}
sec.addEventListener('mousemove',function(e){ground(e,mouseRaw);hasMouse=true;});
sec.addEventListener('mouseleave',function(){hasMouse=false;});
sec.addEventListener('click',function(e){if(e.target.closest('a,button'))return;ground(e,goal);hasGoal=true;boostReq=1;boostClock=0;trailLive=0;});
var scrollV=0,lsy=scrollY;addEventListener('scroll',function(){scrollV=Math.min(scrollV+Math.abs(scrollY-lsy)*.008,2);lsy=scrollY;},{passive:true});
var visible=false;new IntersectionObserver(function(en){visible=en[0].isIntersecting;}).observe(host);
// ---- wander path: closed Catmull-Rom loop ----
var wander=new THREE.CatmullRomCurve3([[-3,0,1.6],[-1,0,2.2],[2,0,1.4],[3.3,0,-.4],[1.2,0,-1.6],[-1.6,0,-1.2],[-3.3,0,-.2]].map(function(a){return new THREE.Vector3(a[0],a[1],a[2]);}),true,'centripetal');
var wu=0,wP=new THREE.Vector3();
// ---- state (all reused) ----
var pos=new THREE.Vector3(-3,0,1.6),yaw=0,spd=1.2,yawRate=0,steerA=0,roll=0,pitch=0,boostE=0,lastSpd=1.2,turnSign=1;
var aim=new THREE.Vector3().copy(pos),raw=new THREE.Vector3(),tmp=new THREE.Vector3(),trailLive=0,t=0;
for(var i=0;i<TN;i++){tp[i*3]=pos.x;tp[i*3+1]=.45;tp[i*3+2]=pos.z;}
function ez(k,dt){return 1-Math.exp(-k*dt);}
function sstep(a,b,x){x=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}
var clock=new THREE.Clock();window.__carLog=null;
function frame(){requestAnimationFrame(frame);var dt=clock.getDelta();if(!visible)return;dt=Math.min(dt,1/30);t+=dt;
 scrollV*=Math.exp(-2.5*dt);
 // boost request: hold until arrival or 1.4s, then release; eased envelope
 if(boostReq>0){boostClock+=dt;if(boostClock>1.4)boostReq=0;}
 boostE+=(boostReq-boostE)*ez(boostReq>boostE?7:2.2,dt);
 // raw target -> low-passed aim
 if(hasGoal){raw.copy(goal);}else if(hasMouse){raw.copy(mouseRaw);}else{wu=(wu+dt*.035)%1;wander.getPointAt(wu,wP);raw.copy(wP);}
 aim.lerp(raw,ez(hasGoal?14:hasMouse?3.5:2,dt));
 tmp.subVectors(aim,pos);var dist=Math.hypot(tmp.x,tmp.z);
 if(hasGoal&&dist<.6){hasGoal=false;boostReq=0;}
 var want=Math.atan2(-tmp.z,tmp.x),err=Math.atan2(Math.sin(want-yaw),Math.cos(want-yaw));
 // hysteresis: target almost directly behind -> keep turning the same way
 if(Math.abs(err)>2.7){err=Math.abs(err)*turnSign;}else if(Math.abs(err)>.05){turnSign=err>0?1:-1;}
 // dead zone: near the target, steering authority fades out
 var near=hasGoal?1:sstep(.35,1.1,dist);
 var maxRate=(1.5+10*boostE)*Math.max(.35,Math.min(1,spd/.9));
 var wantRate=THREE.MathUtils.clamp(err*(3+12*boostE),-maxRate,maxRate)*near;
 yawRate+=(wantRate-yawRate)*ez(8+10*boostE,dt);yaw+=yawRate*dt;
 // speed: arrival easing, scroll and boost bonus
 var aligned=.35+.65*Math.max(0,Math.cos(err));
 var vt=(hasMouse||hasGoal?1.9*sstep(.4,1.8,dist):1.5)*aligned+scrollV*2+boostE*6.5*aligned;
 spd+=(vt-spd)*ez(vt>spd?2.2+3*boostE:2.8,dt);
 var acc=(spd-lastSpd)/Math.max(dt,1e-4);lastSpd=spd;
 pos.x+=Math.cos(yaw)*spd*dt;pos.z-=Math.sin(yaw)*spd*dt;
 pos.x=THREE.MathUtils.clamp(pos.x,-BX-.3,BX+.3);pos.z=THREE.MathUtils.clamp(pos.z,BZ0-.2,BZ1+.2);
 // body: roll from lateral accel, pitch from longitudinal accel (smoothed)
 roll+=(THREE.MathUtils.clamp(spd*yawRate*.035,-.12,.12)-roll)*ez(6,dt);
 pitch+=(THREE.MathUtils.clamp(-acc*.012,-.06,.06)-pitch)*ez(5,dt);
 car.position.copy(pos);car.rotation.set(roll,yaw,pitch,'YXZ');
 // wheels from real speed; smoothed front steer
 steerA+=(THREE.MathUtils.clamp(yawRate/Math.max(spd,.4)*.9,-.5,.5)-steerA)*ez(10,dt);
 var spin=spd*dt/(.21*1.35);for(var w=0;w<wheels.length;w++){wheels[w].w.rotation.z-=spin;if(wheels[w].front)wheels[w].g.rotation.y=steerA;}
 for(var q=0;q<pulses.length;q++){var p=pulses[q],u=(t*(.6+spd*.12)+p.o)%1;p.c.getPointAt(u,p.m.position);p.m.material.opacity=Math.sin(u*Math.PI);}
 // trail: shift ring buffer, newest = rear of car; only segments laid down since the boost turn finished are lit
 tp.copyWithin(3,0,(TN-1)*3);tp[0]=pos.x-Math.cos(yaw)*1.55;tp[1]=.45;tp[2]=pos.z+Math.sin(yaw)*1.55;
 if(boostE>.05&&Math.abs(err)<.2)trailLive=Math.min(TN,trailLive+1);else if(boostE<.05)trailLive=0;
 for(var k=0;k<TN;k++){var f=k<trailLive?Math.pow(1-k/TN,1.5):0;cT.copy(cA).lerp(cB,k/TN).multiplyScalar(f);tc[k*3]=cT.r;tc[k*3+1]=cT.g;tc[k*3+2]=cT.b;}
 tg.attributes.position.needsUpdate=true;tg.attributes.color.needsUpdate=true;
 var to=Math.min(1,boostE*1.4+scrollV*.25);tmat.opacity=to;lmat.opacity=to;
 ret.visible=hasGoal||hasMouse;if(ret.visible){ret.position.set(aim.x,.02,aim.z);ret.rotation.z+=dt;}
 if(window.__carLog)window.__carLog.push(performance.now(),pos.x,pos.z,yaw,dt);
 R.render(scene,cam);}
requestAnimationFrame(frame);
})();
