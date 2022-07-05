<script lang="ts">
  import { number } from 'svelte-i18n';

  export let value: number;
  export let increase: number;

  export let percentage = false;

  let increaseFormatted2: string;
  let valueFormatted2: string;
  $: {
    if (percentage) {
      increaseFormatted2 = $number(increase, {
        style: 'percent',
        useGrouping: true,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
      valueFormatted2 = $number(value, {
        style: 'percent',
        useGrouping: true,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
    } else {
      increaseFormatted2 = $number(increase, {
        useGrouping: true,
        maximumFractionDigits: 6
      });
      valueFormatted2 = $number(value, {
        useGrouping: true,
        maximumFractionDigits: 6
      });
    }
  }
</script>

<span class="inline-block tabular-nums">
  {valueFormatted2} (<span class="text-green-500">+{increaseFormatted2}</span>)
</span>
