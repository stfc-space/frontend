<script lang="ts">
  import { locale, number, _ } from 'svelte-i18n';

  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import { factionThumb, hostileThumb } from '$lib/shared/yuki/thumbs';
  import { getStaticData, YukiApi } from '$lib/shared/api';
  import Flow from '$lib/components/graph/Flow.svelte';
  import type { ElkRoot } from '$lib/graph';
  import { browser } from '$app/environment';

  import type { PageData } from './$types';
  import { ItemType, MissionTaskType, Rarity, Reward } from '$lib/shared/yuki/models';
  import { sortResourceList } from '$lib/shared/yuki/utils';
  import RewardEntry from '$lib/components/prime/RewardEntry.svelte';
  export let data: PageData;

  const { systems, resources } = getStaticData();

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

  $: [task_list, rewards] = (() => {
    let root = data.mission.tasks[data.mission.first_task_id];
    const tasks = [
      {
        id: root.id,
        options: root.next_steps,
        icon: taskIcons[`/src/lib/assets/icons/tasks/missions_task_${root.type}.png`],
        type: root.type,
        attributes: root.attributes
      }
    ];
    const rewards: Record<number, Reward & { rarity: Rarity }> = {};

    for (const reward of root.rewards) {
      if (!rewards[reward.resource_id]) {
        rewards[reward.resource_id] = {
          ...reward,
          rarity: $resources.get(reward.resource_id)?.rarity ?? Rarity.Common
        };
      } else {
        rewards[reward.resource_id].amount += reward.amount;
      }
    }

    let next_step = selected_steps[root.id] ?? root.next_steps[0];
    while (next_step) {
      const current_step = data.mission.tasks[next_step];
      tasks.push({
        id: current_step.id,
        options: current_step.next_steps,
        icon: taskIcons[`/src/lib/assets/icons/tasks/missions_task_${current_step.type}.png`],
        type: current_step.type,
        attributes: current_step.attributes
      });
      for (const reward of current_step.rewards) {
        if (!rewards[reward.resource_id]) {
          rewards[reward.resource_id] = {
            ...reward,
            rarity: $resources.get(reward.resource_id)?.rarity ?? Rarity.Common
          };
        } else {
          rewards[reward.resource_id].amount += reward.amount;
        }
      }
      next_step = selected_steps[next_step] ?? current_step.next_steps[0];
    }

    return [
      tasks,
      sortResourceList(Object.values(rewards)).filter((x) => x.type != ItemType.Mission)
    ];
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
        {#each task_list as task (task.id)}
          <li>
            <div
              class="relative"
              class:pb-4={task.options.length == 1}
              class:pb-1={task.options.length > 1}
            >
              {#if task.options.length < 2}
                {#if task.options.length == 1}
                  <span
                    class="absolute top-6 left-5 -ml-px bottom-0 w-0.5 bg-gray-200 dark:bg-opacity-20"
                    aria-hidden="true"
                  />
                {/if}
                <div class="relative flex items-start space-x-3">
                  <div class="relative w-12">
                    <img
                      class="ml-2 w-6 fix-light-image"
                      src={task.icon}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-md">
                      {$_(`mission_tasks_${task.id}_title`)}
                    </div>
                    <div class="mt-2 text-md text-gray-700 dark:text-gray-300">
                      {#if task.type == MissionTaskType.ReturnFleetToStation}
                        <span>{$_('mission.task.return_station')}</span>
                      {:else if task.type == MissionTaskType.TargetDestination || task.type == MissionTaskType.PlanetDestination}
                        {$_(`mission.task.go_to`)}
                        {#if task.attributes.target_system != -1}
                          <a
                            class="dark:text-indigo-400 text-indigo-600"
                            href={'/systems' + task.attributes.target_system}
                          >
                            {$_(`systems_${task.attributes.target_system}_name`)}
                          </a>
                        {:else}
                          <span class="underline">Nearby</span>
                        {/if}
                      {:else if task.type == MissionTaskType.DonateResources}
                        {$_(`mission.task.donate`)}
                        {$number(task.attributes.resource_amount)}
                        {$_(`materials_${task.attributes.resource_id}_name`)}
                      {:else if task.type == MissionTaskType.DefeatNpcInstantiated}
                        <div class="flex gap-x-1">
                          <span>Kill</span>
                          <a
                            class="text-indigo-700 dark:text-indigo-400"
                            href={'/missions/' +
                              data.mission.id +
                              '/hostile/' +
                              task.attributes.npc.id}
                          >
                            {$_(`mission_tasks_${task.attributes.npc.id}_title`)}
                          </a>
                          <span>in</span>
                          {#if task.attributes.target_system == -1}
                            <span class="text-indigo-700 dark:text-indigo-400">Nearby</span>
                          {:else}
                            <a
                              class="text-indigo-700 dark:text-indigo-400"
                              href={'/systems/' + task.attributes.target_system}
                            >
                              {$_(`systems_${task.attributes.target_system}_name`)}
                            </a>
                          {/if}
                        </div>
                        <div>
                          <div class="flex gap-2 text-md mb-2 items-center">
                            <img
                              src={hostileThumb(task.attributes.npc.hull_type)}
                              class="object-contain h-4 w-4 fix-light-image"
                            />
                            <span class="font-bold"
                              >{$number(task.attributes.npc.stats.strength)}</span
                            >
                          </div>
                        </div>
                      {:else if task.type == MissionTaskType.DefeatNpcGlobal}
                        <div class="flex gap-x-1">
                          Kill {task.attributes.count}
                          <a class="text-indigo-700 dark:text-indigo-400" href="/hostiles">
                            Level {task.attributes.level}+ Hostiles</a
                          >
                          {#if task.attributes.target_system == 0}
                            <span>anywhere</span>
                          {:else}
                            <span>in</span>
                            <a
                              class="text-indigo-700 dark:text-indigo-400"
                              href={'/systems/' + task.attributes.target_system}
                            >
                              {$_(`systems_${task.attributes.target_system}_name`)}
                            </a>
                          {/if}
                        </div>
                      {:else if task.type == MissionTaskType.StarbaseModuleLevel}
                        <!-- TODO(alexander): We can do this nicer with interpolation values in i18n? -->
                        {$_('mission.task.upgrade')}
                        <a
                          class="text-indigo-700 dark:text-indigo-400"
                          href={'/buildings/' +
                            task.attributes.module_id +
                            '?level=' +
                            task.attributes.level}
                        >
                          {$_(`buildings_${task.attributes.module_id}_name`)}
                        </a>
                        {$_('mission.task.upgrade_to_level')}
                        {task.attributes.level}
                      {:else if task.type == MissionTaskType.MineResources}
                        <a class="text-indigo-700 dark:text-indigo-400" href="/systems">
                          {$_('mission.task.mine')}
                          {$number(task.attributes.resource_amount)}
                          {$_(`materials_${task.attributes.resource_id}_name`)}
                        </a>
                      {:else if task.type == MissionTaskType.StockpileResources}
                        {$_('mission.task.collect')}
                        {$number(task.attributes.resource_amount)}
                        {$_(`materials_${task.attributes.resource_id}_name`)}
                      {:else if task.type == MissionTaskType.StartMining || task.type == MissionTaskType.BuildFromBlueprint || task.type == MissionTaskType.RecruitNewOfficer || task.type == MissionTaskType.JoinAlliance || task.type == MissionTaskType.AttackStarbase || task.type == MissionTaskType.CompleteFactionMissions || task.type == MissionTaskType.UpgradeShip || task.type == MissionTaskType.OfficerLevelAndRank || task.type == MissionTaskType.DefeatFactionShips || task.type == MissionTaskType.AssignOfficerToDrydock || task.type == MissionTaskType.MoveStarbase}
                        <!-- These are not _really_ that importan to have data driven text, at least not yetzs-->
                      {:else}
                        Task Details go here {MissionTaskType[task.type]}
                      {/if}
                    </div>
                  </div>
                </div>
              {:else if task.options.length > 1}
                <div class="relative flex items-start flex-wrap space-x-3">
                  <div class="relative w-12">
                    <img class="ml-2 w-6 fix-light-image" src={task.icon} />
                  </div>
                  <span class="text-md">
                    {$_(`mission_tasks_${task.id}_title`)}
                  </span>
                  <div class="w-full">
                    <div>
                      {#each task.options as option}
                        {#if selected_steps[task.id] == option || (!selected_steps[task.id] && option == task.options[0])}
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
              {/if}
            </div>
          </li>
        {/each}
      </ul>
      <br />
      Rewards
      <br />
      <div>
        {#each rewards as reward (reward.resource_id)}
          <RewardEntry {reward} />
        {/each}
      </div>
    </div>

    {#if chainGraphData}
      <Flow layout={chainGraphData} />
    {/if}
  </div>
</DetailPageContainer>
