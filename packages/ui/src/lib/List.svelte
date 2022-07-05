<script lang="ts">
	type X = $$Generic; // any

	interface $$Slots {
		default: { item: X & { id: unknown } };
	}

	import { _ } from 'svelte-i18n';

	import Pagination from './Pagination.svelte';

	export let items: (X & { id: unknown })[];
	export let pageSize = 20;
	export let pageIndex = 0;

	$: visibleItems = items.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
	$: {
		if (items.length < pageIndex * pageSize) {
			pageIndex = 0;
		}
	}
	const itemClass = 'item list-none h-16 !dark:hover:bg-dark-900 !hover:bg-light-500';
</script>

<div
	class="flex flex-col items-center w-full item-table panel px-2 mb-4 pt-2 rounded bg-light-300 dark:bg-dark-900"
>
	<!-- <Pagination bind:pageIndex page={pageIndex + 1} totalItems={items.length} /> -->
	<ul class="dark:bg-dark-400 bg-light-200 w-full overflow-hidden shadow">
		{#each visibleItems as item (item.id)}
			<li
				class="{itemClass} even:bg-light-100 odd:bg-light-400 dark:even:bg-dark-600 dark:odd:bg-dark-800"
			>
				<slot {item} />
			</li>
		{/each}
		{#if visibleItems.length === 0}
			<li
				class="{itemClass} pointer-events-none select-none font-bold text-xl flex items-center justify-center"
			>
				{$_('list.no_results')}
			</li>
		{/if}
	</ul>
	<Pagination
		class="sticky bottom-0 pb-4 pt-4"
		bind:pageIndex
		page={pageIndex + 1}
		totalItems={items.length}
	/>
</div>
