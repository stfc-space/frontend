import { extendTranslations } from '$lib/i18n';
import { YukiApi } from '$lib/shared/api';
import type { SystemDetail } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ session, params, fetch }) => {
  const system: SystemDetail = await YukiApi.get('/system/' + params.sid, undefined, fetch);
  await extendTranslations(session.lang, [{ path: 'systems', ids: [params.sid] }], fetch);
  return { system };
};
