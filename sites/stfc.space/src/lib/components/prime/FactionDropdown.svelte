<script lang="ts">
  import { Dropdown } from '@radion/ui';

  import { _ } from 'svelte-i18n';

  export let value: number;
  let clazz = '';
  export { clazz as class };
</script>

<Dropdown
  class={clazz}
  label={$_('prime.faction.title')}
  key="value"
  bind:value
  options={[
    { name: $_('prime.all'), value: -1, display: false },
    { name: $_('prime.faction.federation'), value: 2064723306 },
    { name: $_('prime.faction.romulan'), value: 669838839 },
    { name: $_('prime.faction.klingon'), value: 4153667145 },
    { name: $_('prime.faction.neutral'), value: -2 }
  ]}
/>
