import { redirect, error } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';

import { QueryStore } from '$lib/shared/queryStore';
import type { Officer } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';

interface QueryParams {
  name: string;
  r: number;
  g: number;
  f: number;
}

export const load: PageLoad = async ({ fetch, url }) => {
  const queryStore = new QueryStore<QueryParams>('officers');
  queryStore.addField('name', '');
  queryStore.addField('r', -1);
  queryStore.addField('g', -1);
  queryStore.addField('f', -1);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  try {
    let result: Officer[];
    await Promise.all([
      YukiApi.get('/officer', undefined, fetch).then((e: Officer[]) => {
        result = e;
      }),
      waitLocale()
    ]);

    return {
      officers: result,
      queryStore
    };
  } catch (e) {
    throw error(500, `Could not load ${e}`);
  }
};
