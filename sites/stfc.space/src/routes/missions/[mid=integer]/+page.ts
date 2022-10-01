import { extendTranslations } from '$lib/i18n';
import { dataLoadHelper } from '$lib/loadHelper';

import { YukiApi } from '$lib/shared/api';
import type { MissionDetail } from '$lib/shared/yuki/models';
import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ parent, fetch, params }) {
  const { lang } = await parent();
  const mission: MissionDetail = await dataLoadHelper([
    YukiApi.get<MissionDetail>('/mission/' + params.mid, undefined, fetch)
  ]);
  const task_ids = Object.values(mission.tasks).flatMap((x) => {
    if (x.attributes.npc) {
      return [x.id, x.attributes.npc.id];
    } else {
      return [x.id];
    }
  });
  await dataLoadHelper([
    extendTranslations(
      lang,
      [
        { path: 'missions', ids: [params.mid] },
        { path: 'mission_tasks', ids: task_ids }
      ],
      fetch
    )
  ]);
  return { mission };
};

export const ssr = false;
