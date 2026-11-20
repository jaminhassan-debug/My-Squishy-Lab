const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const events={},classes=new Set(),props={},main={inert:false},gate={hidden:true,setAttribute(){}},root={classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle:(c,v)=>v?classes.add(c):classes.delete(c)},style:{setProperty:(k,v)=>props[k]=v}},env={innerWidth:844,innerHeight:390,window:{addEventListener:(n,f)=>events[n]=f},document:{documentElement:root,addEventListener:(n,f)=>events[n]=f,getElementById:()=>gate,querySelectorAll:()=>[main],createElement:()=>gate,body:{append(){}}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../viewport-fit.js'),'utf8'),env);events.DOMContentLoaded();
for(const [w,h]of [[844,390],[1180,820],[390,844],[820,1180],[320,568],[844,390]]){
 env.innerWidth=w;env.innerHeight=h;events.resize();
 const portrait=w<h,bw=portrait?768:1024,bh=portrait?1024:768;
 assert.equal(env.SquishyViewport.portrait,portrait);
 assert.equal(env.SquishyViewport.width,bw);
 assert.equal(env.SquishyViewport.height,bh);
 assert(Math.abs(parseFloat(props['--board-width'])*env.SquishyViewport.scale-w)<.001);
 assert(Math.abs(parseFloat(props['--board-height'])*env.SquishyViewport.scale-h)<.001);
 assert.equal(main.inert,false);
 assert.equal(classes.has('rotate-required'),false);
 assert.equal(classes.has('board-portrait'),portrait);
 assert(bw*env.SquishyViewport.scale<=w+.001);
 assert(bh*env.SquishyViewport.scale<=h+.001);
}
console.log('PASS portrait and landscape phone/tablet fit and rotation recovery');

for (const event of ['contextmenu', 'selectstart']) {
  for (const [insideGame, editable, blocked] of [
    [true, false, true],
    [true, true, false],
    [false, false, false],
  ]) {
    let prevented = false;
    events[event]({
      target: {closest: selector => selector.startsWith('main') ? insideGame : editable},
      preventDefault() { prevented = true; },
    });
    assert.equal(prevented, blocked);
  }
}
console.log('PASS native long-press menus blocked on game surfaces while text fields remain usable');
