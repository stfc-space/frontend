import { YukiApi } from '$lib/shared/api';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ session, params, fetch }) => {
  const n: any = await (await fetch('/api/game-profile/' + params.id)).json();

  // TODO(alexander): Backend currently returns the entire deps map here
  // this will change _eventually_
  const deps = await YukiApi.get('/config/deps/range', {
    query: { from: 0, to: 0, from_level: n.buildings['0'], to_level: n.buildings['0'] + 1 }
  });
  return { game_profile: n, deps_to_next_ops: deps };
};
