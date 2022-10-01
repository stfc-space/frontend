import { redirect } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';
import { QueryStore } from '$lib/shared/queryStore';

interface QueryParams {
  name: string;
  page: number;
  faction: number;
  mining: boolean;
  housing: boolean;
  missions: boolean;
  scout: boolean;
  ds: boolean;
  level: [number, number];
  warp: [number, number];
  resources: number[];
  hostiles: number[];
}

import type { PageLoad } from './$types';
import type { System } from '$lib/shared/yuki/models';
import { dataLoadHelper } from '$lib/loadHelper';

export const load: PageLoad = async ({ fetch, url }) => {
  const queryStore = new QueryStore<QueryParams>('systems');
  queryStore.addField('name', '');
  queryStore.addField('page', 1);
  queryStore.addField('faction', -1);
  queryStore.addField('mining', false);
  queryStore.addField('housing', false);
  queryStore.addField('missions', false);
  queryStore.addField('scout', false);
  queryStore.addField('ds', false);
  queryStore.addField('level', [0, 100]);
  queryStore.addField('warp', [0, 500]);
  queryStore.addField('resources', []);
  queryStore.addField('hostiles', []);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  return {
    ...(await dataLoadHelper([
      YukiApi.get('/system', undefined, fetch).then((e: System[]) => {
        return { systems: e };
      }),
      waitLocale()
    ])),
    queryStore
  };
};
