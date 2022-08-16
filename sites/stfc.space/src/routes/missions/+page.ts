import { redirect, error } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { QueryStore } from '$lib/shared/queryStore';

import type { PageLoad } from './$types';
import type { InventoryReward, Mission } from '$lib/shared/yuki/models';

interface QueryParams {
  name: string;
  r: number;
  w: [number, number];
  cw: [number, number];
  f: number;
}

export const load: PageLoad = async ({ url, fetch }) => {
  const queryStore = new QueryStore<QueryParams>('missions');
  queryStore.addField('name', '');
  queryStore.addField('w', [0, 500]);
  queryStore.addField('cw', [0, 500]);
  queryStore.addField('r', -1);
  queryStore.addField('f', -1);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  try {
    const result = await YukiApi.get<{ missions: Mission[]; all_rewards: InventoryReward[] }>(
      '/mission/rewards',
      undefined,
      fetch
    );
    return {
      missions: result.missions,
      allRewards: result.all_rewards,
      queryStore
    };
  } catch (e) {
    throw error(500, `Could not load ${e}`);
  }
};
