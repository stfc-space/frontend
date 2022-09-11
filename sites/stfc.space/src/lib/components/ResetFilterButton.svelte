<script lang="ts">
  import { Icon } from '@steeze-ui/svelte-icon';
  import { ArrowPath } from '@steeze-ui/heroicons';
  import { _ } from 'svelte-i18n';
</script>

<button
  aria-label={$_('filter.aria-reset')}
  on:click
  class="ml-auto mb-auto inline-flex items-center p-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-indigo-200 dark:focus:ring-offset-indigo-800 focus:ring-indigo-600 dark:focus:ring-indigo-500 "
>
  <Icon src={ArrowPath} class="h-5 w-5" />
</button>
