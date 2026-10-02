import { civilizations, regions, countries, belongsToCountry, type Civilization } from './civilizations';

export const eras = ['고대', '중세', '근세', '근대'] as const;
export type Era = typeof eras[number];
export type RegionFilter = '전체' | typeof regions[number];
export type CountryFilter = '전체' | typeof countries[number];
export type EraFilter = '전체' | Era;

export const civilizationEras: Record<Civilization, readonly Era[]> = {
  greece: ['고대'], rome: ['고대'], egypt: ['고대'],
  qin: ['고대'], han: ['고대'], tang: ['중세'], song: ['중세'],
  qing: ['근세', '근대'], korea: ['중세', '근세', '근대'], heian: ['중세'], sengoku: ['중세', '근세'],
  goryeo: ['중세'], goguryeo: ['고대'], baekje: ['고대'], silla: ['고대', '중세'],
  wei: ['고대'], shu: ['고대'], wu: ['고대'], gojoseon: ['고대'], kamakura: ['중세'],
  'mongol-empire': ['중세'], yuan: ['중세'], 'russian-empire': ['근세', '근대'], prussia: ['근세', '근대'],
  inca: ['중세', '근세'], aztec: ['중세', '근세'], maya: ['고대', '중세', '근세'], gaul: ['고대'], babylon: ['고대'],
  edo: ['근세', '근대'], meiji: ['근대'],
};

export function filterCivilizations(search = '', region: RegionFilter = '전체', era: EraFilter = '전체', country: CountryFilter = '전체') {
  const normalize = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, '');
  const query = normalize(search);
  return civilizations.filter(civ =>
    (country === '전체' || belongsToCountry(civ, country)) &&
    (region === '전체' || civ.region === region) &&
    (era === '전체' || civilizationEras[civ.id].includes(era)) &&
    normalize(`${civ.name}${civ.english}${civ.countries.join(' ')}`).includes(query)
  ).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}
