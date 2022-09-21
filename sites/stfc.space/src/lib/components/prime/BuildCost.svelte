<script lang="ts" context="module">
  export enum BuffModifier {
    BuildingCost,
    BuildingSpeed,
    ResearchCost,
    ResearchSpeed,
    ComponentCost,
    ShipBuildSpeed,
    ShipBuildCost,
    ShipTierUpSpeed
  }
</script>

<script lang="ts">
  import { Clock } from '@steeze-ui/heroicons';
  import { Icon } from '@steeze-ui/svelte-icon';
  import { _ } from 'svelte-i18n';

  import 'tippy.js/dist/tippy.css'; // optional

  import { formatDuration } from '$lib/i18n/duration';
  import type { BuildCost, Rarity } from '$lib/shared/yuki/models';

  import type { RequirementUiItem } from './RequiredByTable.svelte';
  import CostItems from './CostItems.svelte';
  import { YukiApi } from '$lib/shared/api';
  import { throttle } from 'lodash-es';
  import CostProfileQuickEditPopover, {
    GameProfileBuffConfig
  } from '../CostProfileQuickEditPopover.svelte';

  export let time: number | null = null;
  export let costs: (BuildCost & { resource_id: number; rarity: Rarity })[];
  export let requirements: RequirementUiItem[] | null = null;
  export let multiRow = true;
  export let buffModifier: BuffModifier;

  let buffConfig: GameProfileBuffConfig;

  interface Constraints {
    condition: any[];
    resources?: number[];
  }

  interface FleetChange {
    value: number;
    chance: number;
    constraints: Constraints;
    operation: number;
    source: number;
  }

  let reductions: { [K in BuffModifier]?: FleetChange[] } = {};
  const resolveCostBuff = (
    buffs: { [K in BuffModifier]?: FleetChange[] },
    mod: BuffModifier,
    resource: number
  ) => {
    return (buffs[mod] ?? []).reduce((acc, b) => {
      if (b.constraints.resources?.includes(resource)) {
        return acc + b.value;
      } else {
        return acc;
      }
    }, 0.0);
  };

  // TODO(alexander): Test stuff
  const updatebuffConfig = throttle(
    (config) => {
      if (!config) {
        return;
      }
      YukiApi.post('/config/buffs/cost', config)
        .then((e) => {
          reductions = e as any;
        })
        .catch((e) => {
          console.error(e);
        });
    },
    250,
    { leading: true, trailing: true }
  );
  $: updatebuffConfig(buffConfig);

  // TODO(alexander): Figure out how to cache this
  // we _should_ be able to maintain a map of resource_id to reductions
  $: mappedCosts = costs.map((cost) => {
    const reduction = resolveCostBuff(reductions, buffModifier, cost.resource_id);
    return {
      ...cost,
      amount: Math.round(cost.amount / (1 + reduction))
    };
  });
</script>

{#if time}
  <div class="mx-auto mb-5 font-bold flex items-center">
    <Icon class="h-5 w-5 inline mr-1" src={Clock} /><span class="font-bold tabular-nums"
      >{formatDuration(time)}</span
    >
  </div>
{/if}
<div class="flex flex-col md:flex-row justify-between gap-y-4">
  <div class="flex flex-col mb-auto md:w-1/2 mr-1">
    <div>
      <h3 class="w-full inline-flex justify-center items-center gap-x-2 font-bold text-xl mb-2">
        {$_('building.costs')}
        <CostProfileQuickEditPopover bind:buffConfig {buffModifier} />
      </h3>
    </div>
    <div class="flex flex-col gap-y-2 ml-[calc(33.33%-10ch)]">
      <CostItems costs={mappedCosts} />
    </div>
  </div>
  {#if requirements}
    <div class="flex flex-col mb-auto mx-auto max-w-full">
      <h3 class="text-center font-bold text-xl mb-2">{$_('building.requirements')}</h3>
      <div
        class="justify-center grid {multiRow
          ? 'grid-rows-2'
          : 'grid-rows-1'} md:grid-rows-1 grid-cols-2 md:grid grid-cols-2 lg:grid-cols-3 gap-2"
      >
        {#each requirements as item (item.id)}
          <a href={item.link} class="rounded shadow w-[8rem] p-1 bg-light-600 dark:bg-dark-500">
            <div class="text-center h-[3rem] break-words" style={'hyphens: auto'}>
              {item.name}
            </div>
            <img class="h-14 mx-auto" aria-hidden="true" src={item.icon} alt="_" />
            {#if item.level}
              <div class="text-center">{$_('prime.level')}: {item.level}</div>
            {:else}
              <div class="text-center">{item.value}</div>
            {/if}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
