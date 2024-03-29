import { redirect } from '@sveltejs/kit';
import { YukiApi } from '$lib/shared/api';
import { QueryStore } from '$lib/shared/queryStore';

import type { PageLoad } from './$types';
import type { Officer, OfficerDetail } from '$lib/shared/yuki/models';
import { extendTranslations } from '$lib/i18n';
import { dataLoadHelper } from '$lib/loadHelper';

export const load: PageLoad = async function ({ parent, fetch, params, url }) {
  const { lang } = await parent();
  const queryStore = new QueryStore<Record<string, never>>(`officer`);
  queryStore.setQuery(url.searchParams, true);

  const query = queryStore.toQuery();
  if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
    throw redirect(302, '?' + query.toString());
  }

  return {
    ...(await dataLoadHelper([
      YukiApi.get('/officer/' + params.oid, undefined, fetch).then((b: OfficerDetail) => {
        return { officer: b };
      }),
      YukiApi.get('/officer', undefined, fetch).then((b: Officer[]) => {
        return { officerList: b };
      }),
      extendTranslations(lang, [{ path: 'officers', ids: [params.oid] }], fetch)
    ])),
    queryStore
  };
};
