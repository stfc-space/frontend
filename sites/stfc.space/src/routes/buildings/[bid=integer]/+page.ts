import { redirect } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import type { BuildingDetail } from '$lib/shared/yuki/models';
import { QueryStore } from '$lib/shared/queryStore';
import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ fetch, params, url }) {
  const queryStore = new QueryStore<{
    level: number;
    rbs: string;
  }>(`building`);
  queryStore.addField('level', 1);
  queryStore.addField('rbs', '');
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  let building: BuildingDetail;
  await Promise.all([
    YukiApi.get('/building/' + params.bid, undefined, fetch).then(
      (b: BuildingDetail) => (building = b)
    )
  ]);

  return { building, queryStore };
};
