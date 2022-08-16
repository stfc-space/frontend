<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';
  import type { PageData } from './$types';

  import { _ } from 'svelte-i18n';

  import type { Building } from '$lib/shared/yuki/models';

  import { TextInput, FilteredList } from '@radion/ui';

  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import BuildingList from '$lib/components/prime/BuildingList.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';
  import { search } from '$lib/shared/search';
  import { onDestroy } from 'svelte';
  import { debounce } from 'lodash-es';
  import MetaHeader from '$lib/components/MetaHeader.svelte';

  export let data: PageData;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: data.queryStore.readField('name')
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
    data.queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters.name);
    }
  }

  $: filteredBuildings = $search(filters.name, 'buildings', data.buildings);
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.buildings')}`} />

<FilteredList items={filteredBuildings} let:item>
  <div slot="filter">
    <div class="flex items-center gap-x-2">
      <FilterContainer>
        <TextInput
          bind:value={filters.name}
          class="px-2 h-8"
          placeholder={$_('filter.text-filter')}
        />
      </FilterContainer>
      <ResetFilterButton on:click={resetFilters} />
    </div>
  </div>
  <BuildingList slot="item" building={item} />
</FilteredList>
