import { useCallback,useEffect,useRef,useState } from 'react';
import type { RoomCommand,RoomSession,RoomView } from './onlineProtocol';
const KEY='civilization-chess.online.session.v1';
function readSession():RoomSession|null{try{const s=JSON.parse(sessionStorage.getItem(KEY)??'null');return s&&/^[A-F0-9]{8}$/.test(s.id)&&/^[a-f0-9]{64}$/.test(s.token)&&['w','b'].includes(s.color)?s:null;}catch{return null;}}
function token(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');}
export function useOnlineRoom(){
 const [session,setSession]=useState<RoomSession|null>(readSession),[room,setRoom]=useState<RoomView|null>(null);
 const [configured,setConfigured]=useState<boolean|null>(null),[networkError,setNetworkError]=useState(''),[error,setError]=useState(''),[connected,setConnected]=useState(false),[busy,setBusy]=useState(false);
 const current=useRef(session),latest=useRef(room),sending=useRef(false);current.current=session;latest.current=room;
 const accept=useCallback((value:RoomView,color?:'w'|'b')=>{if(latest.current?.id===value.id&&latest.current.revision>value.revision)return;if(color)setSession(previous=>{if(!previous||previous.id!==value.id||previous.color===color)return previous;const next={...previous,color};sessionStorage.setItem(KEY,JSON.stringify(next));return next;});setRoom(previous=>previous&&previous.id===value.id&&previous.revision>value.revision?previous:value);setConnected(true);},[]);
 useEffect(()=>{fetch('/api/pvp?health=1').then(r=>r.json()).then(d=>setConfigured(d.configured===true)).catch(()=>setConfigured(false));},[]);
 useEffect(()=>{
  if(!session)return;let cancelled=false,timer:ReturnType<typeof setTimeout>;
  const poll=async()=>{try{const r=await fetch('/api/pvp?room='+session.id,{headers:{Authorization:'Bearer '+session.token},cache:'no-store',signal:AbortSignal.timeout(8000)});const d=await r.json();if(!r.ok)throw Error(d.error??'서버 연결 실패');if(!cancelled){accept(d.room,d.color);setNetworkError('');}}catch(e){if(!cancelled){setConnected(false);setNetworkError(e instanceof Error?e.message:'서버 연결 실패');}}finally{if(!cancelled)timer=setTimeout(poll,document.hidden?3000:1000);}};
  void poll();return()=>{cancelled=true;clearTimeout(timer);};
 },[session,accept]);
 const enter=async(kind:'create'|'join',id='')=>{
  if(sending.current)return;sending.current=true;setBusy(true);setError('');const secret=token();
  try{const r=await fetch('/api/pvp',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+secret},body:JSON.stringify({kind,room:id.trim().toUpperCase()}),signal:AbortSignal.timeout(12000)});const d=await r.json();if(!r.ok)throw Error(d.error??'방 입장 실패');const next={id:d.room.id,token:secret,color:d.color} as RoomSession;sessionStorage.setItem(KEY,JSON.stringify(next));setSession(next);accept(d.room,d.color);}
  catch(e){setError(e instanceof Error?e.message:'방 입장 실패');}finally{sending.current=false;setBusy(false);}
 };
 const send=useCallback(async(command:RoomCommand)=>{
  const s=current.current,r=latest.current;if(!s||!r||sending.current)return false;
  sending.current=true;setBusy(true);setError('');
  const body=JSON.stringify({room:s.id,revision:r.revision,requestId:crypto.randomUUID(),command});
  try{
   // Network retry uses the same request ID, so a lost response cannot apply twice.
   let response:Response;try{response=await fetch('/api/pvp',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.token},body,signal:AbortSignal.timeout(10000)});}catch{response=await fetch('/api/pvp',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.token},body,signal:AbortSignal.timeout(10000)});}
   const d=await response.json();if(!response.ok)throw Error(d.error??'행동 전송 실패');if(current.current?.token===s.token)accept(d.room,d.color);return true;
  }catch(e){setError(e instanceof Error?e.message:'행동 전송 실패');return false;}finally{sending.current=false;setBusy(false);}
 },[accept]);
 const leave=()=>{sessionStorage.removeItem(KEY);setSession(null);setRoom(null);setConnected(false);setError('');setNetworkError('');const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);};
 return {session,room,configured,error:error||networkError,connected,busy,enter,send,leave};
}
export type OnlineController=ReturnType<typeof useOnlineRoom>;
