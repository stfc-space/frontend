<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { systemHostileTypes } from '../helpers';

  import { factionThumb, resourceThumb } from '$lib/shared/yuki/thumbs';

  import { uniqBy } from 'lodash-es';
  import { Table } from '@radion/ui';

  import SystemMap from '$lib/components/prime/SystemMap/index.svelte';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import MetaHeader from '$lib/components/MetaHeader.svelte';

  import type { PageData } from './$types';
  export let data: PageData;

  const hostile_types = systemHostileTypes(data.system);

  $: uniqueMines = uniqBy(data.system.mines, 'resource').map((mine) => {
    const count = data.system.mines.filter(
      (v, i, a) => a.findIndex((x) => x.id == v.id) === i
    ).length;
    const rates = data.system.mines
      .filter((v, i, a) => a.findIndex((x) => x.resource == v.resource && x.rate === v.rate) === i)
      .map((v) => v.rate)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a - b);
    return {
      mine,
      count,
      rates
    };
  });

  $: uniqueMinesTableItems = uniqueMines.map((x) => {
    return {
      id: x.mine.id,
      icon: resourceThumb(x.mine.resource),
      name: $_(`materials_${x.mine.resource}_name`),
      size: x.mine.amount,
      rates: x.rates,
      count: x.count
    };
  });

  $: hostilesTableItems = data.system.hostiles
    .map((x) => {
      return {
        id: x.id,
        name: $_(`hostiles_${x.loca_id}_name`),
        level: x.level,
        strength: x.strength,
        t: x.hull_type
      };
    })
    // TODO(alexander): Sort such that scouts are always first and armadas last
    .sort((a, b) => a.level - b.level)
    .sort((a, b) => {
      return a.t - b.t;
    });

  $: missions = data.system.missions.map((x) => {
    return {
      id: x
    };
  });
</script>

<MetaHeader title={`${$_('project.name')} - ${$_(`systems_${data.system.id}_name`)}`} />

<DetailPageContainer>
  <div class="detail-page-header header text-light-300">
    <div class="flex flex-wrap justify-between items-center relative gap-x-2">
      <div class="flex flex-col">
        <span class="text-sm inline-flex items-center gap-x-1"
          ><img class="h-6" src={factionThumb(data.system.faction)} alt="logo" />{$_(
            `factions_${data.system.faction}_name`
          )}</span
        >
        <span class="text-xl font-bold"
          >{$_(`systems_${data.system.id}_name`)}
          <span class="text-base">({data.system.level})</span></span
        >
        <span class="text-sm">
          {$_('system.warp')}
          {data.system.est_warp}
        </span>
      </div>
      <span
        class="max-w-70 hidden sm:inline min-w-0 flex-grow-0 flex-shrink overflow-hidden overflow-ellipsis whitespace-nowrap"
      >
        {$_(`systems_${data.system.id}_narrative`, { default: '' })}
      </span>
      <div class="grid grid-cols-[1fr,max-content] gap-x-2 items-end tabular-nums">
        <span>{$_('system.mining-nodes')}</span>
        <span class="ml-auto">{data.system.mines.length}</span>
        <span>{$_('system.spawn-points')}</span>
        <span class="ml-auto">{data.system.spawn_points?.length ?? 0}</span>
        <span class="col-span-2 h-6 flex items-center">
          <img
            src="$lib/assets/icons/ship_types/armada.png"
            class="object-contain h-4 w-4"
            class:hidden={!hostile_types.arm}
            alt={$_('aria_hostile_type.armada')}
          />
          <img
            src="$lib/assets/icons/ship_types/battleship.png"
            class="object-contain h-4 w-4"
            class:hidden={!hostile_types.bs}
            alt={$_('aria_hostile_type.battleship')}
          />
          <img
            src="$lib/assets/icons/ship_types/explorer.png"
            class="object-contain h-4 w-4"
            class:hidden={!hostile_types.exp}
            alt={$_('aria_hostile_type.explorer')}
          />
          <img
            src="$lib/assets/icons/ship_types/interceptor.png"
            class="object-contain h-4 w-4"
            class:hidden={!hostile_types.int}
            alt={$_('aria_hostile_type.interceptor')}
          />
          <img
            src="$lib/assets/icons/ship_types/survey.png"
            class="object-contain h-4 w-4"
            class:hidden={!hostile_types.sur}
            alt={$_('aria_hostile_type.survey')}
          />
        </span>
      </div>
    </div>
  </div>
  <div class="w-full p-2 px-2 sm:px-4">
    <h3 class="font-bold mb-1">{$_('system.mining-nodes')}</h3>
    <Table
      class="shadow"
      headers={[
        {
          text: 'Resource',
          icon: 'icon',
          value: 'name'
        },
        {
          text: 'Size',
          value: 'size'
        },
        {
          text: 'Rate(s)',
          value: 'rates'
        },
        {
          text: 'Count',
          value: 'count'
        }
      ]}
      items={uniqueMinesTableItems}
    />
  </div>
  <div class="w-full p-2 px-2 sm:px-4">
    <h3 class="font-bold mb-1">{$_('system.hostiles')}</h3>
    <Table
      class="shadow"
      headers={[
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Level',
          value: 'level'
        },
        {
          text: 'Strength',
          value: 'strength'
        }
      ]}
      items={hostilesTableItems}
      let:item
      let:header
      let:f
      let:value
    >
      <a sveltekit:prefetch href="/hostiles/{item.id}" class="block class p-2">
        {f(header, value)}
      </a>
    </Table>
  </div>

  <div class="w-full p-2 px-2 sm:px-4">
    <h3 class="font-bold mb-1">{$_('system.missions')}</h3>
    <Table
      class="shadow"
      headers={[
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Warp',
          value: 'warp'
        },
        {
          text: 'W. Completion',
          value: 'completion'
        }
      ]}
      items={missions.map((x) => {
        return {
          id: x.id,
          warp: 0,
          completion: 0,
          name: $_(`missions_${x.id}_title`)
        };
      })}
      let:item
      let:header
      let:f
      let:value
    >
      <a sveltekit:prefetch href="/missions/{item.id}" class="block p-2">
        {f(header, value)}
      </a>
    </Table>
  </div>
  <div class="w-full p-2 px-2 sm:px-2">
    <h3 class="font-bold text-xl text-center mb-4">{$_('system.map')}</h3>
    <SystemMap system={data.system} />
  </div>
</DetailPageContainer>

<style>
  .header:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: url($lib/assets/system-header.png);
    background-position: 50% 40%;
    background-size: cover;
    z-index: 1;
  }
  .header:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(29, 31, 41, 0.8);
    z-index: 2;
  }
  .header > * {
    z-index: 3;
  }
</style>
