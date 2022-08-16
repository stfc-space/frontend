import { YukiApi } from '$lib/shared/api';
import type { HostileDetail } from '$lib/shared/yuki/models';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ session, params, fetch }) => {
  const hostile: HostileDetail = await YukiApi.get('/hostile/' + params.hid, undefined, fetch);
  return { hostile };
};
