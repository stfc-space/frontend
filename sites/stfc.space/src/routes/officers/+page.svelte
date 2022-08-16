<script lang="ts" context="module">
  import { YukiApi } from '$lib/shared/api';
  import { waitLocale } from 'svelte-i18n';

  import type { LoadEvent } from '@sveltejs/kit/types';

  interface QueryParams {
    name: string;
    r: number;
    g: number;
    f: number;
  }

  export async function load({ fetch, url }: LoadEvent) {
    const queryStore = new QueryStore<QueryParams>('officers');
    queryStore.addField('name', '');
    queryStore.addField('r', -1);
    queryStore.addField('g', -1);
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
      let result: Officer[];
      await Promise.all([
        YukiApi.get('/officer', undefined, fetch).then((e: Officer[]) => {
          result = e;
        }),
        waitLocale()
      ]);

      return {
        props: {
          officers: result,
          queryStore
        }
      };
    } catch (e) {
      return {
        status: e.status,
        error: new Error(`Could not load ${e}`)
      };
    }
  }
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import { _ } from 'svelte-i18n';

  import { filterRarity, Officer } from '$lib/shared/yuki/models';
  import { QueryStore } from '$lib/shared/queryStore';

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

  export let officers: Officer[] = [];
  export let queryStore: QueryStore<QueryParams>;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: queryStore.readField('name'),
        rarity: queryStore.readField('r'),
        group: queryStore.readField('g'),
        faction: queryStore.readField('f')
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
    queryStore.updateField('r', filters.rarity);
    queryStore.updateField('g', filters.group);
    queryStore.updateField('f', filters.faction);
    queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredOfficers = $search(filters.name, 'officers', officers);
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
      officers.map((o) => {
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
