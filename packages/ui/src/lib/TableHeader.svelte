<script lang="ts">
	export let sortable = false;
	export let sorted = false;
	export let asc = false;
	export let dsc = false;
	let clazz = '';
	export { clazz as class };

	export let text: string;
</script>

<th
	on:click
	scope="col"
	class:sortable
	class:cursor-pointer={sortable}
	class:select-none={sortable}
	class:sorted
	class:asc
	class:dsc
	class="px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider {clazz}"
	><span class:sortable>{text}</span>
</th>

<style>
	th.sortable {
		position: relative;
		padding-right: 20px;
	}

	th.sortable::before,
	.sortable::after {
		border: 5px solid transparent;
		content: '';
		display: block;
		height: 0;
		right: 5px;
		top: 60%;
		position: absolute;
		width: 0;
	}

	th.sortable::before {
		border-bottom-color: #444;
		margin-top: -13px;
	}
	th.sortable::after {
		margin-top: 1px;
		border-top-color: #444;
	}

	th.sortable.sorted.asc::before {
		border-bottom-color: #eee;
	}
	th.sortable.sorted.dsc::after {
		border-top-color: #eee;
	}
</style>
