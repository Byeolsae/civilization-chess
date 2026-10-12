import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Crown, Pause, Play } from 'lucide-react';
import { civilizations, type Civilization } from './civilizations';
import { civilizationMedia, MEDIA_SETTINGS_KEY, parseMediaPreferences } from './civilizationMedia';
import { civilizationReadiness, readinessLabels } from './civilizationReadiness';
import { categories, skills } from './draft';
import { translateUi as t, useLocale } from './i18n';
import LanguageSwitch from './LanguageSwitch';
import type { MatchSettings } from './matchSettings';
import './home.css';

const scenes = civilizations.filter(c => civilizationMedia[c.id]?.background);
type Page = 'main' | 'play' | 'civilizations' | 'novel' | 'profile' | 'settings' | 'campaign';
const history: Partial<Record<Civilization, {ko:string;en:string;source:string}>> = {
  sengoku: {ko:'전국시대의 이치조다니는 아사쿠라 가문의 거점이었습니다. 무사 저택과 상공업자의 마을, 산성을 함께 갖춘 도시였으며 1573년 파괴되었습니다. 배경은 이 시대의 산간 거주지를 참고한 창작 풍경입니다.',en:'Ichijodani was an Asakura clan base with warrior residences, a commercial town and a mountain fortress. It was destroyed in 1573. This background is an imagined landscape inspired by the period.',source:'https://asakura-museum.pref.fukui.lg.jp/en/'},
  edo: {ko:'에도의 상업과 생활은 수로와 밀접하게 연결되어 있었습니다. 에도 후기 거리 복원에는 운하와 상점, 흰 벽의 토장 창고가 함께 나타납니다. 배경은 이런 상업지구를 참고했습니다.',en:'Waterways supported commerce and daily life in Edo. Reconstructions of late-Edo streets include canals, shops and white plaster storehouses, which inspired this scene.',source:'https://www.kcf.or.jp/fukagawa/josetsu/'},
  ming: {ko:'명나라 강남에서는 문인들의 정원 문화가 발달했습니다. 1509년 조성된 졸정원처럼 물·돌·식물·건축을 엮어 자연을 축소해 담았습니다. 배경은 당시 정원 문화를 재해석했습니다.',en:'Literati garden culture flourished in Ming Jiangnan. Gardens such as the Humble Administrator’s Garden, founded in 1509, brought water, rocks, plants and architecture together as miniature landscapes.',source:'https://whc.unesco.org/en/list/813/'},
  goryeo: {ko:'고려의 불교 건축을 이해하는 중요한 사례인 부석사 무량수전은 주심포와 배흘림기둥으로 알려져 있습니다. 1376년 중수설과 11세기 중창설이 함께 전해집니다. 배경은 고려 산사의 건축을 참고한 창작 풍경입니다.',en:'Buseoksa’s Muryangsujeon is an important example of Goryeo Buddhist architecture, known for pillar-top brackets and subtly swelling columns. Scholarship discusses both an 11th-century rebuilding and a 1376 renovation.',source:'https://contents.history.go.kr/mobile/kc/view.do?code=kc_age_20&levelId=kc_r200327'},
};

export default function HomeScreen({onPlay,onResume,canResume}:{onPlay:(mode:MatchSettings['mode'])=>void;onResume:()=>void;canResume:boolean}) {
  const locale=useLocale(); const text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const [page,setPage]=useState<Page>('main');
  const [scene,setScene]=useState(()=>Math.max(0,scenes.findIndex(c=>c.id==='greece'))); const [cycling,setCycling]=useState(()=>{try{const saved=localStorage.getItem('civilization-chess.home-cycle');if(saved!==null)return saved==='true';}catch{}return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;});
  const [selected,setSelected]=useState<Civilization>('greece');
  const [tab,setTab]=useState<'skills'|'history'>('skills');
  const [pending,setPending]=useState<MatchSettings['mode']|null>(null);
  const [preferences,setPreferences]=useState(()=>{try{return parseMediaPreferences(localStorage.getItem(MEDIA_SETTINGS_KEY));}catch{return parseMediaPreferences(null);}});
  const [saveError,setSaveError]=useState(false);
  useEffect(()=>{try{localStorage.setItem('civilization-chess.home-cycle',String(cycling));}catch{setSaveError(true);}},[cycling]);
  useEffect(()=>{if(!cycling||page==='civilizations')return;const timer=setInterval(()=>setScene(v=>(v+1)%scenes.length),10000);return()=>clearInterval(timer);},[cycling,page]);
  useEffect(()=>{const listener=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(pending)setPending(null);else setPage('main');}};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener);},[pending]);
  const background=scenes[scene]; const civ=civilizations.find(c=>c.id===selected)!;
  const menus:[Page,string,string][]=[['play','플레이하기','PLAY'],['civilizations','문명','CIVILIZATIONS'],['novel','소설','STORIES'],['profile','프로필','PROFILE'],['settings','설정','SETTINGS']];
  function choose(id:Civilization){setSelected(id);const index=scenes.findIndex(c=>c.id===id);if(index>=0)setScene(index);}
  function save(next:typeof preferences){setPreferences(next);try{localStorage.setItem(MEDIA_SETTINGS_KEY,JSON.stringify(next));setSaveError(false);}catch{setSaveError(true);}}
  function start(mode:MatchSettings['mode']){if(canResume)setPending(mode);else onPlay(mode);}
  return <main className="home-screen">
    <div className="home-scenery" aria-hidden="true">{scenes.map((c,index)=><div key={c.id} className={`home-scene ${index===scene?'visible':''}`}><img className="home-scene-fill" src={civilizationMedia[c.id]!.background!} alt="" draggable={false}/><img className="home-scene-art" src={civilizationMedia[c.id]!.background!} alt="" draggable={false}/></div>)}</div>
    <div className="home-shade"/>
    <header className="home-header"><a className="home-brand" href="/" aria-label={t('문명체스 홈')}><Crown/><span>{t('문명체스')}<small>CIVILIZATION CHESS</small></span></a><LanguageSwitch/></header>
    <div className={`home-content ${page==='main'?'home-content-main':''}`}>
      <nav className="home-nav" aria-label={text('메인 메뉴','Main menu')}><span className="home-eyebrow">WRITE YOUR HISTORY</span>
        {menus.map(([id,ko,en],index)=><button key={id} className={`${page===id?'active':''} ${index===0?'home-play':''}`} onClick={()=>setPage(id)} aria-current={page===id?'page':undefined}><span>{text(ko,en)}</span><ArrowRight/></button>)}
        {canResume&&<button className="home-resume" onClick={onResume}>{text('이어서 플레이','RESUME')}<Play size={16}/></button>}
      </nav>
      {page!=='main'&&<section className="home-panel" aria-label={text('메뉴 내용','Menu content')} key={page}>
        <button className="home-back" onClick={()=>setPage('main')}><ArrowLeft size={16}/>{text('처음으로','Back')}</button>
        {page==='play'&&<><span className="home-eyebrow">CHOOSE YOUR BATTLE</span><h1>{text('플레이하기','Play')}</h1><div className="home-modes">{([['online','온라인','Online','친구와 함께, 서로 다른 문명으로','Challenge a friend'],['ai','AI 대전','Versus AI','나만의 속도로 전략을 연습하세요','Practice at your own pace'],['local','로컬','Local','한 화면에서 번갈아 두세요','Take turns on one screen']] as const).map(([mode,ko,en,sub,enSub],i)=><button key={mode} onClick={()=>start(mode)}><small>0{i+1}</small><span><strong>{text(ko,en)}</strong><em>{text(sub,enSub)}</em></span><ArrowRight/></button>)}<button onClick={()=>setPage('campaign')}><small>04</small><span><strong>{text('캠페인','Campaign')}</strong><em>{text('준비 중','Coming soon')}</em></span><ArrowRight/></button></div>
        {pending&&<div className="home-replace" role="group" aria-label={text('새 대전 확인','Confirm new match')}><p>{text('새 대전을 시작하면 저장된 대전과 선택 진행 상황이 초기화됩니다.','Starting a new match replaces your saved match and draft.')}</p><button onClick={()=>onPlay(pending)}>{text('새 대전 시작','Start new match')}</button><button onClick={()=>setPending(null)}>{text('취소','Cancel')}</button></div>}</>}
        {page==='civilizations'&&<><span className="home-eyebrow">THE CIVILIZATION ARCHIVE</span><h1>{text('문명 모음','Civilizations')}</h1><div className="home-civ-layout"><div className="home-civ-list">{[...civilizations].sort((a,b)=>t(a.name).localeCompare(t(b.name),locale)).map(c=><button key={c.id} aria-pressed={selected===c.id} onClick={()=>choose(c.id)}>{t(c.name)}</button>)}</div><article className="home-civ-detail"><small>{civ.english}</small><h2>{t(civ.name)}</h2><span className="home-status">{t(readinessLabels[civilizationReadiness(civ.id)])}</span><div className="home-tabs"><button aria-pressed={tab==='skills'} onClick={()=>setTab('skills')}>{text('문명별 스킬','Skills')}</button><button aria-pressed={tab==='history'} onClick={()=>setTab('history')}>{text('역사 설명','History')}</button></div>{tab==='skills'?<>{categories.map(category=><div className="home-skill-category" key={category.id}><h3>{t(category.name)}</h3>{skills[selected][category.id].length?skills[selected][category.id].map(skill=><details key={skill.id}><summary>{t(skill.name)}</summary><p>{t(skill.description)}</p><p>{t(skill.detail)}</p></details>):<p>{text('스킬 준비 중','Skills coming soon')}</p>}</div>)}</>:history[selected]?<><p className="home-history">{history[selected]![locale]}</p><a href={history[selected]!.source} target="_blank" rel="noreferrer">{text('역사 자료 보기 ↗','Read historical source ↗')}</a></>:<p className="home-history">{text('역사 설명을 준비하고 있습니다. 자료를 확인한 뒤 문명별로 추가할 예정입니다.','Historical notes are being prepared and will be added with sources.')}</p>}</article></div></>}
        {page==='settings'&&<><span className="home-eyebrow">MAKE IT YOURS</span><h1>{text('설정','Settings')}</h1><div className="home-settings"><label>{text('언어','Language')}<LanguageSwitch/></label><label>{text('대전 배경음악','Match music')}<input type="checkbox" checked={preferences.music} onChange={e=>save({...preferences,music:e.target.checked})}/></label><label>{text('배경음악 음량','Music volume')}<input type="range" min="0" max="100" value={Math.round(preferences.volume*100)} onChange={e=>save({...preferences,volume:Number(e.target.value)/100})}/></label><label>{text('대전 배경화면','Match backgrounds')}<input type="checkbox" checked={preferences.background} onChange={e=>save({...preferences,background:e.target.checked})}/></label><label>{text('시작 화면 배경 자동 전환','Rotate menu backgrounds')}<input type="checkbox" checked={cycling} onChange={e=>setCycling(e.target.checked)}/></label>{saveError&&<p role="alert">{text('설정을 저장하지 못했어요.','Could not save settings.')}</p>}</div></>}
        {(['novel','profile','campaign'] as Page[]).includes(page)&&<div className="home-coming"><span className="home-eyebrow">COMING SOON</span><h1>{page==='novel'?text('소설','Stories'):page==='profile'?text('프로필','Profile'):text('캠페인','Campaign')}</h1><p>{text('새로운 이야기를 준비하고 있습니다.','A new chapter is on its way.')}</p><button onClick={()=>setPage('play')}>{text('플레이하기','Play')}<ArrowRight size={18}/></button></div>}
      </section>}
    </div>
    <div className="home-scene-controls"><div><small>THE WORLD OF</small><strong>{t(background.name)}</strong></div><button aria-label={text('이전 배경','Previous background')} onClick={()=>setScene(v=>(v+scenes.length-1)%scenes.length)}><ChevronLeft/></button><button aria-label={text(cycling?'배경 자동 전환 멈춤':'배경 자동 전환 시작',cycling?'Pause background rotation':'Start background rotation')} onClick={()=>setCycling(v=>!v)}>{cycling?<Pause size={16}/>:<Play size={16}/>}</button><button aria-label={text('다음 배경','Next background')} onClick={()=>setScene(v=>(v+1)%scenes.length)}><ChevronRight/></button></div>
    <div className="home-version">ALPHA 0.3 <span>·</span> {text('같은 체스판, 서로 다른 문명의 시작.','One board. Countless histories.')}</div>
  </main>;
}
