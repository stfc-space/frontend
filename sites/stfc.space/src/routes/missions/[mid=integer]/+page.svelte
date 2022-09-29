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

  const taskIcons = import.meta.importGlob<string>('$lib/assets/icons/tasks/missions_task_*.png', {
    import: 'default',
    eager: true
  });

  $: task_list = (() => {
    console.log(taskIcons);
    let root = data.mission.tasks[data.mission.first_task_id];
    const tasks = [
      {
        id: root.id,
        options: root.next_steps,
        icon: taskIcons[`/src/lib/assets/icons/tasks/missions_task_${root.type}.png`]
      }
    ];
    let next_step = selected_steps[root.id] ?? root.next_steps[0];
    while (next_step) {
      const current_step = data.mission.tasks[next_step];
      tasks.push({
        id: current_step.id,
        options: current_step.next_steps,
        icon: taskIcons[`/src/lib/assets/icons/tasks/missions_task_${current_step.type}.png`]
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
      <ul>
        {#each task_list as task}
          <li>
            <div
              class="relative pb-6"
              class:pb-6={task.options.length == 1}
              class:pb-1={task.options.length > 1}
            >
              {#if task.options.length == 1}
                <span
                  class="absolute top-6 left-5 -ml-px bottom-0 w-0.5 bg-gray-200 dark:bg-opacity-20"
                  aria-hidden="true"
                />
                <div class="relative flex items-start space-x-3">
                  <div class="relative w-12">
                    <img
                      class="ml-2 w-6 fix-light-image"
                      src={task.icon}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>
                  <span>
                    {$_(`mission_tasks_${task.id}_title`)}
                  </span>
                </div>
              {:else if task.options.length > 1}
                <div class="relative flex items-start flex-wrap space-x-3">
                  <div class="relative w-12">
                    <img class="ml-2 w-6 fix-light-image" src={task.icon} />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-md">
                      {$_(`mission_tasks_${task.id}_title`)}
                    </div>
                  </div>
                  <div class="w-full">
                    <div>
                      {#each task.options as option}
                        {#if selected_steps[task.id] == option}
                          <button
                            class="flex-1 cursor-pointer select-none border-indigo-500 text-indigo-600 py-2 px-1 border-b-2 font-medium text-md"
                            on:click={() => (selected_steps[task.id] = option)}
                            >{$_(`mission_tasks_${option}_dilemma_description`)}</button
                          >
                        {:else}
                          <button
                            class="flex-1 cursor-pointer select-none border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 py-2 px-1 border-b-2 font-medium text-md"
                            on:click={() => (selected_steps[task.id] = option)}
                            >{$_(`mission_tasks_${option}_dilemma_description`)}</button
                          >
                        {/if}
                      {/each}
                    </div>
                    <div class="relative h-8">
                      <span
                        class="absolute top-1 left-2 -ml-px bottom-0 w-0.5 bg-gray-200 dark:bg-opacity-20"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              {:else}
                <div class="relative flex items-start space-x-3">
                  <div class="relative w-12">
                    <img
                      class="ml-2 w-6 fix-light-image"
                      src={task.icon}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>
                  <span>
                    {$_(`mission_tasks_${task.id}_title`)}
                  </span>
                </div>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>

    {#if chainGraphData}
      <Flow layout={chainGraphData} />
    {/if}
  </div>
</DetailPageContainer>

<style>
  .option {
    @apply;
  }
</style>
