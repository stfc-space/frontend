<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import { _ } from 'svelte-i18n';

  import { filterRarity, Officer } from '$lib/shared/yuki/models';

  import { FilteredList, TextInput, Dropdown } from '@radion/ui';

  import OfficerList from '$lib/components/prime/OfficerList.svelte';
  import RarityDropdown from '$lib/components/prime/RarityDropdown.svelte';
  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';

  import { uniqBy } from 'lodash-es';
  import { search } from '$lib/shared/search';
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import { debounce } from 'lodash-es';
  import { onDestroy } from 'svelte';
  import FactionDropdown from '$lib/components/prime/FactionDropdown.svelte';

  import type { PageData } from './$types';
  export let data: PageData;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: data.queryStore.readField('name'),
        rarity: data.queryStore.readField('r'),
        group: data.queryStore.readField('g'),
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
    data.queryStore.updateField('g', filters.group);
    data.queryStore.updateField('f', filters.faction);
    data.queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredOfficers = $search(filters.name, 'officers', data.officers);
  $: {
    filteredOfficers = filteredOfficers.filter((officer) => {
      if (filters.group != -1 && filters.group != officer.synergy_id) {
        return false;
      }
      if (
        !(
          filters.faction === -1 ||
          filters.faction === officer.faction ||
          (filters.faction === -2 && officer.faction === -1)
        )
      ) {
        return false;
      }
      return filterRarity(filters.rarity, officer.rarity);
    });
  }

  $: synergyGroups = [
    {
      name: $_('officer.group-filter-all'),
      value: -1,
      display: false
    },
    ...uniqBy(
      data.officers.map((o) => {
        return {
          name: $_(`officers_synergy_${o.synergy_id}_name`),
          value: o.synergy_id
        };
      }),
      'value'
    )
  ];
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.officers')}`} />

<FilteredList items={filteredOfficers} let:item>
  <div slot="filter">
    <div class="flex items-center gap-x-2 ">
      <FilterContainer>
        <TextInput
          bind:value={filters.name}
          class="px-2 h-8"
          placeholder={$_('filter.text-filter')}
        />
        <div class="flex flex-wrap gap-x-2 gap-y-2">
          <RarityDropdown bind:value={filters.rarity} />
          <FactionDropdown bind:value={filters.faction} />
          <Dropdown
            label={$_('officer.group')}
            filter
            key="value"
            options={synergyGroups}
            bind:value={filters.group}
          />
        </div>
      </FilterContainer>
      <ResetFilterButton on:click={resetFilters} />
    </div>
  </div>
  <OfficerList slot="item" officer={item} />
</FilteredList>
