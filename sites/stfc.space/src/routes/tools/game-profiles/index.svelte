<script context="module" lang="ts">
  import type { LoadEvent } from '@sveltejs/kit';

  export interface GameProfileBuffConfig {
    level: number;
    research: { [key: string | number]: number };
    buildings: { [key: string | number]: number };
    officers: { [key: string | number]: [number, number] };
    syndicate_level: number;
    exocomps: number[];
  }

  export async function load({ session, params, fetch }: LoadEvent) {
    const n = await (await fetch('/api/game-profile')).json();
    return { props: { game_profiles: n } };
  }
</script>

<script lang="ts">
  import { Button } from '@radion/ui';
  import DetailPageContainer from '$lib/components/DetailPageContainer.svelte';
  import { onMount } from 'svelte';
  import { DateTime } from 'luxon';
  import { _, locale } from 'svelte-i18n';

  export let game_profiles: any;

  const deleteProfile = async (e: MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Deleting profile', id);
  };

  onMount(async () => {
    const n = await (await fetch('/api/game-profile')).json();
    game_profiles = n;
  });

  const modifiedAt = (timestamp: number): string => {
    if (!timestamp) {
      timestamp = 0;
    }
    const dt = DateTime.fromSeconds(timestamp);
    const currentLocale = $locale;
    return dt.toLocaleString(
      { year: 'numeric', month: 'short', day: 'numeric' },
      { locale: currentLocale }
    );
  };

  const profileLevel = (profile: any): string => {
    try {
      return profile.buildings[0];
    } catch {
      return 'ERROR: Invalid Game Profile';
    }
  };

  let createProfileOpen = false;
  let newProfileName = '';
  let newProfileDescription = '';
  const submitProfile = async () => {
    const n = await (
      await fetch('/api/game-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newProfileName,
          description: newProfileDescription,
          modified: Math.floor(new Date().getTime() / 1000),
          buildings: {
            0: 1
          }
        })
      })
    ).text();
    console.log('New profile id', n);
    newProfileName = '';
    newProfileDescription = '';
    createProfileOpen = false;
    game_profiles = await (await fetch('/api/game-profile')).json();
  };

  import { fly } from 'svelte/transition';
</script>

{#if createProfileOpen}
  <div class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0" />

    <div class="fixed inset-0 overflow-hidden">
      <div class="absolute inset-0 overflow-hidden">
        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div
            class="pointer-events-auto w-screen max-w-md"
            transition:fly={{ x: 500, opacity: 1 }}
          >
            <div
              class="flex h-full flex-col divide-y divide-gray-200 bg-white dark:bg-dark-500 shadow-xl"
            >
              <div class="h-0 flex-1 overflow-y-auto">
                <div class="bg-indigo-700 py-6 px-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <h2 class="text-lg font-medium text-white" id="slide-over-title">
                      New Game Profile
                    </h2>
                    <div class="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        class="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        on:click={() => (createProfileOpen = false)}
                      >
                        <span class="sr-only">Close panel</span>
                        <!-- Heroicon name: outline/x -->
                        <svg
                          class="h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="mt-1">
                    <p class="text-sm text-indigo-300">
                      Get started by filling in the information below to create your new game
                      profile.
                    </p>
                  </div>
                </div>
                <div class="flex flex-1 flex-col justify-between">
                  <div class="divide-y divide-gray-200 px-4 sm:px-6">
                    <div class="space-y-6 pt-6 pb-5">
                      <div>
                        <label
                          for="profile-name"
                          class="block text-sm font-medium dark:text-light-700"
                        >
                          Profile name
                        </label>
                        <div class="mt-1">
                          <input
                            bind:value={newProfileName}
                            type="text"
                            name="profile-name"
                            id="profile-name"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          for="description"
                          class="block text-sm font-medium dark:text-light-700"
                        >
                          Description
                        </label>
                        <div class="mt-1">
                          <textarea
                            bind:value={newProfileDescription}
                            id="description"
                            name="description"
                            rows="4"
                            class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-shrink-0 justify-end px-4 py-4">
                <button
                  type="button"
                  class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  on:click={() => (createProfileOpen = false)}>Cancel</button
                >
                <button
                  type="submit"
                  class="ml-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  on:click={() => submitProfile()}>Save</button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<DetailPageContainer>
  <div class="flex justify-between w-full p-2">
    <h1 class="text-xl font-medium">Game Profiles</h1>
    <Button on:click={() => (createProfileOpen = true)}>Add</Button>
  </div>
  <span class="text-sm px-2 border rounded m-2"
    >HINT: To have your game state automatically getting imported into a Game Profile, create a
    token in the account settings and enter it into the config of the Community Patch. This will
    automatically create a new profile and keep it up-to-date when using the PC Client of the Game.</span
  >
  <div class="w-full p-2 px-2 sm:px-4 flex flex-col gap-y-2">
    {#each game_profiles as profile}
      <a sveltekit:prefetch href="/tools/game-profiles/{profile.id}" class="w-full">
        <div
          class="rounded-md shadow dark:bg-dark-300 bg-light-100 px-6 py-4 sm:flex sm:items-start sm:justify-between"
        >
          <div class="sm:flex sm:items-start">
            <div class="mt-3 sm:mt-0 sm:ml-4">
              <h3 class="text-md font-bold">{profile.name}</h3>
              <div class="mt-1 text-sm dark:text-light-900 text-dark-100 sm:flex sm:items-center">
                <div>{$_(`buildings_0_name`)} {profileLevel(profile)}</div>
                <span class="hidden sm:mx-2 sm:inline" aria-hidden="true"> &middot; </span>
                <div class="mt-1 sm:mt-0">Last updated on {modifiedAt(profile.modified)}</div>
              </div>
            </div>
          </div>
          <div class="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
            <Button on:click={(e) => deleteProfile(e, profile.id)}>DELETE</Button>
          </div>
        </div>
      </a>
    {/each}
  </div>
</DetailPageContainer>
