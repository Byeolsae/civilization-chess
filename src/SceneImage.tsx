import { memo, useEffect, useState } from 'react';

// Retain the outgoing image until its fade finishes, then release its layer.
export default memo(function SceneImage({src,visible,className}:{src:string;visible:boolean;className?:string}) {
  const [retained,setRetained]=useState(visible);
  useEffect(()=>{
    if(visible){setRetained(true);return;}
    const timer=setTimeout(()=>setRetained(false),2000);
    return()=>clearTimeout(timer);
  },[visible]);
  if(!visible&&!retained)return null;
  return <img src={src} className={className} alt="" draggable={false} decoding="async"/>;
});
