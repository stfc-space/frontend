<script context="module">
	let counter = 0;
</script>

<script lang="ts">
	export let value: number | undefined = undefined;
	export let min: number;
	export let max: number;
	export let disabled = false;
	export let noButtons = false;
	let clazz = '';
	export { clazz as class };

	const eltId = 'number-input_' + counter++;

	const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

	let internalValue: number | undefined = clamp(Number(value), min, max);

	const decrement = () => {
		internalValue = clamp(Number(internalValue) - 1, min, max);
		value = internalValue;
	};

	const increment = () => {
		internalValue = clamp(Number(internalValue) + 1, min, max);
		value = internalValue;
	};

	const backgroundClass = 'bg-light-500 border border-light-900 dark:bg-dark-300 w-6';
	// const backgroundHoverClass = 'hover:bg-light-200 dark:hover:bg-dark-900';

	value = clamp(Number(internalValue), min, max);
	$: {
		if (internalValue !== undefined) {
			internalValue = value;
		}
	}

	const handleInput = (e: InputEvent | Event) => {
		const e2 = e.target as HTMLInputElement;
		if (!e2.value || e2.value == '') {
			internalValue = undefined;
		} else {
			internalValue = Number(e2.value);
		}
		value = clamp(Number(internalValue || min), min, max) || min;
	};
</script>

<div class="flex items-center {clazz}">
	<label class="mr-1" for={eltId}><slot /></label>
	{#if !noButtons}
		<button
			{disabled}
			on:click={decrement}
			class={`number-input-button rounded-l focus:z-30 dark:border-transparent h-8 px-1 input-focus ${backgroundClass}`}
		>
			<span class="m-auto text-xl font-thin">−</span>
		</button>
	{/if}
	<input
		id={eltId}
		class="rounded input-bg px-2 input-focus min-h-8 text-center focus:z-30"
		class:rounded={noButtons}
		class:controls={!noButtons}
		type="number"
		on:change={handleInput}
		on:input={handleInput}
		value={internalValue}
		on:blur={() => (internalValue = value)}
		{min}
		{max}
	/>
	{#if !noButtons}
		<button
			{disabled}
			on:click={increment}
			class={`number-input-button rounded-r focus:z-30 dark:border-transparent input-focus h-8 px-1 ${backgroundClass}`}
		>
			<span class="m-auto text-xl font-thin">+</span>
		</button>
	{/if}
</div>

<style>
	input {
		max-width: 10ch;
	}

	input.controls::-webkit-inner-spin-button,
	input.controls::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
