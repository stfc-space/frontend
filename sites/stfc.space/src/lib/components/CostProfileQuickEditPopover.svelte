<script lang="ts" context="module">
  export interface GameProfileBuffConfig {
    level: number;
    research: { [key: string | number]: number };
    buildings: { [key: string | number]: number };
    officers: { [key: string | number]: [number, number] };
    syndicate_level: number;
    exocomps: number[];
  }
</script>

<script lang="ts">
  import { getStaticData } from '$lib/shared/api';
  import { Checkbox, Slider, Button } from '@radion/ui';

  import { LightningBolt } from '@steeze-ui/heroicons';
  import { clickOutside } from '$lib/clickOutside';
  import { _ } from 'svelte-i18n';

  import type { BuffModifier } from './prime/BuildCost.svelte';

  const { buff_map, researches, buildings } = getStaticData();

  export let buffModifier: BuffModifier;

  export let buffConfig: GameProfileBuffConfig;

  let initalLoaded = false;
  onMount(() => {
    if (browser) {
      try {
        buffConfig = JSON.parse(window.localStorage.getItem(`buffs_${buffModifier}`));
      } catch {
        // EMPTY
      } finally {
        buffConfig = buffConfig ?? {
          level: 0,
          research: {},
          buildings: {},
          officers: {},
          syndicate_level: 0,
          exocomps: []
        };
      }
      if (!buffConfig?.research) {
        buffConfig.research = {};
      }
      if (!buffConfig?.buildings) {
        buffConfig.buildings = {};
      }
      initalLoaded = true;
    }
  });

  import { createPopperActions } from 'svelte-popperjs';
  import { browser } from '$app/env';
  import { onMount } from 'svelte';
  const [popperRef, popperContent] = createPopperActions({
    placement: 'auto',
    strategy: 'absolute',
    modifiers: [
      // { name: 'offset', options: { offset: [0, 8] } },
      {
        name: 'preventOverflow',
        options: {
          altAxis: true, // false by default
          mainAxis: true // true by default
        }
      }
    ]
  });

  const extraOpts = {};

  let showTooltip = false;

  $: buffs =
    $buff_map.get(buffModifier)?.filter((buff) => {
      // TODO(alexander): Filter out things that don't apply to this
      // specific cost set
      return true;
    }) ?? [];

  // TODO(alexander): Temp until we have profile stuff
  $: {
    if (browser && initalLoaded) {
      window.localStorage.setItem(`buffs_${buffModifier}`, JSON.stringify(buffConfig));
    }
  }
</script>

<div use:popperRef>
  <Button
    iconRight={LightningBolt}
    iconTheme="solid"
    iconClass="text-yellow-500"
    class="dark:bg-dark-200 dark:hover:bg-dark-300 dark:text-light-700 text-dark-700 bg-light-200 color-light-500 hover:bg-light-300 py-1.5"
    on:click={() => {
      showTooltip = !showTooltip;
    }}
  >
    {$_('costprofile')}
  </Button>
</div>

{#if showTooltip}
  <div
    id="tooltip"
    class="z-60"
    use:popperContent={extraOpts}
    use:clickOutside={() => (showTooltip = false)}
  >
    <div
      class="rounded bg-light-500 dark:bg-dark-500 p-4 m-2 max-h-screen border border-purple-800 shadow"
    >
      {#if initalLoaded}
        {#each buffs as buff}
          <div class="w-full">
            {#if buff.source == 1}
              <span class="flex items-center gap-x-4">
                <Checkbox>
                  <span>{$_(`consumables_${buff.id}_name`)}</span>
                </Checkbox>
              </span>
            {:else if buff.source == 2}
              <span
                >{$_(`buildings_${buff.id}_name`)} ({buffConfig?.buildings?.[buff.id] ?? 0})</span
              >
              <Slider
                min={0}
                max={$buildings.get(buff.id)?.max_level ?? 0}
                bind:value={buffConfig.research[buff.id]}
              />
            {:else if buff.source == 3}
              <span>{$_(`research_${buff.id}_name`)} ({buffConfig?.research?.[buff.id] ?? 0})</span>
              <Slider
                min={0}
                max={$researches.get(buff.id)?.max_level ?? 0}
                bind:value={buffConfig.research[buff.id]}
              />
            {/if}
          </div>
        {/each}
      {/if}
    </div>
    <div id="arrow" data-popper-arrow />
  </div>
{/if}
