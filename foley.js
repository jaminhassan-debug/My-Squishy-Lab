/* Close-miked-style Foley built from filtered movement noise and short contact resonances. */
(() => {
'use strict';
const rate = 24000;
const tau = 2 * Math.PI;
const actions = {
  tap: [.12, [['pad',0,.08,270,.32],['edge',.012,.037,970,.08]]],
  turn: [.22, [['rub',0,.15,1650,.24],['pad',.115,.055,190,.13]]],
  mould: [.27, [['rub',0,.16,740,.22],['pad',.105,.13,120,.33]]],
  pigment: [.44, [['drop',0,.16,315,.33],['drop',.102,.16,225,.14],['drop',.213,.13,420,.11]]],
  pick: [.15, [['edge',0,.053,1800,.20],['pad',.04,.085,260,.19]]],
  drop: [.47, [['grains',0,.36,2450,.58],['drop',.08,.14,300,.13]]],
  beads: [.51, [['grains',0,.39,3800,.55],['pad',.09,.18,275,.15]]],
  charm: [.42, [['edge',0,.08,1500,.22],['edge',.051,.075,2500,.18],['drop',.085,.19,230,.32]]],
  undo: [.26, [['rub',0,.15,1050,.19],['edge',.105,.06,820,.14]]],
  foam: [.29, [['rub',0,.23,980,.31],['pad',0,.135,85,.25]]],
  gel: [.33, [['drop',0,.24,175,.35],['rub',.028,.21,580,.17]]],
  bounce: [.34, [['pad',0,.21,145,.40],['pad',.108,.14,195,.15]]],
  'foam-squeeze': [.45, [['rub',.003,.38,690,.43],['pad',.081,.25,78,.17]]],
  'gel-squeeze': [.49, [['rub',0,.37,400,.39],['drop',.07,.29,105,.30],['drop',.214,.19,195,.16]]],
  'bounce-squeeze': [.45, [['rub',0,.32,770,.33],['pad',.033,.22,135,.29],['drop',.17,.17,260,.18]]],
  stretch: [.54, [['rub',0,.43,950,.37],['rub',.105,.36,440,.31],['drop',.31,.16,230,.22]]],
  release: [.18, [['drop',0,.145,230,.26],['edge',.018,.05,1300,.11]]],
  'foam-release': [.21, [['rub',0,.16,1250,.25],['pad',.024,.13,117,.17]]],
  'bounce-release': [.25, [['pad',0,.14,196,.32],['pad',.112,.1,246,.14]]],
  peel: [.76, [['rub',0,.64,935,.30],['rub',.09,.35,2200,.20],['drop',.44,.23,220,.27]]],
  land: [.39, [['pad',0,.2,82,.48],['rub',.055,.23,440,.13],['pad',.16,.14,110,.13]]],
  shutter: [.21, [['edge',0,.048,2200,.30],['edge',.045,.055,1500,.28],['edge',.098,.055,3250,.13]]],
  confirm: [.31, [['pad',0,.12,180,.25],['edge',.074,.10,910,.23]]],
  cabinet: [.43, [['rub',0,.28,740,.28],['pad',.15,.16,98,.34],['edge',.194,.06,1280,.17]]],
  gift: [.51, [['rub',0,.33,2400,.30],['rub',.067,.28,1250,.32],['edge',.244,.07,1960,.15]]],
  reward: [.49, [['grains',0,.33,4350,.52],['edge',.15,.23,1480,.20],['edge',.213,.18,2110,.16]]],
  decorate: [.41, [['pad',0,.19,110,.41],['rub',.035,.265,1050,.20],['edge',.166,.07,768,.12]]],
  valve: [.21, [['edge',0,.07,780,.18],['drop',.053,.139,340,.26]]],
  rotate: [.15, [['rub',0,.12,560,.19],['edge',.045,.052,1760,.15]]]
};
const loops = {pour:2.6, stir:2.3};

function random(seed) {
  let state=seed;
  return () => {
    state=(Math.imul(1664525,state)+1013904223)>>>0;
    return state/2147483648-1;
  };
}
function filter(hz) { return 1-Math.exp(-tau*hz/rate); }

function contact(samples,layer,noise) {
  const [kind,start,length,hz,volume]=layer;
  if(kind==='grains') {
    for(let at=0;at<length;at+=.018+(noise()+1)*.027){
      const level=volume*(.29+.22*(noise()+1))*(1-at/length);
      contact(samples,[noise()>.5?'pad':'edge',start+at,.045,hz*(.56+.41*(noise()+1)),level],noise);
    }
    return;
  }
  const offset=Math.round(start*rate), count=Math.min(samples.length-offset,Math.round(length*rate));
  let slow=0,fast=0,phase=0,movement=0;
  const high=filter(kind==='edge'?hz*2.4:hz*1.2);
  const low=filter(kind==='pad'?95:kind==='drop'?185:hz*.23);
  for(let i=0;i<count;i++){
    const time=i/rate, progress=i/count;
    const grit=noise();
    slow+=(grit-slow)*low;
    fast+=(grit-fast)*high;
    movement+=(grit-movement)*.007;
    const attack=Math.min(1,time/(kind==='rub'?.032:kind==='drop'?.008:.002));
    const edge=Math.min(1,(length-time)/.014);
    let sample;
    if(kind==='rub'){
      const texture=.52+.25*Math.sin(tau*13*time)+.15*Math.sin(tau*27*time+1.4);
      sample=(fast-slow)*attack*edge*texture*(.65+movement*4)*Math.sin(Math.PI*progress);
    }else{
      const pitch=kind==='drop'?hz*(.62+.66*Math.exp(-time*19)):hz;
      phase+=tau*pitch/rate;
      const ring=(Math.sin(phase)+.32*Math.sin(phase*1.64)+.17*Math.sin(phase*2.24))*
        Math.exp(-time*(kind==='edge'?65:kind==='pad'?22:19));
      const impact=(fast-slow)*Math.exp(-time*(kind==='edge'?58:kind==='pad'?32:24));
      sample=attack*edge*(impact*.68+ring*(kind==='edge'?.18:.65));
    }
    samples[offset+i]+=sample*volume;
  }
}

function flow(samples,name,duration,noise) {
  const count=samples.length;
  const stream=name==='pour';
  let low=0,body=0,detail=0;
  const roughness=filter(stream?2150:850),moisture=filter(stream?420:275),bass=filter(80);
  for(let i=0;i<count;i++){
    const time=i/rate,raw=noise();
    low+=(raw-low)*bass;
    body+=(raw-body)*moisture;
    detail+=(raw-detail)*roughness;
    const cadence=stream?.69+.14*Math.sin(tau*7*time)+.16*Math.sin(tau*15*time+.6):
      .28+.52*(.5+.5*Math.cos(tau*1.8*time))**2+.16*Math.sin(tau*8*time);
    samples[i]=cadence*((detail-body)*.24+(body-low)*.48+low*.36);
  }
  for(let at=.022;at<duration-.10;at+=(stream?.055:.14)+(noise()+1)*.072){
    contact(samples,[stream?'drop':'rub',at,.09,stream?210+(noise()+1)*185:900,.12+.07*(noise()+1)],noise);
  }
  // Blend the end into the start at the same sample positions without a silent seam.
  const fade=Math.round(rate*.045);
  for(let i=0;i<fade;i++){
    const weight=i/(fade-1);
    const at=count-fade+i;
    const start=Math.min(fade-1,i);
    samples[at]=samples[at]*(1-weight)+samples[start]*weight;
  }
  const seam=samples[0]-samples[count-1];
  for(let i=0;i<fade;i++)samples[count-fade+i]+=seam*(i/(fade-1))**2;
}
function create(context,name) {
  const action=actions[name];
  const duration=action?.[0]??loops[name];
  if(!duration)return null;
  const buffer=context.createBuffer(1,Math.round(rate*duration),rate);
  const samples=buffer.getChannelData(0);
  const seed=[...name].reduce((n,ch)=>Math.imul(n^ch.charCodeAt(0),16777619),2166136261);
  const noise=random(seed);
  if(action)for(const layer of action[1])contact(samples,layer,noise);
  else flow(samples,name,duration,noise);
  let peak=0;
  for(const sample of samples)peak=Math.max(peak,Math.abs(sample));
  const gain=Math.min(2, (name==='tap'||name==='turn'||name==='rotate'?.18:loops[name]?.32:.39)/Math.max(.01,peak));
  for(let i=0;i<samples.length;i++)samples[i]*=gain;
  return buffer;
}
window.SquishyFoley={create,has:name=>Object.hasOwn(actions,name),isLoop:name=>Object.hasOwn(loops,name)};
})();
