<script lang="ts">
  import { useRegisterSW } from 'virtual:pwa-register/svelte';

  import { Speakerphone, X } from '@steeze-ui/heroicons';
  import { Icon } from '@steeze-ui/svelte-icon';

  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      console.log(`SW Registered: ${r}`);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    }
  });

  const refresh = async () => {
    await updateServiceWorker();
    window.location.reload();
  };

  const close = async () => {
    offlineReady.set(false);
    needRefresh.set(false);
  };

  $: toast = $needRefresh;
</script>

{#if toast}
  <div class="fixed inset-x-0 bottom-0 z-50">
    <div class="bg-indigo-600">
      <div class="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between flex-wrap">
          <div class="w-0 flex-1 flex items-center">
            <span class="flex p-2 rounded-lg bg-indigo-800">
              <Icon src={Speakerphone} class="h-6 w-6 text-white" aria-hidden />
            </span>
            <p class="ml-3 font-medium text-white truncate">
              <span class="md:hidden truncate">A new update is ready.</span>
              <span class="hidden md:inline">Big news! A new update is ready.</span>
            </p>
          </div>
          <div
            class="
                  order-3
                  mt-2
                  w-full
                  flex-shrink-0
                  sm:order-2
                  sm:mt-0
                  sm:w-auto
                  flex
                  justify-between
                  gap-2
                "
          >
            {#if $needRefresh}
              <div class="ml-auto">
                <button
                  on:click={refresh}
                  v-if="needRefresh"
                  type="button"
                  class="
                      flex
                      items-center
                      justify-center
                      px-4
                      py-2
                      border border-transparent
                      rounded-md
                      shadow-sm
                      text-sm
                      font-medium
                      text-indigo-600
                      bg-white
                      hover:bg-indigo-50
                    "
                >
                  Update
                </button>
              </div>
            {/if}
          </div>
          <div class="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              on:click={close}
              type="button"
              class="
                    -mr-1
                    flex
                    p-2
                    rounded-md
                    hover:bg-indigo-500
                    focus:outline-none
                    focus:ring-2 focus:ring-white
                    sm:-mr-2
                  "
            >
              <span class="sr-only">Dismiss</span>
              <Icon src={X} class="h-6 w-6 text-white" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
