(() => {
'use strict';
function create(canvas){const c=canvas.getContext('2d'),source=SquishyScene08Renderer.create(document.createElement('canvas'),{textureOnly:true}),images={},output=document.createElement('canvas'),oc=output.getContext('2d'),A=SquishyScene10Atlas;output.width=512;output.height=432;let ref=[1024,768],box=[256,112,512,432];
 const ready=Promise.all([source.ready,...Object.entries(A).map(([id,a])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[id]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=globalThis.SquishyEmbeddedImages?.[a.image]||a.image}))]).then(result=>[...result[0],...result.slice(1)]);
 function size(width,height,portrait=false){ref=portrait?[768,1024]:[1024,768];box=portrait?[96,160,576,486]:[256,112,512,432];canvas.width=Math.max(1,Math.round(width*1.5));canvas.height=Math.max(1,Math.round(height*1.5))}
 function sprite(ctx,id,frame,rect){if(images[id])ctx.drawImage(images[id],...A[id].crops[frame],...rect)}
 function paint(ctx,view){const options=SquishyScene10Model.photo(view.photoOptions),colours={cream:['#FFF7E9','#F0DDC4'],mint:['#E1F6E9','#ADE0CE'],lilac:['#F0E7FC','#C9B2EE']}[options.backgroundId];ctx.clearRect(0,0,512,432);const grad=ctx.createLinearGradient(0,0,0,432);grad.addColorStop(0,colours[0]);grad.addColorStop(1,colours[1]);ctx.fillStyle=grad;ctx.fillRect(0,0,512,432);sprite(ctx,'plinth',0,[20,292,472,136]);const texture=source.getTexture(view.recipe,view.seed,false),index=SquishyScene08Model.shapes.indexOf(view.recipe.mouldId),crop=SquishyScene08Atlas.heroes.crops[index],angle=options.rotation*Math.PI/180,pitch=options.pitch*Math.PI/180,scale=Math.min(280/crop[2],270/crop[3]),w=globalThis.SquishyScene09Volume?300:crop[2]*scale,h=globalThis.SquishyScene09Volume?300:crop[3]*scale;
  ctx.save();ctx.translate(256,334-h/2);ctx.rotate(angle);ctx.transform(1,Math.sin(pitch)*.15,0,Math.cos(pitch),0,0);ctx.drawImage(texture,-w/2,-h/2,w,h);ctx.restore();
  if(options.frameId!=='none'){const frame=['cream','lilac','star'].indexOf(options.frameId);ctx.save();ctx.beginPath();ctx.rect(0,0,512,432);ctx.rect(51,43,410,346);ctx.clip('evenodd');sprite(ctx,'frames',frame,[0,0,512,432]);ctx.restore()}
 }
 function draw(view,options={}){c.setTransform(canvas.width/ref[0],0,0,canvas.height/ref[1],0,0);c.clearRect(0,0,...ref);paint(oc,view);c.drawImage(output,...box);if(options.feedback!=null){sprite(c,'feedback',Math.min(7,Math.max(0,options.feedback)),[ref[0]-260,ref[1]*.34,150,150])}return {box:[...box],photoOptions:SquishyScene10Model.photo(view.photoOptions)}}
 function capture(view,id){const thumb=document.createElement('canvas');thumb.width=384;thumb.height=324;const ctx=thumb.getContext('2d');ctx.setTransform(.75,0,0,.75,0,0);paint(ctx,view);return {id,dataUrl:thumb.toDataURL('image/png'),width:384,height:324}}
 function facePreview(view,id){const preview=document.createElement('canvas');preview.width=preview.height=96;const ctx=preview.getContext('2d');ctx.drawImage(source.getTexture({...view.recipe,faceId:id},view.seed,false),0,0,96,96);return preview}
 return {ready,size,draw,capture,facePreview};
}
globalThis.SquishyScene10Renderer={create};
})();
