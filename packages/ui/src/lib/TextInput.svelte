<script lang="ts">
	let clazz: string | null = null;
	export { clazz as class };

	export let placeholder = '';
	export let value = '';
	export let ref: HTMLInputElement | null = null;
	export let square = false;

	let extraClasses = `${square ? '' : 'rounded'}`;
</script>

<input
	bind:value
	bind:this={ref}
	{placeholder}
	type="text"
	class={`
min-w-0 outline-none border-1 min-h-8 border-light-900 dark:border-transparent
px-2
input-bg input-focus ${clazz || ''} ${extraClasses || ''}`}
	{...$$restProps}
/>
