<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import { _ } from 'svelte-i18n';

  import type { System } from '$lib/shared/yuki/models';

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

  import type { PageData } from './$types';
  export let data: PageData;

  let systemsWithHostileTypes = data.systems.map((x) => {
    return {
      ...x,
      hostile_types: systemHostileTypes(x)
    };
  });

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: data.queryStore.readField('name'),
        page: data.queryStore.readField('page') - 1,
        faction: data.queryStore.readField('faction'),
        mining: data.queryStore.readField('mining'),
        housing: data.queryStore.readField('housing'),
        missions: data.queryStore.readField('missions'),
        scout: data.queryStore.readField('scout'),
        ds: data.queryStore.readField('ds'),
        warp: data.queryStore.readField('warp'),
        level: data.queryStore.readField('level'),
        resources: data.queryStore.readField('resources'),
        hostiles: data.queryStore.readField('hostiles')
      }
    );
  };
  let filters = readFiltersFromQuery();
  const resetFilters = () => {
    data.queryStore.resetToDefault();
    data.queryStore.submitQuery();
    filters = readFiltersFromQuery();
  };

  onDestroy(
    page.subscribe((page) => {
      data.queryStore.setQuery(page.url.searchParams, true);
      filters = readFiltersFromQuery();
    })
  );

  const updateQuery = debounce((..._args) => {
    data.queryStore.updateField('name', filters.name);
    data.queryStore.updateField('page', filters.page + 1);
    data.queryStore.updateField('faction', filters.faction);
    data.queryStore.updateField('mining', filters.mining);
    data.queryStore.updateField('housing', filters.housing);
    data.queryStore.updateField('missions', filters.missions);
    data.queryStore.updateField('scout', filters.scout);
    data.queryStore.updateField('ds', filters.ds);
    data.queryStore.updateField('level', filters.level);
    data.queryStore.updateField('warp', filters.warp);
    data.queryStore.updateField('resources', filters.resources);
    data.queryStore.updateField('hostiles', filters.hostiles);
    data.queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredSystems = $search(filters.name, 'systems', systemsWithHostileTypes);
  $: {
    filteredSystems = filteredSystems.filter((system) => {
      return filterSystems(filters, system);
    });
    // .sort((a: any, b: any) => sortSystems(sort, a, b) || 0);
  }
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.systems')}`} />

<FilteredList items={filteredSystems} let:item bind:pageIndex={filters.page}>
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
