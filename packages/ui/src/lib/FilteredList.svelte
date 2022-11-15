<script lang="ts">
	import List from './List.svelte';

	type X = $$Generic; // any

	export let items: (X & { id: unknown; link?: string })[];
	export let pageIndex = 0;
</script>

<div class="flex flex-col w-full gap-y-4 max-w-[100vw]">
	<slot name="filter" />
	<List {items} let:item bind:pageIndex>
		<slot name="item" {item} />
	</List>
</div>
