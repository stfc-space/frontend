<script lang="ts">
  let clazz = '';
  export { clazz as class };
</script>

<div
  class="grid gap-y-2 gap-x-4 items-center grid-cols-1 sm:grid-cols-max-2 w-full sm:w-auto {clazz}"
>
  <slot />
</div>
