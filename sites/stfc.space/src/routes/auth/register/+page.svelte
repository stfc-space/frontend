<script lang="ts">
  import type { PageData } from './$types';

  import AuthForm from '$lib/components/AuthForm.svelte';

  export let data: PageData;
</script>

<AuthForm type="registration" authUi={data.ui} flowId={data.id} />
