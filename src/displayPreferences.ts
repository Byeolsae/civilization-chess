// Logical design coordinates, not the monitor resolution or a raster image.
// One uniform scale preserves layout and relative sizes on every display.
export const DESIGN_WIDTH=2560;
export const DESIGN_HEIGHT=1440;
export const RESOLUTION_KEY='civilization-chess.resolution.v1';
export const resolutions={hd:1280,fhd:1920,qhd:2560,uhd:3840} as const;
export type Resolution='auto'|keyof typeof resolutions;
export function parseResolution(value:string|null):Resolution{
 return value&&Object.prototype.hasOwnProperty.call(resolutions,value)?value as Resolution:'auto';
}
export function displayGeometry(width:number,height:number,resolution:Resolution='auto'){
 const scale=Math.min(Math.max(0,width)/DESIGN_WIDTH,Math.max(0,height)/DESIGN_HEIGHT,resolution==='auto'?Infinity:resolutions[resolution]/DESIGN_WIDTH);
 return {scale,width:DESIGN_WIDTH,height:DESIGN_HEIGHT};
}
