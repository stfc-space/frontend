import { redirect } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';
import { QueryStore } from '$lib/shared/queryStore';

import type { LoadEvent } from '@sveltejs/kit/types';
import type { Ship } from '$lib/shared/yuki/models';
import { dataLoadHelper } from '$lib/loadHelper';

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

  return {
    ...(await dataLoadHelper([
      YukiApi.get('/ship', undefined, fetch).then((e: Ship[]) => {
        return { ships: e };
      }),
      waitLocale()
    ])),
    queryStore
  };
}
