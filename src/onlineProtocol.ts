import type { Color } from 'chess.js';
import type { AbilityAction, AbilitySave, PassivePlacement } from './AbilityGame';
export type RoomCommand = { kind:'pick'; choice:string } | {kind:'place'; placement:PassivePlacement} | {kind:'action'; action:AbilityAction} | {kind:'answer'; answer:number|null} | {kind:'resign'};
export type RoomView = { id:string; revision:number; joined:boolean; picks:string[]; variant:AbilitySave|null; resigned:Color|null; expiresAt:number; serverTime:number; quiz:null|{color:Color; question:string; expiresAt:number}; };
export type RoomSession = {id:string; token:string; color:Color};
