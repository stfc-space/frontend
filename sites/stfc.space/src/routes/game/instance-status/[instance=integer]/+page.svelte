<script lang="ts">
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import { _ } from 'svelte-i18n';
</script>

<svelte:head>
  <MetaHeader title={`${$_('project.name')} - ${$_('server.status')}`} />
</svelte:head>

<div>Here be dragons</div>
