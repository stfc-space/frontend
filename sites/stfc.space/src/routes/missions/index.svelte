<script lang="ts" context="module">
  import { YukiApi } from '$lib/shared/api';

  interface QueryParams {
    name: string;
    r: number;
    w: [number, number];
    cw: [number, number];
    f: number;
  }

  export async function load({ url, fetch }) {
    const queryStore = new QueryStore<QueryParams>('missions');
    queryStore.addField('name', '');
    queryStore.addField('w', [0, 500]);
    queryStore.addField('cw', [0, 500]);
    queryStore.addField('r', -1);
    queryStore.addField('f', -1);
    queryStore.setQuery(url.searchParams, true);

    const query = queryStore.toQuery();
    if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
      return {
        status: 302,
        redirect: '?' + query.toString()
      };
    }

    try {
      const result = await YukiApi.get<{ missions: Mission[]; all_rewards: InventoryReward[] }>(
        '/mission/rewards',
        undefined,
        fetch
      );
      return {
        props: {
          missions: result.missions,
          allRewards: result.all_rewards,
          queryStore
        }
      };
    } catch (e) {
      return {
        status: e.status || 500,
        error: new Error(`Could not load ${e}`)
      };
    }
  }
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import { onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { debounce } from 'lodash-es';

  import type { InventoryReward, Mission } from '$lib/shared/yuki/models';
  import { ItemType } from '$lib/shared/yuki/models';

  import { search } from '$lib/shared/search';
  import { QueryStore } from '$lib/shared/queryStore';

  import { NumberInput, FilteredList, TextInput, Slider, Listbox } from '@radion/ui';
  import FactionDropdown from '$lib/components/prime/FactionDropdown.svelte';
  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';
  import MissionList from '$lib/components/prime/MissionList.svelte';
  import MetaHeader from '$lib/components/MetaHeader.svelte';

  export let missions: Mission[] = [];
  export let allRewards: InventoryReward[] = [];
  export let queryStore: QueryStore<QueryParams>;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: queryStore.readField('name'),
        res: queryStore.readField('r'),
        minw: queryStore.readField('w')?.[0],
        maxw: queryStore.readField('w')?.[1],
        mincw: queryStore.readField('cw')?.[0],
        maxcw: queryStore.readField('cw')?.[1],
        faction: queryStore.readField('f')
      }
    );
  };
  let filters = readFiltersFromQuery();
  const resetFilters = () => {
    queryStore.resetToDefault();
    queryStore.submitQuery();
    filters = readFiltersFromQuery();
    warpRange = [filters.minw, filters.maxw];
    warpRangeCompletion = [filters.mincw, filters.maxcw];
  };

  onDestroy(
    page.subscribe((page) => {
      queryStore.setQuery(page.url.searchParams, true);
      filters = readFiltersFromQuery();
    })
  );

  const updateQuery = debounce((..._args) => {
    queryStore.updateField('name', filters.name);
    queryStore.updateField('r', filters.res);
    queryStore.updateField('w', [filters.minw, filters.maxw]);
    queryStore.updateField('cw', [filters.mincw, filters.maxcw]);
    queryStore.updateField('f', filters.faction);
    queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredMissions = $search(filters.name, 'missions', missions).filter((mission) => {
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
    const eventResources = allRewards.map((res) => {
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
