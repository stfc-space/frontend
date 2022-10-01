import { extendTranslations } from '$lib/i18n';
import { dataLoadHelper } from '$lib/loadHelper';
import { YukiApi } from '$lib/shared/api';
import type { SystemDetail } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params, fetch }) => {
  const { lang } = await parent();

  return await dataLoadHelper([
    YukiApi.get('/system/' + params.sid, undefined, fetch).then((e: SystemDetail) => {
      return { system: e };
    }),
    extendTranslations(lang, [{ path: 'systems', ids: [params.sid] }], fetch)
  ]);
};
