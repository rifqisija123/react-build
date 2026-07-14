import languageData from './language.json';

export interface Language {
  code: string;
  name: string;
}

export const EXCLUDED_LANGUAGES = [
  'ae', 'an', 'bi', 'cr', 'cu', 'ho', 'hz', 'ia', 'ie', 'ii', 'ik', 'io', 
  'ki', 'kj', 'ks', 'kw', 'lu', 'na', 'nd', 'ng', 'nn', 'nv', 'oj', 'pi', 
  'rm', 'sc', 'vo', 'wa', 'za'
];

export const APP_LANGUAGES: Language[] = languageData
  .filter((d: any) => !EXCLUDED_LANGUAGES.includes(d.alpha2))
  .map((d: any) => ({
    code: d.alpha2,
    name: d.Language
  }));
