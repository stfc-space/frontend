<script lang="ts">
  import { Rarity } from '$lib/shared/yuki/models';
  import { resourceThumb } from '$lib/shared/yuki/thumbs';

  import { _ } from 'svelte-i18n';

  export let resource: { resource_id: number; rarity: Rarity };
</script>

<img
  src={resourceThumb(resource.resource_id)}
  width="16"
  height="16"
  class="h-4 w-4 my-auto mr-1 inline select-none"
  alt=""
/>
{#if resource.rarity === Rarity.Common}
  <span class="inline text-white-500">{$_(`materials_${resource.resource_id}_name`)}</span>
{:else if resource.rarity === Rarity.Uncommon}
  <span class="inline text-green-500">{$_(`materials_${resource.resource_id}_name`)}</span>
{:else if resource.rarity === Rarity.Rare}
  <span class="inline text-blue-500">{$_(`materials_${resource.resource_id}_name`)}</span>
{:else if resource.rarity === Rarity.Epic}
  <span class="inline text-red-500">{$_(`materials_${resource.resource_id}_name`)}</span>
{/if}
