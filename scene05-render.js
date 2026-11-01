(() => {
function create(canvases){
 const images={},buffers={},contexts={},shading={},volumeCards={};
 for(const id of SquishyScene05Model.materials){buffers[id]=document.createElement('canvas');shading[id]=document.createElement('canvas');contexts[id]=canvases[id].getContext('2d')}
 const materialReady=Promise.all(SquishyScene05Model.materials.map(id=>new Promise(resolve=>{const img=new Image();img.onload=()=>{images[id]=img;resolve(true)};img.onerror=()=>resolve(false);img.src=SquishyScene05Atlas[id].image})));
 const padReady=new Promise(resolve=>{const pad=new Image();pad.onload=()=>{images.pad=pad;resolve()};pad.onerror=()=>resolve();pad.src='assets/scene03/turntable.png'});const artworkReady=Promise.all([materialReady,padReady]).then(([materials])=>materials);
 const ready=Promise.all([artworkReady,globalThis.SquishyColourFinish?.ready]).then(async([artwork])=>{if(globalThis.SquishyScene09Volume&&globalThis.SquishyScene09Renderer){const surface=document.createElement('canvas'),renderer=SquishyScene09Renderer.create(surface,{skipLegacy:true});renderer.size(512,512);await renderer.ready;for(const id of SquishyScene05Model.materials)volumeCards[id]={surface,renderer}}return artwork});
 function resize(id,width,height){const c=canvases[id],b=buffers[id],s=shading[id];c.width=b.width=s.width=Math.max(1,Math.round(width*2));c.height=b.height=s.height=Math.max(1,Math.round(height*2))}
 function draw(id,recipe,pose={}){
  const canvas=canvases[id],c=contexts[id],b=buffers[id],bc=b.getContext('2d'),w=canvas.width,h=canvas.height,depth=pose.depth||0;
  c.clearRect(0,0,w,h);bc.clearRect(0,0,w,h);
  const base=h*.78;
  if(images.pad)c.drawImage(images.pad,w*.08,base-h*.126,w*.84,h*.30);
  c.save();c.globalAlpha=.12;c.fillStyle='#49345d';c.beginPath();c.ellipse(w*.5,base,w*(.28+Math.max(0,depth)*.025),h*.035,0,0,Math.PI*2);c.fill();c.restore();
  if(volumeCards[id]){const card=volumeCards[id],key=JSON.stringify([recipe,id]);if(card.key!==key){card.key=key;card.solver=SquishyScene09Volume.create({shape:recipe.mouldId,material:id});}const compression=Math.max(.65,Math.min(1.06,1-depth*.27));for(const n of card.solver.nodes)n.p=[n.rest[0]/Math.sqrt(compression),n.rest[1]*compression,n.rest[2]/Math.sqrt(compression)];card.renderer.draw({recipe:{...recipe,materialId:id},seed:0},card.solver,{texture:true,heroOnly:true,rotation:-18,pitch:12});const size=Math.min(w*.96,h*.88);c.drawImage(card.surface,(w-size)/2,base-size*.88,size,size);return}
  const image=images[id],atlas=SquishyScene05Atlas[id];
  if(!image)return;
  let frame=0;
  if(!pose.quiet&&pose.phase==='press')frame=Math.min(3,Math.max(0,depth)*3);
  if(!pose.quiet&&pose.phase==='recover')frame=depth<0?6:4+Math.min(1,Math.max(0,1-depth/Math.max(.001,pose.from||1)))*3;
  // Fit every material and every animation pose inside the canvas.
  // A shared rest width keeps comparison samples equal-size without top clipping.
  const all=Object.values(SquishyScene05Atlas),maxHeight=Math.max(...all.flatMap(a=>a.frames.map(r=>r[3]/a.rest_width))),maxWidth=Math.max(...all.flatMap(a=>a.frames.map(r=>r[2]/a.rest_width)));
  const restWidth=Math.min(w*.72,w*.88/maxWidth,(base-h*.08)/maxHeight);
  const low=Math.floor(frame),high=Math.min(7,low+1),fraction=frame-low,scale=restWidth/atlas.rest_width;
  function cell(index,alpha){const r=atlas.frames[index],dw=r[2]*scale,dh=r[3]*scale;bc.globalAlpha=alpha;bc.drawImage(image,r[0],r[1],r[2],r[3],w*.5-dw*.5,base-dh,dw,dh)}
  cell(low,1-fraction);if(fraction>.001){bc.globalCompositeOperation='lighter';cell(high,fraction)}bc.globalCompositeOperation='source-over';bc.globalAlpha=1;
  const colours=SquishyScene04Model.appearance(recipe),gradient=bc.createLinearGradient(w*.1,h*.15,w*.9,h*.75);colours.tones.forEach((hex,i)=>gradient.addColorStop(colours.tones.length===1?0:i/(colours.tones.length-1),hex));
  const shade=shading[id].getContext('2d');shade.clearRect(0,0,w,h);shade.filter='grayscale(1)';shade.drawImage(b,0,0);shade.filter='none';bc.globalCompositeOperation='source-in';bc.globalAlpha=1;bc.fillStyle=gradient;bc.fillRect(0,0,w,h);bc.globalCompositeOperation='soft-light';bc.globalAlpha=id==='foam'?.35:.58;bc.drawImage(shading[id],0,0);bc.globalAlpha=1;bc.globalCompositeOperation='source-over';
  if((recipe.inclusions?.length||recipe.batches?.length)&&id==='foam'){bc.save();bc.globalCompositeOperation='source-atop';bc.globalAlpha=.6;bc.fillStyle=colours.tones.at(-1);for(let i=0;i<5;i++){bc.beginPath();bc.ellipse(w*(.35+i*.065),h*(.40+(i%2)*.03),w*.012,h*.009,0,0,Math.PI*2);bc.fill()}bc.restore()}
  bc.save();bc.globalCompositeOperation='source-atop';globalThis.SquishyColourFinish?.draw(bc,recipe,w*.12,h*.06,w*.76,h*.72,{quiet:pose.quiet});bc.restore();
  c.drawImage(b,0,0);
 }
 return {ready,resize,draw};
}
globalThis.SquishyScene05Renderer={create};
})();
