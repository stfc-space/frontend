<script lang="ts" context="module">
  import { YukiApi } from '$lib/shared/api';
  import { waitLocale } from 'svelte-i18n';

  import type { LoadEvent } from '@sveltejs/kit/types';

  interface QueryParams {
    name: string;
    page: number;
    faction: number;
    mining: boolean;
    housing: boolean;
    missions: boolean;
    scout: boolean;
    ds: boolean;
    level: [number, number];
    warp: [number, number];
    resources: number[];
    hostiles: number[];
  }

  export async function load({ fetch, url }: LoadEvent) {
    const queryStore = new QueryStore<QueryParams>('systems');
    queryStore.addField('name', '');
    queryStore.addField('page', 1);
    queryStore.addField('faction', -1);
    queryStore.addField('mining', false);
    queryStore.addField('housing', false);
    queryStore.addField('missions', false);
    queryStore.addField('scout', false);
    queryStore.addField('ds', false);
    queryStore.addField('level', [0, 100]);
    queryStore.addField('warp', [0, 500]);
    queryStore.addField('resources', []);
    queryStore.addField('hostiles', []);
    queryStore.setQuery(url.searchParams, true);

    const query = queryStore.toQuery();
    if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
      return {
        status: 302,
        redirect: '?' + query.toString()
      };
    }

    try {
      let result: System[];
      await Promise.all([
        YukiApi.get('/system', undefined, fetch).then((e: System[]) => {
          result = e;
        }),
        waitLocale()
      ]);

      return {
        props: {
          systems: result,
          queryStore
        }
      };
    } catch (e) {
      return {
        status: e.status ?? 500,
        error: new Error(`Could not load ${e}`)
      };
    }
  }
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import { _ } from 'svelte-i18n';

  import type { System } from '$lib/shared/yuki/models';
  import { QueryStore } from '$lib/shared/queryStore';

  import { FilteredList, TextInput, Checkbox } from '@radion/ui';

  import FactionDropdown from '$lib/components/prime/FactionDropdown.svelte';
  import SystemList from '$lib/components/prime/SystemList.svelte';
  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';

  import { search } from '$lib/shared/search';

  import { filterSystems, systemHostileTypes } from './helpers';
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import { onDestroy } from 'svelte';
  import { debounce } from 'lodash-es';

  export let systems: System[] = [];
  export let queryStore: QueryStore<QueryParams>;

  let systemsWithHostileTypes = systems.map((x) => {
    return {
      ...x,
      hostile_types: systemHostileTypes(x)
    };
  });

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: queryStore.readField('name'),
        page: queryStore.readField('page') - 1,
        faction: queryStore.readField('faction'),
        mining: queryStore.readField('mining'),
        housing: queryStore.readField('housing'),
        missions: queryStore.readField('missions'),
        scout: queryStore.readField('scout'),
        ds: queryStore.readField('ds'),
        warp: queryStore.readField('warp'),
        level: queryStore.readField('level'),
        resources: queryStore.readField('resources'),
        hostiles: queryStore.readField('hostiles')
      }
    );
  };
  let filters = readFiltersFromQuery();
  const resetFilters = () => {
    queryStore.resetToDefault();
    queryStore.submitQuery();
    filters = readFiltersFromQuery();
  };

  onDestroy(
    page.subscribe((page) => {
      queryStore.setQuery(page.url.searchParams, true);
      filters = readFiltersFromQuery();
    })
  );

  const updateQuery = debounce((..._args) => {
    queryStore.updateField('name', filters.name);
    queryStore.updateField('page', filters.page + 1);
    queryStore.updateField('faction', filters.faction);
    queryStore.updateField('mining', filters.mining);
    queryStore.updateField('housing', filters.housing);
    queryStore.updateField('missions', filters.missions);
    queryStore.updateField('scout', filters.scout);
    queryStore.updateField('ds', filters.ds);
    queryStore.updateField('level', filters.level);
    queryStore.updateField('warp', filters.warp);
    queryStore.updateField('resources', filters.resources);
    queryStore.updateField('hostiles', filters.hostiles);
    queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredShips = $search(filters.name, 'systems', systemsWithHostileTypes);
  $: {
    filteredShips = filteredShips.filter((system) => {
      return filterSystems(filters, system);
    });
    // .sort((a: any, b: any) => sortSystems(sort, a, b) || 0);
  }
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.systems')}`} />

<FilteredList items={filteredShips} let:item bind:pageIndex={filters.page}>
  <div slot="filter">
    <div class="flex items-center gap-x-2">
      <FilterContainer>
        <TextInput bind:value={filters.name} class="px-2 h-8" placeholder="Filter" />
        <div class="flex flex-wrap gap-x-2 gap-y-2">
          <FactionDropdown bind:value={filters.faction} />
          <div class="flex flex-col gap-y-1">
            <Checkbox bind:checked={filters.housing}>{$_('systems.filter.has-housing')}</Checkbox>
            <Checkbox bind:checked={filters.missions}>{$_('systems.filter.has-missions')}</Checkbox>
            <Checkbox bind:checked={filters.ds}>{$_('systems.filter.is-deep-space')}</Checkbox>
          </div>
        </div>
      </FilterContainer>
      <ResetFilterButton on:click={resetFilters} />
    </div>
  </div>
  <SystemList slot="item" system={item} />
</FilteredList>
