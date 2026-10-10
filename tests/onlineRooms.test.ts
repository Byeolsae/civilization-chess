import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { createRoom,joinRoom,commandRoom,publicRoom,seat,getRoom,type Room } from '../server/rooms';
import { MemoryRoomStore } from '../server/roomStore';
import { roomHandler } from '../api/pvp';
import { AbilityGame } from '../src/AbilityGame';
import { draftSteps } from '../src/draft';
import type { RoomCommand } from '../src/onlineProtocol';
const w='a'.repeat(64),b='b'.repeat(64),intruder='c'.repeat(64),now=1000000;
const ordinary=['greece','egypt','olympics','sandstorm','zeus','osiris','sparta','sphinx'];
async function setup(picks=ordinary){const store=new MemoryRoomStore();let room=await createRoom(store,w,now);room=await joinRoom(store,room.id,b,now);room=await commandRoom(store,room.id,w,room.revision,randomUUID(),{kind:'color',color:'w'},now);for(const choice of picks){room=await commandRoom(store,room.id,draftSteps[room.picks.length].color==='w'?w:b,room.revision,randomUUID(),{kind:'pick',choice},now);}return {store,room};}
async function act(store:MemoryRoomStore,room:Room,command:RoomCommand,token=w,time=now){return commandRoom(store,room.id,token,room.revision,randomUUID(),command,time);}
function move(room:Room,from:string,to:string):RoomCommand{const g=AbilityGame.restoreSave(room.variant!);const action=g.actions().find(a=>a.kind==='move'&&a.from===from&&a.to===to);assert.ok(action);return {kind:'action',action};}
test('rooms keep seats private, reject intruders and admit only one guest atomically',async()=>{
 const store=new MemoryRoomStore(),room=await createRoom(store,w,now);
 const results=await Promise.allSettled([joinRoom(store,room.id,b,now),joinRoom(store,room.id,intruder,now)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 const joined=await getRoom(store,room.id,now);assert.equal(seat(joined,w),'w');
 assert.throws(()=>seat(joined,'d'.repeat(64)));
 assert.equal('seats' in publicRoom(joined,now),false);
 assert.equal('requests' in publicRoom(joined,now),false);
 await assert.rejects(()=>getRoom(store,room.id,now+86400001));
});
test('server validates drafting turn and card choice',async()=>{
 const store=new MemoryRoomStore();let room=await createRoom(store,w,now);
 await assert.rejects(()=>act(store,room,{kind:'pick',choice:'greece'}));
 room=await joinRoom(store,room.id,b,now);
 room=await act(store,room,{kind:'color',color:'w'});
 await assert.rejects(()=>act(store,room,{kind:'pick',choice:'greece'},b));
 await assert.rejects(()=>act(store,room,{kind:'pick',choice:'nonexistent'}));
 room=await act(store,room,{kind:'pick',choice:'greece'});assert.deepEqual(room.picks,['greece']);
});
test('legal moves synchronize, opponent moves and stale writes fail, duplicate request is applied once',async()=>{
 let {store,room}=await setup();const id=randomUUID(),revision=room.revision,cmd=move(room,'e2','e4');
 await assert.rejects(()=>act(store,room,cmd,b));
 room=await commandRoom(store,room.id,w,revision,id,cmd,now);
 const retry=await commandRoom(store,room.id,w,revision,id,cmd,now);
 assert.equal(retry.revision,room.revision);assert.equal(retry.variant!.actions.length,1);
 await assert.rejects(()=>commandRoom(store,room.id,b,revision,randomUUID(),move(room,'e7','e5'),now));
 room=await act(store,room,move(room,'e7','e5'),b);
 assert.equal(AbilityGame.restoreSave(room.variant!).turn(),'w');
 const client=new AbilityGame(room.variant!.loadouts);client.acceptOnlineSave(room.variant!);assert.equal(client.fen(),AbilityGame.restoreSave(room.variant!).fen());
});
test('simultaneous commands cannot overwrite one another',async()=>{
 const {store,room}=await setup();const results=await Promise.allSettled([act(store,room,move(room,'e2','e4')),act(store,room,move(room,'d2','d4'))]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal((await getRoom(store,room.id,now)).variant!.actions.length,1);
});
test('online placement belongs to each owner, survives reconnect and does not consume a turn',async()=>{
 let {store,room}=await setup(['rome','egypt','roads','pyramid','pilum','set','ballista','mummy']);
 await assert.rejects(()=>act(store,room,{kind:'place',placement:{square:'f7',axis:'row'}},b));
 room=await act(store,room,{kind:'place',placement:{square:'b4',axis:'column'}});
 room=await joinRoom(store,room.id,b,now);assert.equal(AbilityGame.restoreSave(room.variant!).placementOwner(),'b');
 room=await act(store,room,{kind:'place',placement:{square:'f7',axis:'row'}},b);
 const g=AbilityGame.restoreSave(room.variant!);assert.equal(g.placementOwner(),undefined);assert.equal(g.turn(),'w');assert.equal(g.state.zones.length,2);
});
test('philosophy does not start a timed online match',async()=>{
 let {store,room}=await setup(['greece','egypt','philosophy','sandstorm','zeus','set','sparta','mummy']);
 assert.equal(publicRoom(room,now+1000).variant!.clocks,null);
 room=await act(store,room,move(room,'e2','e4'),w,now+2000);assert.equal(room.variant!.clocks,null);
 room=await act(store,room,move(room,'e7','e5'),b,now+700000);assert.equal(room.variant!.clocks,null);
});
test('skills are validated and resignation ends both players game',async()=>{
 let {store,room}=await setup();const skill=AbilityGame.restoreSave(room.variant!).actions().find(a=>a.skill==='zeus');assert.ok(skill);
 room=await act(store,room,{kind:'action',action:skill});assert.equal(AbilityGame.restoreSave(room.variant!).state.activeUsed.w,true);
 room=await act(store,room,{kind:'resign'},b);assert.equal(publicRoom(room,now).resigned,'b');await assert.rejects(()=>act(store,room,{kind:'resign'}));
});
test('Sphinx challenge is generated by server and client quiz=true cannot bypass it',async()=>{
 let {store,room}=await setup();for(const [from,to,token] of [['e2','e4',w],['b8','c6',b],['f1','b5',w],['a7','a6',b]])room=await act(store,room,move(room,from,to),token);
 const command=move(room,'b5','c6');if(command.kind==='action')command.action.quiz=true;
 room=await act(store,room,command);assert.ok(room.quiz);assert.equal(room.variant!.actions.length,4);assert.equal('answer' in publicRoom(room,now).quiz!,false);
 await assert.rejects(()=>act(store,room,{kind:'answer',answer:room.quiz!.answer},b));
 room=await act(store,room,{kind:'answer',answer:room.quiz!.answer},w,now+6000);
 const g=AbilityGame.restoreSave(room.variant!);assert.ok(g.unit('c6'));assert.equal(g.unit('c6')!.owner,'b');assert.equal(room.quiz,null);
});
test('HTTP room endpoint supports two independent authenticated clients',async()=>{
 const store=new MemoryRoomStore(),server=createServer(roomHandler(store));await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const addr=server.address();assert.ok(addr&&typeof addr==='object');const base=`http://127.0.0.1:${addr.port}/api/pvp`;
 try{const post=async(token:string,body:unknown)=>fetch(base,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const created=await (await post(w,{kind:'create'})).json();assert.equal(created.color,'w');const id=created.room.id;
 const joined=await(await post(b,{kind:'join',room:id})).json();assert.equal(joined.color,'b');
 const denied=await fetch(base+'?room='+id,{headers:{Authorization:'Bearer '+intruder}});assert.equal(denied.status,403);
 const poll=await(await fetch(base+'?room='+id,{headers:{Authorization:'Bearer '+w}})).json();assert.equal(poll.room.joined,true);assert.equal(poll.color,'w');
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

test('host chooses black before guest joins and colors persist',async()=>{
 const store=new MemoryRoomStore();let room=await createRoom(store,w,now);
 assert.equal(publicRoom(room,now).colorsChosen,false);
 room=await act(store,room,{kind:'color',color:'b'});
 assert.equal(seat(room,w),'b');assert.equal(publicRoom(room,now).joined,false);
 room=await joinRoom(store,room.id,b,now);assert.equal(seat(room,b),'w');
 assert.equal(publicRoom(room,now).hostColor,'b');
 await assert.rejects(()=>act(store,room,{kind:'color',color:'w'},b));
 await assert.rejects(()=>act(store,room,{kind:'pick',choice:'greece'},w));
 room=await act(store,room,{kind:'pick',choice:'greece'},b);assert.equal(room.picks.length,1);
 assert.equal(seat(await getRoom(store,room.id,now),w),'b');
});
test('joined players wait for host color choice; retry remains idempotent after swap',async()=>{
 const store=new MemoryRoomStore();let room=await createRoom(store,w,now);room=await joinRoom(store,room.id,b,now);
 await assert.rejects(()=>act(store,room,{kind:'pick',choice:'greece'}));
 await assert.rejects(()=>act(store,room,{kind:'color',color:'b'},b));
 const revision=room.revision,id=randomUUID();
 room=await commandRoom(store,room.id,w,revision,id,{kind:'color',color:'b'},now);
 const retry=await commandRoom(store,room.id,w,revision,id,{kind:'color',color:'b'},now);
 assert.equal(retry.revision,room.revision);assert.equal(seat(room,w),'b');assert.equal(seat(room,b),'w');
 await assert.rejects(()=>act(store,room,{kind:'color',color:'w'}));
});

test('online Twelve Tables requires an authorized law selection before play',async()=>{
 let {store,room}=await setup(['rome','greece','twelve-tables','olympics','vesta','zeus','ballista','minotaur']);
 assert.equal(AbilityGame.restoreSave(room.variant!).placementOwner(),'w');
 await assert.rejects(()=>act(store,room,{kind:'place',placement:{law:'military-code'}},b));
 room=await act(store,room,{kind:'place',placement:{law:'military-code'}});
 const g=AbilityGame.restoreSave(room.variant!);assert.equal(g.placementOwner(),undefined);assert.equal(g.state.laws?.w,'military-code');
 room=await act(store,room,move(room,'e2','e4'));
 const action=AbilityGame.restoreSave(room.variant!).actions().find(a=>a.skill==='minotaur')!;
 room=await act(store,room,{kind:'action',action},b);
 const after=AbilityGame.restoreSave(room.variant!);assert.equal(after.unit(action.from!)!.cooldownUntil-after.state.turns.b,6);
});
