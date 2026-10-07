import { createHash, randomBytes, randomInt } from 'node:crypto';
import type { Color } from 'chess.js';
import { AbilityGame, type AbilityAction, type AbilitySave } from '../src/AbilityGame';
import { confirmPick, completeDraft, draftSteps } from '../src/draft';
import type { RoomCommand, RoomView } from '../src/onlineProtocol';
export class RoomError extends Error { constructor(public status:number,message:string){super(message);} }
export type Room = { id:string; revision:number; seats:Record<Color,string|null>; picks:string[]; variant:AbilitySave|null; resigned:Color|null; clockAt:number; expiresAt:number; requests:Partial<Record<Color,string>>; quiz:null|{color:Color;action:AbilityAction;question:string;answer:number;expiresAt:number} };
export interface RoomStore { get(id:string):Promise<Room|null>; create(room:Room):Promise<boolean>; swap(room:Room,expected:number):Promise<boolean>; }
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export function seat(room:Room,token:string):Color { const hash=tokenHash(token);if(room.seats.w===hash)return 'w';if(room.seats.b===hash)return 'b';throw new RoomError(403,'이 방의 참가자 인증이 필요합니다.'); }
export function checkedToken(token:string){if(!/^[a-f0-9]{64}$/.test(token))throw new RoomError(401,'참가자 인증 정보가 없습니다.');}
export async function getRoom(store:RoomStore,id:string,now=Date.now()) { if(!/^[A-F0-9]{8}$/.test(id))throw new RoomError(400,'방 코드는 8자리입니다.');const room=await store.get(id);if(!room||room.expiresAt<=now)throw new RoomError(404,'방이 없거나 만료되었습니다.');return room; }
export async function createRoom(store:RoomStore,token:string,now=Date.now()) {
 checkedToken(token);
 for(let i=0;i<4;i++){const room:Room={id:randomBytes(4).toString('hex').toUpperCase(),revision:0,seats:{w:tokenHash(token),b:null},picks:[],variant:null,resigned:null,clockAt:now,expiresAt:now+86400000,requests:{},quiz:null};if(await store.create(room))return room;}
 throw new RoomError(503,'방을 만들지 못했습니다. 다시 시도하세요.');
}
export async function joinRoom(store:RoomStore,id:string,token:string,now=Date.now()) {
 checkedToken(token);const room=await getRoom(store,id,now);const hash=tokenHash(token);
 if(Object.values(room.seats).includes(hash))return room;
 if(room.seats.b)throw new RoomError(409,'이미 두 명이 참가한 방입니다.');
 const expected=room.revision;room.seats.b=hash;room.revision++;
 if(!await store.swap(room,expected))throw new RoomError(409,'참가 상태가 바뀌었습니다. 다시 시도하세요.');return room;
}
function gameAt(room:Room,now:number){if(!room.variant)throw new RoomError(409,'문명과 스킬 선택을 먼저 마쳐주세요.');const game=AbilityGame.restoreSave(room.variant);if(!room.resigned&&!game.isGameOver())game.tick(Math.max(0,now-room.clockAt));return game;}
export function publicRoom(room:Room,now=Date.now()):RoomView {
 const variant=room.variant?.clocks&&!room.resigned ? gameAt(room,now).save() : room.variant;
 return {id:room.id,revision:room.revision,joined:!!room.seats.b,picks:room.picks,variant,resigned:room.resigned,expiresAt:room.expiresAt,serverTime:now,quiz:room.quiz?{color:room.quiz.color,question:room.quiz.question,expiresAt:room.quiz.expiresAt}:null};
}
export async function commandRoom(store:RoomStore,id:string,token:string,expected:number,requestId:string,command:RoomCommand,now=Date.now()){
 checkedToken(token);const room=await getRoom(store,id,now);const color=seat(room,token);
 if(!/^[a-zA-Z0-9-]{16,80}$/.test(requestId))throw new RoomError(400,'요청 식별자가 올바르지 않습니다.');
 if(room.requests[color]===requestId)return room;
 if(expected!==room.revision)throw new RoomError(409,'상대의 최신 행동을 반영한 뒤 다시 선택하세요.');
 if(!room.seats.b)throw new RoomError(409,'상대의 입장을 기다려주세요.');
 if(room.resigned)throw new RoomError(409,'이미 종료된 대전입니다.');
 if(command.kind==='pick'){
   if(room.variant||draftSteps[room.picks.length]?.color!==color)throw new RoomError(403,'내 선택 차례가 아닙니다.');
   const next=confirmPick(room.picks,command.choice);if(next===room.picks)throw new RoomError(400,'선택할 수 없는 카드입니다.');room.picks=next;
   const complete=completeDraft(next);if(complete){room.variant=new AbilityGame(complete.loadouts).beginPlacement().save();room.clockAt=now;}
 }else{
   const game=gameAt(room,now);
   if(game.isGameOver())throw new RoomError(409,'이미 종료된 대전입니다.');
   if(command.kind==='resign'){room.resigned=color;room.quiz=null;}
   else if(command.kind==='place')game.placePassive(color,command.placement);
   else {
     if(game.placementOwner()||game.turn()!==color)throw new RoomError(403,'내 행동 차례가 아닙니다.');
     if(command.kind==='answer'){
       const quiz=room.quiz;if(!quiz||quiz.color!==color)throw new RoomError(409,'진행 중인 문제가 없습니다.');
       game.perform({...quiz.action,quiz:now<=quiz.expiresAt&&command.answer===quiz.answer});room.quiz=null;
     }else if(command.kind==='action'){
       if(room.quiz)throw new RoomError(409,'스핑크스 문제에 먼저 답해주세요.');
       // Resolve the canonical legal action; never accept a client-supplied quiz result.
       const submitted={...command.action};delete submitted.quiz;
       const action=game.actions().find(a=>JSON.stringify(a)===JSON.stringify(submitted));
       if(!action)throw new RoomError(400,'둘 수 없는 수 또는 사용할 수 없는 스킬입니다.');
       if((action.kind==='move'||action.skill==='ballista')&&game.needsQuiz(action.from,action.to)){
         const a=randomInt(2,10),b=randomInt(2,10);room.quiz={color,action,question:`${a} × ${b}`,answer:a*b,expiresAt:now+5000};
       }else game.perform(action);
     }else throw new RoomError(400,'알 수 없는 요청입니다.');
   }
   room.variant=game.save();room.clockAt=now;
 }
 room.revision++;room.requests[color]=requestId;
 if(!await store.swap(room,expected))throw new RoomError(409,'동시에 다른 행동이 반영되었습니다. 최신 상태를 확인하세요.');return room;
}
