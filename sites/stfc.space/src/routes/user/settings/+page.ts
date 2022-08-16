import { runLoad } from '../../auth/_load';
import type { PageLoad } from './$types';

export const load: PageLoad = async (loadEvent) => {
  return await runLoad('settings', loadEvent);
};
