const assert=require('node:assert/strict');const G=require('./geometry.js');
for(const name of ['heart','star','cloud']){const p=G.prepare(G.stamp(name));assert(p.length>=40&&p.length<=160);assert(G.simple(p));assert(Math.abs(G.area(p))>.04);assert(p.every(p=>p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)))}
assert.throws(()=>G.prepare([]),/larger/);assert.throws(()=>G.prepare(Array.from({length:12},(_,i)=>[i/20,.5])),/fuller/);assert.throws(()=>G.prepare(Array(12).fill([NaN,.5])),/read/);
const cross=[[.1,.1],[.3,.3],[.5,.5],[.7,.7],[.9,.9],[.9,.7],[.9,.5],[.9,.1],[.7,.3],[.5,.5],[.3,.7],[.1,.9],[.1,.7],[.1,.5],[.1,.1]];assert.throws(()=>G.prepare(cross));
const open=G.stamp('cloud').slice(0,100);assert.throws(()=>G.prepare(open),/Join/);
const concave=[[.1,.1],[.3,.1],[.3,.5],[.7,.5],[.7,.1],[.9,.1],[.9,.9],[.1,.9],[.1,.1]];assert(G.simple(G.prepare(concave)));
console.log('PASS: starter shapes, bounded geometry, concave outline, malformed input, crossing, open stroke, thin stroke');
