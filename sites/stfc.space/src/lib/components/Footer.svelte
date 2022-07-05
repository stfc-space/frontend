<script>
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  const version = import.meta.env.PACKAGE_VERSION;
  const refHash = import.meta.env.GIT_REV_HASH;
</script>

<footer class="p-2 bg-dark-900 text-light-500 mt-auto">
  <div
    class="flex justify-between items-center gap-2 flex-wrap pb-4 self-center w-stretch flex mx-auto max-w-screen-lg flex items-center w-full"
  >
    <div class="flex flex-col">
      <a
        sveltekit:prefetch
        href="/"
        aria-label="Home"
        class="text-blue font-bold flex items-center flex-1 lg:flex-none mb-2"
      >
        <img class="w-8 h-full" width="32" height="32" src="$lib/assets/logo.png" alt="logo" />
        <span>STFC.space</span>
      </a>
      <div class="flex flex-col gap-y-0.5">
        <a href="/cookie-policy" class="text-indigo-500">Cookie Policy</a>
        <a href="/privacy-policy" class="text-indigo-500">Privacy Policy</a>
        <LanguageSwitcher />
      </div>
      <span class="mt-4">
        Feedback or Suggestions? Join
        <a
          class="text-indigo-500"
          target="_blank"
          rel="noopener"
          href="https://discord.gg/BvjM6JCcdp">Discord</a
        >
      </span>
      <span class="mt-4">
        Version: {version} - {refHash}
      </span>
    </div>
    <div class="flex flex-wrap gap-x-4 justify-center">
      <div class="flex">Magical Magical Magical Magical</div>
      <div class="flex">Magical Magical Magical Magical</div>
    </div>
  </div>
</footer>
