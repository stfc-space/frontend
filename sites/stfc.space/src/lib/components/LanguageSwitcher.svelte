<script lang="ts">
  import { onMount } from 'svelte';

  import { locale } from 'svelte-i18n';
  import { $locale as searchLocale } from '$lib/shared/search';
  import { browser } from '$app/environment';
  import { setCookie } from '$lib/shared/utils';

  let select: HTMLSelectElement;
  const languageChange = function (e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
    e.preventDefault();
    const t = e.target as HTMLSelectElement;
    const selected = t.options[t.options.selectedIndex];
    setCookie('lang', selected.dataset.content);
    locale.set(selected.dataset.content);
    searchLocale.set(selected.dataset.content);
    if (browser) {
      document.documentElement.setAttribute('lang', selected.dataset.content);
    }
  };

  onMount(() => {
    if (!select) {
      return;
    }
    for (let i = 0; i < select.options.length; ++i) {
      const option = select.options[i];
      if (option.dataset.content == $locale) {
        select.value = option.value;
        break;
      }
    }
  });

  const options = [
    {
      value: 'en',
      icon: '🇺🇸',
      name: 'English'
    },
    {
      value: 'fr',
      icon: '🇫🇷',
      name: 'Français'
    },
    {
      value: 'it',
      icon: '🇮🇹',
      name: 'Italian'
    },
    {
      value: 'de',
      icon: '🇩🇪',
      name: 'Deutsch'
    },
    {
      value: 'es',
      icon: '🇪🇸',
      name: 'Español'
    },
    {
      value: 'ru',
      icon: '🇷🇺',
      name: 'русский'
    },
    {
      value: 'pt',
      icon: '🇵🇹',
      name: 'Português'
    },
    {
      value: 'ja',
      icon: '🇯🇵',
      name: '日本語'
    },
    {
      value: 'ko',
      icon: '🇰🇷',
      name: '한국어'
    }
  ];
</script>

<div class="relative inline-block align-middle">
  <label for="language" class="sr-only">Language</label>
  <select
    id="language"
    class="appearance-none block w-full bg-none bg-white dark:bg-dark-700 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base text-gray-900 dark:text-light-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    bind:this={select}
    on:change={languageChange}
  >
    {#each options as option}
      <option class="dark:bg-gray-900" data-content={option.value}
        >{option.icon} {option.name}</option
      >
    {/each}
  </select>
  <div class="pointer-events-none absolute inset-y-0 right-0 px-2 flex items-center">
    <!-- Heroicon name: solid/chevron-down -->
    <svg
      class="h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
  </div>
</div>
