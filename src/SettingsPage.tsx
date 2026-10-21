import { useState } from 'react';
import { Volume2, Monitor, Languages, ChevronRight } from 'lucide-react';
import type { MediaPreferences } from './civilizationMedia';
import { useLocale } from './i18n';
import LanguageSwitch from './LanguageSwitch';
import './settingsPage.css';

export default function SettingsPage({preferences,onChange,cycling,onCycling,sceneCount,saveError}:{
  preferences:MediaPreferences;onChange:(value:MediaPreferences)=>void;
  cycling:boolean;onCycling:(value:boolean)=>void;sceneCount:number;saveError:boolean;
}) {
  const locale=useLocale(), text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const [category,setCategory]=useState<'audio'|'display'|'language'>('audio');
  const sections=[{id:'audio',name:text('오디오','Audio'),icon:Volume2},{id:'display',name:text('화면','Display'),icon:Monitor},{id:'language',name:text('언어','Language'),icon:Languages}] as const;
  const toggle=(label:string,value:boolean,change:(value:boolean)=>void,disabled=false)=><button className="settings-toggle" role="switch" aria-label={label} aria-checked={value} disabled={disabled} onClick={()=>change(!value)}><span>{value?'ON':'OFF'}</span><i aria-hidden="true"/></button>;
  return <div className="settings-page">
    <header className="settings-page-title"><span>OPTIONS</span><h1>{text('설정','Settings')}</h1><p>{text('당신의 플레이에 맞추세요.','Make the game your own.')}</p></header>
    <div className="settings-page-layout">
      <nav className="settings-categories" aria-label={text('설정 분류','Settings categories')}>{sections.map(({id,name,icon:Icon})=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}><Icon size={21}/><span>{name}</span><ChevronRight size={16}/></button>)}</nav>
      <section className="settings-page-body" key={category} aria-label={sections.find(s=>s.id===category)!.name}>
        <h2>{sections.find(s=>s.id===category)!.name}</h2>
        {category==='audio'&&<>
          <div className="settings-option"><div><h3>{text('배경음악','Background music')}</h3><p>{text('시작화면과 대전에서 음악을 재생합니다.','Play music in menus and matches.')}</p></div>{toggle(text('배경음악','Background music'),preferences.music,value=>onChange({...preferences,music:value}))}</div>
          <div className="settings-option"><div><label htmlFor="settings-volume">{text('음악 음량','Music volume')}</label><p>{text('모든 문명 BGM에 적용됩니다.','Applies to every civilization soundtrack.')}</p></div><div className="settings-volume"><input id="settings-volume" type="range" min="0" max="100" value={Math.round(preferences.volume*100)} onChange={e=>onChange({...preferences,volume:Number(e.target.value)/100})}/><output htmlFor="settings-volume">{Math.round(preferences.volume*100)}%</output></div></div>
        </>}
        {category==='display'&&<>
          <div className="settings-option"><div><strong>{text('화면 표시 방식','Display mode')}</strong><p>{text('HD·FHD·QHD 등 모든 해상도에서 UI의 상대 크기와 배치를 유지합니다. 화면 비율이 다르면 여백이 생깁니다.','UI proportions and layout stay consistent across HD, FHD, QHD and other resolutions. Different aspect ratios use margins.')}</p></div><strong>{text('자동 · 비율 유지','Auto · preserve proportions')}</strong></div>

          <div className="settings-option"><div><h3>{text('대전 배경화면','Match backgrounds')}</h3><p>{text('상대 문명에 맞는 배경을 표시합니다.','Show the opposing civilization’s scenery.')}</p></div>{toggle(text('대전 배경화면','Match backgrounds'),preferences.background&&sceneCount>0,value=>onChange({...preferences,background:value}),sceneCount===0)}</div>
          <div className="settings-option"><div><h3>{text('메뉴 배경 자동 전환','Rotate menu backgrounds')}</h3><p>{text('메뉴에서 문명의 풍경을 차례로 보여줍니다.','Cycle through civilization scenery in menus.')}</p></div>{toggle(text('메뉴 배경 자동 전환','Rotate menu backgrounds'),cycling&&sceneCount>1,onCycling,sceneCount<2)}</div>
        </>}
        {category==='language'&&<div className="settings-option"><div><h3>{text('표시 언어','Display language')}</h3><p>{text('메뉴와 스킬 설명의 언어를 선택하세요.','Choose the language for menus and skill descriptions.')}</p></div><LanguageSwitch/></div>}
        <p className="settings-save-state" role={saveError?'alert':'status'}>{saveError?text('설정을 저장하지 못했어요.','Unable to save settings.'):text('변경사항은 자동으로 저장됩니다.','Changes are saved automatically.')}</p>
      </section>
    </div>
  </div>;
}
