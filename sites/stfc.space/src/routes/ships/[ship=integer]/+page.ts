import { redirect } from '@sveltejs/kit';
import { extendTranslations } from '$lib/i18n';

import { YukiApi } from '$lib/shared/api';
import { QueryStore } from '$lib/shared/queryStore';
import { ShipDetail } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';

interface QueryParams {
  level: number;
  slevel: number;
  tr: [number, number];
}

export const load: PageLoad = async function ({ session, fetch, params, url }) {
  let ship: ShipDetail;
  await Promise.all([
    await YukiApi.get('/ship/' + params.ship, undefined, fetch).then((s: ShipDetail) => (ship = s)),
    extendTranslations(session.lang, [{ path: 'ships', ids: [params.ship] }], fetch)
  ]);

  const queryStore = new QueryStore<QueryParams>(`ship`);
  queryStore.addField('level', 1);
  queryStore.addField('slevel', ship.max_level);
  queryStore.addField('tr', [1, 1]);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  return { ship, queryStore };
};
