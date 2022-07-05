<script lang="ts" context="module">
  import { createLoad } from './_load';
  export const load = createLoad('verify');
</script>

<script lang="ts">
  import type { UiContainer } from '@ory/client';

  import AuthForm from '$lib/components/AuthForm.svelte';

  export let authUi: UiContainer;
</script>

<AuthForm type="verify" {authUi} />
