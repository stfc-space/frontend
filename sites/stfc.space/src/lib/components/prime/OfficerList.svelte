<script lang="ts">
  import { _ } from 'svelte-i18n';

  import type { Officer } from '$lib/shared/yuki/models';
  import { ListItem } from '@radion/ui';

  import { officerThumb } from '$lib/shared/yuki/thumbs';
  import RarityIcon from './RarityIcon.svelte';

  export let officer: Officer;
</script>

<a href="/officers/{officer.id}">
  <ListItem>
    <div
      class="gap-x-1 sm:gap-x-1 items-center grid grid-cols-[3.5rem,1fr] grid-rows-2 sm:grid-rows-2"
    >
      <img
        class="h-14 w-auto row-span-2 mx-auto justify-self-center"
        width="64"
        height="64"
        src={officerThumb(officer.art_id)}
        alt="system faction icon"
      />
      <span
        class="font-bold col-start-2 sm:row-start-1 sm:row-span-1 text-center flex items-center"
      >
        <RarityIcon rarity={officer.rarity} />
        {$_(`officers_${officer.id}_name`)}
      </span>
      <span class="col-start-2 row-start-2 text-sm">
        {$_(`officers_synergy_${officer.synergy_id}_name`)}
      </span>
    </div>
  </ListItem>
</a>
