import { redirect } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { waitLocale } from 'svelte-i18n';

import { QueryStore } from '$lib/shared/queryStore';
import type { Research } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';
import { dataLoadHelper } from '$lib/loadHelper';

interface QueryParams {
  name: string;
  t: number;
  e: number;
}

export const load: PageLoad = async ({ fetch, url }) => {
  const queryStore = new QueryStore<QueryParams>('researches');
  queryStore.addField('name', '');
  queryStore.addField('t', -1);
  queryStore.addField('e', -1);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  return {
    ...(await dataLoadHelper([
      YukiApi.get('/research', undefined, fetch).then((e: Research[]) => {
        return { researches: e };
      }),
      waitLocale()
    ])),
    queryStore
  };
};
