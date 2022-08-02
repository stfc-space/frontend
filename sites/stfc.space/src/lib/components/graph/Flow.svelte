<script lang="ts">
  import type { ElkRoot } from '$lib/graph';

  import Node from './Node.svelte';
  import Edge from './Edge.svelte';

  export let layout: ElkRoot;
</script>

<div class="flex flex-col w-full items-center">
  <div class="overflow-auto w-full select-none">
    <svg
      class="mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      height={layout.height}
      width={layout.width}
    >
      <g>
        {#each layout.children as child}
          <Node node={child} />
        {/each}
        {#each layout.edges as edge}
          <Edge {edge} />
        {/each}
      </g>
    </svg>
  </div>
</div>
