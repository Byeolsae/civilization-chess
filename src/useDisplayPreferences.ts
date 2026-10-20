import {useState,useEffect} from 'react';
import {DISPLAY_KEY,parseDisplay,type DisplayPreferences} from './displayPreferences';
export function useDisplayPreferences(){
 const [preferences,setPreferences]=useState(()=>{try{return parseDisplay(localStorage.getItem(DISPLAY_KEY));}catch{return parseDisplay(null);}});
 const [error,setError]=useState(false);
 useEffect(()=>{const update=()=>{try{setPreferences(parseDisplay(localStorage.getItem(DISPLAY_KEY)));}catch{}};window.addEventListener('storage',update);window.addEventListener('display-preferences',update);return()=>{window.removeEventListener('storage',update);window.removeEventListener('display-preferences',update);};},[]);
 function save(p:DisplayPreferences){try{localStorage.setItem(DISPLAY_KEY,JSON.stringify(p));setPreferences(p);setError(false);window.dispatchEvent(new Event('display-preferences'));}catch{setError(true);}}
 return {preferences,save,error};
}
