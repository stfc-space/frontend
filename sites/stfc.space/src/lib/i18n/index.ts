import { uniq } from 'lodash-es';
import { register, init, getLocaleFromNavigator, addMessages, locale } from 'svelte-i18n';
import { YukiApi } from '../shared/api';

const staticTranslations = [
  { path: 'materials', 'key': 'name' },
  { path: 'ships', 'key': 'name' },
  { path: 'officers', 'key': 'name' },
  { path: 'officers_synergy' },
  { path: 'research', 'key': 'name' },
  { path: 'research', 'key': 'tree_name' },
  { path: 'buildings' },
  { path: 'building_buffs', 'key': 'buff_name' },
  { path: 'factions' },
  { path: 'officer_division' },
  { path: 'ship_type' },
  { path: 'systems', 'key': 'name' },
  { path: 'ship_components' },
  { path: 'consumables', 'key': 'name' },
  { path: 'hostiles' },
  { path: 'missions', 'key': 'title' },
  { path: 'traits' },
  { path: 'ships', 'key': 'blueprint_name' },
  { path: 'servers' }
];

const staticTranslationList = [{ path: 'officers', ids: [-1] }];

// interface TranslationEntry {
//   id: string;
//   key: string;
//   text: string;
// }
// const loadTranslation = async (
//   lang: string,
//   category: { path: string; query?: any }
// ): Promise<TranslationEntry[]> => {
//   return await YukiApi.get(`translations/${lang}/${category.path}`, { query: category.query });
// };

const loadTranslationPack = async (
  lang: string,
  category: { path: string; key?: string }[],
  fetchOverride?: Window['fetch']
): Promise<Record<string, string>> => {
  return await YukiApi.get(
    `translations/${lang}/packed-flat/${encodeURIComponent(JSON.stringify(category))}`,
    undefined,
    fetchOverride
  );
};

const loadTranslationList = async (
  lang: string,
  category: string,
  ids?: (number | string)[],
  fetchOverride?: Window['fetch']
): Promise<{ id: string; key: string; text: string }[]> => {
  return await YukiApi.get(
    `translations/${lang}/${category}/${uniq(ids).join(',')}`,
    undefined,
    fetchOverride
  );
};

export const validLangs = ['en', 'fr', 'it', 'de', 'es', 'ru', 'pt', 'ja', 'ko'];

register('en', () => import(`./en.json`));
// register("fr", () => import(`./fr.json`));
// register("it", () => import(`./it.json`));
register('de', () => import(`./de.json`));
// register("es", () => import(`./es.json`));
// register("ru", () => import(`./ru.json`));
// register("pt", () => import(`./pt.json`));
// register("ja", () => import(`./ja.json`));
// register("ko", () => import(`./ko.json`));

let awaitSetup = true;

function setupI18n(
  { withLocale: _locale } = {
    withLocale: 'en'
  },
  fetchOverride?: Window['fetch']
) {
  if (awaitSetup) {
    awaitSetup = false;
    for (const lang of validLangs) {
      register(lang, async () => {
        try {
          return await loadTranslationPack(lang, staticTranslations, fetchOverride);
        } catch (e) {
          console.warn('Failed to load translations', e);
          return {};
        }
      });

      for (const n of staticTranslationList) {
        register(lang, async () => {
          try {
            const data = await loadTranslationList(lang, n.path, n.ids);
            return Object.fromEntries(
              data.map((t) => {
                return [`${n.path}_${t.id}_${t.key}`, t.text];
              })
            );
          } catch (e) {
            console.warn('Failed to load translations', e);
            return {};
          }
        });
      }
    }
  }

  init({
    fallbackLocale: 'en',
    initialLocale: _locale ?? getLocaleFromNavigator()
  });
}

const translationExtensions = [];

export async function extendTranslations(
  lang: string,
  o: {
    path: string;
    ids: (string | number)[];
  }[],
  fetchOverride?: Window['fetch']
) {
  translationExtensions.push(...o);
  return Promise.allSettled(
    o.map((n) =>
      loadTranslationList(lang, n.path, n.ids, fetchOverride)
        .then((data) => {
          addMessages(
            lang,
            Object.fromEntries(
              data.map((t) => {
                return [`${n.path}_${t.id}_${t.key}`, t.text];
              })
            )
          );
        })
        .catch()
    )
  );
}

locale.subscribe(async (lang: string) => {
  for (const n of translationExtensions) {
    try {
      const data = await loadTranslationList(lang, n.path, n.ids);
      addMessages(
        lang,
        Object.fromEntries(
          data.map((t) => {
            return [`${n.path}_${t.id}_${t.key}`, t.text];
          })
        )
      );
    } catch {
      // Intentionally left empty
    }
  }
});

export { setupI18n };
