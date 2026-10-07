import type { IncomingMessage,ServerResponse } from 'node:http';
import { commandRoom,createRoom,getRoom,joinRoom,publicRoom,seat,RoomError,tokenHash,checkedToken,type RoomStore } from '../server/rooms.js';
import { productionStore,RedisRoomStore } from '../server/roomStore.js';
export function roomHandler(injected?:RoomStore){return async(req:IncomingMessage&{body?:unknown},res:ServerResponse)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
 const send=(status:number,data:unknown)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 try{
 const url=new URL(req.url??'/api/pvp','http://localhost');const store=injected??productionStore();
 if(req.method==='GET'&&url.searchParams.has('health')){send(200,{configured:!!store});return;}
 if(!store)throw new RoomError(503,'온라인 서버 준비 중입니다. 방 저장소 연결 후 이용할 수 있어요.');
 if(!['GET','POST'].includes(req.method??''))throw new RoomError(405,'지원하지 않는 요청입니다.');
 const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)throw new RoomError(403,'다른 사이트에서는 요청할 수 없습니다.');
 const token=(req.headers.authorization??'').replace(/^Bearer /,'');checkedToken(token);
 if(store instanceof RedisRoomStore){const ip=String(req.headers['x-forwarded-for']??'unknown').split(',')[0];await store.rate(tokenHash(ip),240);}
 if(req.method==='GET'){const room=await getRoom(store,url.searchParams.get('room')??'');const color=seat(room,token);send(200,{room:publicRoom(room),color});return;}
 let raw=req.body;
 if(raw===undefined){const chunks:Buffer[]=[];let size=0;for await(const chunk of req){const b=Buffer.from(chunk);size+=b.length;if(size>12000)throw new RoomError(413,'요청이 너무 큽니다.');chunks.push(b);}raw=Buffer.concat(chunks).toString();}
 const body=typeof raw==='string'?JSON.parse(raw):raw as any;
 if(!body||JSON.stringify(body).length>12000)throw new RoomError(400,'잘못된 요청입니다.');
 if(store instanceof RedisRoomStore&&['create','join'].includes(body.kind))await store.rate('entry:'+tokenHash(String(req.headers['x-forwarded-for']??'unknown')),20);
 const room=body.kind==='create'?await createRoom(store,token):body.kind==='join'?await joinRoom(store,body.room,token):await commandRoom(store,body.room,token,body.revision,body.requestId,body.command);
 send(200,{room:publicRoom(room),color:seat(room,token)});
 }catch(error){if(error instanceof RoomError)send(error.status,{error:error.message});else send(400,{error:'요청을 처리하지 못했습니다. 최신 상태를 확인하고 다시 시도하세요.'});}
};}
export default roomHandler();
