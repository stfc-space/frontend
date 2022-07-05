<script lang="ts">
  import { Dropdown } from '@radion/ui';

  import { _ } from 'svelte-i18n';

  export let value: number;
</script>

<Dropdown
  label={$_('prime.grade')}
  key="value"
  bind:value
  options={[
    { name: $_('prime.all'), value: -1, display: false },
    { name: 'I', value: 1 },
    { name: 'II', value: 2 },
    { name: 'III', value: 3 },
    { name: 'IV', value: 4 },
    { name: 'V', value: 5 }
  ]}
/>
