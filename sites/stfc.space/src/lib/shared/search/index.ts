import { validLangs } from '$lib/i18n';
import { derived, get, writable } from 'svelte/store';
import type { Subscriber } from 'svelte/store';
import { YukiApi } from '../api';
import { uniq } from 'lodash-es';

const internalLocale = writable('');

export interface SearchIndexLoader {
  (): Promise<unknown>;
}

const fallbackLocale = 'en';

const loaders: { [key: string]: Set<SearchIndexLoader> } = {};

let awaitSetup = true;

export async function waitSearchReady(
  locale?: string,
  fetchOverride?: Window['fetch']
): Promise<void> {
  if (awaitSetup) {
    awaitSetup = false;
    for (const lang of validLangs) {
      loaders[lang] = loaders[lang] ?? new Set();
      loaders[lang].add(async () => {
        const data = await YukiApi.get(`/search-index/${lang}`, undefined, fetchOverride);
        return data;
      });
    }
  }
  const currentLocale = locale ?? get(internalLocale);
  return flush(currentLocale);
}

export function init(lang: string) {
  internalLocale.set(lang);
}

export function setupSearch(
  { withLocale: _locale } = {
    withLocale: 'en'
  }
) {
  init(_locale);
}

export const $locale = {
  subscribe(fn: Subscriber<string>) {
    return internalLocale.subscribe(fn);
  },
  async set(newLocale: string) {
    await flush(newLocale as string);
    internalLocale.set(newLocale);
  }
};

function getSubLocales(refLocale: string) {
  return refLocale
    .split('-')
    .map((_, i, arr) => arr.slice(0, i + 1).join('-'))
    .reverse();
}

export function getPossibleLocales(refLocale: string): string[] {
  const locales = getSubLocales(refLocale);

  return uniq([...locales, ...getSubLocales(fallbackLocale)]);
}

function getLocalesQueues(locale: string) {
  return getPossibleLocales(locale)
    .map<[string, SearchIndexLoader[]]>((localeItem) => {
      const localeQueue = loaders[localeItem];

      return [localeItem, localeQueue ? Array.from(localeQueue.values()) : []];
    })
    .filter(([, localeQueue]) => localeQueue.length > 0);
}

export interface LocaleDictionary {
  [key: string]: object;
}

export type LocalesDictionary = {
  [key: string]: LocaleDictionary;
};

const activeFlushes: { [key: string]: Promise<void> } = {};
let searchIndexCache: LocalesDictionary;
const $searchIndexCache = writable<LocalesDictionary>({});

async function loadLocaleQueue(locale: string, localeQueue: SearchIndexLoader[]) {
  const allLoadersPromise = Promise.all(
    localeQueue.map(async (loader) => {
      loaders[locale].delete(loader);

      if (loaders[locale].size === 0) {
        delete loaders[locale];
      }

      const partial = await loader();
      const p = partial as { default: unknown };
      return p.default || partial;
    })
  );

  const partials = await allLoadersPromise;
  $searchIndexCache.update((d) => {
    d[locale] = Object.assign(searchIndexCache[locale] ?? {}, ...partials);

    return d;
  });
}

export function flush(locale: string) {
  if (locale in searchIndexCache) {
    return Promise.resolve();
  }

  if (locale in activeFlushes) {
    return activeFlushes[locale];
  }

  // get queue of XX-YY and XX locales
  const queues = getLocalesQueues(locale);

  activeFlushes[locale] = Promise.all(
    queues.map(([localeName, localeQueue]) => loadLocaleQueue(localeName, localeQueue))
  ).then(() => {
    delete activeFlushes[locale];
  });

  return activeFlushes[locale];
}

$searchIndexCache.subscribe((newDictionary) => (searchIndexCache = newDictionary));

import MiniSearch, { AsPlainObject } from 'minisearch';

export interface ItemSearchItem {
  id: unknown;
}

const searchCache: {
  [key: string]: {
    ii: (ItemSearchItem & unknown)[];
    l: string;
    items: Map<unknown, unknown>;
    search: MiniSearch<unknown>;
  };
} = {};

function readSearchCache<T>(type: string, items: (ItemSearchItem & T)[]) {
  const currentLocale = get<string>(internalLocale);
  if (type in searchCache) {
    const c = searchCache[type];
    const n =
      c.ii === items ||
      (c.ii.length === items.length &&
        c.ii[0].id === items[0].id &&
        c.ii[c.ii.length - 1].id === items[items.length - 1].id);
    if (n && c.l === currentLocale) {
      return c;
    }
  }

  const index = searchIndexCache?.[currentLocale]?.[type];

  if (!index) {
    return null;
  }

  const itemMap: Map<unknown, ItemSearchItem & unknown> = new Map();
  itemMap.clear();
  for (const item of items) {
    itemMap.set(item.id, item);
  }

  const sI = {
    ii: items,
    l: currentLocale,
    items: itemMap,
    search: MiniSearch.loadJS(index as AsPlainObject, {
      fields: ['text', 'textAlternate'],
      searchOptions: {
        prefix: true,
        fuzzy: true,
        combineWith: 'AND'
      }
    })
  };

  searchCache[type] = sI;

  return sI;
}

function executeSearch<T>(term: string, type: string, items: (ItemSearchItem & T)[]) {
  if (term.length == 0) {
    return items;
  }

  const sI = readSearchCache(type, items);

  if (!sI) {
    console.warn('Search index missing');
    return items;
  }

  return sI.search
    .search(term)
    .sort((a, b) => b.score - a.score)
    .map((x) => sI.items.get(x.id) as T)
    .filter((x) => !!x);
}

const $search = derived([$locale, $searchIndexCache], () => executeSearch);

export { $search as search };
