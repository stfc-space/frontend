<script lang="ts">
  import MetaHeader from '$lib/components/MetaHeader.svelte';
  import { _ } from 'svelte-i18n';
  import { page } from '$app/stores';
  import { error } from '@sveltejs/kit';
</script>

<svelte:head>
  {#if $page.status == 404}
    <MetaHeader title={`${$_('project.name')} - ${$_('not_found')}`} />
  {:else}
    <title>Error: {$page.error.message}</title>
  {/if}
</svelte:head>

<div class="min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
  <div class="max-w-max mx-auto">
    <section class="sm:flex">
      <p class="text-4xl font-extrabold text-indigo-600 sm:text-5xl">{$page.status}</p>
      <div class="sm:ml-6">
        {#if $page.status == 404}
          <div class="sm:border-l sm:border-gray-200 sm:pl-6">
            <h1
              class="text-4xl font-extrabold text-gray-900 dark:text-light-500 tracking-tight sm:text-5xl"
            >
              {$_('error.not-found.title')}
            </h1>
            <p class="mt-1 text-base text-gray-500">
              {$_('error.not-found.desc')}
            </p>
          </div>
        {:else if $page.status == 500}
          <div class="sm:border-l sm:border-gray-200 sm:pl-6">
            <h1
              class="text-4xl font-extrabold text-gray-900 dark:text-light-500 tracking-tight sm:text-5xl"
            >
              {$_('error.fatal.title')}
            </h1>
            <p class="mt-4">{$page.error.message}</p>
          </div>
        {:else}
          <div />{/if}
        <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
          <a
            sveltekit:prefetch
            href="/"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            Go back home
          </a>
        </div>
      </div>
    </section>
  </div>
</div>
