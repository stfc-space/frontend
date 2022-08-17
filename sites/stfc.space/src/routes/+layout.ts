import { setupI18n } from '$lib/i18n';

import { waitLocale } from 'svelte-i18n';

import { setupSearch, waitSearchReady } from '$lib/shared/search';
import { waitStaticData } from '$lib/shared/api';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, fetch }) => {
  const { lang, user, theme } = data;
  setupI18n({ withLocale: lang }, fetch);
  setupSearch();
  await Promise.all([waitLocale(lang), waitSearchReady(lang, fetch), waitStaticData(fetch)]);
  return { theme: theme, lang: lang, userId: user };
};
