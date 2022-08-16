import { setupI18n } from '$lib/i18n';

import { waitLocale } from 'svelte-i18n';

import { setupSearch, waitSearchReady } from '$lib/shared/search';
import { waitStaticData } from '$lib/shared/api';
import type { LayoutLoad } from './$types';

async function getLogoutUrl(fetch: Window['fetch'], session: { user: unknown }) {
  // No user, so we can't log out
  if (!session.user) {
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

export const load: LayoutLoad = async ({ session, fetch }) => {
  setupI18n({ withLocale: session.lang }, fetch);
  setupSearch();
  let logoutUrl: string;
  await Promise.all([
    waitLocale(session.lang),
    waitSearchReady(session.lang, fetch),
    waitStaticData(fetch),
    getLogoutUrl(fetch, session).then((url) => {
      logoutUrl = url;
    })
  ]);

  return { theme: session.theme, lang: session.lang, logoutUrl };
};
