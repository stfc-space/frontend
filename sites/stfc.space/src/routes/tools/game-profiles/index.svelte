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

  const deleteProfile = async (id: string) => {
    console.log('Deleting profile', id);
  };

  onMount(async () => {
    const n = await (await fetch('/api/game-profile')).json();
    game_profiles = n;
  });

  const modifiedAt = (timestamp: number): string => {
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
</script>

<DetailPageContainer>
  <div class="flex justify-between w-full p-2">
    <h1 class="text-xl font-medium">Game Profiles</h1>
    <Button>Add</Button>
  </div>
  <span class="text-sm px-2 border rounded m-2"
    >HINT: To have your game state automatically getting imported into a Game Profile, create a
    token in the account settings and enter it into the config of the Community Patch. This will
    automatically create a new profile and keep it up-to-date when using the PC Client of the Game.</span
  >
  <div class="w-full p-2 px-2 sm:px-4">
    {#each game_profiles as profile}
      <a
        href="/tools/game-profile/{profile.id}"
        class="rounded dark:bg-dark-300 bg-light-200 px-6 py-5 sm:flex sm:items-start sm:justify-between shadow border border-transparent hover:border-indigo-800"
      >
        <div class="sm:flex sm:items-start">
          <div class="mt-3 sm:mt-0 sm:ml-4">
            <h3 class="text-md font-bold">{profile.name}</h3>
            <div class="mt-1 text-sm dark:text-light-900 text-dark-100 sm:flex sm:items-center">
              <div>{$_(`buildings_0_name`)} {profileLevel(profile)}</div>
              <span class="hi}dden sm:mx-2 sm:inline" aria-hidden="true"> &middot; </span>
              <div class="mt-1 sm:mt-0">Last updated on {modifiedAt(profile.modified)}</div>
            </div>
          </div>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
          <Button on:click={() => deleteProfile(profile.id)}>DELETE</Button>
        </div>
      </a>
    {/each}
  </div>
</DetailPageContainer>
