<script lang="ts">
  import { locale, _ } from 'svelte-i18n';

  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import { factionThumb } from '$lib/shared/yuki/thumbs';
  import { getStaticData, YukiApi } from '$lib/shared/api';
  import Flow from '$lib/components/graph/Flow.svelte';
  import type { ElkRoot } from '$lib/graph';
  import { browser } from '$app/environment';

  import type { PageData } from './$types';
  export let data: PageData;

  const { systems } = getStaticData();

  $: pickupSystems = data.mission.pickup_systems
    .map((system) => $systems.get(system))
    .filter((system) => !!system);

  let chainGraphData: ElkRoot | null = null;
  const fetchChainGraph = (lang: string) => {
    if (!browser) {
      return;
    }
    if (data.mission.chain == -1) {
      return;
    }
    YukiApi.get('/mission/chain/' + data.mission.chain, {
      query: {
        lang: lang,
        format: 'elk'
      }
    }).then((e: any) => {
      chainGraphData = e;
    });
  };
  $: fetchChainGraph($locale);

  $: selected_steps = {};

  $: task_list = (() => {
    let root = data.mission.tasks[data.mission.first_task_id];
    const tasks = [{ id: root.id, options: root.next_steps }];
    let next_step = selected_steps[root.id] ?? root.next_steps[0];
    while (next_step) {
      const current_step = data.mission.tasks[next_step];
      tasks.push({
        id: current_step.id,
        options: current_step.next_steps
      });
      next_step = selected_steps[next_step] ?? current_step.next_steps[0];
    }
    return tasks;
  })();
</script>

<MetaHeader title={`${$_('project.name')} - ${$_(`missions_${data.mission.id}_title`)}`} />
<DetailPageContainer>
  <div
    class="detail-page-header flex justify-between items-center relative gap-x-8 p-2 px-2 sm:px-4 flex-wrap"
  >
    <div class="flex sm:flex-shrink-0">
      <img class="h-16 mr-2" src={factionThumb(data.mission.faction)} alt="logo" />
      <div class="flex flex-col">
        <span class="text-xl font-bold whitespace-normal sm:whitespace-nowrap">
          {$_(`missions_${data.mission.id}_title`)}
        </span>
        <span class="text-sm">{$_('mission.warp')}: {data.mission.warp}</span>
        <span class="text-sm"
          >{$_('mission.warp_completion')}: {data.mission.warp_for_completion}</span
        >
      </div>
    </div>
  </div>
  <div class="p-2 px-2 sm:px-4">
    <div class="flex p-2 overflow-auto gap-2">
      {#each pickupSystems as system (system.id)}
        <a
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

    <div class="flex flex-col mx-auto items-center">
      Steps
      <br />
      <div class="flex flex-col">
        {#each task_list as task}
          <span>
            {$_(`mission_tasks_${task.id}_title`)}
          </span>
          {#if task.options.length > 1}
            CHOOSE
            {#each task.options as option}
              <button on:click={() => (selected_steps[task.id] = option)}
                >{$_(`mission_tasks_${option}_dilemma_description`)}</button
              >
            {/each}
          {/if}
        {/each}
      </div>
    </div>

    {#if chainGraphData}
      <Flow layout={chainGraphData} />
    {/if}
  </div>
</DetailPageContainer>
