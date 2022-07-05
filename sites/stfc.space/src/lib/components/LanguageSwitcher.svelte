<script lang="ts">
  import { onMount } from 'svelte';

  import { locale } from 'svelte-i18n';
  import { $locale as searchLocale } from '$lib/shared/search';
  import { browser } from '$app/env';
  import { session } from '$app/stores';
  import { setCookie } from '$lib/shared/utils';

  let select: HTMLSelectElement;
  const languageChange = function (e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
    e.preventDefault();
    const t = e.target as HTMLSelectElement;
    const selected = t.options[t.options.selectedIndex];
    setCookie('lang', selected.dataset.content);
    locale.set(selected.dataset.content);
    searchLocale.set(selected.dataset.content);
    $session.lang = selected.dataset.content;
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
  <div class="flex text-light-200 items-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="inline h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg><span class="inline align-middle">
      {options.find((e) => e.value == $locale).name}
    </span>
  </div>
  <select
    class="
		  absolute
          cursor-pointer
          bg-transparent
          text-xl
          opacity-0
          left-0
		  right-0
		  top-0
		  bottom-0
        "
    bind:this={select}
    on:change={languageChange}
  >
    {#each options as option}
      <option class="dark:bg-gray-900" data-content={option.value}
        >{option.icon} {option.name}</option
      >
    {/each}
  </select>
</div>
