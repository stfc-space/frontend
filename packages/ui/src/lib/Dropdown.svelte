<script lang="ts">
	import { tick } from 'svelte';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { Check } from '@steeze-ui/heroicons';

	import ListboxItemList from './ListboxItemList.svelte';
	import ListboxListItem from './ListboxListItem.svelte';

	type X = $$Generic; // any
	type OptionType = Omit<X, 'name' | 'class' | 'display'> & {
		name: string;
		class?: string;
		display?: boolean | undefined;
	};

	let selection: OptionType | null | undefined = null;
	export let value: unknown;
	export let options: Array<OptionType>;
	export let key: keyof OptionType | undefined = undefined;
	let activeValue: OptionType | null = null;

	// Extra stuff for Dropdown
	export let label: string;
	export let filter = false;
	let clazz = '';
	export { clazz as class };

	let buttonRef: HTMLButtonElement;
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
		let values = filteredOptions;
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
			case ' ':
			case 'Space':
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
			if (textFilterRef && selection) {
				textFilterRef.value = selection.name;
			}
			isOpen = false;
		}

		if (!event.defaultPrevented) buttonRef?.focus({ preventScroll: true });
	};

	const select = (v: OptionType | null) => {
		value = keyedValue(v);
		selection = v;
		isOpen = false;
	};

	let containerLeft = 0;

	const toggleOpen = () => {
		isOpen = !isOpen;
		const r = buttonRef as HTMLElement;
		const rl = r.getBoundingClientRect().left;
		// TODO(alexander): Don't use a hardcoded width here
		if (rl + 288 > window.innerWidth) {
			containerLeft = window.innerWidth - (rl + 288);
		} else {
			containerLeft = 0;
		}
	};
	$: selection = options ? options.find((x) => keyedValue(x) === value) : null ?? options[0];
</script>

<svelte:window on:keydown={handleKeydown} on:click={handleClick} />
<div class="relative {clazz}">
	<div>
		<button
			bind:this={buttonRef}
			on:click={() => (toggleOpen(), (filterText = ''))}
			class="w-max dropdown-btn relative rounded input-bg input-focus pl-2 pr-2 text-left cursor-default sm:text-sm flex flex-wrap gap-x-1 items-center min-h-8"
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			value={selection ? selection?.name : null}
			spellcheck="false"
			>{label}{#if selection && (selection?.display || selection?.display === undefined)}: <span
					class="font-bold {selection?.class}">{selection ? selection?.name : ''}</span
				>{/if}
		</button>
	</div>
	{#if isOpen}
		<div
			bind:this={optionsContainerRef}
			class="absolute mt-1 z-50 shadow-lg w-72 bg-light-50 dark:bg-dark-600 flex flex-col"
			style="left: {containerLeft}px"
		>
			{#if filter}
				<input
					bind:this={textFilterRef}
					on:click={() => (filterText = '')}
					class="relative mx-3 mt-3 rounded input-bg input-focus pl-1 pr-10 text-left cursor-default sm:text-sm flex flex-wrap gap-x-1 items-center min-h-8"
					aria-haspopup="listbox"
					aria-expanded={isOpen}
					value={selection ? selection?.name : null}
					placeholder="Please select an option"
					spellcheck="false"
					on:input={filterChanged}
				/>
			{/if}
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
						<span class={item?.class}>
							{item.name}
						</span>
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
	.dropdown-btn:after {
		display: inline-block;
		margin-left: 0.255em;
		vertical-align: 0.055em;
		content: '';
		border-top: 0.5em solid;
		border-right: 0.3em solid transparent;
		border-bottom: 0;
		border-left: 0.3em solid transparent;
	}
</style>
