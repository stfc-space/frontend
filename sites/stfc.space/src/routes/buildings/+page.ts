import { redirect, error } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';

import { QueryStore } from '$lib/shared/queryStore';

import type { LoadEvent } from '@sveltejs/kit/types';
import type { Building } from '$lib/shared/yuki/models';

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

  try {
    let result: Building[];
    await Promise.all([
      YukiApi.get('/building', undefined, fetch).then((e: Building[]) => {
        result = e;
      }),
      waitLocale()
    ]);

    return {
      buildings: result,
      queryStore
    };
  } catch (e) {
    throw error(500, `Could not load ${e}`);
  }
}
