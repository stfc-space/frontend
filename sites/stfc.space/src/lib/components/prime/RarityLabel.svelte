<script lang="ts">
  export let rarity: string | number;

  import { _ } from 'svelte-i18n';

  let name: string;
  $: {
    switch (rarity) {
      case 'Common':
      case 1:
        {
          name = $_('prime.rarity.common');
        }
        break;
      case 'Uncommon':
      case 2:
        {
          name = $_('prime.rarity.uncommon');
        }
        break;
      case 'Rare':
      case 3:
        {
          name = $_('prime.rarity.rare');
        }
        break;
      case 'Epic':
      case 4:
        {
          name = $_('prime.rarity.epic');
        }
        break;
    }
  }
</script>

<span aria-label={name}>{name}</span>
