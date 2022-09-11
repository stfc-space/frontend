<script lang="ts">
  export let href: string;
  export let title: string = null;
</script>

<a
  {href}
  class="text-center rounded-sm bg-light-400 dark:bg-dark-200 p-2 hover:bg-light-800 dark:hover:bg-dark-400"
>
  <slot>{title}</slot>
</a>
