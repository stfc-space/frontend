<script lang="ts">
  import { Dropdown } from '@radion/ui';

  import { _ } from 'svelte-i18n';

  export let value: number;
</script>

<Dropdown
  label={$_('prime.rarity.title')}
  key="value"
  bind:value
  options={[
    { name: $_('prime.all'), value: -1, display: false, class: 'font-bold' },
    { name: $_('prime.rarity.common'), value: 1, class: 'color-rarity-0 font-bold' },
    { name: $_('prime.rarity.uncommon'), value: 2, class: 'color-rarity-1 font-bold' },
    { name: $_('prime.rarity.rare'), value: 3, class: 'color-rarity-2 font-bold' },
    { name: $_('prime.rarity.epic'), value: 4, class: 'color-rarity-3 font-bold' }
  ]}
/>
