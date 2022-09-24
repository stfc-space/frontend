<script context="module" lang="ts">
</script>

<script lang="ts">
	import { number } from 'svelte-i18n';
	import DivWrapper from './DivWrapper.svelte';

	import TableHeaderEntry from './TableHeader.svelte';

	type T = $$Generic;

	type ItemType = { id: unknown; __collapseRow?: boolean; text?: string } & T;
	interface TableHeader {
		text: string;
		value: keyof ItemType | string;
		percentage?: boolean;
		round?: boolean;
		icon?: keyof ItemType | string;
		class?: string;
		dense?: boolean;
	}

	interface TableHeader2 {
		text: string;
		value: keyof ItemType;
		percentage?: boolean;
		round?: boolean;
		icon?: keyof ItemType;
		class?: string;
		dense?: boolean;
	}

	export let fixed = false;
	export let full = true;
	export let sortable = false;
	export let headers: Array<TableHeader>;
	export let items: Array<ItemType>;
	export let sort = '';
	export let sticky = false;
	export let forcePadding = false;
	export let horizontal = false;

	let clazz = '';
	export { clazz as class };

	const f = (h: TableHeader, v: unknown): string => {
		if (typeof v == 'number') {
			if (h.round) v = Math.round(v);
			if (h.percentage) {
				return $number(v as number, { style: 'percent' });
			} else {
				return $number(v as number);
			}
		} else if (Array.isArray(v)) {
			if (typeof v[0] == 'number') {
				return v.map((x) => f(h, x)).join(' | ');
			}
			return v.join(' | ');
		} else if (typeof v === 'string') {
			return v ?? '';
		} else {
			return '';
		}
	};

	let sortField: keyof ItemType | null = null;
	let sortAsc = false;
	$: sortedItems = sortField
		? items.sort((a, b) => {
				let aV = a[sortField ?? 'id'];
				let bV = b[sortField ?? 'id'];
				if (typeof aV === 'number' && typeof bV === 'number') {
					return (aV - bV) * (sortAsc ? 1 : -1);
				} else if (typeof aV === 'string' && typeof bV === 'string') {
					return aV.localeCompare(bV) * (sortAsc ? 1 : -1);
				}
				return 0;
		  })
		: items;

	$: {
		let sortParts = sort?.split('_');
		if (sortParts?.length == 2) {
			sortField = sortParts[0] as keyof ItemType;
			sortAsc = sortParts[1] == 'asc';
		}
	}

	const changeSort = (field: keyof ItemType | string) => {
		if (!sortable) {
			return;
		}
		if (sortField == field) {
			sortAsc = !sortAsc;
		} else {
			sortField = field as keyof ItemType;
		}
		sort = `${String(sortField)}_${sortAsc ? 'asc' : 'dsc'}`;
	};

	$: tableClass = horizontal ? 'divide-x divide-gray-200 dark:divide-gray-500 flex' : 'relative';
	$: headers2 = headers as unknown as Array<TableHeader2>;
</script>

<div
	class="min-h-fit overflow-auto rounded {clazz}"
	class:max-h-lg={sticky}
	class:w-full={full}
	class:max-w-min={horizontal}
>
	<table class={tableClass} class:w-full={!horizontal} class:md:table-fixed={fixed}>
		<DivWrapper wrap={horizontal} class="divide-x divide-light-200 dark:divide-dark-100 flex">
			<thead
				class="bg-table-header bg-light-900 dark:bg-dark-400"
				class:sticky
				class:top-0={!horizontal}
				class:left-0={horizontal}
			>
				<tr
					class={horizontal
						? 'flex flex-col justify-center divide-y bg-table-header bg-light-900 dark:bg-dark-400 divide-light-200 dark:divide-dark-100 h-full'
						: ''}
				>
					{#each headers as header (header.text)}
						<TableHeaderEntry
							on:click={() => changeSort(header.value)}
							sorted={sortField === header.value}
							asc={sortField === header.value && sortAsc}
							dsc={sortField === header.value && !sortAsc}
							class={header.class}
							text={header.text}
							{sortable}
						/>
					{/each}
				</tr>
			</thead>
			<tbody x-max="1" class:flex={horizontal} class:flex-row={horizontal}>
				{#each sortedItems as item (item.id)}
					<tr
						class="even:bg-light-100 odd:bg-light-400 dark:even:bg-dark-600 dark:odd:bg-dark-800 border-transparent hover:border-indigo-200
							{horizontal
							? 'flex flex-col divide-y divide-light-200 dark:divide-dark-100 border-y-5'
							: 'border-l-5'}"
					>
						{#if item.__collapseRow}
							<td class="text-center font-bold" colspan={headers.length}>{item.text}</td>
						{:else}
							{#each headers2 as header (header.text ?? header.value)}
								<td
									class="whitespace-nowrap text-md dark:text-gray-100 tabular-nums"
									class:p-2={!$$slots.default}
									class:p-1={forcePadding}
									class:text-right={!horizontal}
									class:text-center={horizontal}
									class:dense={header.dense}
								>
									<slot {header} value={item[header.value]} {item} {f}>
										{#if header.icon}
											<img aria-hidden alt="" class="h-4 inline" src={String(item[header.icon])} />
										{/if}
										{f(header, item[header.value])}
									</slot>
								</td>
							{/each}
						{/if}
					</tr>
				{/each}
			</tbody>
		</DivWrapper>
	</table>
</div>

<style>
	.dense {
		width: 0.1%;
		white-space: nowrap;
	}
</style>
