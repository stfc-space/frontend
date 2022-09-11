<script lang="ts">
  import { abilityValue, Officer } from '$lib/shared/yuki/models';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import { officerAbilityThumb, officerThumb, resourceThumb } from '$lib/shared/yuki/thumbs';

  import { number, _ } from 'svelte-i18n';
  import { formatPrimeText, sortResourceList } from '$lib/shared/yuki/utils';
  import { Table } from '@radion/ui';
  import RarityLabel from '$lib/components/prime/RarityLabel.svelte';
  import { uniqBy } from 'lodash-es';
  import MetaHeader from '$lib/components/MetaHeader.svelte';

  import type { PageData } from './$types';
  export let data: PageData;

  $: otherClasses = [1, 2, 3].filter((x) => x !== data.officer.class);
  $: synergyItems = [
    {
      id: `${data.officer.class}_${data.officer.id}`,
      class: $_(`officer_division_${data.officer.class}_name`),
      bonus: abilityValue(data.officer.captain_ability, 1)
    }
  ].concat(
    otherClasses.map((x) => {
      return {
        id: `${x}_${data.officer.id}`,
        class: $_(`officer_division_${x}_name`),
        bonus: abilityValue(data.officer.captain_ability, 2)
      };
    })
  );
  $: officerSynergyHeaders = [
    { text: $_('officer.class'), value: 'class' },
    {
      text: $_('officer.bonus'),
      value: 'bonus',
      percentage: data.officer.ability.value_is_percentage || data.officer.ability.show_percentage
    }
  ];
  $: officerRankHeaders = [
    { text: $_('officer.rank'), value: 'class' },
    {
      text: $_('officer.bonus'),
      value: 'bonus',
      percentage: data.officer.ability.value_is_percentage || data.officer.ability.show_percentage
    }
  ];

  $: costs = sortResourceList(data.officer.ranks.flatMap((x) => x.costs));
  $: rankExtra = uniqBy(costs, 'resource_id');
  $: rankHeaders = [
    { text: '#', value: 'rank' },
    { text: $_('officer.max-level'), value: 'max_level' },
    {
      text: $_('officer.shards-required'),
      value: 'shards_required'
    }
  ].concat(
    rankExtra.map((extra) => {
      return {
        text: $_(`materials_${extra.resource_id}_name`),
        value: extra.resource_id.toString()
      };
    })
  );
  $: rankItems = data.officer.ranks.map((r, index, _this) => {
    const o = {
      id: r.rank,
      rank: $_(`officers_-1_officer_rank_${r.rank}`),
      max_level: r.max_level,
      shards_required: r.shards_required - (_this[index - 1]?.shards_required || 0)
    };

    for (const extra of uniqBy(r.costs, 'resource_id')) {
      o[extra.resource_id.toString()] = extra.amount;
    }

    return o;
  });

  $: levelHeaders = [
    { text: 'Level', value: 'level' },
    { text: 'Attack', value: 'attack' },
    { text: 'Defense', value: 'defense' },
    { text: 'Health', value: 'health' },
    { text: 'XP', value: 'xp' }
  ];

  $: levelItems = data.officer.ranks.flatMap((rank, index, _this) => {
    const r = [];
    r.push({
      id: 1000 * rank.rank,
      text: $_(`officers_-1_officer_rank_${rank.rank}`),
      __collapseRow: true
    });
    const ml = _this[index - 1]?.max_level;
    for (let i = ml ? ml + 1 : 0; i <= rank.max_level; ++i) {
      const l = data.officer.levels.find((x) => x.level == i);
      if (!l) {
        continue;
      }
      const s = data.officer.stats[i - 1];
      r.push({
        id: l.level,
        level: l.level,
        attack: Math.round(s.attack),
        defense: Math.round(s.defense),
        health: Math.round(s.health),
        xp: l.xp
      });
    }
    return r;
  });

  $: hasTraits = !!data.officer.trait_config;
  $: traits =
    data.officer.trait_config?.progression.map((progression) => {
      return {
        id: progression.trait_id,
        levels: data.officer.trait_config?.traits
          .find((x) => x.trait_id === progression.trait_id)
          ?.cost.sort((a, b) => a.level - b.level)
          .map((x) => {
            return {
              id: x.level,
              level: x.level,
              cost: x.costs
            };
          })
      };
    }) ?? [];

  $: synergyOfficers = data.officerList.filter(
    (sofficer) => sofficer.synergy_id == data.officer.synergy_id && sofficer.id != data.officer.id
  );

  const officerSynergyBonus = (synergyOfficer: Officer) => {
    const value =
      data.officer.class == synergyOfficer.class
        ? abilityValue(data.officer.captain_ability, 1)
        : abilityValue(data.officer.captain_ability, 2);
    return value;
  };
  $: synergyIsPercentage =
    data.officer.captain_ability.value_is_percentage ||
    data.officer.captain_ability.show_percentage;
</script>

<MetaHeader
  title={`${$_('project.name')} - ${$_(`officers_${data.officer.id}_name`)}`}
  description={$_(`officers_${data.officer.id}_description`)}
  image={officerThumb(data.officer.art_id)}
/>

<DetailPageContainer>
  <div
    class="detail-page-header flex justify-between items-center relative gap-x-8 p-2 px-2 sm:px-4 flex-wrap"
  >
    <div class="flex sm:flex-shrink-0">
      <img class="h-16 mr-2" src={officerThumb(data.officer.art_id)} alt="logo" />
      <div class="flex flex-col">
        <span class="text-sm"
          ><RarityLabel rarity={data.officer.rarity} /> - {$_(
            `factions_${data.officer.faction}_name`
          )} -
          {$_(`officer_division_${data.officer.class}_name`)}</span
        >
        <span class="text-xl font-bold whitespace-normal sm:whitespace-nowrap">
          {$_(`officers_${data.officer.id}_name`)}
        </span>
        <span class="text-sm">{$_(`officers_synergy_${data.officer.synergy_id}_name`)}</span>
      </div>
    </div>
  </div>
  <div class="p-2 px-2 sm:px-4">
    <div class="flex mb-4 flex-wrap">
      <span class="text-base max-w-sm lg:max-w-xl">
        <span class="flex items-center mb-2">
          <img
            src={officerAbilityThumb(data.officer.captain_ability.art_id)}
            class="h-8 mr-2"
            alt=""
          />
          <h3 class="font-bold text-xl">
            {$_(`officers_${data.officer.id}_captain_ability_name`)}
            <span class="text-sm font-normal">[{$_('officer.captain-maneuver')}]</span>
          </h3>
        </span>
        {@html formatPrimeText($_(`officers_${data.officer.id}_captain_ability_description`), {
          vars: [abilityValue(data.officer.captain_ability, 0)],
          stripLines: 1
        })}</span
      >
      <div class="sm:ml-auto w-full sm:w-max">
        <div class="font-bold mb-2">{$_('officer.synergy-bonus')}</div>
        <Table class="shadow" headers={officerSynergyHeaders} items={synergyItems} />
      </div>
    </div>

    <div class="flex mb-4 flex-wrap">
      <span class="text-base max-w-sm lg:max-w-xl">
        <span class="flex items-center mb-2">
          <img src={officerAbilityThumb(data.officer.ability.art_id)} class="h-8 mr-2" alt="" />
          <h3 class="font-bold text-xl">
            {$_(`officers_${data.officer.id}_officer_ability_name`)}
            <span class="text-sm font-normal">[{$_('officer.officer-ability')}]</span>
          </h3>
        </span>
        {@html formatPrimeText($_(`officers_${data.officer.id}_officer_ability_description`), {
          vars: [abilityValue(data.officer.ability, 0)],
          stripLines: 1
        })}</span
      >
      <div class="sm:ml-auto w-full sm:w-max">
        <div class="font-bold mb-2">{$_('officer.rank-bonus')}</div>
        <Table
          class="shadow"
          headers={officerRankHeaders}
          items={data.officer.ranks.map((rank) => {
            return {
              id: rank.rank,
              class: $_(`officers_-1_officer_rank_${rank.rank}`),
              bonus: abilityValue(data.officer.ability, rank.rank - 1)
            };
          })}
        />
      </div>
    </div>
    {#if data.officer.below_decks_ability}
      <div class="flex mb-4 flex-wrap">
        <span class="text-base max-w-sm lg:max-w-xl">
          <span class="flex items-center mb-2">
            <img
              src={officerAbilityThumb(data.officer.below_decks_ability.art_id)}
              class="h-8 mr-2"
              alt=""
            />
            <h3 class="font-bold text-xl">
              {$_(`officers_${data.officer.id}_below_decks_ability_name`)}
              <span class="text-sm font-normal">[{$_('officer.below-decks-ability')}]</span>
            </h3>
          </span>
          {@html formatPrimeText(
            $_(`officers_${data.officer.id}_below_decks_ability_description`),
            {
              vars: [abilityValue(data.officer.below_decks_ability, 0)],
              stripLines: 1
            }
          )}</span
        >
        <div class="sm:ml-auto w-full sm:w-max">
          <div class="font-bold mb-2">{$_('officer.rank-bonus')}</div>
          <Table
            class="shadow"
            headers={officerRankHeaders}
            items={data.officer.ranks.map((rank) => {
              return {
                id: rank.rank,
                class: $_(`officers_-1_officer_rank_${rank.rank}`),
                bonus: abilityValue(data.officer.ability, rank.rank - 1)
              };
            })}
          />
        </div>
      </div>
    {/if}
    <div class="flex mb-4 flex-col max-w-full">
      <h3 class="font-bold mb-1 text-lg">{$_('officer.rank-upgrades')}</h3>
      <div>
        <Table headers={rankHeaders} items={rankItems} />
      </div>
    </div>
    <div class="flex mb-4 flex-col max-w-full">
      <h3 class="font-bold mb-1 text-lg">{$_('officer.level-upgrades')}</h3>
      <div>
        <Table sticky headers={levelHeaders} items={levelItems} />
      </div>
    </div>
    <div class="flex flex-wrap md:flex-nowrap gap-4">
      <div class="flex mb-4 flex-col max-w-full flex-shrink-0">
        {#if hasTraits}
          <h3 class="font-bold mb-1 text-lg">{$_('officer.traits')}</h3>
          <div class="flex flex-wrap gap-2 md:flex-nowrap">
            {#each traits as trait (trait)}
              <div class="w-[fit-content]">
                <h4 class="font-bold mb-1">{$_(`traits_${trait.id}_name`)}</h4>
                <Table
                  forcePadding
                  headers={[
                    { text: 'Level', value: 'level' },
                    { text: 'Cost', value: 'cost' }
                  ]}
                  items={trait.levels}
                  let:header
                  let:f
                  let:value
                >
                  {#if header.value == 'cost' && Array.isArray(value)}
                    {#each value as cost (cost.resource_id)}
                      <span class="inline-flex gap-1 justify-between w-full text-right font-bold">
                        <img
                          src={resourceThumb(cost.resource_id)}
                          class="my-auto"
                          width="16"
                          height="16"
                          alt=""
                          aria-hidden="true"
                        />{$number(cost.amount)}
                      </span>
                    {/each}
                  {:else}
                    <div class="text-center">
                      {f(header, value)}
                    </div>
                  {/if}
                </Table>
              </div>
            {/each}
          </div>
        {:else}
          <span class="font-bold text-lg">{$_('officer.no-traits')}</span>
        {/if}
      </div>
      <div>
        <h3 class="font-bold mb-1 text-lg">Synergy Officers</h3>
        <div class="flex gap-2 flex-wrap">
          {#each synergyOfficers as synergyOfficer (synergyOfficer.id)}
            <a
              href="/officers/{synergyOfficer.id}"
              class="rounded shadow w-[8rem] p-1 bg-light-600 dark:bg-dark-500 h-[fit-content]"
            >
              <div class="text-center h-[3rem] break-words" style={'hyphens: auto'}>
                {$_(`officers_${synergyOfficer.id}_name`)}
              </div>
              <img
                class="h-14 mx-auto"
                aria-hidden="true"
                src={officerThumb(synergyOfficer.art_id)}
                alt="_"
              />
              <div class="text-center font-bold tabular-nums">
                {$number(officerSynergyBonus(synergyOfficer), {
                  style: synergyIsPercentage ? 'percent' : undefined
                })}
              </div>
            </a>
          {/each}
        </div>
      </div>
    </div>
    <div class="flex flex-col mb-4">
      <h3 class="font-bold mb-2">{$_('officer.description')}</h3>
      <p class="text-justify">
        {@html formatPrimeText($_(`officers_${data.officer.id}_narrative`), { stripLines: 3 })}
      </p>
    </div>
  </div>
</DetailPageContainer>
