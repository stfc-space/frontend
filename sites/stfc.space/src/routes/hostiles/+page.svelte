<script lang="ts" context="module">
  import { YukiApi } from '$lib/shared/api';
  import { waitLocale } from 'svelte-i18n';

  interface QueryParams {
    name: string;
    r: number;
    f: number;
  }

  export async function load({ fetch, url }) {
    const queryStore = new QueryStore<QueryParams>('hostiles');
    queryStore.addField('name', '');
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
      let result: Hostile[];
      await Promise.all([
        YukiApi.get('/hostile', undefined, fetch).then((e: Hostile[]) => {
          result = e;
        }),
        waitLocale()
      ]);

      return {
        props: {
          hostiles: result,
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

  import { filterRarity, Hostile } from '$lib/shared/yuki/models';
  import { QueryStore } from '$lib/shared/queryStore';

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

  export let hostiles: Hostile[] = [];
  export let queryStore: QueryStore<QueryParams>;

  let hostilesWithRep = hostiles.map((x) => {
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
        name: queryStore.readField('name'),
        rarity: queryStore.readField('r'),
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
    queryStore.updateField('f', filters.faction);
    queryStore.submitQuery();
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
