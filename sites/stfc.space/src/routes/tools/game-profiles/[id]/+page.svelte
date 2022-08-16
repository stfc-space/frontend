<script lang="ts" context="module">
  import { YukiApi } from '$lib/shared/api';

  import type { LoadEvent } from '@sveltejs/kit';

  export async function load({ session, params, fetch }: LoadEvent) {
    const n: any = await (await fetch('/api/game-profile/' + params.id)).json();

    // TODO(alexander): Backend currently returns the entire deps map here
    // this will change _eventually_
    const deps = await YukiApi.get('/config/deps/range', {
      query: { from: 0, to: 0, from_level: n.buildings['0'], to_level: n.buildings['0'] + 1 }
    });
    return { props: { game_profile: n, deps_to_next_ops: deps } };
  }
</script>

<script lang="ts">
  export let game_profile: any;
  export let deps_to_next_ops: any;

  console.log(game_profile);
  console.log(deps_to_next_ops);
</script>

{game_profile.name}
