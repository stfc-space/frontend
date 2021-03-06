<script context="module" lang="ts">
  import { getStaticData, YukiApi } from '$lib/shared/api';

  export const load: Load = async function ({ session, fetch, params, url }) {
    const queryStore = new QueryStore<{
      level: number;
    }>(`research`);
    queryStore.addField('level', 1);
    queryStore.setQuery(url.searchParams, true);

    const query = queryStore.toQuery();
    if (url.searchParams.toString() != query.toString() && !queryStore.hasPendingSubmit()) {
      return {
        status: 302,
        redirect: '?' + query.toString()
      };
    }

    let research: ResearchDetail;
    await Promise.all([
      YukiApi.get('/research/' + params.rid, undefined, fetch).then(
        (r: ResearchDetail) => (research = r)
      ),
      extendTranslations(session.lang, [{ path: 'research', ids: [params.rid] }], fetch)
    ]);

    return { props: { research, queryStore } };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';

  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import {
    BuildCost,
    Rarity,
    Requirement,
    RequirementType,
    ResearchDetail,
    ResearchDetailLevel
  } from '$lib/shared/yuki/models';

  import { _ } from 'svelte-i18n';
  import { onDestroy } from 'svelte';

  import { QueryStore } from '$lib/shared/queryStore';
  import { buildingThumb, researchThumb } from '$lib/shared/yuki/thumbs';
  import { NumberInput, Slider } from '@radion/ui';

  import { sortResourceList } from '$lib/shared/yuki/utils';
  import type { Load } from '@sveltejs/kit';
  import { debounce } from 'lodash-es';

  import RequiredByTable, { RequirementUiItem } from '$lib/components/prime/RequiredByTable.svelte';
  import BuildCosts, { BuffModifier } from '$lib/components/prime/BuildCost.svelte';
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import ValueIncrease from '$lib/components/prime/ValueIncrease.svelte';
  import BuffValue from '$lib/components/prime/BuffValue.svelte';
  import { extendTranslations } from '$lib/i18n';

  export let research: ResearchDetail;
  export let queryStore: QueryStore<{ level: number }>;

  let selectedLevel = queryStore.readField('level');

  onDestroy(
    page.subscribe((page) => {
      queryStore.setQuery(page.url.searchParams, true);
      selectedLevel = queryStore.readField('level');
    })
  );

  const updateQuery = debounce((..._args) => {
    queryStore.updateField('level', selectedLevel);
    queryStore.submitQuery();
  });

  $: {
    if (browser) {
      updateQuery(selectedLevel);
    }
  }

  const { resources, researches } = getStaticData();

  let researchLevel: ResearchDetailLevel;
  let requirementsTableItems: RequirementUiItem[];
  let requiredByTableItems: RequirementUiItem[];
  let costs: (BuildCost & { resource_id: number; rarity: Rarity })[];

  let mapRequirement = (x: Requirement) => {
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
    requiredByTableItems = researchLevel.required_by?.map(mapRequirement);
  }, 10);
  $: {
    researchLevel = research.levels[selectedLevel - 1];
    costs = sortResourceList(researchLevel.costs).map((e) => {
      return { rarity: $resources.get(e.resource_id).rarity, ...e };
    });

    requirementsTableItems = researchLevel.requirements.map(mapRequirement);
    updateRequiredByItems();
  }
</script>

<MetaHeader
  title={`${$_('project.name')} - ${$_(`research_${research.id}_name`)} (${selectedLevel})`}
/>

<DetailPageContainer>
  <div
    class="detail-page-header flex justify-between items-center relative gap-x-8 p-2 px-2 sm:px-4 flex-wrap"
  >
    <div class="flex sm:flex-shrink-0">
      <img class="h-16 mr-2" src={researchThumb(research.art_id)} alt="logo" />
      <div class="flex flex-col">
        <span class="text-xl font-bold whitespace-normal sm:whitespace-nowrap"
          >{$_(`research_${research.id}_name`)}
          <span class="text-base whitespace-nowrap">(1 - {research.levels.length})</span></span
        >
        <span class="text-sm">
          {$_('prime.unlock_level')}:
          {research.unlock_level}
        </span>
      </div>
    </div>
    <div class="flex w-96 flex-shrink">
      <Slider
        class="flex-grow flex-shrink"
        min={1}
        max={research.levels.length}
        bind:value={selectedLevel}
      />
      <NumberInput min={1} max={research.levels.length} bind:value={selectedLevel} />
    </div>
  </div>
  <div class="p-2 px-2 sm:px-4">
    <div class="mb-6">
      {$_('building.create_upgrade_plan')}
      <a
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-700"
        href="/tools/upgrade_plan/new?i={research.id}&l={selectedLevel}&t=research"
        >{$_('tool.upgrade_planner')}</a
      >
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="text-center font-bold text-xl mb-2">{$_('research.buffs')}</h3>
      <h4 class="mx-auto">{$_(`research_${research.id}_description`)}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 mx-auto gap-2">
        <span
          >{$_('prime.power')}: <ValueIncrease
            value={researchLevel.strength}
            increase={researchLevel.strength_increase}
          />
        </span>
        {#each research.buffs as buff (buff.id)}
          <span>{$_(`research.bonus`)}: <BuffValue {buff} level={selectedLevel} /></span>
        {/each}
      </div>
    </div>
    <div class="flex flex-col mb-4">
      <BuildCosts
        time={researchLevel.research_time_in_seconds}
        {costs}
        requirements={requirementsTableItems}
        buffModifier={BuffModifier.ResearchCost}
      />
      {#if requiredByTableItems}
        <RequiredByTable items={requiredByTableItems} />
      {/if}
    </div>
  </div>
</DetailPageContainer>
