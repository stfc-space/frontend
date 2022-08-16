<script lang="ts">
  import { _ } from 'svelte-i18n';

  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import type { HostileDetail } from '$lib/shared/yuki/models';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';

  import type { PageData } from './$types';
  export let data: PageData;
</script>

<MetaHeader title={`${$_('project.name')} - ${$_(`hostiles_${data.hostile.id}_name`)}`} />

<DetailPageContainer>
  <div class="detail-page-header header text-light-300">
    This is the header for hostiles
    <br />
  </div>
  <div class="w-full p-2 px-2 sm:px-4">
    Here lives the content
    <br />
  </div>
</DetailPageContainer>
