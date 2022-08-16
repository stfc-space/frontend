<script>
  import ComonentLib from '$lib/components/ComonentLib.svelte';
</script>

<div class="flex gap-2 max-w-prose">
  <div class="dark bg-dark-800 text-light-100 p-2">
    <h2>Dark Theme</h2>

    <ComonentLib />
  </div>

  <div class="light bg-light-50 text-dark-700 p-2">
    <h2>Light Theme</h2>
    <ComonentLib />
  </div>
</div>
