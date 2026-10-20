import {useState,useEffect} from 'react';
import {displayGeometry} from './displayPreferences';
import {useDisplayPreferences} from './useDisplayPreferences';
import './displayHost.css';
// A real child viewport keeps vw/vh, media queries, dialogs and pointer coordinates
// in the same design space. Only its outer frame is scaled; App never remounts.
export default function DisplayHost(){
 const {preferences}=useDisplayPreferences();
 const [viewport,setViewport]=useState(()=>({width:window.innerWidth,height:window.innerHeight,coarse:matchMedia('(pointer:coarse)').matches}));
 const [src]=useState(()=>location.href);
 useEffect(()=>{const query=matchMedia('(pointer:coarse)');const resize=()=>setViewport({width:window.innerWidth,height:window.innerHeight,coarse:query.matches});window.addEventListener('resize',resize);query.addEventListener('change',resize);return()=>{window.removeEventListener('resize',resize);query.removeEventListener('change',resize);};},[]);
 const g=displayGeometry(viewport.width,viewport.height,viewport.coarse,preferences);
 const width=g.width*g.scale,height=g.height*g.scale;
 return <div className="display-host"><div className="display-frame-space" style={{width,height,marginLeft:Math.max(0,(viewport.width-width)/2),marginTop:Math.max(0,(viewport.height-height)/2)}}><iframe data-game-viewport="true" title="Civilization Chess" src={src} allow="autoplay; fullscreen" style={{width:g.width,height:g.height,transform:`scale(${g.scale})`}}/></div></div>;
}
