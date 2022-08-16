<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;

  console.log(data.game_profile);
  console.log(data.deps_to_next_ops);
</script>

{data.game_profile.name}
