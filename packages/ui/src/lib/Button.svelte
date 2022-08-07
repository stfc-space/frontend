<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { IconSource } from '@steeze-ui/svelte-icon/types';

	let clazz = '';
	export { clazz as class };

	export let iconLeft: IconSource | null = null;
	export let iconRight: IconSource | null = null;
	export let iconTheme = 'solid';
	export let iconClass = '';

	export let submit = false;
</script>

<button
	type={submit ? 'submit' : 'button'}
	class={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-indigo-200 dark:focus:ring-offset-indigo-800 focus:ring-indigo-600 dark:focus:ring-indigo-500 ${
		clazz || ''
	}`}
	on:click
	{...$$restProps}
>
	{#if iconLeft}
		<Icon src={iconLeft} theme={iconTheme} class="mr-2 -ml-0.5 h-4 w-4 {iconClass}" aria-hidden />
	{/if}
	<slot />
	{#if iconRight}
		<Icon src={iconRight} theme={iconTheme} class="ml-2 -mr-0.5 h-4 w-4 {iconClass}" aria-hidden />
	{/if}
</button>
