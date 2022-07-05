<script lang="ts">
  import type { Buff } from '$lib/shared/yuki/models';
  import ValueIncrease from './ValueIncrease.svelte';

  export let level: number;
  export let buff: Buff;

  $: value = buff.values[level - 1]?.value ?? 0;
  $: increase = value - (buff.values[level - 2]?.value ?? 0) ?? value;
</script>

<ValueIncrease {value} {increase} percentage={buff.show_percentage || buff.value_is_percentage} />
