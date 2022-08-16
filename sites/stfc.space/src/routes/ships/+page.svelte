<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import { _ } from 'svelte-i18n';

  import { filterRarity } from '$lib/shared/yuki/models';

  import ShipList from '$lib/components/prime/ShipList.svelte';

  import { FilteredList, TextInput } from '@radion/ui';

  import RarityDropdown from '$lib/components/prime/RarityDropdown.svelte';
  import GradeDropdown from '$lib/components/prime/GradeDropdown.svelte';
  import FactionDropdown from '$lib/components/prime/FactionDropdown.svelte';
  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';
  import { search } from '$lib/shared/search';
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import { onDestroy } from 'svelte';
  import { debounce } from 'lodash-es';

  import type { PageData } from './$types';
  export let data: PageData;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: data.queryStore.readField('name'),
        rarity: data.queryStore.readField('r'),
        faction: data.queryStore.readField('f'),
        grade: data.queryStore.readField('g')
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
    data.queryStore.updateField('g', filters.grade);
    data.queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredShips = $search(filters.name, 'ships', data.ships);
  $: {
    filteredShips = filteredShips.filter((ship) => {
      const filterGrade = (grade: number) => {
        if (filters.grade == -1) {
          return true;
        }
        return filters.grade == grade;
      };

      return (
        filterGrade(ship.grade) &&
        filterRarity(filters.rarity, ship.rarity) &&
        (filters.faction === -1 ||
          filters.faction === ship.faction ||
          (filters.faction === -2 && ship.faction === -1))
      );
    });
  }
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.ships')}`} />

<FilteredList items={filteredShips} let:item>
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
          <GradeDropdown bind:value={filters.grade} />
          <RarityDropdown bind:value={filters.rarity} />
        </div>
      </FilterContainer>
      <ResetFilterButton on:click={resetFilters} />
    </div>
  </div>
  <ShipList slot="item" ship={item} />
</FilteredList>
