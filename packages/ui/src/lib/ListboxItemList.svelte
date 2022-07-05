<script lang="ts">
	type X = $$Generic; // any

	export let items: X[];
</script>

<ul
	class="bg-light-50 dark:bg-dark-600 dark:text-light-50 w-full input-bg-color max-h-60 rounded-t rounded-b py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
>
	{#each items as item}
		<slot {item} />
	{/each}
	{#if items.length == 0}
		<li class="pl-3 pr-9">
			<span>No Results</span>
		</li>
	{/if}
</ul>
