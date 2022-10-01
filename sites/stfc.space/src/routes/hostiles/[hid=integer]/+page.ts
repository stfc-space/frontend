import { dataLoadHelper } from '$lib/loadHelper';
import { YukiApi } from '$lib/shared/api';
import type { HostileDetail } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const hostile: HostileDetail = await dataLoadHelper([
    YukiApi.get<HostileDetail>('/hostile/' + params.hid, undefined, fetch)
  ]);
  return { hostile };
};
