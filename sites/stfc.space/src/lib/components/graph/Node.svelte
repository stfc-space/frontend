<script lang="ts">
  export let node: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    labels: { x: number; y: number; text: string; originalText?: string }[];
  };

  $: style = (() => {
    return 'transform: ' + `translateX(${node.x}px) translateY(${node.y}px);`;
  })();

  const textColor = 'rgb(249, 250, 251)';
  const bgColor = 'rgb(17, 24, 39)';
</script>

<g {style} id={node.id}>
  <rect
    tabindex="-1"
    fill="currentColor"
    color={bgColor}
    stroke="rgb(129, 140, 248)"
    height={node.height}
    width={node.width}
    rx="2"
    ry="2"
  />
  {#if node.labels.length == 1}
    <g fill="currentColor">
      <title>{node.labels[0].originalText || node.labels[0].text}</title>
      <text
        x={node.width / 2}
        y={node.height / 2}
        color={textColor}
        dominant-baseline="middle"
        text-anchor="middle">{node.labels[0].text}</text
      >
    </g>
  {:else}
    {#each node.labels as label}
      <g fill="currentColor" transform={`translate(${label.x}, ${label.y})`}>
        <title>{label.originalText || label.text}</title>
        {#if node.labels.length == 1}
          <text
            x={node.width / 2}
            y={node.height / 2}
            color={textColor}
            dominant-baseline="middle"
            text-anchor="middle">{label.text}</text
          >
        {/if}
      </g>
    {/each}
  {/if}
</g>
