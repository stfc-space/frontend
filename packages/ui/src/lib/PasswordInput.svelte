<script lang="ts">
	let clazz: string | undefined = undefined;
	export { clazz as class };

	export let placeholder = '';
	export let value = '';
</script>

<input
	bind:value
	{placeholder}
	type="password"
	class={`
min-w-0 outline-none border-1 min-h-8 border-light-900 dark:border-transparent rounded
px-2
input-bg ${clazz ?? ''}`}
	{...$$restProps}
/>
