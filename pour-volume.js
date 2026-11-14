/* One geometric cavity and fill plane for every pour. No bitmap fill masks. */
(() => {'use strict';
const cache=new Map(),lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function cut(poly,h){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],aa=a[2]<=h,bb=b[2]<=h;if(aa)out.push(a);if(aa!==bb)out.push(lerp(a,b,(h-a[2])/(b[2]-a[2])))}return out}
function section(mesh,h){const edges=[];for(const ids of mesh.triangles){const tri=ids.map(i=>mesh.nodes[i].rest),hits=[];for(let i=0;i<3;i++){const a=tri[i],b=tri[(i+1)%3];if(Math.abs(a[2]-h)<1e-7)hits.push(a);if((a[2]<h&&b[2]>h)||(a[2]>h&&b[2]<h))hits.push(lerp(a,b,(h-a[2])/(b[2]-a[2])))}const unique=[...new Map(hits.map(p=>[p.map(v=>v.toFixed(6)).join(','),p])).values()];if(unique.length>=2)edges.push(unique.slice(0,2))}return edges}
function model(shape){if(cache.has(shape))return cache.get(shape);const mesh=SquishyScene09Volume.mesh(shape,48,20),zs=mesh.nodes.map(n=>n.rest[2]),min=Math.min(...zs),max=Math.max(...zs);const points=[...new Map(section(mesh,0).flat().map(p=>[p.slice(0,2).map(v=>v.toFixed(5)).join(','),p])).values()].sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));const data={mesh,min,max,points};cache.set(shape,data);return data}
function geometry(shape,progress){const {mesh,min,max,points}=model(shape),level=min+(max-min)*clamp(progress,0,1),fill=[];if(progress>0){for(const ids of mesh.triangles){const poly=cut(ids.map(i=>mesh.nodes[i].rest),level);for(let j=1;j<poly.length-1;j++)fill.push([poly[0],poly[j],poly[j+1]])}if(progress<1)for(const [a,b]of section(mesh,level)){const tri=[[0,0,level],a,b];tri.cap=true;fill.push(tri)}}const inner=1.035,outer=1.105,floor=min*inner,top=max*inner+.025,shell=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],p=(q,s,z)=>[q[0]*s,q[1]*s,z],ai=p(a,inner,top),bi=p(b,inner,top),ao=p(a,outer,top),bo=p(b,outer,top),af=p(a,inner,floor),bf=p(b,inner,floor),ab=p(a,outer,floor-.06),bb=p(b,outer,floor-.06);shell.push({tri:[ai,af,bi],part:'inner'},{tri:[bi,af,bf],part:'inner'},{tri:[ao,bo,ab],part:'outer'},{tri:[bo,bb,ab],part:'outer'},{tri:[ai,bi,ao],part:'rim'},{tri:[bi,bo,ao],part:'rim'},{tri:[[0,0,floor],af,bf],part:'floor'})}return {fill,shell,level,min,max,progress:clamp(progress,0,1),points}}
function jugPose(jr,p,ms=0){const t=p.phase==='aligning'?clamp(ms/300,0,1):p.phase==='cutoff'?1-clamp(ms/300,0,1):['flowing','paused'].includes(p.phase)?1:0;const eased=t*t*(3-2*t),angle=eased*.92,rect=[...jr],spout=[jr[0]+jr[2]*.861,jr[1]+jr[3]*.175];return {rect,spout,angle};}
const fills={foam:{width:23,shine:.27,shadow:.11,size:1.08},gel:{width:19,shine:.69,shadow:.25,size:1},bounce:{width:15,shine:.86,shadow:.16,size:.88}};
let bitsKey='', bits=[];
function recipeBits(recipe, seed){
 const batches=recipe.batches??recipe.inclusions??[];
 const key=JSON.stringify([seed,batches]);
 if(key!==bitsKey){
  bitsKey=key;
  bits=SquishyScene06Model.anchors({...recipe,batches},seed).filter(point=>point.index%2===0);
 }
 return bits;
}
function paintBit(c,images,bit,x,y,size,alpha=1,angle=0){
 const im=images.pourBits;
 if(!im)return;
 const frame=SquishyScene06Model.frame(bit.familyId,bit.subtype);
 if(!Number.isInteger(frame))return;
 const crop=SquishyScene06Atlas.bits.crops[frame];
 const height=size*crop[3]/crop[2];
 c.save();c.translate(x,y);c.rotate(angle+bit.rotation);c.globalAlpha*=alpha;
 c.drawImage(im,...crop,-size/2,-height/2,size,height);c.restore();
}
const visibleFills=new WeakMap();
function visibleFill(frame){
 if(visibleFills.has(frame))return visibleFills.get(frame);
 const {width,height,kind}=frame,positions=[];
 for(let y=4;y<height-4;y+=4)for(let x=4;x<width-4;x+=4){
  const i=y*width+x;
  if([i,i-4,i+4,i-4*width,i+4*width].every(j=>kind[j]===2))positions.push([x,y]);
 }
 visibleFills.set(frame,positions);
 return positions;
}
function paintMouldBits(c,images,bits,project,frame,rect,progress){
 if(!frame||progress<=0||!bits.length)return;
 const {width,height}=frame,positions=visibleFill(frame);
 if(!positions.length)return;
 const occupied=new Set();
 for(const bit of bits){
  if(bit.z>progress)continue;
  const [x,y]=project(bit);
  const u=(x-rect[0])*width/rect[2],v=(y-rect[1])*height/rect[3];
  let best=null,distance=Infinity;
  for(const position of positions){
   if(occupied.has(position))continue;
   const [px,py]=position,d=(px-u)**2+(py-v)**2;
   if(d<distance){best=position;distance=d}
  }
  if(!best)break;
  const [px,py]=best;
  for(const position of positions)if(Math.hypot(position[0]-px,position[1]-py)<10)occupied.add(position);
  paintBit(c,images,bit,rect[0]+px*rect[2]/width,rect[1]+py*rect[3]/height,25*bit.size,Math.max(.65,.96-(progress-bit.z)*.28));
 }
}
function paintStream(c,images,bits,start,end,app,material,flow,time,glitter){
 const [x,y]=start,[ex,ey]=end;
 const b=[x,y+40],d=[ex-10,ey-40],width=material.width*flow;
 const curve=t=>[0,1].map(i=>(1-t)**3*start[i]+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*d[i]+t**3*end[i]);
 c.save();c.lineCap='round';
 const gradient=c.createLinearGradient(x,y,ex,ey);
 const tones=app.swirl?app.tones:[app.target];
 tones.forEach((tone,i)=>gradient.addColorStop(i/tones.length,tone));
 gradient.addColorStop(1,app.swirl?tones.at(-1):app.target);
 c.beginPath();c.moveTo(x,y);c.bezierCurveTo(...b,...d,ex,ey);
 c.strokeStyle='rgba(63,32,91,'+material.shadow+')';c.lineWidth=width+3;c.stroke();
 c.strokeStyle=gradient;c.lineWidth=width;c.stroke();
 c.strokeStyle='rgba(255,255,255,'+material.shine+')';c.lineWidth=Math.max(1,width*.22);c.stroke();
 for(let i=0;i<Math.min(bits.length,7);i++){
  const position=(time/720+i/7)%1,[px,py]=curve(position);
  paintBit(c,images,bits[Math.floor(time/720+i)%bits.length],px+(i%3-1)*width*.2,py,Math.max(15,width*1.27),flow,position*2);
 }
 if(glitter){
  c.fillStyle='#FFF6CE';
  for(let i=0;i<11;i++){
   const [px,py]=curve((time/840+i/11)%1);
   c.beginPath();c.arc(px+(i%3-1)*width*.27,py,i%3===0?1.8:1,0,Math.PI*2);c.fill();
  }
 }
 c.restore();
}
function drawJug(c,images,pose,bits,progress,app,material,glitter){const im=images.pourJug;if(!im)return;const [x,y,w,h]=pose.rect,[sx,sy]=pose.spout;c.save();c.translate(sx,sy);c.rotate(pose.angle);c.translate(-sx,-sy);c.drawImage(im,x,y,w,h);c.save();c.translate(x,y);c.scale(w,h);c.beginPath();c.moveTo(.335,.215);c.bezierCurveTo(.49,.26,.66,.25,.78,.205);c.lineTo(.795,.775);c.quadraticCurveTo(.77,.88,.57,.88);c.quadraticCurveTo(.35,.87,.335,.78);c.closePath();c.clip();const empty=clamp(progress,0,1),level=.27+empty*.60,grad=c.createLinearGradient(.35,level,.76,.88);const tones=app.swirl?app.tones:[app.target];tones.forEach((tone,i)=>grad.addColorStop(i/tones.length,tone));grad.addColorStop(1,tones.at(-1));c.fillStyle=grad;c.globalAlpha=.88;c.fillRect(.30,level,.52,.9-level);for(const bit of bits){const by=.28+bit.z*.58;if(by<level)continue;paintBit(c,images,bit,.56+bit.x*.25,by,.12*material.size*bit.size,.92)}if(glitter){c.fillStyle='#FFF6CE';for(let i=0;i<22;i++){const by=.29+(i*37%23)/23*.56;if(by<level)continue;c.beginPath();c.arc(.36+(i*13%23)/23*.4,by,i%3===0?.008:.004,0,Math.PI*2);c.fill()}}c.strokeStyle='#FFFFFFAC';c.lineWidth=.01;c.beginPath();c.moveTo(.34,level);c.quadraticCurveTo(.56,level+.035,.79,level);c.stroke();c.restore();c.globalAlpha=.20;c.drawImage(im,x,y,w,h);c.restore();}
function draw(c,state,options,ref,layout,images,atlas){const d=state.drafts[state.activeDraftId],r=d.recipe,p=SquishyScene07Model.presentation(state),g=geometry(r.mouldId,p.progress),rect=layout.mould,jr=layout.jug,app=SquishyScene04Model.appearance(r),yaw=-.22,pitch=1.15;
 // Lay the final body on its back: final z becomes pour height. Same final mesh volume.
 const turn=q=>{const x=q[0]*Math.cos(yaw)-q[1]*Math.sin(yaw),z=-q[0]*Math.sin(yaw)-q[1]*Math.cos(yaw),y=q[2];return [x,y*Math.cos(pitch)-z*Math.sin(pitch),y*Math.sin(pitch)+z*Math.cos(pitch)]};
 const all=g.shell.flatMap(t=>t.tri).map(turn),min=[0,1].map(k=>Math.min(...all.map(q=>q[k]))),max=[0,1].map(k=>Math.max(...all.map(q=>q[k]))),baseScale=Math.min(rect[2]/(max[0]-min[0]),rect[3]/(max[1]-min[1]))*.9,sizeFactor=r.mouldId.startsWith('dumpling_')?(SquishyDumplings.scale(r.mouldId)/1.02):1,scale=baseScale*sizeFactor,cx=rect[0]+rect[2]/2-(min[0]+max[0])/2*scale,cy=rect[1]+rect[3]/2+(min[1]+max[1])/2*scale;
 const project=q=>{const v=turn(q);return [cx+v[0]*scale,cy-v[1]*scale,v[2]]},items=g.shell.map(t=>({...t,colour:t.part==='rim'?'#DFC5FF':t.part==='inner'?'#A17AD2':t.part==='floor'?'#B699DA':'#BE9AE9'}));for(const tri of g.fill){const mid=tri.reduce((a,q)=>a.map((v,k)=>v+q[k]/3),[0,0,0]),phase=(Math.atan2(mid[1],mid[0])+Math.hypot(mid[0],mid[1])*5+(r.swirlAngle||0))/(Math.PI*2),index=((Math.floor(phase*app.tones.length)%app.tones.length)+app.tones.length)%app.tones.length;items.push({tri,part:tri.cap?'cap':'fill',colour:app.swirl?app.tones[index]:app.target})}items.forEach(t=>{t.p=t.tri.map(project);t.depth=t.p.reduce((s,q)=>s+q[2],0)/3});items.sort((a,b)=>a.depth-b.depth);
 let frame;
 if(globalThis.SquishyPourRaster){frame=SquishyPourRaster.draw(c,items,project,rect,{size:options.quiet||['ready','filled'].includes(p.phase)?384:256,key:JSON.stringify([r,d.seed,Math.round(p.progress*160),rect,options.quiet||['ready','filled'].includes(p.phase)?384:256]),glitter:r.colourFinish==='glitter',seed:d.seed||1,normalTransform:turn,materialImage:globalThis.SquishyToyArt?.images[r.mouldId.startsWith('dumpling_')?'dumplings':'mould_'+r.mouldId]});}else{throw Error('The depth-tested pour renderer is unavailable')}
 const liquidSurface=project([0,0,g.level]).slice(0,2),surface=project([0,0,g.max*1.035+.025]).slice(0,2);

 const pose=jugPose(jr,p,d.pourStageMs||0),dr=pose.rect,spout=pose.spout;

 const contents=recipeBits(r,d.seed||1),material=fills[r.materialId]||fills.gel,glitter=r.colourFinish==='glitter';
 paintMouldBits(c,images,contents,bit=>project([bit.x*.83,bit.y*.83,g.level]),frame,rect,p.progress);
 if(p.flow>0)paintStream(c,images,contents,spout,liquidSurface,app,material,p.flow,options.quiet?0:(options.time||0),glitter);
 drawJug(c,images,pose,contents,p.progress,app,material,glitter);return {spout,surface,liquidSurface,mouldRect:[...rect],jugRect:dr,phase:p.phase,fillLevel:g.level,fillTriangles:g.fill.length,shape:r.mouldId,geometryFill:true,jugAngle:pose.angle,cavityBounds:[g.min,g.max]};}
 globalThis.SquishyPourVolume={geometry,model,draw,jugPose};})();
