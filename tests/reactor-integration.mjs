import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { Miniflare } = createRequire(require.resolve('wrangler/package.json'))('miniflare');
const worker = new Miniflare({modulesRoot:resolve('dist/server'),modules:['index.js',...(await readdir('dist/server',{recursive:true})).filter(p=>p.endsWith('.js')&&p!=='index.js')].map(p=>({type:'ESModule',path:resolve('dist/server',p)})),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'reactor-rush-tests'},cf:false});
const db=await worker.getD1Database('DB');
for(const q of (await readFile('drizzle/0000_zippy_dark_beast.sql','utf8')).split('--> statement-breakpoint'))if(q.trim())await db.prepare(q.trim()).run();
let checks=0;const latencies=[];let conflicts=0;
const check=(v,s)=>{assert.ok(v,s);checks++;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function req(path,data,seat,status=200,extra={}){
 const start=performance.now();
 const response=await worker.dispatchFetch('http://game.test'+path,{method:data?'POST':'GET',headers:{...(data?{'Content-Type':'application/json'}:{}),...(seat?{Authorization:'Bearer '+seat.token}:{}),...extra},...(data?{body:JSON.stringify(data)}:{})});
 latencies.push(performance.now()-start);
 const result=await response.json();assert.equal(response.status,status,JSON.stringify(result));return result;
}
const create=async(name,solo=false)=>(await req('/api/reactor',{name,character:'iris',solo},null,201));
const join=async(s,name)=>(await req('/api/reactor/join',{name,character:'jet',code:s.code}));
const read=s=>req('/api/reactor/'+s.code,null,s);
const act=(s,type,rest={},status=200)=>req('/api/reactor/'+s.code,{type,requestId:randomUUID(),...rest},s,status);
const input=(s,seq,x=0,y=0,dash=0)=>req('/api/reactor/'+s.code,{type:'input',seq,x,y,dash},s);
async function patch(code,fn){const row=await db.prepare('SELECT state FROM rooms WHERE code=?').bind(code).first();const r=JSON.parse(row.state);fn(r);await db.prepare('UPDATE rooms SET state=?,version=version+1 WHERE code=?').bind(JSON.stringify(r),code).run();}
try{
 await req('/api/reactor',{name:'',character:'iris',solo:false},null,400);
 await req('/api/reactor',{name:'Test',character:'invalid'},null,400);
 await req('/api/reactor',{name:'Test',character:'iris',solo:false},null,403,{Origin:'https://elsewhere.test'});
 for(const count of [2,3,6]){
  const made=await create('Host'+count),host=made.session,seats=[host];
  for(let i=1;i<count;i++)seats.push((await join(host,'Player'+i)).session);
  check(new Set(seats.map(s=>s.token)).size===count,'Independent seat tokens');
  await req('/api/reactor/'+host.code,null,null,401);
  await req('/api/reactor/'+host.code,null,{...host,token:'0'.repeat(64)},401);
  await req('/api/rooms/join',{name:'Legacy',code:host.code},null,404);
  await req('/api/rooms/'+host.code,null,host,404);
  await act(seats[1],'duration',{value:60},403);await act(seats[1],'start',{},403);
  await act(host,'start',{},400);
  await req('/api/reactor/join',{name:'Host'+count,character:'iris',code:host.code},null,400);
  if(count===6)await req('/api/reactor/join',{name:'Seventh',character:'iris',code:host.code},null,400);
  await act(host,'duration',{value:600});check((await read(seats[1])).duration===600,'Custom time syncs');
  await act(host,'duration',{value:30});
  await act(host,'duration',{value:29},400);await act(host,'duration',{value:601},400);
  await Promise.all(seats.map(s=>act(s,'ready',{ready:true})));
  let r=await act(host,'start');check(r.phase==='countdown','Ready crew starts shared countdown');
  check(r.players.length===count,'All seats in snapshot');check(!JSON.stringify(r).includes(host.token)&&!JSON.stringify(r).includes('token_hash')&&!('seed'in r),'No credentials or PRNG state leak');
  await act(seats[1],'character',{character:'lumi'},400);
  await req('/api/reactor/join',{name:'Late',character:'iris',code:host.code},null,400);
  await req('/api/reactor/'+host.code,{type:'input',x:1,y:0,seq:1,dash:0,score:100},host,400);
  await req('/api/reactor/'+host.code,{type:'input',x:200,y:0,seq:1,dash:0},host,400);
  await patch(host.code,r=>{r.startedAt=Date.now()-500;r.endsAt=Date.now()+30000;r.simAt=Date.now();r.phase='playing';r.players.forEach((p,i)=>{p.x=420+i*10;p.y=235;p.lastSeen=0;});r.balls=[];r.nextRareAt=Date.now()+20000;});
  const initial=await read(host);await pause(80);
  for(let wave=0;wave<8;wave++){
   const responses=await Promise.all(seats.map(async(s,i)=>{
    const response=await worker.dispatchFetch('http://game.test/api/reactor/'+s.code,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.token},body:JSON.stringify({type:'input',x:i%2?-1:1,y:0,seq:wave+1,dash:0})});
    if(response.status===409){conflicts++;return null;}assert.equal(response.status,200,await response.clone().text());return response.json();
   }));
   check(responses.some(Boolean),`Concurrent wave ${wave} accepted`);await pause(90);
  }
  r=await read(host);check(r.players.some((p,i)=>Math.abs(p.x-initial.players[i].x)>30),'Independent inputs move runners on server');
  check(r.players.every(p=>p.input.seq>0),'Every seat input eventually applied');
  const p=r.players.find(p=>p.id===host.playerId);const old=p.input.seq;await pause(80);await input(host,0,-1,0,50);r=await read(host);check(r.players.find(p=>p.id===host.playerId).input.seq===old,'Stale sequence rejected');
  await patch(host.code,r=>{r.players.forEach((p,i)=>{p.lastSeen=0;p.input={x:0,y:0,seq:50,dash:0,at:0};p.score=0;p.bag=i===0?[1,1,2]:[];if(i===0){p.x=p.home.x;p.y=p.home.y;}});r.balls=[];r.simAt=Date.now()-25;});
  r=await read(seats[1]);check(r.players.find(p=>p.id===host.playerId).score===4,'Deposit awards four on actual Worker');
  const views=await Promise.all(seats.map(read));check(views.every(v=>v.players.find(p=>p.id===host.playerId).score===4),'All independent seats agree on score');
  await patch(host.code,r=>{r.players.forEach(p=>{p.lastSeen=0;p.bag=[];p.input.x=0;p.input.y=0;});r.endsAt=Date.now()-10;r.simAt=r.endsAt;});
  r=await read(host);check(r.phase==='finished'&&r.winners[0]===host.playerId,'Shared deadline ends round and selects winner');
  const refresh=await read(host);check(refresh.players.find(p=>p.id===host.playerId).score===4,'Reload with same seat retains final score');
  await act(seats[1],'rematch',{},403);r=await act(host,'rematch');check(r.phase==='lobby'&&r.players.every(p=>!p.ready),'Rematch returns everyone and resets readiness');
  const left=await act(seats[1],'leave');check(left.left,'Guest can leave');await read(host);await req('/api/reactor/'+host.code,null,seats[1],401);
  check((await read(host)).players.length===count-1,'Departure removes seat');
  console.log(`PASS ${count} independent players: joins, host checks, concurrent input, scoring, deadline, reconnect, replay, leave.`);
 }
 const solo=await create('Solo',true),s=solo.session;
 check(solo.room.players.filter(p=>p.isBot).length===2,'Solo creates two bots');
 const requestId=randomUUID();await act(s,'bots',{value:1,requestId});await act(s,'bots',{value:3,requestId});check((await read(s)).players.filter(p=>p.isBot).length===1,'Duplicate action applied once');
 await act(s,'start');
 await patch(s.code,r=>{r.phase='playing';r.startedAt=Date.now()-20000;r.endsAt=Date.now()+50000;r.simAt=Date.now()-1500;r.players[0].lastSeen=0;});
 let r=await read(s);check(r.players.find(p=>p.isBot).x!==solo.room.players[1].x,'Bot moves through shared Worker simulation');
 const guest=(await create('Takeover')).session,second=(await join(guest,'NextHost')).session;
 await patch(guest.code,r=>{r.players[0].lastSeen=Date.now()-16000;r.players[1].lastSeen=0;});r=await read(second);check(r.hostId===second.playerId,'Active guest inherits offline host');
 r=await act(second,'remove',{targetId:guest.playerId});check(r.players.length===1,'Host can remove an offline lobby player');
 await req('/api/reactor/'+guest.code,null,guest,401);
 const online=(await join(second,'OnlineGuest')).session;
 await act(second,'remove',{targetId:online.playerId},400);
 await act(online,'remove',{targetId:second.playerId},403);
 await patch(guest.code,r=>{r.createdAt=0;});await db.prepare('UPDATE rooms SET expires_at=? WHERE code=?').bind(Date.now()-1,guest.code).run();await req('/api/reactor/'+guest.code,null,second,404);
 const sorted=latencies.sort((a,b)=>a-b);console.log(`Passed ${checks} Reactor Rush API assertions plus HTTP validation checks. Local request latency median=${Math.round(sorted[Math.floor(sorted.length*.5)])}ms p95=${Math.round(sorted[Math.floor(sorted.length*.95)])}ms; concurrent conflicts=${conflicts}.`);
}catch(e){console.error(e);process.exitCode=1;}finally{await worker.dispose();}
