<script lang="ts">
  import { Dropdown } from '@radion/ui';

  import { _ } from 'svelte-i18n';

  export let value: number;
  const trees = [
    1870147103, 1766645516, 1056678826, 2024220584, 3374361850, 1454228576, 1868126734
  ];

  const treeOptions = [{ name: $_('prime.all'), value: -1, display: false }].concat(
    trees.map((x) => {
      return {
        name: $_(`research_${x}_tree_name`),
        value: x,
        display: true
      };
    })
  );
</script>

<Dropdown label={$_('prime.research_tree')} key="value" bind:value options={treeOptions} />
