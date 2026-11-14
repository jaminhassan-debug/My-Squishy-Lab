(() => {
'use strict';
const dayMs=86400000;
const ideas=[
 {shape:'dumpling_s',colour:'pink',name:'Berry Bao'},
 {shape:'heart',colour:'lilac',name:'Lavender Heart'},
 {shape:'cube',colour:'mint',name:'Mint Cube'},
 {shape:'blob',colour:'peach',name:'Peach Puddle'}
];
const dailyCoins=5,weeklyCoins=15;
function calendar(now){
 const date=new Date(now);
 const day=Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/dayMs);
 return {day,week:day-(day+3)%7};
}
function summary(state,now=Date.now()){
 const {day,week}=calendar(now),progress=state.profile.workshopRewards??{};
 const idea=ideas[((week+3)/7%ideas.length+ideas.length)%ideas.length];
 const count=state.creations.filter(toy=>{
  if(!Number.isFinite(toy.savedAt))return false;
  const saved=calendar(toy.savedAt).day;
  return saved>=week&&saved<=day&&toy.recipe?.mouldId===idea.shape&&toy.recipe?.colourIds?.includes(idea.colour);
 }).length;
 return {idea,count,day,week,dailyAvailable:day>(progress.dailyDay??-1),weeklyAvailable:count>0&&week>(progress.weeklyDay??-1)};
}
function claim(state,kind,now=Date.now()){
 const current=summary(state,now);
 if(kind!=='daily'&&kind!=='weekly')throw Error('Unknown workshop reward');
 if(!current[kind+'Available'])return {state,coins:0};
 const coins=kind==='daily'?dailyCoins:weeklyCoins;
 const progress={...state.profile.workshopRewards,[kind+'Day']:current[kind==='daily'?'day':'week']};
 return {state:{...state,profile:{...state.profile,workshopRewards:progress,wallet:(state.profile.wallet??0)+coins}},coins};
}
globalThis.SquishyDailyWorkshop={summary,claim,dailyCoins,weeklyCoins};
})();
