<script lang="ts">
  import type { PageData } from './$types';
  import { LinkedChart } from 'svelte-tiny-linked-charts';

  import { time, _ } from 'svelte-i18n';
  import { Table } from '@radion/ui';
  import { sortBy } from 'lodash-es';
  import { YukiApi } from '$lib/shared/api';
  import { browser } from '$app/environment';
  import { Region, Status } from './+page';

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

  let containerWidth = 0;

  $: latencyChartWidth = containerWidth > 515 ? 250 : 175;
</script>

<div bind:clientWidth={containerWidth}>
  <div class="p-1">Last Updated: {$time(lastFetched, { format: 'medium' })}</div>
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
    items={instances.map((instance) => {
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
          width={latencyChartWidth}
          showValue
          valuePosition="floating"
          uid={`table-${item.id}`}
          type="line"
          scaleMax="300"
          valueAppend="ms"
          values={value}
          labels={item.latency_lables}
        />
      </div>
    {:else if header.value == 'status'}
      <div class="px-2">
        {#if item.status == Status.Online}
          <span class="border border-green-500 text-green-500 px-1 py-0.5 rounded dark:bg-dark-900">
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
</div>
