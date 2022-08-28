<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  import { _ } from 'svelte-i18n';

  import type { Research } from '$lib/shared/yuki/models';

  import { FilteredList, TextInput } from '@radion/ui';
  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import ResearchList from '$lib/components/prime/ResearchList.svelte';
  import ResearchTreeDropdown from '$lib/components/prime/ResearchTreeDropdown.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';
  import { search } from '$lib/shared/search';
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import { debounce } from 'lodash-es';
  import { onDestroy } from 'svelte';

  import type { PageData } from './$types';
  export let data: PageData;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: data.queryStore.readField('name'),
        tree: data.queryStore.readField('t')
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
    data.queryStore.updateField('t', filters.tree);
    data.queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredResearches = $search(filters.name, 'research', data.researches);
  $: {
    const filterResearches = (filter: { tree: number }, research: Research) => {
      if (filter.tree != -1 && research.research_tree != filter.tree) {
        return false;
      }
      return true;
    };
    filteredResearches = filteredResearches.filter((x) => filterResearches(filters, x));
  }
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.researches')}`} />

<FilteredList items={filteredResearches} let:item>
  <div slot="filter">
    <div class="flex items-center gap-x-2">
      <FilterContainer>
        <TextInput
          bind:value={filters.name}
          class="px-2 h-8"
          placeholder={$_('filter.text-filter')}
        />
        <ResearchTreeDropdown bind:value={filters.tree} />
      </FilterContainer>
      <ResetFilterButton on:click={resetFilters} />
    </div>
  </div>
  <ResearchList slot="item" research={item} />
</FilteredList>
