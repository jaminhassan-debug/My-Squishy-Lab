(() => {'use strict';
const V=SquishyScene09Volume,{add,mul}=V.math;
function halves(shape){const base=V.mesh(shape),count=base.nodes.length;
 return [-1,1].map(side=>{const selected=base.triangles.filter(ids=>side*ids.reduce((sum,i)=>sum+base.nodes[i].rest[0],0)>=-1e-9),nodes=[...base.nodes.map(n=>{const p=mul(n.rest,1.105);return {rest:p,p:[...p]}}),...base.nodes.map(n=>{const p=mul(n.rest,1.035);return {rest:p,p:[...p]}})],triangles=[...selected.map(t=>[...t]),...selected.map(t=>[t[2]+count,t[1]+count,t[0]+count])],edges=new Map;
 for(const t of selected)for(let j=0;j<3;j++){const a=t[j],b=t[(j+1)%3],key=[a,b].sort((a,b)=>a-b).join(',');const old=edges.get(key);edges.set(key,old?{...old,count:old.count+1}:{a,b,count:1})}
 for(const e of edges.values())if(e.count===1)triangles.push([e.a,e.b,e.a+count],[e.b,e.b+count,e.a+count]);
 const shell={volume:true,shape,nodes,triangles,side,outerScale:1.105,innerScale:1.035,getInterior:()=>({particles:[]}),getStatus:()=>({contacts:0,auto:false,recovering:false}),getGesture:()=> 'ready',getDepth:()=>0};
 shell.pose=open=>{const angle=side*open*.62,c=Math.cos(angle),s=Math.sin(angle);for(const n of nodes){const [x,y,z]=n.rest;n.p=[x*c+z*s,y-open*.03,-x*s+z*c]}};shell.pose(0);return shell});
}
function bounds(shape){const body=V.mesh(shape),min=[0,1,2].map(k=>Math.min(...body.nodes.map(n=>n.rest[k]))),max=[0,1,2].map(k=>Math.max(...body.nodes.map(n=>n.rest[k])));return {shape,body:min.map((v,i)=>max[i]-v),inner:min.map((v,i)=>(max[i]-v)*1.035),outer:min.map((v,i)=>(max[i]-v)*1.105),wallScale:.07}}
const fits=new Map;
function cameraFit(shape,yaw=-18,pitch=12){const key=[shape,yaw,pitch].join(':');if(fits.has(key))return fits.get(key);const points=[],a=pitch*Math.PI/180;for(const rotation of [-.62,0,.62]){const t=yaw*Math.PI/180+rotation,c=Math.cos(t),s=Math.sin(t);for(const n of V.mesh(shape.startsWith('dumpling_')?'dumpling_xl':shape).nodes){const [x,y,z]=mul(n.rest,1.105),xx=c*x+s*z,zz=-s*x+c*z,yy=Math.cos(a)*y-Math.sin(a)*zz,depth=Math.sin(a)*y+Math.cos(a)*zz,f=4.5/(4.5-depth);points.push([xx*f,yy*f])}}const min=[0,1].map(k=>Math.min(...points.map(p=>p[k]))),max=[0,1].map(k=>Math.max(...points.map(p=>p[k]))),scale=464/Math.max(max[0]-min[0],max[1]-min[1]),fit={scale,center:[256-(min[0]+max[0])*scale/2,256+(min[1]+max[1])*scale/2]};fits.set(key,fit);return fit}
globalThis.SquishyMouldGeometry={halves,bounds,cameraFit};})();
