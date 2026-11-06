const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ctx = vm.createContext({ structuredClone });
for (const file of ['hub-model.js','scene09-model.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
}
const hub = ctx.SquishyHubModel;
const play = ctx.SquishyScene09Model;
const state = hub.empty();
const sample = {kind:'sample'};
assert.equal(play.tried(state,sample),state);
assert.equal(play.checkpoint(state,sample,{}),state);
const draft = {kind:'draft',draftId:'toy',recipe:{materialId:'gel'}};
const batch = {id:'a',familyId:'foil_star',subtype:'star',amount:6,seedOffset:1};
state.drafts.toy = {id:'toy',creationId:'creation',lastSafeStep:'08',recipe:{
  batches:[batch],inclusions:[structuredClone(batch)]
}};
const checkpoint = play.checkpoint(state,draft,{yaw:-18,pitch:12});
assert.equal(checkpoint.drafts.toy.playView.yaw,342);
assert.equal(play.checkpoint(checkpoint,draft,{yaw:-18,pitch:12}),checkpoint);
const tried = play.tried(checkpoint,draft);
assert.notEqual(tried,checkpoint);
assert.equal(play.tried(tried,draft),tried);
const saved = hub.normalize(JSON.parse(hub.serialize(tried)));
assert.equal(saved.drafts.toy.recipe.inclusions,undefined);
assert.equal(saved.drafts.toy.recipe.batches[0].amount,6);
state.drafts.toy.recipe.inclusions[0].amount = 7;
assert.equal(JSON.parse(hub.serialize(state)).drafts.toy.recipe.inclusions[0].amount,7);
console.log('PASS unchanged pokes and camera checkpoints reuse state, equal ingredient aliases are compacted and legacy data is retained');
