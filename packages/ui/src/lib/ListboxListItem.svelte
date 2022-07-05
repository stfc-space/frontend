<script lang="ts">
	export let highlighted = false;
</script>

<li
	class="group !hover:text-white hover:bg-indigo-600 cursor-default select-none relative py-2 pl-3 pr-9"
	class:text-indigo-600={highlighted}
	class:dark:text-indigo-500={highlighted}
	on:click
	on:mouseover
	on:focus
	role="option"
>
	<slot />
</li>
