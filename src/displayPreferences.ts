export const DISPLAY_KEY='civilization-chess.display.v1';
export type DisplayPreferences={mode:'auto'|'qhd'|'responsive';size:number};
export const defaultDisplay:DisplayPreferences={mode:'auto',size:0};
export function parseDisplay(raw:string|null):DisplayPreferences{
 try{const p=JSON.parse(raw??'null');return {mode:['auto','qhd','responsive'].includes(p?.mode)?p.mode:'auto',size:[0,80,90,100,110,120].includes(p?.size)?p.size:0};}catch{return {...defaultDisplay};}
}
export function displayGeometry(width:number,height:number,p:DisplayPreferences){
 const responsive=p.mode!=='qhd';
 const factor=(p.size||100)/100;
 const scale=responsive?factor:Math.min(width/2560,height/1440)*factor;
 return {mode:responsive?'responsive':'qhd',scale,width:responsive?width/scale:2560,height:responsive?height/scale:1440};
}
