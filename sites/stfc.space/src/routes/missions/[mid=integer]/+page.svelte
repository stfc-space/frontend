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
  import { locale, _ } from 'svelte-i18n';

  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import { factionThumb } from '$lib/shared/yuki/thumbs';
  import { getStaticData } from '$lib/shared/api';
  import Flow from '$lib/components/graph/Flow.svelte';
  import type { ElkRoot } from '$lib/graph';
  import { browser } from '$app/env';

  export let mission: MissionDetail;

  const { systems } = getStaticData();

  $: pickupSystems = mission.pickup_systems
    .map((system) => $systems.get(system))
    .filter((system) => !!system);

  let chainGraphData: ElkRoot | null = null;
  const fetchChainGraph = (state: string) => {
    if (!browser) {
      return;
    }
    if (mission.chain == -1) {
      return;
    }
    YukiApi.get('/mission/chain/' + mission.chain, {
      query: {
        lang: state,
        format: 'elk'
      }
    }).then((e: any) => {
      chainGraphData = e;
    });
  };
  $: fetchChainGraph($locale);
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
  <div class="p-2 px-2 sm:px-4">
    <div class="flex p-2 overflow-auto gap-2">
      {#each pickupSystems as system (system.id)}
        <a
          sveltekit:prefetch
          href="/systems/{system.id}"
          class="rounded border dark:border-dark-300 p-2 dark:bg-dark-700 shadow"
        >
          <span
            class="border-b border-opacity-25 dark:border-opacity-100 dark:border-dark-200 whitespace-nowrap flex items-center"
          >
            <span class="font-bold text-center flex items-center">
              {$_(`systems_${system.id}_name`)}
            </span>
            <span class="text-sm font-bold ml-1">({system.level})</span>
          </span>
          <span class="text-sm"> {$_('system.warp')} {system.est_warp}</span>
        </a>
      {/each}
    </div>

    {#if chainGraphData}
      <Flow layout={chainGraphData} />
    {/if}
  </div>
</DetailPageContainer>
