/* A rigid charm follows the orientation of its containing material triangle. */
(()=>{'use strict';const is=id=>id==='rainbow'||id==='unicorn';function frame(a,b,c){const sub=(a,b)=>a.map((v,i)=>v-b[i]),norm=v=>{const l=Math.hypot(...v);return l>1e-8?v.map(n=>n/l):null},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],x=norm(sub(b,a)),z=x&&norm(cross(x,sub(c,a)));return x&&z?[x,cross(z,x),z]:null}
function update(p,body){if(!is(p.familyId))return;const rest=p.ids.map(i=>body.nodes[i].rest),current=p.ids.map(i=>body.nodes[i].p);p.restFrame??=frame(...rest);const now=frame(...current);if(now)p.currentFrame=now}
function orient(p,v){const q=SquishyInterior.rotate(v,p.axis,p.angle);if(!p.restFrame||!p.currentFrame)return q;return p.currentFrame.reduce((out,axis,i)=>{const d=q.reduce((s,n,k)=>s+n*p.restFrame[i][k],0);return out.map((n,k)=>n+axis[k]*d)},[0,0,0])}
globalThis.SquishyCharmMotion={is,update,orient};})();
