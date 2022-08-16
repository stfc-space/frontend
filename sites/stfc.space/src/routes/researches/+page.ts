import { redirect, error } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';

import { QueryStore } from '$lib/shared/queryStore';
import type { Research } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';

interface QueryParams {
  name: string;
  t: number;
}

export const load: PageLoad = async ({ fetch, url }) => {
  const queryStore = new QueryStore<QueryParams>('researches');
  queryStore.addField('name', '');
  queryStore.addField('t', -1);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  try {
    let result: Research[];
    await Promise.all([
      YukiApi.get('/research', undefined, fetch).then((e: Research[]) => {
        result = e;
      }),
      waitLocale()
    ]);

    return {
      researches: result,
      queryStore
    };
  } catch (e) {
    throw error(500, `Could not load ${e}`);
  }
};
