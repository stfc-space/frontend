<script lang="ts">
	import { tick } from 'svelte';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { Selector, Check } from '@steeze-ui/heroicons';

	import ListboxItemList from './ListboxItemList.svelte';
	import ListboxListItem from './ListboxListItem.svelte';

	type X = $$Generic; // any
	type OptionType = X & { name: string };

	let selection: OptionType | null | undefined = null;
	export let value: unknown;
	export let options: OptionType[] = [];
	export let key: keyof OptionType | undefined = undefined;
	let activeValue: OptionType | null = null;

	let buttonRef: HTMLInputElement;
	let optionsRef: HTMLUListElement;
	let textFilterRef: HTMLInputElement;
	let optionsContainerRef: HTMLDivElement;
	let isOpen = false;

	const keyedValue = (v: OptionType | null | undefined) => {
		if (!v) {
			return v;
		}
		return key ? v[key] : v;
	};

	let filterText = '';
	let filteredOptions = options;
	$: filterTextNormalized = filterText.toLocaleLowerCase();
	$: filteredOptions = options.filter((value) => {
		return (
			filterText.length == 0 ||
			value.name.toLocaleLowerCase().includes(filterTextNormalized) ||
			keyedValue(selection) === keyedValue(value)
		);
	});

	const focus = async (v: OptionType) => {
		activeValue = v;
		if (v !== null) {
			await tick();
			if (optionsRef && optionsRef.children[filteredOptions.indexOf(v)]) {
				optionsRef.children[filteredOptions.indexOf(v)].scrollIntoView({ block: 'nearest' });
			}
		}
	};

	$: if (activeValue && filteredOptions.indexOf(activeValue) === -1) {
		if (typeof document !== 'undefined' && document && textFilterRef === document?.activeElement) {
			focus(filteredOptions[0]);
		}
	}

	const filterChanged = (e: Event) => {
		const t = e.target as HTMLInputElement;
		filterText = t.value;
		if (!isOpen) {
			isOpen = true;
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (!isOpen) return;
		// if (textFilterRef === document.activeElement) return;
		const values = filteredOptions;
		let focusedIndex = values.indexOf(activeValue as OptionType);

		let indexToFocus: number;
		switch (e.key) {
			case 'Esc':
			case 'Escape':
				e.preventDefault();
				isOpen = false;
				break;
			case 'Tab':
				e.preventDefault();
				break;
			case 'Up':
			case 'ArrowUp':
				e.preventDefault();
				indexToFocus = focusedIndex - 1 < 0 ? values.length - 1 : focusedIndex - 1;
				focus(values[indexToFocus]);
				break;
			case 'Home':
				e.preventDefault();
				indexToFocus = 0;
				focus(values[indexToFocus]);
				break;
			case 'End':
				e.preventDefault();
				indexToFocus = values.length - 1;
				focus(values[indexToFocus]);
				break;
			case 'Down':
			case 'ArrowDown':
				e.preventDefault();
				indexToFocus = (focusedIndex + 1) % values.length;
				focus(values[indexToFocus]);
				break;
			case 'Enter':
				// case ' ':
				// case 'Space':
				if (textFilterRef !== document.activeElement || e.key === 'Enter') {
					e.preventDefault();
					select(activeValue);
				}
				break;
			default:
				break;
		}
	};

	const handleClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (!isOpen) return;

		if (buttonRef?.contains(target)) return;
		if (textFilterRef?.contains(target)) return;
		if (optionsContainerRef?.contains(target)) return;
		if (!optionsRef?.contains(target)) {
			event.preventDefault();
			event.stopPropagation();
			buttonRef.value = selection?.name ?? '';
			isOpen = false;
		}

		if (!event.defaultPrevented) buttonRef?.focus({ preventScroll: true });
	};

	const select = (v: OptionType | null) => {
		value = keyedValue(v);
		selection = v;
		isOpen = false;
	};

	$: selection = options ? options.find((x) => keyedValue(x) === value) : null ?? options[0];
</script>

<svelte:window on:keydown={handleKeydown} on:click={handleClick} />
<div class="relative w-72">
	<div>
		<input
			bind:this={buttonRef}
			on:click={() => ((isOpen = !isOpen), (filterText = ''))}
			class="relative w-full rounded input-bg input-focus pl-1 pr-10 text-left cursor-default sm:text-sm flex flex-wrap gap-x-1 items-center min-h-8"
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			role="listbox"
			value={selection ? selection?.name : null}
			placeholder="Please select an option"
			spellcheck="false"
			on:input={filterChanged}
		/>
		<span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
			<Icon src={Selector} solid class="w-5 h-5 dark:text-light-400" aria-hidden />
		</span>
	</div>
	{#if isOpen}
		<div bind:this={optionsContainerRef} class="absolute mt-1 w-full z-50 shadow-lg">
			<ListboxItemList let:item items={filteredOptions}>
				<ListboxListItem
					on:click={() => select(item)}
					on:mouseover={() => focus(item)}
					on:focus={() => focus(item)}
					highlighted={activeValue === item && keyedValue(selection) !== keyedValue(item)}
				>
					<slot
						{item}
						selected={keyedValue(selection) == keyedValue(item)}
						active={activeValue === item}
					>
						{item.name}
					</slot>
					{#if keyedValue(selection) == keyedValue(item)}
						<span
							class="group-hover:text-white text-indigo-600 dark:text-indigo-500 absolute inset-y-0 right-0 flex items-center pr-4"
						>
							<Icon src={Check} solid class="h-5 w-5" aria-hidden />
						</span>
					{/if}
				</ListboxListItem>
			</ListboxItemList>
		</div>
	{/if}
</div>

<style>
</style>
