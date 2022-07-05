<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@steeze-ui/heroicons';

	import { Icon } from '@steeze-ui/svelte-icon';

	export let page = 1;
	export let pageIndex = 0;
	export let pageRange = 1;
	export let perPage = 20;
	export let totalItems = 200;
	let clazz: string | undefined = undefined;
	export { clazz as class };

	$: previousPage = page - 1;
	$: nextPage = page + 1;
	$: totalPages = Math.max(0, Math.ceil(totalItems / perPage) ?? 0);
	$: rangeStart = Math.max(1, Math.min(totalPages - pageRange * 2, Number(page) - pageRange));
	let rangeEnd: number;
	$: {
		let end = Number(page) + pageRange;
		if (page <= pageRange) {
			end += pageRange;
		}
		if (end - rangeStart > pageRange * 2) {
			end -= end - rangeStart - pageRange * 2;
		}
		rangeEnd = end < totalPages ? end : totalPages;
	}
	$: hasFirst = rangeStart > 1;
	$: hasLast = rangeEnd < totalPages;
	$: hasPrev = page > 1;
	$: hasNext = page < totalPages;
	$: rangeLength = rangeEnd - rangeStart + 1;
	$: visualRange = rangeLength + (hasLast ? 1 : 0) + (hasFirst ? 1 : 0);

	const pageBtnClsBg = 'bg-white dark:bg-dark-300';
	const pageBtnClsBorder =
		'border border-light-900 dark:border-dark-50 focus:ring-1 focus:ring-indigo-500 focus:z-10';
	const pageBtnClsText = 'text-sm font-medium text-dark-400 dark:text-light-500';
	const pageBtnClsHover = 'hover:bg-light-500 dark:hover:bg-dark-900';
	const pageBtnCls = `flex-1 ${pageBtnClsBg} ${pageBtnClsBorder} ${pageBtnClsText} ${pageBtnClsHover} outline-none focus:outline-none`;

	const changePage = (p: number) => {
		page = p;
		pageIndex = p - 1;
	};
</script>

<nav class="z-0 inline-flex rounded -space-x-px {clazz || ''}" aria-label="Pagination">
	<button
		class="px-2 py-2 text-sm font-medium rounded-l disabled:opacity-50 diabled:pointer-events-none {pageBtnCls}"
		disabled={!hasPrev}
		on:click|preventDefault={() => changePage(previousPage)}
	>
		<span class="sr-only">Previous</span>
		<Icon src={ChevronLeft} solid class="h-5 w-5" aria-hidden />
	</button>
	{#if hasFirst}
		<button
			on:click|preventDefault={() => changePage(1)}
			class="px-3 py-2 text-sm font-medium text-center {pageBtnCls}"
			class:bg-indigo-50={page == 1}
			class:dark:bg-indigo-900={page == 1}>1</button
		>
		{#if rangeStart > 2}
			<span
				class="px-1 py-2 text-sm font-medium {pageBtnCls} pointer-events-none"
				class:hidden={visualRange >= totalPages}>...</span
			>
		{/if}
	{/if}
	{#each { length: rangeLength } as _, p (p + rangeStart)}
		<button
			on:click|preventDefault={() => changePage(rangeStart + p)}
			class="px-3 py-2 text-sm font-medium text-center {pageBtnCls}"
			class:bg-indigo-50={page == rangeStart + p}
			class:dark:bg-indigo-900={page == rangeStart + p}>{rangeStart + p}</button
		>
	{/each}

	{#if hasLast}
		{#if rangeEnd + 1 < totalPages}
			<span
				class="px-1 py-2 text-sm font-medium {pageBtnCls} pointer-events-none"
				class:hidden={visualRange >= totalPages}>...</span
			>
		{/if}
		<button
			on:click|preventDefault={() => changePage(totalPages)}
			class:bg-indigo-50={page == totalPages}
			class:dark:bg-indigo-900={page == totalPages}
			class="px-3 py-2 text-sm font-medium {pageBtnCls}">{totalPages}</button
		>
	{/if}
	<button
		class="px-2 py-2 text-sm font-medium rounded-r disabled:opacity-50 diabled:pointer-events-none {pageBtnCls}"
		disabled={!hasNext}
		on:click|preventDefault={() => changePage(nextPage)}
	>
		<span class="sr-only">Next</span>
		<Icon src={ChevronRight} solid class="h-5 w-5" aria-hidden />
	</button>
</nav>
