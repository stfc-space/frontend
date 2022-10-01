import { redirect, error } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';

import { QueryStore } from '$lib/shared/queryStore';

import type { LoadEvent } from '@sveltejs/kit/types';
import type { Building } from '$lib/shared/yuki/models';
import { dataLoadHelper } from '$lib/loadHelper';

interface QueryParams {
  name: string;
}

export async function load({ url, fetch }: LoadEvent) {
  const queryStore = new QueryStore<QueryParams>(`buildings`);
  queryStore.addField('name', '');
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  return {
    ...(await dataLoadHelper([
      YukiApi.get('/building', undefined, fetch).then((e: Building[]) => {
        return { buildings: e };
      }),
      waitLocale()
    ])),
    queryStore
  };
}
