<script lang="ts">
  export let rarity: string | number;

  import { _ } from 'svelte-i18n';

  let bgClass = 'bg-rarity-0';
  let name: string;
  switch (rarity) {
    case 'Common':
    case 1:
      {
        bgClass = 'bg-rarity-0';
        name = $_('prime.rarity.common');
      }
      break;
    case 'Uncommon':
    case 2:
      {
        bgClass = 'bg-rarity-1';
        name = $_('prime.rarity.uncommon');
      }
      break;
    case 'Rare':
    case 3:
      {
        bgClass = 'bg-rarity-2';
        name = $_('prime.rarity.rare');
      }
      break;
    case 'Epic':
    case 4:
      {
        bgClass = 'bg-rarity-3 text-light-400';
        name = $_('prime.rarity.epic');
      }
      break;
  }
</script>

<span
  class="
        mr-1
        px-2
        inline-flex
        items-center
        text-xs
        leading-5
        font-bold
        rounded-full
        text-gray-800
        {bgClass}
      "
  role="img"
  aria-label={name}>{name[0]}</span
>
