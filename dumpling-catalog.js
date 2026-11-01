(() => {'use strict';
const tiers=[['dumpling_s','Small Dumpling',.44,0,0],['dumpling_m','Medium Dumpling',.60,3,20],['dumpling_l','Large Dumpling',.80,7,40],['dumpling_xl','Super Large Dumpling',1.02,12,60]].map(([id,label,scale,saves,price],index)=>({id,label,scale,saves,price,index}));
const get=id=>tiers.find(t=>t.id===id),is=id=>!!get(id);globalThis.SquishyDumplings={tiers,get,is,label:id=>get(id)?.label||id[0].toUpperCase()+id.slice(1),scale:id=>get(id)?.scale||1};})();
