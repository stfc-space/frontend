<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import { _ } from 'svelte-i18n';

  import { filterRarity, Hostile } from '$lib/shared/yuki/models';

  import HostileList from '$lib/components/prime/HostileList.svelte';

  import { TextInput, FilteredList } from '@radion/ui';
  import RarityDropdown from '$lib/components/prime/RarityDropdown.svelte';
  import FactionDropdown from '$lib/components/prime/FactionDropdown.svelte';
  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';
  import { search } from '$lib/shared/search';
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import { onDestroy } from 'svelte';
  import { debounce } from 'lodash-es';

  import type { PageData } from './$types';
  export let data: PageData;

  let hostilesWithRep = data.hostiles.map((x) => {
    return {
      ...x,
      link: '/hostiles/' + x.id,
      rep:
        x.resources?.filter(
          (x) =>
            x.resource_id == 970475396 || x.resource_id == 156323681 || x.resource_id == 4135751670
        ) ?? []
    };
  });

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: data.queryStore.readField('name'),
        rarity: data.queryStore.readField('r'),
        faction: data.queryStore.readField('f')
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
    data.queryStore.updateField('r', filters.rarity);
    data.queryStore.updateField('f', filters.faction);
    data.queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredHostiles = $search(filters.name, 'hostiles', hostilesWithRep);
  $: {
    filteredHostiles = filteredHostiles.filter((ship) => {
      return (
        filterRarity(filters.rarity, ship.rarity) &&
        (filters.faction === -1 ||
          filters.faction === ship.faction ||
          (filters.faction === -2 && ship.faction === -1))
      );
    });
  }
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.hostiles')}`} />

<FilteredList items={filteredHostiles} let:item>
  <div slot="filter">
    <div class="flex items-center gap-x-2">
      <FilterContainer>
        <TextInput
          bind:value={filters.name}
          class="px-2 h-8"
          placeholder={$_('filter.text-filter')}
        />
        <div class="flex flex-wrap gap-x-2 gap-y-2">
          <FactionDropdown bind:value={filters.faction} />
          <RarityDropdown bind:value={filters.rarity} />
        </div>
      </FilterContainer>
      <ResetFilterButton on:click={resetFilters} />
    </div>
  </div>
  <HostileList slot="item" hostile={item} />
</FilteredList>
