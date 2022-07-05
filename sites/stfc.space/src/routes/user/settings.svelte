<script lang="ts" context="module">
  import { createLoad } from '../auth/_load';
  export const load = createLoad('settings');
</script>

<script lang="ts">
  import type { UiContainer } from '@ory/client';

  import AuthForm from '$lib/components/AuthForm.svelte';

  export let authUi: UiContainer;
</script>

<AuthForm type="settings" only="profile" {authUi} />
<AuthForm type="settings" only="password" {authUi} />
