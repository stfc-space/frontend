<script lang="ts">
	export let checked = false;
	let clazz: string | null = null;
	export { clazz as class };
</script>

<label class="inline-flex items-center gap-1">
	<input
		type="checkbox"
		bind:checked
		class="focus:ring-indigo-500 h-5 w-5 text-indigo-600 dark:text-indigo-600 border-light-900 rounded input-bg input-focus {clazz ||
			''}"
		{...$$restProps}
	/>
	<span class="select-none">
		<slot />
	</span>
</label>
