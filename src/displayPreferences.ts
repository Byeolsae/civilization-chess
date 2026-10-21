export const DISPLAY_KEY='civilization-chess.display.v1';
export const DESIGN_WIDTH=2560;
export const DESIGN_HEIGHT=1440;
export type DisplayPreferences={mode:'auto'|'qhd';size:number};
export const defaultDisplay:DisplayPreferences={mode:'auto',size:0};
export function parseDisplay(raw:string|null):DisplayPreferences{
 try{
  const p=JSON.parse(raw??'null');
  // Migrate old responsive/oversized preferences to the uniform fit policy.
  return {mode:p?.mode==='qhd'?'qhd':'auto',size:[0,80,90,100].includes(p?.size)?p.size:0};
 }catch{return {...defaultDisplay};}
}
export function displayGeometry(width:number,height:number,p:DisplayPreferences){
 const factor=[80,90,100].includes(p.size)?p.size/100:1;
 const scale=Math.min(Math.max(0,width)/DESIGN_WIDTH,Math.max(0,height)/DESIGN_HEIGHT)*factor;
 return {mode:'qhd' as const,scale,width:DESIGN_WIDTH,height:DESIGN_HEIGHT};
}
