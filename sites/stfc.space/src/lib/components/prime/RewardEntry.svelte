<script lang="ts">
  import { getStaticData } from '$lib/shared/api';
  import { ItemType, Rarity, Reward } from '$lib/shared/yuki/models';
  import { officerThumb, resourceThumb, shipThumb } from '$lib/shared/yuki/thumbs';
  import { number, _ } from 'svelte-i18n';
  import { get } from 'svelte/store';
  import ResourceText from './ResourceText.svelte';

  export let reward: Reward;

  const { resources, officers, ships } = getStaticData();
</script>

<div class="w-fit flex gap-x-2">
  <span class="text-right font-bold w-[10ch]"
    >{reward.amount < 100000
      ? $number(reward.amount)
      : $number(reward.amount, {
          notation: 'compact',
          minimumSignificantDigits: 1,
          maximumSignificantDigits: 3,
          compactDisplay: 'short'
        })}</span
  >&#215;
  <div>
    {#if reward.type == ItemType.Resource}
      <ResourceText
        resource={{
          ...reward,
          rarity: $resources.get(reward.resource_id)?.rarity ?? Rarity.Base
        }}
      />
    {:else if reward.type == ItemType.Blueprint}
      <img
        src={shipThumb($ships.get(reward.resource_id)?.art_id)}
        width="16"
        height="16"
        class="h-4 w-4 my-auto mr-1 inline select-none"
        alt=""
      />
      {$_(`ships_${reward.resource_id}_name`)}
    {:else if reward.type == ItemType.Mission}
      {ItemType[reward.type]}
    {:else if reward.type == ItemType.Connection}
      {ItemType[reward.type]}
    {:else if reward.type == ItemType.Consumable}
      {ItemType[reward.type]}
    {:else if reward.type == ItemType.Officer || reward.type == ItemType.OfficerShard}
      <img
        src={officerThumb($officers.get(reward.resource_id)?.art_id)}
        width="16"
        height="16"
        class="h-4 w-4 my-auto mr-1 inline select-none"
        aria-hidden="true"
        alt=""
      />
      {$_(`officers_${reward.resource_id}_name`)}
    {:else if reward.type == ItemType.Cosmetic}
      {ItemType[reward.type]}
    {:else if reward.type == ItemType.Shield}
      {ItemType[reward.type]}
    {:else}
      {ItemType[reward.type]}
    {/if}
  </div>
</div>
