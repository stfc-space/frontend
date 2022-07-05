<script lang="ts">
	import { onMount } from 'svelte';

	export let min: number | string;
	export let max: number | string;
	export let step = 1;
	export let value: number | number[] = 0;
	export let stepDecimals = false;
	export let noTicks = false;
	export let smooth = false;
	let clazz = '';
	export { clazz as class };

	let minV = Number(min);
	let maxV = Number(max);
	$: {
		minV = Number(min);
		maxV = Number(max);
	}

	let countTicks = Array.from({ length: Number(max) - Number(min) - 1 }, (_, i) => i + 1);
	$: countTicks = Array.from({ length: Number(max) - Number(min) - 1 }, (_, i) => i + 1);

	let lengthPerStep = 100 / ((Number(max) - Number(min)) / Number(step));
	$: lengthPerStep = 100 / ((Number(max) - Number(min)) / Number(step));

	let isEquals = Array.isArray(value) ? value[0] === value[1] : false;
	$: isEquals = Array.isArray(value) ? value[0] === value[1] : false;

	let sliderElement: HTMLDivElement;

	const toDecimal = (value: number) => {
		return parseFloat(value.toFixed(1));
	};

	const changePosition = (value: number | number[]): number[] => {
		// const min = Number(min);
		// const max = Number(max);
		let leftX: number;
		let leftTwo = 0;
		if (Array.isArray(value)) {
			leftX = ((value[1] - minV) / (maxV - minV)) * 100;
			leftTwo = ((value[0] - minV) / (maxV - minV)) * 100;
		} else {
			leftX = ((value - minV) / (maxV - minV)) * 100;
		}

		return [leftX, leftTwo];
	};

	// let effect = false;
	let two = false;
	let active = false;
	let [leftX, leftTwo] = changePosition(value);

	const changeLeft = (leftx: number) => {
		const isArray = Array.isArray(value);
		const sliderV = sliderElement;

		let percentX = (leftx / sliderV.clientWidth) * 100;

		const steps = Math.round(percentX / lengthPerStep);

		let val = steps * lengthPerStep * (maxV - minV) * 0.01 + minV;
		if (isNaN(val)) {
			val = minV;
		}

		val = stepDecimals ? toDecimal(val) : Math.round(val);
		let leftV = 0;
		if (val > maxV) {
			val = maxV;
			leftV = 100;
		} else {
			leftV = steps * lengthPerStep;
		}
		if (two) {
			leftTwo = Math.max(0, leftV);
		} else {
			if (smooth) {
				leftX = Math.max(0, percentX);
			} else {
				leftX = Math.max(0, leftV);
			}
		}

		let newValue: number | number[];
		if (isArray) {
			let valueNew = val;
			if (val == maxV) {
				valueNew = maxV;
			}

			let vals = value;
			let minR = Math.round((leftTwo / 100) * (maxV / step)) * step;
			let maxR = Math.round((leftX / 100) * (maxV / step)) * step;
			if (two) {
				if (minR < maxR && Array.isArray(vals)) {
					newValue = [valueNew, vals[1]];
				} else if (minR > maxR && Array.isArray(vals)) {
					newValue = [vals[0], valueNew];
				} else {
					newValue = [valueNew, valueNew];
				}
			} else {
				if (minR > maxR && Array.isArray(vals)) {
					newValue = [valueNew, vals[1]];
				} else if (minR < maxR && Array.isArray(vals)) {
					newValue = [vals[0], valueNew];
				} else {
					newValue = [valueNew, valueNew];
				}
			}
		} else {
			newValue = val;
		}
		if (
			(isArray &&
				Array.isArray(value) &&
				Array.isArray(newValue) &&
				(value[0] != newValue[0] || value[1] != newValue[1])) ||
			(!isArray && value != newValue)
		) {
			value = clampValue(newValue);
		}
	};

	const clickSlider = (evt: MouseEvent) => {
		let leftx = 0;
		if (window.TouchEvent && evt instanceof TouchEvent) {
			leftx = evt.targetTouches[0].clientX - sliderElement.getBoundingClientRect().left;
		} else {
			leftx = (evt as MouseEvent).clientX - sliderElement.getBoundingClientRect().left;
		}
		// effect = true;
		// setTimeout(() => {
		// 	effect = false;
		// }, 200);
		let percentX = Math.round((leftx / sliderElement.clientWidth) * 100);
		if (Array.isArray(value)) {
			if (Math.abs(percentX - leftX) > Math.abs(percentX - leftTwo)) {
				two = true;
			} else {
				two = false;
			}
		}

		changeLeft(leftx);
	};

	const activeFocus = (evt: MouseEvent | TouchEvent) => {
		active = true;
		clickSlider(evt as MouseEvent);

		window.addEventListener('mousemove', mouseMovex);
		window.addEventListener('mouseup', removeEvents, { capture: true });
		window.addEventListener('touchmove', mouseMovex, { passive: false });
		window.addEventListener('touchend', removeEvents);
	};

	const mouseMovex = (evt: MouseEvent | TouchEvent) => {
		evt.preventDefault();
		evt.stopPropagation();

		const sliderV = sliderElement;
		if (!sliderV) {
			return;
		}

		let leftx: number;
		/*
		 * change position left circle and bar
		 */
		if (window.TouchEvent && evt instanceof TouchEvent) {
			leftx = evt.targetTouches[0].clientX - sliderV.getBoundingClientRect().left;
		} else {
			leftx = (evt as MouseEvent).clientX - sliderV.getBoundingClientRect().left;
		}
		if (Math.sign(leftx) == -1) {
			leftx = 0;
		} else if (leftx > sliderV.clientWidth) {
			leftx = sliderV.clientWidth;
		}
		changeLeft(leftx);
	};

	const removeEvents = (event: MouseEvent | TouchEvent) => {
		two = false;
		active = false;

		// Don't bubble up to a potential global handler
		// This prevents things like closing after drag with a clickoutside handler
		// using 'mouseup'
		event.stopPropagation();
		event.preventDefault();

		window.removeEventListener('mouseup', removeEvents, { capture: true });
		window.removeEventListener('mousemove', mouseMovex);
		window.removeEventListener('touchmove', mouseMovex);
		window.removeEventListener('touchend', removeEvents);
	};

	const clampValue = (v: number | number[]) => {
		if (Array.isArray(v)) {
			const [oMin, oMax] = v;
			if (oMin < minV || oMax > maxV) {
				const nMin = Math.min(Math.max(oMin, minV), maxV);
				const nMax = Math.min(Math.max(oMax, maxV), maxV);
				return [nMin, nMax];
			}
		} else if ((v as number) < minV || (v as number) > maxV) {
			const clampedValue = Math.min(Math.max(v as number, minV), maxV);
			return clampedValue;
		}
		return v;
	};

	onMount(() => {
		value = clampValue(value);
	});

	$: {
		if (!active) {
			value = clampValue(value);
			const [iX, iTwo] = changePosition(value);
			leftX = iX;
			leftTwo = iTwo;
		}
	}

	const sliderStyle =
		'cursor-pointer absolute transition transform top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 hover:scale-125 rounded-full border-2 active:border-4 hover:bg-light-100 dark:hover:bg-dark-800 border-indigo-500 dark:bg-dark-200 bg-light-50 w-6 h-6 z-20 slider-thumb-touch-target';
</script>

<div class="relative py-4 mx-6 {clazz}">
	<div
		class="relative block w-full h-2 z-10 dark:bg-dark-200 bg-light-300 border-1 dark:border-0 border-light-900 rounded slider-bar-touch-target"
		bind:this={sliderElement}
		on:touchstart|nonpassive={activeFocus}
		on:mousedown|preventDefault={activeFocus}
	>
		{#if !noTicks}
			{#each countTicks as tick (tick)}
				<span
					class="absolute h-full w-px top-0 bg-light-900 opacity-50 dark:bg-dark-900"
					style="left: {`${lengthPerStep * tick}%`}"
				/>
			{/each}
		{/if}
	</div>
	<button
		class="focus:outline-none slider-thumbs slider-one {sliderStyle}"
		class:isEquals
		style="left: {`${leftX}%`}"
		on:touchstart|nonpassive={activeFocus}
		on:mousedown|stopPropagation={activeFocus}
	/>
	{#if Array.isArray(value)}
		<button
			class="focus:outline-none slider-thumbs slider-two {sliderStyle}"
			class:isEquals
			style="left: {`${leftTwo}%`}"
			on:touchstart|nonpassive={(e) => {
				activeFocus(e);
				two = true;
			}}
			on:mousedown|stopPropagation={(e) => {
				activeFocus(e);
				two = true;
			}}
		/>
	{/if}
</div>

<style>
	@media (pointer: coarse) {
		.slider-bar-touch-target::after {
			top: -10px;
			left: -10px;
			right: -10px;
			bottom: -10px;
			content: '';
			position: absolute;
		}
	}
	@media (pointer: fine) {
		.slider-bar-touch-target::after {
			top: -8px;
			left: -8px;
			right: -8px;
			bottom: -8px;
			content: '';
			position: absolute;
		}
	}
	@media (pointer: coarse) {
		.slider-thumb-touch-target::after {
			top: -10px;
			left: -10px;
			right: -10px;
			bottom: -10px;
			content: '';
			position: absolute;
		}
	}
	@media (pointer: fine) {
		.slider-thumb-touch-target::after {
			top: -8px;
			left: -8px;
			right: -8px;
			bottom: -8px;
			content: '';
			position: absolute;
		}
	}

	.slider-thumbs.isEquals.slider-two {
		border-radius: 50% 50% 0 0;
		transform: translate(-50%, -100%) scale(0.9) !important;
	}
	.slider-thumbs.isEquals.slider-one {
		border-radius: 0 0 50% 50%;
		transform: translate(-50%, -25%) scale(0.9) !important;
	}
</style>
