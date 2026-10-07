import { RoomError, type Room, type RoomStore } from './rooms.js';
export class RedisRoomStore implements RoomStore {
 constructor(private url:string,private token:string){}
 async command(args:(string|number)[]){const response=await fetch(this.url,{method:'POST',headers:{Authorization:`Bearer ${this.token}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});if(!response.ok)throw new RoomError(503,'온라인 저장소에 연결하지 못했습니다.');const data=await response.json();if(data.error)throw new RoomError(503,'온라인 저장소 요청에 실패했습니다.');return data.result;}
 async get(id:string){const raw=await this.command(['GET','chess:room:'+id]);return raw?JSON.parse(raw) as Room:null;}
 async create(room:Room){return await this.command(['SET','chess:room:'+room.id,JSON.stringify(room),'NX','EX',86400])==='OK';}
 async swap(room:Room,expected:number){return await this.command(['EVAL',"local r=redis.call('GET',KEYS[1]); if not r then return 0 end; if cjson.decode(r).revision~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2],'KEEPTTL'); return 1",1,'chess:room:'+room.id,expected,JSON.stringify(room)])===1;}
 async rate(key:string,limit:number){const n=await this.command(['EVAL',"local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n",1,'chess:rate:'+key]);if(n>limit)throw new RoomError(429,'요청이 많습니다. 잠시 후 다시 시도하세요.');}
}
// Explicitly injected by the local Vite dev server and tests. Never a production fallback.
export class MemoryRoomStore implements RoomStore {
 private rooms=new Map<string,Room>();
 async get(id:string){return structuredClone(this.rooms.get(id)??null);}
 async create(room:Room){if(this.rooms.has(room.id))return false;this.rooms.set(room.id,structuredClone(room));return true;}
 async swap(room:Room,expected:number){if(this.rooms.get(room.id)?.revision!==expected)return false;this.rooms.set(room.id,structuredClone(room));return true;}
}
export function productionStore(){const url=process.env.UPSTASH_REDIS_REST_URL??process.env.KV_REST_API_URL;const token=process.env.UPSTASH_REDIS_REST_TOKEN??process.env.KV_REST_API_TOKEN;return url&&token?new RedisRoomStore(url,token):null;}
