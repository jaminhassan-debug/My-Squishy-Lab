(() => {'use strict';
const {add,sub,mul,dot,cross,norm,clamp}=SquishyScene09Volume.math;
const det=(a,b,c)=>dot(a,cross(b,c));
function weights(p,a,b,c){const d=det(a,b,c);if(Math.abs(d)<1e-9)return null;const w=[det(p,b,c)/d,det(a,p,c)/d,det(a,b,p)/d];return [1-w[0]-w[1]-w[2],...w]}
const blend=(pts,w)=>pts.reduce((v,p,i)=>add(v,mul(p,w[i+1])),[0,0,0]);
function create(body,recipe,seed=0,{interactive=false}={}){let rng=SquishyScene06Model.hash(String(seed)+':interior-v06'),elapsed=0,accumulator=0,active=false;const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296},particles=[];
 const tets=body.triangles.filter(ids=>Math.abs(det(...ids.map(i=>body.nodes[i].rest)))>1e-7),material=recipe.materialId||'gel',cdf=[];let totalVolume=0;for(const ids of tets){totalVolume+=Math.abs(det(...ids.map(i=>body.nodes[i].rest)));cdf.push(totalVolume)}function chooseTet(){const n=rand()*totalVolume;let lo=0,hi=cdf.length-1;while(lo<hi){const m=(lo+hi)>>1;if(cdf[m]<n)lo=m+1;else hi=m}return tets[lo]}
 function spawn(meta){const size=(meta.glitter?.008+rand()*.008:.024+rand()*.016)*(body.modelScale||1);let ids,w,p;
  for(let attempt=0;attempt<64;attempt++){ids=chooseTet();const exp=Array.from({length:4},()=>-Math.log(Math.max(1e-9,rand()))),sum=exp.reduce((a,b)=>a+b,0);w=exp.map(v=>v/sum);const radial=Math.min(.94,1-w[0]);w=[1-radial,...w.slice(1).map(v=>v/(1-w[0])*radial)];p=blend(ids.map(i=>body.nodes[i].rest),w);if(meta.glitter||!particles.some(q=>!q.glitter&&Math.hypot(...sub(q.rest,p))<(q.size+size)*.85))break}
  const axis=norm([rand()-.5,rand()-.5,rand()-.5]);particles.push({...meta,id:particles.length,ids:[...ids],w,rest:[...p],p:[...p],v:[0,0,0],target:[...p],axis,angle:rand()*Math.PI*2,spin:0,size,colour:meta.glitter?['#FFF5A0','#FF83DC','#75EEFF','#FFFFFF','#B89AFF','#7BFFBE','#FFBB78','#E8B8FF'][Math.floor(rand()*8)]:undefined})}

 for(const b of recipe.batches||[])for(let i=0;i<b.amount;i++)spawn({batchId:b.id,index:i,familyId:b.familyId,subtype:b.subtype,glitter:false});
 const sparkleDose=(recipe.batches||[]).filter(b=>b.familyId.startsWith('foil')).reduce((n,b)=>n+b.amount,0),dustCount=recipe.colourFinish==='glitter'?900:sparkleDose?Math.max(360,Math.min(900,sparkleDose*12)):0;for(let i=0;i<(interactive?Math.min(144,dustCount):dustCount);i++)spawn({familyId:'glitter',subtype:'flake',glitter:true});
 const solids=particles.filter(p=>!p.glitter);
 function constrain(p){const pts=p.ids.map(i=>body.nodes[i].p),w=weights(p.p,...pts);if(!w||w.some(x=>!Number.isFinite(x))){p.p=blend(pts,p.w);p.v=[0,0,0];return}const margin=.008,raw=w.map(x=>Math.max(margin,x));raw[0]=Math.max(.045,raw[0]);const total=raw.reduce((a,b)=>a+b,0),safe=raw.map(x=>x/total);if(w.some((x,i)=>Math.abs(x-safe[i])>1e-7)){p.p=blend(pts,safe);p.v=mul(p.v,.2)}}
 function step(dt=0,quiet=false){if(quiet){for(const p of particles){p.p=blend(p.ids.map(i=>body.nodes[i].p),p.w);p.target=[...p.p];p.v=[0,0,0];p.spin=0}accumulator=0;active=false;return false}dt=clamp(dt,0,100);accumulator+=dt/1000;active=false;const h=1/120;
  while(accumulator>=h){accumulator-=h;elapsed+=h;for(const p of particles){const target=blend(p.ids.map(i=>body.nodes[i].p),p.w),delta=sub(target,p.target),speed=Math.hypot(...delta)/h;const stiff=material==='foam'?650:material==='bounce'?180:110,drag=material==='foam'?45:material==='bounce'?15:21;
    // A material-space attachment carries each inclusion; inertia gives viscous lag, never a surface sticker.
    for(let k=0;k<3;k++){const a=(target[k]-p.p[k])*stiff-p.v[k]*drag;p.v[k]+=a*h;p.p[k]+=p.v[k]*h}p.target=target;
    // Strain-driven angular motion only. No idle random movement or time-driven sparkle.
    p.spin=(p.spin+clamp(dot(cross(p.rest,mul(delta,1/h)),p.axis),-5,5)*h*(p.glitter?5:1.5))*Math.exp(-h*(material==='foam'?28:9));p.angle+=p.spin*h;constrain(p);
    if(Math.hypot(...sub(target,p.p))>.0003||Math.hypot(...p.v)>.002||Math.abs(p.spin)>.002)active=true;else {p.p=[...target];p.v=[0,0,0];p.spin=0}
  }
   for(let i=0;i<solids.length;i++)for(let j=i+1;j<solids.length;j++){const a=solids[i],b=solids[j],dx=b.p[0]-a.p[0],dy=b.p[1]-a.p[1],dz=b.p[2]-a.p[2],distanceSquared=dx*dx+dy*dy+dz*dz,limit=(a.size+b.size)*.7;if(distanceSquared>1e-12&&distanceSquared<limit*limit){const distance=Math.sqrt(distanceSquared),shift=mul([dx,dy,dz],(limit-distance)/distance*.35);a.p=sub(a.p,shift);b.p=add(b.p,shift);a.v=mul(a.v,.8);b.v=mul(b.v,.8);constrain(a);constrain(b);if(limit-distance>.001)active=true}}
  }return active;
 }
 return {particles,step,reset:()=>step(0,true),get active(){return active},get elapsed(){return elapsed},weights:p=>weights(p.p,...p.ids.map(i=>body.nodes[i].p)),material,recipeKey:JSON.stringify([recipe,seed])};
}
// Tiny true 3D inclusion meshes, extruded foil/fruit and faceted pearls/gems. No camera-facing sprite decals.
function geometry(p){const f=p.familyId;
 if(f==='pearl'||f==='gem'){const vertices=[],triangles=[],seg=8,rings=f==='pearl'?4:2,r=p.size;for(let j=0;j<=rings;j++){const lat=-Math.PI/2+j/rings*Math.PI;for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2;vertices.push([Math.cos(a)*Math.cos(lat)*r,Math.sin(lat)*r,Math.sin(a)*Math.cos(lat)*r])}}for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=j*seg+i,b=j*seg+(i+1)%seg,c=a+seg,d=b+seg;triangles.push([a,c,b],[b,c,d])}return {vertices,triangles,colour:f==='pearl'?'#FFF0DC':p.subtype==='diamond'?'#AD82FF':'#52DCE6',smooth:f==='pearl',metal:false}}
 const n=f==='foil_star'?10:f==='foil_heart'?20:f==='pearl'?10:f==='fruit'?16:f==='sprinkle'?4:f==='glitter'?3:6,vertices=[],triangles=[],r=p.size,thick=p.glitter?.0015:f.startsWith('foil')?.003:f==='fruit'?.009:f==='sprinkle'?.018:.027;
 for(const z of [-thick,thick])for(let i=0;i<n;i++){const a=i/n*Math.PI*2;let x=Math.cos(a),y=Math.sin(a);if(f==='foil_star'){const k=i%2?.42:1;x*=k;y*=k}if(f==='foil_heart'){x=Math.sin(a)**3;y=(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/16}if(f==='sprinkle'){x*=.38;y*=1.2}if(f==='fruit'&&p.subtype==='strawberry'){x*=.65+.35*y;y*=1.05}vertices.push([x*r,y*r,z])}
 vertices.push([0,0,-thick],[0,0,thick]);for(let i=0;i<n;i++){const j=(i+1)%n;triangles.push([2*n,j,i],[2*n+1,n+i,n+j],[i,j,n+i],[j,n+j,n+i])}
 const palette={foil_star:'#FFD75C',foil_heart:'#FF8DC7',pearl:'#FFF0DC',sprinkle:'#F28DD5',gem:p.subtype==='diamond'?'#AD82FF':'#52DCE6',fruit:p.subtype==='kiwi'?'#96D757':p.subtype==='orange'?'#FFA636':'#FF6383',glitter:p.colour};
 const faceColours=triangles.map(()=>palette[f]||'#FFF7CC');
 if(f==='fruit'){for(let k=0;k<9;k++){const a=k/9*Math.PI*2,rx=Math.cos(a)*r*.56,ry=Math.sin(a)*r*.56,z=thick+.0004,base=vertices.length;vertices.push([rx-r*.055,ry-r*.07,z],[rx+r*.055,ry-r*.07,z],[rx,ry+r*.07,z]);triangles.push([base,base+1,base+2]);faceColours.push(p.subtype==='orange'?'#FFE4AC':p.subtype==='kiwi'?'#3C3827':'#FFF0B6')}for(let i=0;i<n;i++)faceColours[i*4+1]=p.subtype==='kiwi'?'#BFEB73':palette[f]}
 return {vertices,triangles,faceColours,colour:palette[f]||'#FFF7CC',metal:p.glitter||f.startsWith('foil')};
}
function rotate(p,axis,angle){const c=Math.cos(angle),s=Math.sin(angle);return add(add(mul(p,c),mul(cross(axis,p),s)),mul(axis,dot(axis,p)*(1-c)))}
globalThis.SquishyInterior={create,geometry,rotate,weights};})();
