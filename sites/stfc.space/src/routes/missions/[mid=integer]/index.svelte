<script context="module" lang="ts">
  import { extendTranslations } from '$lib/i18n';

  import { YukiApi } from '$lib/shared/api';
  import type { MissionDetail } from '$lib/shared/yuki/models';
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ session, fetch, params, url }) {
    let mission: MissionDetail;
    await Promise.all([
      await YukiApi.get('/mission/' + params.mid, undefined, fetch).then(
        (s: MissionDetail) => (mission = s)
      ),
      extendTranslations(session.lang, [{ path: 'missions', ids: [params.mid] }], fetch)
    ]);
    return { props: { mission } };
  };
</script>

<script lang="ts">
  import { _ } from 'svelte-i18n';

  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import { factionThumb } from '$lib/shared/yuki/thumbs';

  export let mission: MissionDetail;
</script>

<MetaHeader title={`${$_('project.name')} - ${$_(`missions_${mission.id}_title`)}`} />
<DetailPageContainer>
  <div
    class="detail-page-header flex justify-between items-center relative gap-x-8 p-2 px-2 sm:px-4 flex-wrap"
  >
    <div class="flex sm:flex-shrink-0">
      <img class="h-16 mr-2" src={factionThumb(mission.faction)} alt="logo" />
      <div class="flex flex-col">
        <span class="text-xl font-bold whitespace-normal sm:whitespace-nowrap">
          {$_(`missions_${mission.id}_title`)}
        </span>
        <span class="text-sm">{$_('mission.warp')}: {mission.warp}</span>
        <span class="text-sm">{$_('mission.warp_completion')}: {mission.warp_for_completion}</span>
      </div>
    </div>
  </div>
  <div class="p-2 px-2 sm:px-4">Content will be here soon...</div>
</DetailPageContainer>
