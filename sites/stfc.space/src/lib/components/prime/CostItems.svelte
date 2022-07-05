<script lang="ts" context="module">
  const tippy = createTippy({
    duration: 0,
    arrow: true,
    delay: [250, 50],
    offset: [0, 3],
    followCursor: 'horizontal',
    plugins: [followCursor],
    hideOnClick: false
  });
</script>

<script lang="ts">
  import type { BuildCost, Rarity } from '$lib/shared/yuki/models';

  import { number, _ } from 'svelte-i18n';
  import { createTippy } from 'svelte-tippy';
  import { followCursor } from 'tippy.js';

  import ResourceText from './ResourceText.svelte';

  export let costs: (BuildCost & { resource_id: number; rarity: Rarity })[];

  let copied = false;
  const copyToClipboard = (v: number | string) => {
    copied = true;
    navigator.clipboard.writeText(v.toString());
    setTimeout(() => {
      copied = false;
    }, 500);
  };
</script>

{#each costs as cost (cost.resource_id)}
  <div class="flex cursor-default">
    <div
      class="w-fit flex gap-x-2"
      use:tippy={{
        arrow: !copied,
        content: copied ? 'Copied' : $_('prime.copy_cost')
      }}
      on:click={() => copyToClipboard(cost.amount)}
    >
      <span class="text-right font-bold w-[10ch]"
        >{cost.amount < 100000
          ? $number(cost.amount)
          : $number(cost.amount, {
              notation: 'compact',
              minimumSignificantDigits: 1,
              maximumSignificantDigits: 3,
              compactDisplay: 'short'
            })}</span
      >
      <div>
        <ResourceText resource={cost} />
      </div>
    </div>
  </div>
{/each}
