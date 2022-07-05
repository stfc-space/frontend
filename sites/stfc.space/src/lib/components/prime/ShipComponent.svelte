<script lang="ts">
  import { getStaticData } from '$lib/shared/api';

  import type { ShipDetailComponent } from '$lib/shared/yuki/models';
  import { formatPrimeText, sortResourceList } from '$lib/shared/yuki/utils';

  import { number, _ } from 'svelte-i18n';
  import ResourceText from './ResourceText.svelte';

  export let component: ShipDetailComponent;
  export let tier: number | null = null;

  const { resources } = getStaticData();

  $: buildCost = sortResourceList(component.build_cost).map((e) => {
    return { rarity: $resources.get(e.resource_id).rarity, ...e };
  });
</script>

<div class="shadow w-48 lg:w-64 border rounded p-1">
  {formatPrimeText(tier ? $_(`ship_components_-1_component_tier_${tier}`) : '{0}', {
    vars: [$_(`ship_components_${component.loca_id}_name`)]
  })}

  {#each buildCost as cost (cost.resource_id)}
    <div class="flex gap-x-2 cursor-default">
      <span class="text-right font-bold w-1/3"
        >{cost.amount < 100000
          ? $number(cost.amount)
          : $number(cost.amount, {
              notation: 'compact',
              minimumSignificantDigits: 1,
              maximumSignificantDigits: 3,
              compactDisplay: 'short'
            })}</span
      >
      <div class="w-2/3">
        <ResourceText resource={cost} />
      </div>
    </div>
  {/each}
</div>
