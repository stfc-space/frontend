<script>
	export let wrap = false;
</script>

{#if wrap}
	<div {...$$restProps}>
		<slot />
	</div>
{:else}
	<slot />
{/if}
