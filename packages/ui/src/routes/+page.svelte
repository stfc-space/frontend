<script lang="ts">
	import Listbox from '$lib/Listbox.svelte';

	let listBoxOptions = [{ name: 'Test', value: 1 }];
	let listboxValue = listBoxOptions[0];
</script>

<div class="flex gap-2 max-w-prose">
	<div class="dark bg-light-50 text-dark-700 p-2">
		<div class="flex flex-col gap-y-2">
			<Listbox value={listboxValue} options={listBoxOptions} />
		</div>
	</div>
</div>
