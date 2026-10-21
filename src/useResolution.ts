import {useEffect,useState} from 'react';
import {RESOLUTION_KEY,parseResolution,type Resolution} from './displayPreferences';
function read(){try{return parseResolution(localStorage.getItem(RESOLUTION_KEY));}catch{return 'auto' as const;}}
export function useResolution(){
 const [resolution,setResolution]=useState<Resolution>(read);
 const [error,setError]=useState(false);
 useEffect(()=>{
  const update=()=>setResolution(read());
  window.addEventListener('storage',update);
  window.addEventListener('resolution-change',update);
  return()=>{window.removeEventListener('storage',update);window.removeEventListener('resolution-change',update);};
 },[]);
 function save(value:Resolution){
  try{localStorage.setItem(RESOLUTION_KEY,value);setResolution(value);setError(false);window.dispatchEvent(new Event('resolution-change'));}
  catch{setError(true);}
 }
 return {resolution,save,error};
}
