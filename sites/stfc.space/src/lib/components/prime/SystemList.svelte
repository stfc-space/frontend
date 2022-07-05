<script lang="ts">
  import { _ } from 'svelte-i18n';

  import type { System } from '$lib/shared/yuki/models';
  import { ListItem } from '@radion/ui';

  import housingIcon from '$lib/assets/icons/misc/housing.png';
  import missionIcon from '$lib/assets/icons/misc/mission.png';
  import deepSpaceIcon from '$lib/assets/icons/misc/deepspace.png';
  import { factionThumb, resourceThumb } from '$lib/shared/yuki/thumbs';

  export let system: System & {
    hostile_types: {
      int: boolean;
      bs: boolean;
      exp: boolean;
      arm: boolean;
      sur: boolean;
    };
  };
</script>

<a sveltekit:prefetch href="/systems/{system.id}">
  <ListItem>
    <div class="grid grid-rows-3 w-4 gap-1 col-start-1 sm:row-start-1 flex-shrink-0">
      <img
        src={housingIcon}
        class="object-contain"
        class:h-0={!system.has_player_containers}
        width="16"
        height="16"
        alt="has housing"
      />
      <img
        src={missionIcon}
        class="object-contain"
        class:h-0={!system.has_missions}
        width="16"
        height="16"
        alt="has mission"
      />
      <img
        src={deepSpaceIcon}
        class:h-0={!system.is_deep_space}
        class="object-contain"
        width="16"
        height="16"
        alt="is deep space"
      />
    </div>
    <div
      class="gap-x-1 sm:gap-x-1 items-center grid sm:grid-cols-[3.5rem,minmax(0,20ch),1fr] grid-cols-[2rem,10fr,1fr] grid-rows-2 sm:grid-rows-2"
    >
      <img
        class="h-8 sm:h-14 w-auto row-span-2 mb-auto sm:mx-auto justify-self-center"
        width="64"
        height="64"
        src={factionThumb(system.faction)}
        alt="system faction icon"
      />
      <span
        class="font-bold col-start-2 sm:row-start-1 sm:row-span-1 text-center flex items-center"
      >
        {$_(`systems_${system.id}_name`)}
      </span>
      <span class="flex col-start-3 row-start-1 gap-2 items-center w-20">
        {#each system.mine_resources as resource (resource)}
          <img
            src={resourceThumb(resource)}
            width="24"
            height="24"
            alt={$_(`materials_${resource}_name`)}
          />
        {/each}
      </span>
      <span class="text-sm whitespace-nowrap col-start-3 row-start-2"
        >Warp: <span class="font-bold">{system.est_warp}</span></span
      >
      <div
        class="col-start-2 sm:row-start-2 sm:row-span-1 grid grid-cols-5 grid-rows-2 h-4 w-24 gap-1 min-w-max"
      >
        <img
          src="$lib/assets/icons/ship_types/armada.png"
          class="object-contain h-4 w-4 fix-light-image"
          class:hidden={!system.hostile_types.arm}
          alt="Armada"
        />
        <img
          src="$lib/assets/icons/ship_types/battleship.png"
          class="object-contain h-4 w-4 fix-light-image"
          class:hidden={!system.hostile_types.bs}
          alt="Battleship"
        />
        <img
          src="$lib/assets/icons/ship_types/explorer.png"
          class="object-contain h-4 w-4 fix-light-image"
          class:hidden={!system.hostile_types.exp}
          alt="Explorer"
        />
        <img
          src="$lib/assets/icons/ship_types/interceptor.png"
          class="object-contain h-4 w-4 fix-light-image"
          class:hidden={!system.hostile_types.int}
          alt="Interceptor"
        />
        <img
          src="$lib/assets/icons/ship_types/survey.png"
          class="object-contain h-4 w-4 fix-light-image"
          class:hidden={!system.hostile_types.sur}
          alt="Survey"
        />
      </div>
    </div>
  </ListItem>
</a>
