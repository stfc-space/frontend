<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import {
    BuildCost,
    BuildingDetailLevel,
    Rarity,
    Requirement,
    RequirementType
  } from '$lib/shared/yuki/models';

  import { _ } from 'svelte-i18n';
  import { onDestroy } from 'svelte';

  import type { PageData } from './$types';

  import { buildingThumb, researchThumb } from '$lib/shared/yuki/thumbs';
  import { NumberInput, Slider } from '@radion/ui';

  import { formatPrimeText, sortResourceList } from '$lib/shared/yuki/utils';
  import { debounce } from 'lodash-es';
  import RequiredByTable, { RequirementUiItem } from '$lib/components/prime/RequiredByTable.svelte';
  import BuildCosts, { BuffModifier } from '$lib/components/prime/BuildCost.svelte';
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import BuffValue from '$lib/components/prime/BuffValue.svelte';
  import ValueIncrease from '$lib/components/prime/ValueIncrease.svelte';
  import { getStaticData } from '$lib/shared/api';

  export let data: PageData;

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        selectedLevel: data.queryStore.readField('level'),
        rbSort: data.queryStore.readField('rbs')
      }
    );
  };
  let filters = readFiltersFromQuery();

  onDestroy(
    page.subscribe((page) => {
      data.queryStore.setQuery(page.url.searchParams, true);
      filters = readFiltersFromQuery();
    })
  );

  const updateQuery = debounce((_v) => {
    data.queryStore.updateField('level', filters.selectedLevel);
    data.queryStore.updateField('rbs', filters.rbSort);
    data.queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  const { resources, researches } = getStaticData();

  let buildingLevel: BuildingDetailLevel;
  let requirementsTableItems: RequirementUiItem[];
  let requiredByTableItems: RequirementUiItem[];
  let buildingLevelCosts: (BuildCost & { resource_id: number; rarity: Rarity })[];

  let mapRequirement = (x: Requirement): RequirementUiItem => {
    return {
      id: `${x.requirement_id}_${x.requirement_level}`,
      link:
        x.requirement_type == RequirementType.BuildingLevel
          ? '/buildings/' + x.requirement_id + '?level=' + x.requirement_level
          : '/researches/' + x.requirement_id + '?level=' + x.requirement_level,
      name:
        x.requirement_type == RequirementType.BuildingLevel
          ? $_(`buildings_${x.requirement_id}_name`)
          : $_(`research_${x.requirement_id}_name`),
      icon:
        x.requirement_type == RequirementType.BuildingLevel
          ? buildingThumb(x.requirement_id)
          : researchThumb($researches.get(x.requirement_id).art_id),
      level: x.requirement_level,
      power: x.power_gain
    };
  };

  const updateRequiredByItems = debounce(() => {
    requiredByTableItems = buildingLevel.required_by?.map(mapRequirement);
  }, 100);
  $: {
    buildingLevel = data.building.levels[filters.selectedLevel - 1];
    buildingLevelCosts = sortResourceList(buildingLevel.costs).map((e) => {
      return { rarity: $resources.get(e.resource_id).rarity, ...e };
    });

    requirementsTableItems = buildingLevel.requirements.map(mapRequirement);
    updateRequiredByItems();
  }
</script>

<MetaHeader
  title={`${$_('project.name')} - ${$_(`buildings_${data.building.id}_name`)} (${
    filters.selectedLevel
  })`}
  description={$_(`buildings_${data.building.id}_description`)}
  image={buildingThumb(data.building.id)}
/>

<DetailPageContainer>
  <div
    class="detail-page-header flex justify-between items-center relative gap-x-8 p-2 px-2 sm:px-4 flex-wrap"
  >
    <div class="flex sm:flex-shrink-0">
      <img class="h-16 w-16 mr-2" src={buildingThumb(data.building.id)} alt="logo" />
      <div class="flex flex-col">
        <span class="text-xl font-bold whitespace-normal sm:whitespace-nowrap"
          >{$_(`buildings_${data.building.id}_name`)}
          <span class="text-base whitespace-nowrap">(1 - {data.building.levels.length})</span></span
        >
        <span class="text-sm">
          {$_('prime.unlock_level')}:
          {data.building.unlock_level}
        </span>
      </div>
    </div>
    <div class="flex w-96 flex-shrink">
      <Slider
        class="flex-grow flex-shrink"
        min={1}
        max={data.building.levels.length}
        bind:value={filters.selectedLevel}
      />
      <NumberInput min={1} max={data.building.levels.length} bind:value={filters.selectedLevel} />
    </div>
  </div>
  <div class="p-2 px-2 sm:px-4">
    <div class="mb-6">
      {$_('building.create_upgrade_plan')}
      <a
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-700"
        href="/tools/upgrade_plan/new?i={data.building.id}&l={filters.selectedLevel}&t=building"
        >{$_('tool.upgrade_planner')}</a
      >
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="text-center font-bold text-xl mb-2">{$_('building.buffs')}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 mx-auto gap-2">
        <span
          >{$_('prime.power')}: <ValueIncrease
            value={buildingLevel.strength}
            increase={buildingLevel.strength_increase}
          />
        </span>
        {#each data.building.buffs as buff (buff.id)}
          <span
            >{$_(`building_buffs_${buff.id}_buff_name`)}: <BuffValue
              {buff}
              level={filters.selectedLevel}
            /></span
          >
        {/each}
      </div>
    </div>
    <div class="flex flex-col mb-4">
      <BuildCosts
        time={buildingLevel.build_time_in_seconds}
        costs={buildingLevelCosts}
        requirements={requirementsTableItems}
        buffModifier={BuffModifier.BuildingCost}
      />
      {#if requiredByTableItems}
        <RequiredByTable bind:sort={filters.rbSort} items={requiredByTableItems} />
      {/if}
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2">{$_('building.description')}</h3>
      <p class="text-justify">
        {@html formatPrimeText($_(`buildings_${data.building.id}_description`), { stripLines: 3 })}
      </p>
    </div>
  </div></DetailPageContainer
>
