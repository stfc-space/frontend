<script lang="ts">
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';

  import { _ } from 'svelte-i18n';
  import {
    shipThumb,
    officerAbilityThumb,
    buildingThumb,
    researchThumb
  } from '$lib/shared/yuki/thumbs';
  import { Table, Slider, NumberInput } from '@radion/ui';
  import { formatPrimeText, sortResourceList } from '$lib/shared/yuki/utils';

  import RarityLabel from '$lib/components/prime/RarityLabel.svelte';
  import BuildCosts, { BuffModifier } from '$lib/components/prime/BuildCost.svelte';
  import type { RequirementUiItem } from '$lib/components/prime/RequiredByTable.svelte';
  import { clamp, debounce } from 'lodash-es';
  import { browser } from '$app/environment';
  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import ShipComponent from '$lib/components/prime/ShipComponent.svelte';
  import CostItems from '$lib/components/prime/CostItems.svelte';
  import { getStaticData } from '$lib/shared/api';

  import type { PageData } from './$types';
  import {
    abilityValue,
    BuildCost,
    Rarity,
    Requirement,
    RequirementType,
    ShipDetailComponent
  } from '$lib/shared/yuki/models';
  export let data: PageData;

  const { resources, researches } = getStaticData();

  const readFiltersFromQuery = () => {
    return Object.assign(
      {},
      {
        level: data.queryStore.readField('level'),
        scrapLevel: data.queryStore.readField('slevel'),
        tierMin: data.queryStore.readField('tr')?.[0],
        tierMax: data.queryStore.readField('tr')?.[1]
      }
    );
  };
  let filters = readFiltersFromQuery();

  $: {
    if (browser) {
      updateQuery(filters);
    }
  }

  onDestroy(
    page.subscribe((page) => {
      data.queryStore.setQuery(page.url.searchParams, true);
      filters = readFiltersFromQuery();
    })
  );

  const updateQuery = debounce((..._args) => {
    data.queryStore.updateField('level', filters.level);
    data.queryStore.updateField('slevel', filters.scrapLevel);
    data.queryStore.updateField('tr', [filters.tierMin, filters.tierMax]);
    data.queryStore.submitQuery();
  });

  let tierRange = [filters.tierMin, filters.tierMax];

  const updateTierRange = debounce((v: number[]) => {
    filters.tierMin = v[0];
    filters.tierMax = v[1];
  }, 20);

  $: {
    updateTierRange(tierRange);
  }

  $: abilityHeader = [
    { text: 'Level', value: 'level', percentage: false },
    {
      text: 'Bonus',
      value: 'value',
      percentage: data.ship.ability.value_is_percentage || data.ship.ability.show_percentage
    }
  ];
  $: abilityItems = data.ship.ability.values.slice(0, data.ship.max_level).map((_, index) => {
    return { id: index, level: index + 1, value: abilityValue(data.ship.ability, index) };
  });
  $: buildCost = sortResourceList(data.ship.build_cost).map((e) => {
    return { rarity: $resources.get(e.resource_id).rarity, ...e };
  });
  $: componentsHigh = ((): ShipDetailComponent[] => {
    const tier = clamp(filters.tierMax - 1, 0, data.ship.max_tier - 1);

    if (tier == 0) {
      return data.ship.tiers[tier].components.sort((a, b) => a.order - b.order);
    }
    return data.ship.tiers[tier].components
      .filter((c) => c.build_cost.length > 0)
      .sort((a, b) => a.order - b.order);
  })();

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

  $: buildRequirements = data.ship.build_requirements.map(mapRequirement);

  $: tierRangeMod = (() => {
    const rangeStart = filters.tierMin;
    const rangeEnd = filters.tierMax;
    const useTierRange = true;

    const start = useTierRange
      ? rangeStart == rangeEnd
        ? rangeStart - 1
        : rangeStart
      : rangeStart - 1;
    const end = useTierRange ? rangeEnd : rangeStart;

    return {
      start: clamp(start, 0, data.ship.tiers.length),
      end: clamp(end, 0, data.ship.tiers.length)
    };
  })();

  $: cumulativeUpgradeCost = (() => {
    const costs: { [key: string]: BuildCost & { rarity: Rarity } } = {};

    const { start, end } = tierRangeMod;

    for (let i = start; i < end; ++i) {
      for (const component of data.ship.tiers[i].components) {
        for (const cost of component.build_cost) {
          if (cost.resource_id in costs) {
            costs[cost.resource_id].amount += cost.amount;
          } else {
            costs[cost.resource_id] = { rarity: $resources.get(cost.resource_id).rarity, ...cost };
          }
        }
      }
    }
    return sortResourceList(Object.values(costs));
  })();
</script>

<MetaHeader title={`${$_('project.name')} - ${$_(`ships_${data.ship.id}_name`)}`} />

<DetailPageContainer>
  <div
    class="detail-page-header flex justify-between items-center relative gap-x-8 p-2 px-2 sm:px-4 flex-wrap"
  >
    <div class="flex sm:flex-shrink-0">
      <img class="h-16 mr-2" src={shipThumb(data.ship.art_id)} alt="logo" />
      <div class="flex flex-col">
        <span class="text-sm"
          ><RarityLabel rarity={data.ship.rarity} /> - {$_(
            `factions_${data.ship.faction}_name`
          )}</span
        >
        <span class="text-xl font-bold whitespace-normal sm:whitespace-nowrap">
          {$_(`ships_${data.ship.id}_name`)}
        </span>
        <span class="text-sm">{$_(`ship_type_${data.ship.hull_type}_name`)}</span>
      </div>
    </div>
  </div>
  <div class="p-2 px-2 sm:px-4">
    <div class="flex mb-4 flex-col flex-wrap">
      <span class="text-base">
        <span class="flex items-center mb-2">
          <img src={officerAbilityThumb(data.ship.ability.art_id)} class="h-8 mr-2" alt="" />
          <h3 class="font-bold text-xl">
            {$_(`ships_${data.ship.id}_bonus_name`)}
            <span class="text-sm font-normal">[{$_('ship.ability')}]</span>
          </h3>
        </span>
        {@html formatPrimeText($_(`ships_${data.ship.id}_bonus_description`), {
          vars: [abilityValue(data.ship.ability, 0)],
          stripLines: 1
        })}</span
      >
      <div class="w-full mt-4">
        <h3 class="font-bold mb-2">{$_('ship.ability-bonus')}</h3>
        <Table class="shadow" horizontal sticky headers={abilityHeader} items={abilityItems} />
      </div>
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2 section-divider text-lg">{$_('ship.description')}</h3>
      <div class="grid grid-cols-[1fr,auto] grid-rows-[auto,1fr] gap-x-2">
        <span class="text-sm"
          >{$_('ship.tier-range')} ({`${tierRangeMod.start} - ${tierRangeMod.end}`})</span
        >
        <span class="text-sm">{$_('ship.level')}</span>
        <Slider min="1" max={data.ship.max_tier} bind:value={tierRange} />
        <NumberInput
          class="w-20 inline"
          noButtons
          min={1}
          max={data.ship.max_level}
          bind:value={filters.level}
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <div class="flex w-full flex-col">
          <CostItems costs={cumulativeUpgradeCost} />
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4 mx-8 lg:mx-12">
          {#each componentsHigh as component}
            <ShipComponent tier={filters.tierMax} {component} />
          {/each}
        </div>
      </div>
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2 section-divider text-lg">{$_('ship.build-cost')}</h3>
      <BuildCosts
        time={data.ship.build_time_in_seconds}
        costs={buildCost}
        requirements={buildRequirements}
        multiRow={false}
        buffModifier={BuffModifier.ShipBuildCost}
      />
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2 section-divider text-lg">{$_('ship.description')}</h3>
      <p>Firing Pattern</p>
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2 section-divider text-lg">{$_('ship.description')}</h3>
      <p>Scrapping</p>
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2 section-divider text-lg">{$_('ship.description')}</h3>
      <p>Crew Slots</p>
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2 section-divider text-lg">{$_('ship.description')}</h3>
      <p>Testing</p>
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2 section-divider text-lg">{$_('ship.description')}</h3>
      <p class="text-justify">
        {@html formatPrimeText($_(`ships_${data.ship.id}_description`), { stripLines: 3 })}
      </p>
    </div>
  </div>
</DetailPageContainer>
