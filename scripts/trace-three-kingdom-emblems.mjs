import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.argv[2]||'sharp');
const names={goguryeo:'goguryeo.png',baekje:'baekje.jpg',silla:'silla.png'};
// Trace the actual two-color source silhouette, including enclosed background holes.
// Pixel edges are simplified at subpixel tolerance; no invented feather or face details.
function simplify(points,epsilon=.3){
 if(points.length<3)return points;
 const a=points[0],b=points.at(-1),dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
 let max=0,index=0;
 for(let i=1;i<points.length-1;i++){
  const p=points[i],t=len?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len)):0;
  const d=Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
  if(d>max){max=d;index=i;}
 }
 return max>epsilon?[...simplify(points.slice(0,index+1),epsilon).slice(0,-1),...simplify(points.slice(index),epsilon)]:[a,b];
}
const output={};
for(const [id,name] of Object.entries(names)){
 const {data,info}=await sharp(readFileSync(new URL(`../art/emblems/three-kingdoms/references/${name}`,import.meta.url))).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h,channels}=info,mask=new Uint8Array(w*h);
 for(let i=0;i<w*h;i++){const r=data[i*channels],g=data[i*channels+1],b=data[i*channels+2];mask[i]=Number(id==='silla'?Math.min(r,g,b)>200:Math.max(r,g,b)<110);}
 const inside=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&mask[y*w+x];
 const edges=new Map();let minX=w,minY=h,maxX=0,maxY=0;
 function edge(x,y,xx,yy){const key=`${x},${y}`;if(!edges.has(key))edges.set(key,[]);edges.get(key).push([xx,yy]);}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(inside(x,y)){
 minX=Math.min(x,minX);minY=Math.min(y,minY);maxX=Math.max(x+1,maxX);maxY=Math.max(y+1,maxY);
 if(!inside(x,y-1))edge(x,y,x+1,y);if(!inside(x+1,y))edge(x+1,y,x+1,y+1);if(!inside(x,y+1))edge(x+1,y+1,x,y+1);if(!inside(x-1,y))edge(x,y+1,x,y);
 }
 const loops=[];
 while(edges.size){const start=edges.keys().next().value;let key=start;const pts=[key.split(',').map(Number)];
 do{const list=edges.get(key);if(!list)throw Error('Open contour');const next=list.pop();if(!list.length)edges.delete(key);pts.push(next);key=next.join(',');}while(key!==start);
 let area=0;for(let i=1;i<pts.length;i++)area+=pts[i-1][0]*pts[i][1]-pts[i][0]*pts[i-1][1];
 if(Math.abs(area)>4)loops.push(simplify(pts));
 }
 const scale=48/Math.max(maxX-minX,maxY-minY),ox=32-(minX+maxX)/2*scale,oy=32-(minY+maxY)/2*scale;
 const d=loops.map(points=>points.map(([x,y],i)=>`${i?'L':'M'}${(x*scale+ox).toFixed(2)} ${(y*scale+oy).toFixed(2)}`).join('')+'Z').join('');
 const hex=n=>n.toString(16).padStart(2,'0');
 const background='#'+[data[0],data[1],data[2]].map(hex).join('');
 const foreground=id==='silla'?'#ffffff':'#000000';
 const rawPath=loops.map(points=>points.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join('')+'Z').join('');
 const flag='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'"><rect width="'+w+'" height="'+h+'" fill="'+background+'"/><path fill="'+foreground+'" fill-rule="evenodd" d="'+rawPath+'"/></svg>\n';
 const icon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="'+background+'"/><path fill="'+foreground+'" fill-rule="evenodd" d="'+d+'"/></svg>\n';
 for(const suffix of ['','-w','-b'])writeFileSync(new URL('../public/civilizations/'+id+suffix+'.svg',import.meta.url),icon);
 writeFileSync(new URL('../art/emblems/three-kingdoms/'+id+'-flag.svg',import.meta.url),flag);
 output[id]={source:name,bounds:[minX,minY,maxX,maxY],background,foreground,path:d};
 console.log(id,loops.length,'contours',d.length,'characters');
}
writeFileSync(new URL('../art/emblems/three-kingdoms/paths.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
