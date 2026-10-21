import {useState,useEffect,useRef} from 'react';
import {displayGeometry} from './displayPreferences';
import './displayHost.css';
// A real child viewport keeps vw/vh, media queries, dialogs and pointer coordinates
// in the same design space. Only its outer frame is scaled; App never remounts.
export default function DisplayHost(){
 const [viewport,setViewport]=useState(()=>({width:window.innerWidth,height:window.innerHeight}));
 const host=useRef<HTMLDivElement>(null);
 const [src]=useState(()=>location.href);
 useEffect(()=>{
  const element=host.current;
  if(!element)return;
  const resize=()=>setViewport({width:element.clientWidth,height:element.clientHeight});
  resize();
  const observer=new ResizeObserver(resize);
  observer.observe(element);
  return()=>observer.disconnect();
 },[]);
 const g=displayGeometry(viewport.width,viewport.height);
 const width=g.width*g.scale,height=g.height*g.scale;
 return <div ref={host} className="display-host"><div className="display-frame-space" style={{width,height,marginLeft:Math.max(0,(viewport.width-width)/2),marginTop:Math.max(0,(viewport.height-height)/2)}}><iframe data-game-viewport="true" title="Civilization Chess" src={src} allow="autoplay; fullscreen" style={{width:g.width,height:g.height,transform:`scale(${g.scale})`}}/></div></div>;
}
