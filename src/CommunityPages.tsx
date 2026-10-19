import { useState } from 'react';
import { UserRound, Users, UserPlus, Swords, ArrowRight, Clock3 } from 'lucide-react';
import { useLocale } from './i18n';
import './communityPages.css';

const PROFILE_KEY='civilization-chess.local-profile';
export function ProfilePage({canResume,onResume,onPlay}:{canResume:boolean;onResume:()=>void;onPlay:()=>void}) {
  const locale=useLocale(),text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const [name,setName]=useState(()=>{try{return localStorage.getItem(PROFILE_KEY)?.slice(0,24)||'';}catch{return '';}});
  const [draft,setDraft]=useState(name),[editing,setEditing]=useState(false),[error,setError]=useState(false);
  function save(){try{const next=draft.trim();localStorage.setItem(PROFILE_KEY,next);setName(next);setEditing(false);setError(false);}catch{setError(true);}}
  return <div className="community-page">
    <header className="community-heading"><small>PLAYER PROFILE</small><h1>{text('프로필','Profile')}</h1><p>{text('당신의 다음 이야기를 시작하세요.','Begin your next chapter.')}</p></header>
    <div className="profile-layout">
      <aside className="profile-identity"><div className="profile-avatar"><UserRound size={64}/></div><span className="community-kicker">{text('로컬 프로필','LOCAL PROFILE')}</span><h2>{name||text('플레이어','Player')}</h2><p>{text('이 브라우저에 저장되는 프로필입니다.','This profile is saved in this browser.')}</p>
        {editing?<form onSubmit={e=>{e.preventDefault();save();}}><label htmlFor="profile-name">{text('표시 이름','Display name')}</label><input id="profile-name" maxLength={24} value={draft} onChange={e=>setDraft(e.target.value)} autoFocus/><div className="community-actions"><button type="submit">{text('저장','Save')}</button><button type="button" onClick={()=>{setDraft(name);setEditing(false);setError(false);}}>{text('취소','Cancel')}</button></div>{error&&<p role="alert">{text('이름을 저장하지 못했어요.','Unable to save your name.')}</p>}</form>:<button onClick={()=>setEditing(true)}>{text('이름 변경','Edit name')}</button>}
      </aside>
      <section className="profile-overview" aria-label={text('플레이 현황','Play overview')}><h2>{text('플레이 현황','Play overview')}</h2>
        <div className="community-feature"><Clock3 size={28}/><div><h3>{text('이어 할 대전','Continue playing')}</h3><p>{canResume?text('저장된 대전 또는 문명 선택을 이어갈 수 있습니다.','Continue your saved match or civilization selection.'):text('현재 이어 할 대전이 없습니다.','There is no match to resume.')}</p></div><button disabled={!canResume} onClick={onResume}>{text('이어하기','Resume')}<ArrowRight size={16}/></button></div>
        <div className="community-feature"><Swords size={28}/><div><h3>{text('새로운 대전','A new match')}</h3><p>{text('문명을 선택하고 당신의 전략을 펼치세요.','Choose a civilization and put your strategy to the test.')}</p></div><button onClick={onPlay}>{text('플레이하기','Play')}<ArrowRight size={16}/></button></div>
        <div className="community-empty"><h3>{text('전적과 업적','Statistics and achievements')}</h3><p>{text('누적 전적과 업적은 준비 중입니다. 현재 대전의 수 기록과 복기는 대전 화면에서 확인할 수 있습니다.','Career statistics and achievements are coming later. Move history and review are available inside your current match.')}</p></div>
      </section>
    </div>
  </div>;
}

export function SocialPage({onOnline}:{onOnline:()=>void}) {
  const locale=useLocale(),text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const [tab,setTab]=useState<'friends'|'requests'>('friends');
  return <div className="community-page"><header className="community-heading"><small>PLAY TOGETHER</small><h1>{text('소셜','Social')}</h1><p>{text('함께할 상대를 만나고, 문명의 승부를 펼치세요.','Meet your opponent and bring civilizations together.')}</p></header>
    <div className="social-layout"><section className="social-roster"><nav className="social-tabs" aria-label={text('소셜 분류','Social categories')}><button aria-pressed={tab==='friends'} onClick={()=>setTab('friends')}><Users size={19}/>{text('친구','Friends')}</button><button aria-pressed={tab==='requests'} onClick={()=>setTab('requests')}><UserPlus size={19}/>{text('친구 요청','Friend requests')}</button></nav>
      <div className="social-empty" key={tab}>{tab==='friends'?<Users size={52}/>:<UserPlus size={52}/>}<h2>{tab==='friends'?text('친구 기능을 준비하고 있어요','Friends are coming soon'):text('친구 요청 기능을 준비하고 있어요','Friend requests are coming soon')}</h2><p>{text('계정과 친구 목록이 연결되면 이곳에서 관리할 수 있습니다. 지금은 온라인 방으로 함께 플레이할 수 있어요.','Once accounts and friend lists are connected, you can manage them here. For now, play together through an online room.')}</p></div>
    </section><aside className="social-invite"><Swords size={32}/><span className="community-kicker">ONLINE MATCH</span><h2>{text('친구와 한 판','Challenge a friend')}</h2><p>{text('온라인 대전에서 방을 만들거나 참가하세요.','Create or join a room in online play.')}</p><button onClick={onOnline}>{text('온라인 대전으로','Go to online play')}<ArrowRight size={18}/></button></aside></div>
  </div>;
}
