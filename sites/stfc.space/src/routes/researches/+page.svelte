<script lang="ts" context="module">
  import { YukiApi } from '$lib/shared/api';
  import { waitLocale } from 'svelte-i18n';

  import type { LoadEvent } from '@sveltejs/kit/types';

  interface QueryParams {
    name: string;
    t: number;
  }

  export async function load({ fetch, url }: LoadEvent) {
    const queryStore = new QueryStore<QueryParams>('researches');
    queryStore.addField('name', '');
    queryStore.addField('t', -1);
    queryStore.setQuery(url.searchParams, true);

    const query = queryStore.toQuery();
    if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
      return {
        status: 302,
        redirect: '?' + query.toString()
      };
    }

    try {
      let result: Research[];
      await Promise.all([
        YukiApi.get('/research', undefined, fetch).then((e: Research[]) => {
          result = e;
        }),
        waitLocale()
      ]);

      return {
        props: {
          researches: result,
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

  import type { Research } from '$lib/shared/yuki/models';
  import { QueryStore } from '$lib/shared/queryStore';

  import { FilteredList, TextInput } from '@radion/ui';
  import ResetFilterButton from '$lib/components/ResetFilterButton.svelte';
  import ResearchList from '$lib/components/prime/ResearchList.svelte';
  import ResearchTreeDropdown from '$lib/components/prime/ResearchTreeDropdown.svelte';
  import FilterContainer from '$lib/components/FilterContainer.svelte';
  import { search } from '$lib/shared/search';
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import { debounce } from 'lodash-es';
  import { onDestroy } from 'svelte';

  export let researches: Research[] = [];
  export let queryStore: QueryStore<QueryParams>;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        name: queryStore.readField('name'),
        tree: queryStore.readField('t')
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
    queryStore.updateField('t', filters.tree);
    queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  $: filteredResearches = $search(filters.name, 'research', researches);
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
