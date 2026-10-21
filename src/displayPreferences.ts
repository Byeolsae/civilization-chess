// Logical design coordinates, not the monitor resolution or a raster image.
// One uniform scale preserves layout and relative sizes on every display.
export const DESIGN_WIDTH=2560;
export const DESIGN_HEIGHT=1440;
export function displayGeometry(width:number,height:number){
 const scale=Math.min(Math.max(0,width)/DESIGN_WIDTH,Math.max(0,height)/DESIGN_HEIGHT);
 return {scale,width:DESIGN_WIDTH,height:DESIGN_HEIGHT};
}
