import { setupI18n } from '$lib/i18n';

import { waitLocale } from 'svelte-i18n';

import { setupSearch, waitSearchReady } from '$lib/shared/search';
import { waitStaticData } from '$lib/shared/api';
import type { LayoutLoad } from './$types';

async function getLogoutUrl(fetch: Window['fetch'], user: unknown) {
  if (!user) {
    return null;
  }

  const r = await fetch(`/api/auth/self-service/logout/browser`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const r2 = await r.json<{ logout_url: string }>();
  return r2?.logout_url;
}

export const load: LayoutLoad = async ({ data, fetch }) => {
  const { lang, user, theme } = data;
  setupI18n({ withLocale: lang }, fetch);
  setupSearch();
  let logoutUrl: string | undefined;
  await Promise.all([
    waitLocale(lang),
    waitSearchReady(lang, fetch),
    waitStaticData(fetch),
    getLogoutUrl(fetch, user).then((url) => {
      logoutUrl = url;
    })
  ]);

  return { theme: theme, lang: lang, logoutUrl };
};
