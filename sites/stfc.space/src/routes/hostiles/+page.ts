import { redirect } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';
import { QueryStore } from '$lib/shared/queryStore';
import type { Hostile } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';
import { dataLoadHelper } from '$lib/loadHelper';

interface QueryParams {
  name: string;
  r: number;
  f: number;
}

export const load: PageLoad = async ({ fetch, url }) => {
  const queryStore = new QueryStore<QueryParams>('hostiles');
  queryStore.addField('name', '');
  queryStore.addField('r', -1);
  queryStore.addField('f', -1);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  return {
    ...(await dataLoadHelper([
      YukiApi.get('/hostile', undefined, fetch).then((e: Hostile[]) => {
        return { hostiles: e };
      }),
      waitLocale()
    ])),
    queryStore
  };
};
