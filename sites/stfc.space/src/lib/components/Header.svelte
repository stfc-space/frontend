<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { clickOutside } from '$lib/clickOutside';
  import { Icon } from '@steeze-ui/svelte-icon';
  import { User } from '@steeze-ui/heroicons';
  import { MenuAlt1, Search, X } from '@steeze-ui/heroicons';
  import DarkModeToggle from './DarkModeToggle.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte/types/runtime/internal/lifecycle';

  let userMenuOpen = false;
  let mobileMenuOpen = false;

  export let userId: string | null;

  let logoutUrl: string | null = null;

  const updateLogoutUrl = async (_userId: string) => {
    const r = await fetch(`/api/auth/self-service/logout/browser`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    logoutUrl = (await r.json<{ logout_url: string }>()).logout_url;
  };

  onMount(() => {
    if (userId) {
      updateLogoutUrl(userId);
    }
  });
  $: updateLogoutUrl(userId);
  $: isAuthenticated = !!$page.data.user;
</script>

<header>
  <nav class="flex-shrink-0 bg-indigo-600">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <!-- Logo section -->
        <div class="flex items-center px-2 lg:px-0 xl:w-64">
          <div class="flex-shrink-0">
            <a sveltekit:prefetch href="/" aria-label="Home" class="font-bold flex-1 lg:flex-none">
              <img
                class="w-8 h-full mr-2 inline-block "
                width="32"
                height="32"
                src="$lib/assets/logo.png"
                alt="logo"
              />
              <h1 class="hidden lg:inline-block text-light-200 align-middle">
                {$_('project.name')}
              </h1>
            </a>
          </div>
        </div>

        <!-- Search section -->
        <div class="flex-1 flex justify-center lg:justify-end">
          <div class="w-full px-2 lg:px-6">
            <label for="search" class="sr-only">{$_('global_search')}</label>
            <div class="relative text-light-200 focus-within:text-light-400">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <!-- Heroicon name: solid/search -->
                <Icon src={Search} class="h-5 w-5" aria-hidden />
              </div>
              <input
                id="search"
                name="search"
                class="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-indigo-400 bg-opacity-25 text-light-100 placeholder-light-200 focus:outline-none  focus:ring-0 focus:placeholder-light-900 focus:text-light-900 sm:text-sm"
                placeholder={$_('global_search')}
                type="search"
              />
            </div>
          </div>
        </div>
        <div class="flex lg:hidden gap-x-2">
          <DarkModeToggle />
          <!-- Mobile menu button -->
          <button
            type="button"
            class="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-indigo-400 hover:text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            aria-controls="mobile-menu"
            aria-expanded="false"
            on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
          >
            <span class="sr-only">Open main menu</span>
            {#if !mobileMenuOpen}
              <Icon src={MenuAlt1} outline class="block h-6 w-6" />
            {:else}
              <Icon src={X} outline class="block h-6 w-6" />
            {/if}
          </button>
        </div>
        <!-- Links section -->
        <div class="hidden lg:block lg:w-80">
          <div class="flex items-center justify-end">
            <!-- <div class="flex">
							<a
								href="#"
								class="px-3 py-2 rounded-md text-sm font-medium text-indigo-200 hover:text-white"
								>Documentation</a
							>
							<a
								href="#"
								class="px-3 py-2 rounded-md text-sm font-medium text-indigo-200 hover:text-white"
								>Support</a
							>
						</div> -->
            <!-- Profile dropdown -->
            {#if !isAuthenticated}
              <div class="ml-4 flex items-center text-light-700">
                <div class="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-2">
                  <a href="/auth/login" class="text-sm font-medium hover:text-gray-300">Log in</a>
                  <span class="h-5 w-px bg-light-900" aria-hidden="true" />
                  <a href="/auth/register" class="text-sm font-medium hover:text-gray-300"
                    >{$_('account.create')}</a
                  >
                </div>
              </div>
              <DarkModeToggle class="ml-2" />
            {:else}
              <DarkModeToggle />
              <div class="ml-4 relative flex-shrink-0">
                <div>
                  <button
                    type="button"
                    class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                    id="user-menu-button"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    on:click={() => (userMenuOpen = !userMenuOpen)}
                  >
                    <span class="sr-only">Open user menu</span>
                    <Icon src={User} class="h-8 w-8 rounded-full" />
                  </button>
                </div>

                {#if userMenuOpen}
                  <div
                    class="origin-top-right absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabindex="-1"
                    use:clickOutside={() => (userMenuOpen = false)}
                  >
                    <!-- Active: "bg-gray-100", Not Active: "" -->
                    <a
                      href="/user/settings"
                      class="block px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      tabindex="-1"
                      id="user-menu-item-1">{$_('account.settings')}</a
                    >
                    <a
                      href={logoutUrl}
                      rel="external"
                      class="block px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                      tabindex="-1"
                      id="user-menu-item-2">{$_('account.log_out')}</a
                    >
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    {#if mobileMenuOpen}
      <div class="lg:hidden" id="mobile-menu" on:click|capture={() => (mobileMenuOpen = false)}>
        <!-- <div class="px-2 pt-2 pb-3">
					<a
						href="#"
						class="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-800"
						>Dashboard</a
					>
					<a
						href="#"
						class="mt-1 block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-indigo-100 hover:bg-indigo-600"
						>Support</a
					>
				</div> -->
        <div class="pt-4 pb-3 border-t border-indigo-800">
          {#if isAuthenticated}
            <div class="px-2">
              <a
                href="/user/settings"
                class="mt-1 block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-indigo-100 hover:bg-indigo-600"
                >{$_('account.settings')}</a
              >
              <a
                href={logoutUrl}
                rel="external"
                class="mt-1 block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-indigo-100 hover:bg-indigo-600"
                >{$_('account.log_out')}</a
              >
            </div>
          {:else}
            <div class="px-2">
              <a
                href="/auth/login"
                class="mt-1 block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-indigo-100 hover:bg-indigo-600"
                >{$_('account.log_in')}</a
              >
              <a
                href="/auth/register"
                class="mt-1 block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-indigo-100 hover:bg-indigo-600"
                >{$_('account.create')}</a
              >
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </nav>
</header>
