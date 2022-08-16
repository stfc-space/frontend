import { redirect } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';

import type { PageLoad } from './$types';
import { QueryStore } from '$lib/shared/queryStore';
import type { ResearchDetail } from '$lib/shared/yuki/models';
import { extendTranslations } from '$lib/i18n';

export const load: PageLoad = async function ({ session, fetch, params, url }) {
  const queryStore = new QueryStore<{
    level: number;
  }>(`research`);
  queryStore.addField('level', 1);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  let research: ResearchDetail;
  await Promise.all([
    YukiApi.get('/research/' + params.rid, undefined, fetch).then(
      (r: ResearchDetail) => (research = r)
    ),
    extendTranslations(session.lang, [{ path: 'research', ids: [params.rid] }], fetch)
  ]);

  return { research, queryStore };
};
