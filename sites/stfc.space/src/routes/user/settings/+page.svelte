<script lang="ts">
  import AuthForm from '$lib/components/AuthForm.svelte';

  import type { PageData } from './$types';
  export let data: PageData;
</script>

<AuthForm type="settings" only="profile" authUi={data.ui} flowId={data.id} />
<AuthForm type="settings" only="password" authUi={data.ui} flowId={data.id} />
