<script context="module" lang="ts">
  import { setupI18n } from '$lib/i18n';

  import { waitLocale } from 'svelte-i18n';

  import { setupSearch, waitSearchReady } from '$lib/shared/search';
  import { waitStaticData } from '$lib/shared/api';

  async function getLogoutUrl(fetch: Window['fetch'], session: { user: unknown }) {
    // No user, so we can't log out
    if (!session.user) {
      return null;
    }

    const r = await fetch(`/api/auth/self-service/logout/browser`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const r2 = await r.json<{ logout_url: string }>();
    return r2?.logout_url;
  }

  export async function load({ session, fetch }) {
    setupI18n({ withLocale: session.lang }, fetch);
    setupSearch();
    let logoutUrl: string;
    await Promise.all([
      waitLocale(session.lang),
      waitSearchReady(session.lang, fetch),
      waitStaticData(fetch),
      getLogoutUrl(fetch, session).then((url) => {
        logoutUrl = url;
      })
    ]);

    return { props: { theme: session.theme, lang: session.lang, logoutUrl } };
  }
</script>

<script lang="ts">
  import 'virtual:windi.css';

  import { onMount } from 'svelte';
  import { browser, dev } from '$app/env';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { locale } from 'svelte-i18n';
  import { $locale as searchLocale } from '$lib/shared/search';

  export let lang: string;
  export let logoutUrl: string;

  searchLocale.set(lang);
  locale.set(lang);

  let ReloadPrompt = null;
  onMount(async () => {
    if (!dev && browser) {
      ReloadPrompt = (await import('$lib/components/ReloadPrompt.svelte')).default;
    }
  });

  import { navigating } from '$app/stores';
  import navState from '$lib/stores/navstate';
  import NavLoader from '$lib/components/NavLoader.svelte';

  // if we're navigating, set the store accordingly
  $: $navState =
    $navigating != null && $navigating.from?.pathname !== $navigating.to?.pathname
      ? 'loading'
      : 'loaded';

  import '../app.css';
</script>

<NavLoader />
<Header {logoutUrl} />
<main class="py-4 w-full mx-auto flex justify-center flex-1">
  <div class="max-w-screen-lg mx-2 sm:mx-4 flex-1 w-[calc(100%-0.5rem)]">
    <slot />
  </div>
</main>

{#if ReloadPrompt}
  <svelte:component this={ReloadPrompt} />
{/if}
<Footer />
