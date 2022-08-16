import { redirect, error } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';
import { QueryStore } from '$lib/shared/queryStore';

import type { LoadEvent } from '@sveltejs/kit/types';
import type { Ship } from '$lib/shared/yuki/models';

interface QueryParams {
  name: string;
  r: number;
  f: number;
  g: number;
}

export async function load({ fetch, url }: LoadEvent) {
  const queryStore = new QueryStore<QueryParams>('hostiles');
  queryStore.addField('name', '');
  queryStore.addField('r', -1);
  queryStore.addField('f', -1);
  queryStore.addField('g', -1);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  try {
    let result: Ship[];
    await Promise.all([
      YukiApi.get('/ship', undefined, fetch).then((e: Ship[]) => {
        result = e;
      }),
      waitLocale()
    ]);

    return {
      ships: result,
      queryStore
    };
  } catch (e) {
    throw error(500, `Could not load ${e}`);
  }
}
