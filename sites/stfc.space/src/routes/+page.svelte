<script context="module" lang="ts">
  export const prerender = false;
</script>

<script lang="ts">
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import SectionLink from '$lib/components/SectionLink.svelte';
  import { _ } from 'svelte-i18n';
</script>

<MetaHeader title={`${$_('project.name')} - ${$_('title.home')}`} />

<section>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-5xl font-bold mt-4 mb-8 dark:text-light-200 text-dark-800 text-center">
      {$_('project.name')}
    </h1>

    <div class="flex flex-col flex-wrap">
      <div class="grid grid-cols-4 overflow-hidden gap-1">
        <SectionLink href="/ships">{$_('section.ships')}</SectionLink>
        <SectionLink href="/officers">{$_('section.officers')}</SectionLink>
        <SectionLink href="/systems">{$_('section.systems')}</SectionLink>
        <SectionLink href="/buildings">{$_('section.buildings')}</SectionLink>
        <SectionLink href="/researches">{$_('section.research')}</SectionLink>
        <SectionLink href="/hostiles">{$_('section.hostiles')}</SectionLink>
        <SectionLink href="/events">{$_('section.events')}</SectionLink>
        <SectionLink href="/missions">{$_('section.missions')}</SectionLink>
        <SectionLink href="/tools">{$_('section.tools')}</SectionLink>
        <SectionLink href="/map">{$_('section.map')}</SectionLink>
        <SectionLink href="/charts">{$_('section.charts')}</SectionLink>
      </div>
    </div>
  </div>
</section>
