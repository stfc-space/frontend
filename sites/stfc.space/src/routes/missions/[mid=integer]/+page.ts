import { extendTranslations } from '$lib/i18n';

import { YukiApi } from '$lib/shared/api';
import type { MissionDetail } from '$lib/shared/yuki/models';
import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ parent, fetch, params }) {
  const { lang } = await parent();
  let mission: MissionDetail;
  await Promise.all([
    await YukiApi.get('/mission/' + params.mid, undefined, fetch).then(
      (s: MissionDetail) => (mission = s)
    ),
    extendTranslations(lang, [{ path: 'missions', ids: [params.mid] }], fetch)
  ]);
  return { mission };
};
