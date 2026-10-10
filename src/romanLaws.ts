export const romanLaws = [
  { id: 'military-code', name: '군율법', effect: '상대 기물 스킬 쿨타임 +1턴', privilege: '로마는 기존 쿨타임 유지' },
  { id: 'march-law', name: '진군법', effect: '상대 폰의 첫 2칸 전진 금지', privilege: '로마 폰은 첫 2칸 전진 가능' },
  { id: 'conscription-law', name: '징집법', effect: '상대 폰의 퀸 승격 금지', privilege: '로마는 퀸 승격 가능' },
] as const;
export type RomanLaw = typeof romanLaws[number]['id'];
