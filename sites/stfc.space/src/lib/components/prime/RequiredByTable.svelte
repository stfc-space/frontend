<script context="module" lang="ts">
  export interface RequirementUiItem {
    id: string;
    link: string;
    name: string;
    icon: string;
    level: number;
    power: number;
  }
</script>

<script lang="ts">
  import { _ } from 'svelte-i18n';

  import { Table } from '@radion/ui';

  const requiredByTableHeaders = [
    {
      text: $_('prime.required_by_item'),
      icon: 'icon' as keyof RequirementUiItem,
      value: 'name' as keyof RequirementUiItem
    },
    {
      text: $_('prime.level'),
      value: 'level' as keyof RequirementUiItem,
      class: 'w-[10ch]'
    },
    {
      text: $_('prime.power'),
      value: 'power' as keyof RequirementUiItem,
      class: 'w-[15ch]'
    }
  ];

  export let items: RequirementUiItem[];
  export let sort = '';
</script>

<div class="flex flex-col mb-auto mx-auto max-w-full mt-4 w-full md:w-prose">
  <h3 class="text-center font-bold text-xl mb-2">{$_('building.required_by')}</h3>
  <Table
    sortable
    bind:sort
    headers={requiredByTableHeaders}
    {items}
    let:item
    let:header
    let:f
    let:value
  >
    <a sveltekit:prefetch href={String(item.link)} class="block class p-2">
      {#if header.icon}
        <img aria-hidden alt="" class="h-4 inline" src={String(item[header.icon])} />
      {/if}
      {f(header, value)}
    </a>
  </Table>
</div>
