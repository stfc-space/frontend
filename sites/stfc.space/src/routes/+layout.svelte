<script lang="ts">
  import 'virtual:windi.css';

  import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { locale } from 'svelte-i18n';
  import { $locale as searchLocale } from '$lib/shared/search';

  import type { LayoutData } from './$types';
  export let data: LayoutData;

  searchLocale.set(data.lang);
  locale.set(data.lang);

  let ReloadPrompt = null;
  onMount(async () => {
    if (!dev && browser) {
      ReloadPrompt = (await import('$lib/components/ReloadPrompt.svelte')).default;
    }
  });

  import { navigating } from '$app/stores';
  import navState from '$lib/stores/navstate';
  import NavLoader from '$lib/components/NavLoader.svelte';

  import { theme } from '$lib/shared/stores';

  // if we're navigating, set the store accordingly
  $: $navState =
    $navigating != null && $navigating.from?.pathname !== $navigating.to?.pathname
      ? 'loading'
      : 'loaded';

  import '../app.css';
</script>

<svelte:head>
  <meta name="color-scheme" content={$theme == 'system' ? 'light dark' : $theme} />
</svelte:head>

<NavLoader />
<Header userId={data.userId} />
<main class="py-4 w-full mx-auto flex justify-center flex-1">
  <div class="max-w-screen-lg mx-2 sm:mx-4 flex-1 w-[calc(100%-0.5rem)]">
    <slot />
  </div>
</main>

{#if ReloadPrompt}
  <svelte:component this={ReloadPrompt} />
{/if}
<Footer />
