<script lang="ts">
  import AuthForm from '$lib/components/AuthForm.svelte';

  import type { PageData } from './$types';
  export let data: PageData;
  // export let flowID: string;
</script>

<AuthForm type="login" authUi={data.authUi} />
