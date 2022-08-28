<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  import { onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { debounce } from 'lodash-es';

  import { ItemType } from '$lib/shared/yuki/models';

  import { search } from '$lib/shared/search';

  import { NumberInput, FilteredList, TextInput, Slider, Listbox } from '@radion/ui';
  import FactionDropdown from '$lib/components/prime/FactionDropdown.svelte';
  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';
  import MissionList from '$lib/components/prime/MissionList.svelte';
  import MetaHeader from '$lib/components/MetaHeader.svelte';

  import type { PageData } from './$types';

  export let data: PageData;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: data.queryStore.readField('name'),
        res: data.queryStore.readField('r'),
        minw: data.queryStore.readField('w')?.[0],
        maxw: data.queryStore.readField('w')?.[1],
        mincw: data.queryStore.readField('cw')?.[0],
        maxcw: data.queryStore.readField('cw')?.[1],
        faction: data.queryStore.readField('f')
      }
    );
  };
  let filters = readFiltersFromQuery();
  const resetFilters = () => {
    data.queryStore.resetToDefault();
    data.queryStore.submitQuery();
    filters = readFiltersFromQuery();
    warpRange = [filters.minw, filters.maxw];
    warpRangeCompletion = [filters.mincw, filters.maxcw];
  };

  onDestroy(
    page.subscribe((page) => {
      data.queryStore.setQuery(page.url.searchParams, true);
      filters = readFiltersFromQuery();
    })
  );

  const updateQuery = debounce((..._args) => {
    data.queryStore.updateField('name', filters.name);
    data.queryStore.updateField('r', filters.res);
    data.queryStore.updateField('w', [filters.minw, filters.maxw]);
    data.queryStore.updateField('cw', [filters.mincw, filters.maxcw]);
    data.queryStore.updateField('f', filters.faction);
    data.queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredMissions = $search(filters.name, 'missions', data.missions).filter((mission) => {
    if (filters.faction !== -2 && filters.faction !== -1 && mission.faction != filters.faction) {
      return false;
    }

    if (filters.faction === -2 && mission.faction !== -1) {
      return false;
    }

    if (mission.warp < filters.minw) {
      return false;
    } else if (mission.warp > filters.maxw) {
      return false;
    }

    if (mission.warp_for_completion < filters.mincw) {
      return false;
    } else if (mission.warp_for_completion > filters.maxcw) {
      return false;
    }

    if (filters.res !== -1 && !mission.total_rewards.find((x) => x.resource_id == filters.res)) {
      return false;
    }

    return true;
  });

  $: missionRewards = (() => {
    const eventResources = data.allRewards.map((res) => {
      let name = res.type.toString();
      switch (res.type) {
        case ItemType.Blueprint: {
          name = $_(`blueprints_${res.id}_blueprint_name`);
          break;
        }
        case ItemType.Consumable: {
          name = $_(`consumables_${res.id}_name`);
          break;
        }
        case ItemType.Resource: {
          name = $_(`materials_${res.id}_name`);
          break;
        }
        case ItemType.OfficerShard: {
          name = $_(`officers_${res.id}_name`);
          break;
        }
        case ItemType.Cosmetic: {
          name = $_(`avatars_${res.id}_name`);
        }
      }
      return {
        name: name,
        value: res.id
      };
    });
    return [{ name: $_('filter.any'), value: -1 }].concat(
      eventResources.sort((a, b) => a.name.localeCompare(b.name))
    );
  })();

  let warpRange = [filters.minw, filters.maxw];
  let warpRangeCompletion = [filters.mincw, filters.maxcw];

  const updateWarpFilter = debounce((v: number[]) => {
    filters.minw = v[0];
    filters.maxw = v[1];
  }, 100);

  const updateWarpCompletionFilter = debounce((v: number[]) => {
    filters.mincw = v[0];
    filters.maxcw = v[1];
  }, 100);
  $: {
    updateWarpFilter(warpRange);
  }
  $: {
    updateWarpCompletionFilter(warpRangeCompletion);
  }
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.missions')}`} />

<FilteredList items={filteredMissions} let:item>
  <div slot="filter">
    <div class="flex items-center gap-x-2 bg-light-300 dark:bg-dark-900 p-2 rounded shadow">
      <FilterContainer>
        <div class="sm:(col-start-1 row-start-1) flex gap-2 flex-wrap">
          <div class="w-full sm:w-auto">
            <span class="text-sm">{$_('filter.name')}</span>
            <TextInput
              bind:value={filters.name}
              class="px-2 h-8 w-full"
              placeholder={$_('filter.text-filter')}
            />
          </div>
          <FactionDropdown class="mt-auto" bind:value={filters.faction} />

          <div>
            <span class="text-sm">{$_('filter.reward')}</span>
            <Listbox key="value" bind:value={filters.res} options={missionRewards} />
          </div>
        </div>
        <div class="sm:(col-start-2 row-start-1) flex flex-wrap gap-2 items-center">
          <div class="w-full">
            <span class="text-sm">{$_('mission.warp')}</span>
            <div class="items-center flex w-full">
              <NumberInput class="w-20" noButtons min={0} max={500} bind:value={warpRange[0]} />
              <Slider noTicks class="w-full" min="0" max="500" bind:value={warpRange} />
              <NumberInput class="w-20" noButtons min={0} max={500} bind:value={warpRange[1]} />
            </div>
          </div>

          <div class="w-full">
            <span class="text-sm">{$_('mission.warp_completion')}</span>
            <div class="items-center flex w-full">
              <NumberInput
                class="w-20"
                noButtons
                min={0}
                max={500}
                bind:value={warpRangeCompletion[0]}
              />
              <Slider noTicks class="w-full" min="0" max="500" bind:value={warpRangeCompletion} />
              <NumberInput
                class="w-20"
                noButtons
                min={0}
                max={500}
                bind:value={warpRangeCompletion[1]}
              />
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 sm:col-start-1" />
      </FilterContainer>
      <ResetFilterButton on:click={resetFilters} />
    </div>
  </div>
  <MissionList slot="item" mission={item} />
</FilteredList>
