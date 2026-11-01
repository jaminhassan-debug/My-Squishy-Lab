(() => {
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),falloff=(x,y)=>Math.max(0,1-x*x-y*y)**2;
function create({material='gel',shape='cube',columns=20}={}){const n=columns,nodes=[],contacts=new Map,ignored=new Set;let release=null,auto=null,lastNow=0,qualified=false,wasTwo=false,pausedAt=null;
 for(let y=0;y<=n;y++)for(let x=0;x<=n;x++)nodes.push({u:x/n,v:y/n,x:x/n,y:y/n,dx:0,dy:0});
 const triangles=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++){const a=y*(n+1)+x;triangles.push([a,a+1,a+n+1],[a+1,a+n+2,a+n+1])}
 function mask(u,v){const x=(u-.5)*2,y=(v-.5)*2;if(shape==='cube')return Math.abs(x)<.91&&Math.abs(y)<.91&&(Math.abs(x)<.73||Math.abs(y)<.73||Math.hypot(Math.abs(x)-.73,Math.abs(y)-.73)<.18);if(shape==='heart'){const xx=x/1.05,yy=-(y+.06)/.98;return (xx*xx+yy*yy-1)**3-xx*xx*yy**3<-.04}if(shape==='star'){const a=Math.atan2(y,x)+Math.PI/2,r=Math.hypot(x,y);return r<.63+.22*Math.cos(a*5)}if(shape==='cloud')return (x*x/.82+(y-.20)**2/.4<1)||(x*x/.35+(y+.25)**2/.45<1);if(shape==='bear')return x*x/.75+(y-.13)**2/.70<1||((Math.abs(x)-.60)**2+(y+.58)**2<.10);return x*x/.85+y*y/.80<1}
 function bary(x,y,a,b,c){const den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(den)<1e-9)return null;const wa=((b.y-c.y)*(x-c.x)+(c.x-b.x)*(y-c.y))/den,wb=((c.y-a.y)*(x-c.x)+(a.x-c.x)*(y-c.y))/den,wc=1-wa-wb;return wa>=-.0001&&wb>=-.0001&&wc>=-.0001?[wa,wb,wc]:null}
 function hit(x,y){for(let i=triangles.length-1;i>=0;i--){const indices=triangles[i],p=indices.map(i=>nodes[i]),b=bary(x,y,...p);if(!b)continue;const u=p.reduce((s,a,j)=>s+a.u*b[j],0),v=p.reduce((s,a,j)=>s+a.v*b[j],0);if(mask(u,v))return {u,v}}return null}
 function down(id,x,y,now){if(contacts.has(id)||ignored.has(id))return false;if(contacts.size>=2||wasTwo&&contacts.size){ignored.add(id);return false}const uv=hit(x,y);if(!uv)return false;auto=null;release=null;qualified=false;contacts.set(id,{id,...uv,x,y,started:now});if(contacts.size===2)wasTwo=true;update(now,0);return true}
 function move(id,x,y){const c=contacts.get(id);if(c){c.x=clamp(x,-.25,1.25);c.y=clamp(y,-.25,1.25)}}
 function beginRelease(now,qualify,duration){release={start:now,duration:duration||SquishyScene09Model.recoveryMs[material],from:nodes.map(p=>[p.dx,p.dy]),qualify,reset:!!duration};auto=null;qualified=false}
 function up(id,now,cancelled=false){ignored.delete(id);if(!contacts.has(id))return;update(now,0);contacts.delete(id);if(!contacts.size){wasTwo=false;beginRelease(now,!cancelled)}else if(cancelled)cancel(now)}
 function cancel(now){contacts.clear();ignored.clear();wasTwo=false;beginRelease(now,false)}
 function reset(now,quiet=false){contacts.clear();ignored.clear();wasTwo=false;if(quiet){release=auto=null;for(const p of nodes)p.x=p.u,p.y=p.v,p.dx=p.dy=0}else beginRelease(now,false,250)}
 function squeeze(now){reset(now,true);auto={start:now};release=null}
 function update(now,dt){if(pausedAt!==null)return {completed:false,active:false,phase:'paused',contacts:0,stretch:1};lastNow=now;dt=clamp(Number.isFinite(dt)?dt:0,0,100);if(auto&&now-auto.start>=350){const deadline=auto.start+350;update(deadline-.000001,0);beginRelease(deadline,true);}
  const live=[...contacts.values()],synthetic=auto?[{u:.5,v:.5,x:.5,y:.5,started:auto.start}]:[],inputs=live.length?live:synthetic;
  let stretch=1,axis=[1,0],center=[.5,.5];if(live.length===2){const [a,b]=live,ix=b.u-a.u,iy=b.v-a.v,initial=Math.max(.08,Math.hypot(ix,iy));stretch=clamp(Math.hypot(b.x-a.x,b.y-a.y)/initial,.67,1.5);axis=[ix/initial,iy/initial];center=[(a.u+b.u)/2,(a.v+b.v)/2]}
  for(let i=0;i<nodes.length;i++){const p=nodes[i];let dx=0,dy=0;if(inputs.length){if(live.length===2){const x=p.u-center[0],y=p.v-center[1],along=x*axis[0]+y*axis[1],across=-x*axis[1]+y*axis[0],lateral=1/Math.sqrt(stretch);dx=axis[0]*along*(stretch-1)-axis[1]*across*(lateral-1);dy=axis[1]*along*(stretch-1)+axis[0]*across*(lateral-1)}
    for(const input of inputs){const depth=clamp(1-Math.exp(-Math.max(16,now-input.started)/180),.06,1),rx=(p.u-input.u)/.53,ry=(p.v-input.v)/.53,f=falloff(rx,ry),protect=['star','bear'].includes(shape)?(.65+.35*falloff((p.u-.5)/.7,(p.v-.5)/.7)):1;dy+=depth*.16*f*protect;dx+=depth*.07*rx*f;dx+=clamp(input.x-input.u,-.25,.25)*f*.42;dy+=clamp(input.y-input.v,-.25,.25)*f*.30}
    dx=clamp(dx,-.28,.28);dy=clamp(dy,-.24,.27);const smooth=dt===0?1:1-Math.exp(-dt/45);p.dx+=(dx-p.dx)*smooth;p.dy+=(dy-p.dy)*smooth;
   }else if(release){const elapsed=Math.max(0,now-release.start),t=elapsed/release.duration,envelope=release.reset?Math.max(0,(1-t)**3):Math.exp(-3*t),bounce=material==='bounce'&&!release.reset?Math.cos(t*Math.PI*4):1;p.dx=release.from[i][0]*envelope*bounce;p.dy=release.from[i][1]*envelope*bounce}else p.dx=p.dy=0;p.x=p.u+p.dx;p.y=p.v+p.dy}
  const minX=Math.min(...nodes.map(p=>p.x)),maxX=Math.max(...nodes.map(p=>p.x)),minY=Math.min(...nodes.map(p=>p.y)),maxY=Math.max(...nodes.map(p=>p.y));if(maxX-minX>1.5||maxY-minY>1.5){const sx=Math.min(1,1.5/(maxX-minX)),sy=Math.min(1,1.5/(maxY-minY)),cx=(minX+maxX)/2,cy=(minY+maxY)/2;for(const p of nodes){p.x=cx+(p.x-cx)*sx;p.y=cy+(p.y-cy)*sy;p.dx=p.x-p.u;p.dy=p.y-p.v}}
  let completed=false;if(release&&now-release.start>=release.duration){completed=release.qualify&&!qualified;qualified=true;release=null;for(const p of nodes)p.x=p.u,p.y=p.v,p.dx=p.dy=0}return {completed,active:!!(contacts.size||release||auto),phase:contacts.size===2?(stretch>1?'stretch':'smush'):contacts.size||auto?'single_press':release?'recovery':'ready',contacts:contacts.size,stretch};
 }
 return {pause:now=>{if(pausedAt===null){cancel(now);pausedAt=now}},resume:now=>{if(pausedAt!==null){if(release)release.start+=Math.max(0,now-pausedAt);pausedAt=null}},nodes,triangles,hit,mask,down,move,up,cancel,reset,squeeze,update,getStatus:()=>({contacts:contacts.size,ignored:ignored.size,auto:!!auto,recovering:!!release}),get lastNow(){return lastNow}};
}
globalThis.SquishyScene09Solver={create};
})();
