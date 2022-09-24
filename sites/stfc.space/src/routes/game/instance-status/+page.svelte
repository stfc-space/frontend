<script lang="ts">
  import type { PageData } from './$types';
  import LinkedChart from '$lib/components/LinkedChart.svelte';

  import { UserShared } from '@steeze-ui/remix-icons';

  import { time, _ } from 'svelte-i18n';
  import { Checkbox, Table } from '@radion/ui';
  import { sortBy } from 'lodash-es';
  import { YukiApi } from '$lib/shared/api';
  import { browser } from '$app/environment';
  import { Region, Status } from './+page';
  import { Icon } from '@steeze-ui/svelte-icon';

  export let data: PageData;

  $: instances = sortBy(data.status.instances, 'id');
  let lastFetched = new Date();

  if (browser) {
    setInterval(() => {
      YukiApi.get('/game/status', undefined, fetch).then((e: any) => {
        data.status = e;
        lastFetched = new Date();
      });
    }, 5 * 1000);
  }

  let containerWidth = 600;

  let selectedRegion = Region.UsEast1;

  $: latencyChartWidth = containerWidth > 515 ? 200 : 125;

  $: filteredInstances = instances
    .filter((instance) => {
      return instance.region == selectedRegion || selectedRegion == Region.Global;
    })
    .map((instance) => {
      return {
        id: instance.id,
        region: instance.region,
        status: instance.status,
        latency: instance.latency_ms,
        latency_lables: data.status.instance_latency_labels.slice(
          data.status.instance_latency_labels.length - instance.latency_ms.length
        ),
        transfer: instance.metadata.split('|').slice(0, 2),
        name: $_(`servers_${instance.id}_name`)
      };
    });

  let selectedInstance = -1;

  let useTable = false;
</script>

<div bind:clientWidth={containerWidth}>
  <Checkbox bind:checked={useTable}>Use Table</Checkbox>
  <div class="p-1">Last Updated: {$time(lastFetched, { format: 'medium' })}</div>
  <div class="flex gap-2 mb-4">
    <button
      class="px-2 py-1 rounded border border-green-500"
      on:click={() => (selectedRegion = Region.Global)}>All</button
    >
    <button
      class="px-2 py-1 rounded border border-green-500"
      on:click={() => (selectedRegion = Region.UsEast1)}>North America</button
    >
    <button
      class="px-2 py-1 rounded border border-green-500"
      on:click={() => (selectedRegion = Region.EuWest1)}>Europe</button
    >
    <button
      class="px-2 py-1 rounded border border-green-500"
      on:click={() => (selectedRegion = Region.ApNorthEast1)}>Asia Pacific</button
    >
  </div>
  {#if !useTable}
    <div class="grid gap-3 grid-cols-3 mb-4 grid-flow-dense">
      {#each filteredInstances as instance (instance.id)}
        <div
          class="flex items-center p-2 rounded-lg shadow bg-dark-500 flex-wrap w-full"
          on:click={() => {
            if (selectedInstance == instance.id) {
              selectedInstance = -1;
            } else {
              selectedInstance = instance.id;
            }
          }}
        >
          <div class="flex items-center gap-0.5">
            <span class="inline-block font-bold whitespace-nowrap">
              {#if instance.region == Region.UsEast1}
                {$_('region.us')}
              {:else if instance.region == Region.EuWest1}
                {$_('region.eu')}
              {:else if instance.region == Region.ApNorthEast1}
                {$_('region.apac')}
              {/if}-
              {String(instance.id).padStart(3, '0')}
            </span>
            <span class="inline-block text-gray-200 text-sm lg:block hidden">
              ({$_(`servers_${instance.id}_name`, { default: '' })})</span
            >
          </div>
          <div class="ml-auto p-2 flex lg:block flex-nowrap items-center">
            {#if instance.status == Status.Online}
              <span
                class="border border-green-500 text-green-500 px-1 py-0.5 rounded dark:bg-dark-900"
              >
                {$_('status.online')}
              </span>
            {:else if instance.status == Status.Maintenance}
              <span
                class="border border-yellow-500 text-yellow-500 px-1 py-0.5 rounded dark:bg-dark-900"
              >
                {$_('status.maintenance')}
              </span>
            {:else if instance.status == Status.Incident}
              <span class="border border-red-500 text-red-500 px-1 py-0.5 rounded dark:bg-dark-900">
                {$_('status.incident')}
              </span>
            {:else if instance.status == Status.Retired || instance.status == Status.Offline}
              <span class="border border-black-500 px-1 py-0.5 rounded dark:bg-dark-900">
                {$_('status.offline')}
              </span>
            {/if}
            <div class="ml-auto px-2 py-2 flex items-center gap-1 lg:hidden block text-sm">
              <Icon src={UserShared} class="w-6 h-6" />
              {#if instance.transfer[0] == '1'}
                <span class="border rounded border-green-500 px-1 py-0.5 hidden sm:block">IN</span>
              {:else}
                <span class="border rounded border-red-500 px-1 py-0.5 hidden sm:block">IN</span>
              {/if}
              {#if instance.transfer[1] == '1'}
                <span class="border rounded border-green-500 px-1 py-0.5 hidden sm:block">OUT</span>
              {:else}
                <span class="border rounded border-red-500 px-1 py-0.5 hidden sm:block">OUT</span>
              {/if}
            </div>
          </div>
          <div class="w-full gap-1 items-center hidden sm:flex">
            <div class="border border-2 border-indigo-500/50 mr-auto rounded">
              <LinkedChart
                uid={`table-${instance.id}`}
                width={latencyChartWidth}
                type="line"
                hover={false}
                interaction={false}
                scaleMax={300}
                values={instance.latency}
                labels={instance.latency_lables}
              />
            </div>
            <div class="px-2 py-2 items-center gap-1 lg:inline-flex hidden">
              <Icon
                src={UserShared}
                class="w-6 h-6 {instance.transfer[0] == '0' || instance.transfer[1] == '0'
                  ? instance.transfer[0] == '0' && instance.transfer[1] == '0'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                  : ''}"
              />
              {#if instance.transfer[0] == '1'}
                <span class="border rounded border-green-500 px-1 py-0.5">IN</span>
              {:else}
                <span class="border rounded border-red-500 px-1 py-0.5">IN</span>
              {/if}
              {#if instance.transfer[1] == '1'}
                <span class="border rounded border-green-500 px-1 py-0.5">OUT</span>
              {:else}
                <span class="border rounded border-red-500 px-1 py-0.5">OUT</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <Table
      full
      class="overflow-y-hidden"
      headers={[
        {
          text: 'Instance',
          value: 'id'
        },
        {
          text: 'Status',
          value: 'status'
        },
        {
          text: 'Transfer',
          value: 'transfer'
        },
        {
          text: 'Latency',
          value: 'latency'
        }
      ]}
      items={instances
        .filter((instance) => {
          return instance.region == selectedRegion || selectedRegion == Region.Global;
        })
        .map((instance) => {
          return {
            id: instance.id,
            region: instance.region,
            status: instance.status,
            latency: instance.latency_ms,
            latency_lables: data.status.instance_latency_labels.slice(
              data.status.instance_latency_labels.length - instance.latency_ms.length
            ),
            transfer: instance.metadata.split('|').slice(0, 2),
            name: $_(`servers_${instance.id}_name`)
          };
        })}
      let:item
      let:header
      let:f
      let:value
    >
      {#if header.value == 'region'}
        {#if item.region == Region.UsEast1}
          {$_('region.us')}
        {:else if item.region == Region.EuWest1}
          {$_('region.eu')}
        {:else if item.region == Region.ApNorthEast1}
          {$_('region.apac')}
        {/if}
      {:else if header.value == 'id'}
        <span class="mr-auto inline-block">
          {#if item.region == Region.UsEast1}
            {$_('region.us')}
          {:else if item.region == Region.EuWest1}
            {$_('region.eu')}
          {:else if item.region == Region.ApNorthEast1}
            {$_('region.apac')}
          {/if}-
          {String(item.id).padStart(3, '0')}
        </span>
        <!-- <span class="ml-auto inline-block">({$_(`servers_${item.id}_name`)})</span> -->
      {:else if header.value == 'transfer'}
        {#if item.transfer[0] == '1'}
          <span class="border rounded border-green-500 px-1 py-0.5">IN</span>
        {:else}
          <span class="border rounded border-red-500 px-1 py-0.5">IN</span>
        {/if}
        {#if item.transfer[1] == '1'}
          <span class="border rounded border-green-500 px-1 py-0.5">OUT</span>
        {:else}
          <span class="border rounded border-red-500 px-1 py-0.5">OUT</span>
        {/if}
        <!-- <span class="ml-auto inline-block">({$_(`servers_${item.id}_name`)})</span> -->
      {:else if header.value == 'latency'}
        <div class="latency-chart px-2 py-1 w-[fit-content] ml-auto">
          <LinkedChart
            uid={`table-${item.id}`}
            type="line"
            width={latencyChartWidth}
            hover={false}
            interaction={false}
            scaleMax={300}
            values={item.latency}
            labels={item.latency_lables}
          />
        </div>
      {:else if header.value == 'status'}
        <div class="px-2 py-2">
          {#if item.status == Status.Online}
            <span
              class="border border-green-500 text-green-500 px-1 py-0.5 rounded dark:bg-dark-900"
            >
              {$_('status.online')}
            </span>
          {:else if item.status == Status.Maintenance}
            <span
              class="border border-yellow-500 text-yellow-500 px-1 py-0.5 rounded dark:bg-dark-900"
            >
              {$_('status.maintenance')}
            </span>
          {:else if item.status == Status.Incident}
            <span class="border border-red-500 text-red-500 px-1 py-0.5 rounded dark:bg-dark-900">
              {$_('status.incident')}
            </span>
          {:else if item.status == Status.Retired || item.status == Status.Offline}
            <span class="border border-black-500 px-1 py-0.5 rounded dark:bg-dark-900">
              {$_('status.offline')}
            </span>
          {:else}
            <span>{f(header, value)}</span>
          {/if}
        </div>
      {:else}
        {f(header, value)}
      {/if}
    </Table>
  {/if}
</div>
