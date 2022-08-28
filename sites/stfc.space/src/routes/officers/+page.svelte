<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  import { _ } from 'svelte-i18n';

  import { AbilityFlag, filterRarity } from '$lib/shared/yuki/models';

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
        faction: data.queryStore.readField('f'),
        effect: data.queryStore.readField('e')
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
    data.queryStore.updateField('e', filters.effect);
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

      if (
        filters.effect != -1 &&
        officer.ability.flag != filters.effect &&
        officer.captain_ability.flag != filters.effect
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

  $: effectList = [
    {
      name: $_('officer.group-filter-all'),
      value: -1,
      display: false
    },
    {
      name: 'Warp Range',
      value: AbilityFlag.WarpRange
    },
    {
      name: 'Warp Speed',
      value: AbilityFlag.WarpSpeed
    },
    {
      name: 'Impulse Speed',
      value: AbilityFlag.ImpulseSpeed
    },
    {
      name: 'Cargo',
      value: AbilityFlag.CargoCapacity
    },
    {
      name: 'Protected Cargo',
      value: AbilityFlag.CargoProtection
    },
    {
      name: 'Mining Speed',
      value: AbilityFlag.MiningRate
    },
    {
      name: 'GIVE STATE (SPLIT UP [MORALE, BURNING, HULL BREACH])',
      value: AbilityFlag.AddState
    },
    {
      name: 'TODO: USES STATE',
      value: AbilityFlag.Invalid
    }
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
          <Dropdown
            label={$_('officer.effect')}
            filter
            key="value"
            options={effectList}
            bind:value={filters.effect}
          />
        </div>
      </FilterContainer>
      <ResetFilterButton on:click={resetFilters} />
    </div>
  </div>
  <OfficerList slot="item" officer={item} />
</FilteredList>
