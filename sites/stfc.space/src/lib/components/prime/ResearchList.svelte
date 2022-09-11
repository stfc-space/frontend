<script lang="ts">
  import { _ } from 'svelte-i18n';

  import type { Research } from '$lib/shared/yuki/models';
  import { researchThumb } from '$lib/shared/yuki/thumbs';
  import { ListItem } from '@radion/ui';
  import { capFirstChar } from '$lib/shared/utils';

  export let research: Research;
</script>

<a href="/researches/{research.id}">
  <ListItem>
    <div
      class="gap-x-2 items-center grid grid-cols-[max-content,1fr,max-content] grid-rows-2 lg:w-3/5 md:w-3/4 w-full text-ellipsis overflow-hidden"
    >
      <img
        class="w-full h-5 w-[36px] sm:w-[72px] mb-auto sm:my-auto sm:h-10 row-span-1 row-span-2"
        width="32"
        height="32"
        src={researchThumb(research.art_id)}
        alt="logo"
      />
      <span
        class="font-bold col-start-2 row-start-1 text-center flex items-center min-w-[240px] whitespace-nowrap"
      >
        {$_(`research_${research.id}_name`)}
      </span>
      <span class="row-start-2 col-start-2 text-sm">
        {$_(`prime.unlock_level`)}:
        <div class="w-[2ch] inline-block text-right tabular-nums">{research.unlock_level}</div>
        <span class="inline sm:hidden">
          |
          {capFirstChar($_(`research_${research.research_tree}_tree_name`))}
        </span>
      </span>
      <div
        class="hidden sm:(grid grid-cols-6ch-2 gap-x-2 grid-rows-3 row-start-1 row-span-2 col-start-3 text-xs) w-[24ch]"
      >
        <span class="hidden sm:inline">{$_('prime.research_tree_short')}:</span>
        <span class="hidden sm:inline">
          {capFirstChar($_(`research_${research.research_tree}_tree_name`))}
        </span>
        <span>{$_('prime.row')}:</span> <span class="font-bold">{research.row}</span>
        <span>{$_('prime.column')}:</span>
        <span class="font-bold">{research.column}</span>
      </div>
    </div>
  </ListItem>
</a>
