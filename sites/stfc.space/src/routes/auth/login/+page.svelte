<script lang="ts" context="module">
  import { createLoad } from './_load';
  export const load = createLoad('login');
</script>

<script lang="ts">
  import type { UiContainer } from '@ory/client';

  import AuthForm from '$lib/components/AuthForm.svelte';

  export let authUi: UiContainer;
  // export let flowID: string;
</script>

<AuthForm type="login" {authUi} />
