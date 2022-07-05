<script lang="ts" context="module">
  import { YukiApi } from '$lib/shared/api';
  import { waitLocale } from 'svelte-i18n';

  import type { LoadEvent } from '@sveltejs/kit/types';

  interface QueryParams {
    name: string;
  }

  export async function load({ url, fetch }: LoadEvent) {
    const queryStore = new QueryStore<QueryParams>(`buildings`);
    queryStore.addField('name', '');
    queryStore.setQuery(url.searchParams, true);

    const query = queryStore.toQuery();
    if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
      return {
        status: 302,
        redirect: '?' + query.toString()
      };
    }

    try {
      let result: Building[];
      await Promise.all([
        YukiApi.get('/building', undefined, fetch).then((e: Building[]) => {
          result = e;
        }),
        waitLocale()
      ]);

      return {
        props: {
          buildings: result,
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

  import type { Building } from '$lib/shared/yuki/models';
  import { QueryStore } from '$lib/shared/queryStore';

  import { TextInput, FilteredList } from '@radion/ui';

  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import BuildingList from '$lib/components/prime/BuildingList.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';
  import { search } from '$lib/shared/search';
  import { onDestroy } from 'svelte';
  import { debounce } from 'lodash-es';
  import MetaHeader from '$lib/components/MetaHeader.svelte';

  export let buildings: Building[] = [];
  export let queryStore: QueryStore<QueryParams>;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: queryStore.readField('name')
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
    queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters.name);
    }
  }

  $: filteredBuildings = $search(filters.name, 'buildings', buildings);
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
