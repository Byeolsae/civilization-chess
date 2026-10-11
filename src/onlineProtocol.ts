import type { Color } from 'chess.js';
import type { AbilityAction, AbilitySave, PassivePlacement } from './AbilityGame';
export type RematchMode = 'civilizations' | 'loadouts';
export type RematchRequest = {color:Color; mode:RematchMode};
export type RoomCommand = {kind:'rematch'; mode:RematchMode} | {kind:'rematch-answer'; accept:boolean} | {kind:'color'; color:Color} | { kind:'pick'; choice:string } | {kind:'place'; placement:PassivePlacement} | {kind:'action'; action:AbilityAction} | {kind:'answer'; answer:number|null} | {kind:'resign'};
export type RoomView = { id:string; revision:number; round?:number; rematch?:RematchRequest|null; joined:boolean; colorsChosen:boolean; hostColor:Color; picks:string[]; variant:AbilitySave|null; resigned:Color|null; expiresAt:number; serverTime:number; quiz:null|{color:Color; question:string; expiresAt:number}; };
export type RoomSession = {id:string; token:string; color:Color};
