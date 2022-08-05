<script context="module" lang="ts">
  import { YukiApi } from '$lib/shared/api';

  import type { LoadEvent } from '@sveltejs/kit/types';

  export async function load({ session, params, fetch }: LoadEvent) {
    const hostile = await YukiApi.get('/hostile/' + params.hid, undefined, fetch);
    return { props: { hostile } };
  }
</script>

<script lang="ts">
  import { _ } from 'svelte-i18n';

  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import type { HostileDetail } from '$lib/shared/yuki/models';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';

  export let hostile: HostileDetail;
</script>

<MetaHeader title={`${$_('project.name')} - ${$_(`hostiles_${hostile.id}_name`)}`} />

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
