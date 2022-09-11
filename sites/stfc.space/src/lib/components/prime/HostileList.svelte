<script lang="ts">
  import { _, number } from 'svelte-i18n';

  import type { Hostile, ResourceRewardRange } from '$lib/shared/yuki/models';
  import { factionThumb, resourceThumb } from '$lib/shared/yuki/thumbs';
  import { ListItem } from '@radion/ui';

  export let hostile: Hostile & { rep: ResourceRewardRange[] };

  const formatRep = (v: number) => {
    return (v > 0 ? '+' : '') + $number(v);
  };
</script>

<a href="/hostiles/{hostile.id}">
  <ListItem>
    <div
      class="gap-x-2 items-center grid grid-cols-[1.5rem,1fr] sm:grid-cols-[3.5rem,1fr,max-content] sm:grid-rows-2"
    >
      <img
        class="w-8 sm:w-11 row-span-2 sm:row-span-3"
        height="56"
        src={factionThumb(hostile.faction)}
        alt="logo"
      />
      <span
        class="font-bold col-start-2 sm:row-start-1 text-center flex items-center min-w-[240px] leading-tight"
      >
        {$_(`hostiles_${hostile.loca_id}_name`)}
      </span>
      <span class="row-start-2 col-start-2 text-sm">
        {$_('ship.power')}: {$number(hostile.strength || 0)} | {$_('ship.warp')}:
        {hostile.warp}
      </span>
      <span
        class="row-start-3 col-start-2 text-xs flex items-center gap-x-1 sm:col-start-3 sm:row-start-1 sm:row-span-2"
      >
        {#each hostile.rep as rep (rep.resource_id)}
          <span class="flex">
            <img class="w-4 h-4 my-auto" src={resourceThumb(rep.resource_id)} alt="" />
            <span
              class="text-sm tabular-nums text-right"
              style="width: 8ch;"
              class:text-green-700={rep.max > 0}
              class:text-red-700={rep.max < 0}
              class:dark:text-green-200={rep.max > 0}
              class:dark:text-red-200={rep.max < 0}>{formatRep(rep.max)}</span
            >
          </span>
        {/each}
      </span>
    </div>
  </ListItem>
</a>
