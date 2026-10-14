import { additionalCivilizations } from './additionalCivilizations';
import { translate, getLocale } from './i18n';
import { civilizations, regions, countries, belongsToCountry, type Civilization } from './civilizations';

export const eras = ['고대', '중세', '근세', '근대'] as const;
export type Era = typeof eras[number];
export type RegionFilter = '전체' | typeof regions[number];
export type CountryFilter = '전체' | typeof countries[number];
export type EraFilter = '전체' | Era;

export const civilizationEras: Record<Civilization, readonly Era[]> = {
  ...additionalCivilizations.reduce((result, civ) => { result[civ.id] = civ.eras; return result; }, {} as Record<typeof additionalCivilizations[number]['id'], readonly Era[]>),
  greece: ['고대'], rome: ['고대'], egypt: ['고대'],
  qin: ['고대'], han: ['고대'], tang: ['중세'], song: ['중세'], ming: ['중세', '근세'],
  qing: ['근세', '근대'], korea: ['중세', '근세', '근대'], heian: ['중세'], sengoku: ['중세', '근세'],
  goryeo: ['중세'], goguryeo: ['고대'], baekje: ['고대'], silla: ['고대', '중세'],
  wei: ['고대'], shu: ['고대'], wu: ['고대'], gojoseon: ['고대'], kamakura: ['중세'],
  'mongol-empire': ['중세'], yuan: ['중세'], 'russian-empire': ['근세', '근대'], prussia: ['근세', '근대'],
  inca: ['중세', '근세'], aztec: ['중세', '근세'], maya: ['고대', '중세', '근세'], gaul: ['고대'], babylon: ['고대'],
  edo: ['근세', '근대'], meiji: ['근대'],
};

const normalizeSearch = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, '');
// Civilization data is static. Build bilingual search terms once, not on each render.
const searchIndex = new Map(civilizations.map(civ => [civ.id, normalizeSearch(
  `${civ.name}${civ.english} ${'aliases' in civ ? civ.aliases : ''} ${civ.countries.join(' ')} ${translate(civ.name, 'en')} ${civ.countries.map(c => translate(c, 'en')).join(' ')}`
)]));
const orderedRosters = new Map<ReturnType<typeof getLocale>, (typeof civilizations[number])[]>();
function orderedCivilizations() {
  const locale = getLocale();
  let ordered = orderedRosters.get(locale);
  if (!ordered) {
    const names = new Map(civilizations.map(c => [c.id, translate(c.name, locale)]));
    ordered = [...civilizations].sort((a, b) => names.get(a.id)!.localeCompare(names.get(b.id)!, locale));
    orderedRosters.set(locale, ordered);
  }
  return ordered;
}

export function filterCivilizations(search = '', region: RegionFilter = '전체', era: EraFilter = '전체', country: CountryFilter = '전체') {
  const query = normalizeSearch(search);
  return orderedCivilizations().filter(civ =>
    (country === '전체' || belongsToCountry(civ, country)) &&
    (region === '전체' || civ.region === region) &&
    (era === '전체' || civilizationEras[civ.id].includes(era)) &&
    (!query || searchIndex.get(civ.id)!.includes(query))
  );
}
