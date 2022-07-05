<script lang="ts">
  import { _ } from 'svelte-i18n';

  import type { Building } from '$lib/shared/yuki/models';
  import { buildingThumb } from '$lib/shared/yuki/thumbs';
  import { ListItem } from '@radion/ui';

  export let building: Building;
</script>

<a sveltekit:prefetch href="/buildings/{building.id}">
  <ListItem>
    <div class="gap-x-2 items-center grid grid-cols-[3.5rem,1fr] grid-rows-2">
      <img
        class="h-full h-14 w-14 row-span-1 row-span-2"
        width="32"
        height="32"
        src={buildingThumb(building.id)}
        alt="logo"
      />
      <span class="font-bold col-start-2 row-start-1 text-center flex items-center min-w-[240px]">
        {$_(`buildings_${building.id}_name`)}
      </span>
      <span class="row-start-2 col-start-2 text-sm">
        {$_(`prime.unlock_level`)}: {building.unlock_level}
      </span>
    </div>
  </ListItem>
</a>
