import { createLoad } from '../../auth/_load';
import type { PageLoad } from './$types';

export const load: PageLoad = createLoad('settings');
