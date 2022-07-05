<script lang="ts">
  import { _ } from 'svelte-i18n';

  import type { Ship } from '$lib/shared/yuki/models';
  import { shipThumb } from '$lib/shared/yuki/thumbs';
  import { ListItem } from '@radion/ui';
  import RarityIcon from './RarityIcon.svelte';

  export let ship: Ship;
</script>

<a sveltekit:prefetch href="/ships/{ship.id}">
  <ListItem>
    <div
      class="gap-x-2 items-center grid sm:grid-cols-[3.5rem,1fr,1fr] grid-cols-[2rem,1fr,1fr] grid-rows-2 sm:grid-rows-1"
    >
      <img
        class="w-8 h-full sm:h-14 sm:w-14 row-span-1 sm:row-span-2"
        width="32"
        height="32"
        src={shipThumb(ship.art_id)}
        alt="logo"
      />
      <span
        class="font-bold col-start-2 sm:row-start-1 text-center flex items-center min-w-[240px]"
      >
        <RarityIcon rarity={ship.rarity} />
        {$_(`ships_${ship.id}_name`)}
      </span>
      <span class="row-start-2 col-start-2 sm:col-start-2">
        {$_(`ship_type_${ship.hull_type}_name`)}
        <span class="inline sm:hidden">
          |
          {$_(`factions_${ship.faction}_name`)}
        </span>
      </span>
      <span class="row-start-1 row-span-2 hidden sm:col-start-3 sm:inline">
        <!-- Grade: <span class="font-bold">{{ item.grade }}</span>
				Shipyard:
				<span class="font-bold">{{ requiredShipyardLevel(item) }}</span> -->
        {$_(`factions_${ship.faction}_name`)}
      </span>
    </div>
  </ListItem>
</a>
