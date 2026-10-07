import { useEffect,useState } from 'react';
import type { OnlineController } from './useOnlineRoom';
import './online.css';
export function OnlineLobby({online,onBack}:{online:OnlineController;onBack:()=>void}){
 const [code,setCode]=useState(()=>new URL(location.href).searchParams.get('room')??'');
 return <section className="online-lobby"><span className="eyebrow">PLAY WITH A FRIEND</span><h1>온라인 대전</h1><p>방을 만들고 초대 링크나 8자리 코드를 친구에게 보내세요.</p>{online.configured===false&&<p className="online-warning">온라인 서버 준비 중입니다. 방 저장소가 연결되면 이용할 수 있어요.</p>}<div className="online-lobby-actions"><button className="primary-button" disabled={online.busy||online.configured!==true} onClick={()=>void online.enter('create')}>새 방 만들기 · 백</button><form onSubmit={e=>{e.preventDefault();void online.enter('join',code);}}><label htmlFor="room-code">초대 코드</label><input id="room-code" autoComplete="off" maxLength={8} placeholder="8자리 코드" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g,''))}/><button className="primary-button" disabled={code.length!==8||online.busy||online.configured!==true}>참가하기 · 흑</button></form></div>{online.error&&<p role="alert">{online.error}</p>}<button className="secondary-button" onClick={onBack}>대전 방식으로 돌아가기</button><small>친구 초대 대전 · 방은 생성 후 24시간 유지 · 이 탭에서 새로고침하면 재접속</small></section>;
}
export function OnlineBanner({online,onLeave}:{online:OnlineController;onLeave:()=>void}){
 const [copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
 const session=online.session;if(!session)return null;
 const link=new URL(location.href);link.search='';link.searchParams.set('room',session.id);
 return <section className="online-banner"><div><strong>방 {session.id} · 나 {session.color==='w'?'백':'흑'}</strong><span role="status">{online.busy?'전송 중…':!online.connected?'연결 복구 중…':!online.room?.joined?'친구가 입장하기를 기다리는 중':'서버 연결됨 · 상대 참가 완료'}</span></div><button onClick={()=>{navigator.clipboard.writeText(link.href).then(()=>{setCopied(true);setCopyError(false);},()=>setCopyError(true));}}>{copied?'초대 링크 복사됨':'초대 링크 복사'}</button><button onClick={onLeave}>{online.room?.variant&&!online.room.resigned?'기권하고 나가기':'나가기'}</button>{copyError&&<input readOnly aria-label="초대 링크" value={link.href} onFocus={e=>e.target.select()}/ >}{online.error&&<p role="alert">{online.error}</p>}</section>;
}
export function OnlineQuiz({online}:{online:OnlineController}){
 const q=online.room?.quiz;const [answer,setAnswer]=useState(''),[seconds,setSeconds]=useState(5);
 useEffect(()=>{setAnswer('');if(!q)return;const remaining=Math.max(0,q.expiresAt-(online.room?.serverTime??Date.now()));const end=performance.now()+remaining;const timer=setInterval(()=>setSeconds(Math.max(0,Math.ceil((end-performance.now())/1000))),100);return()=>clearInterval(timer);},[q?.expiresAt]);
 useEffect(()=>{if(q&&seconds===0&&q.color===online.session?.color&&!online.busy)void online.send({kind:'answer',answer:null});},[seconds,q,online.busy,online.send]);
 if(!q)return null;
 return <div className="online-quiz-backdrop"><section role="dialog" aria-modal="true" aria-label="스핑크스의 질문" className="online-quiz"><h2>스핑크스의 질문</h2>{q.color===online.session?.color?<form onSubmit={e=>{e.preventDefault();void online.send({kind:'answer',answer:Number(answer)});}}><strong>{q.question} = ?</strong><p>{seconds}초 남음</p><input autoFocus inputMode="numeric" aria-label="정답" value={answer} onChange={e=>setAnswer(e.target.value.replace(/\D/g,''))}/><button className="primary-button" disabled={!answer||online.busy||seconds===0}>정답 제출</button></form>:<p>상대가 문제를 풀고 있어요.</p>}</section></div>;
}
