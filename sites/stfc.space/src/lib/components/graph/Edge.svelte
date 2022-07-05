<script lang="ts">
  import { curveBundle, line } from 'd3-shape';
  import { getBezierPath } from './Edge.utils';

  export let edge: {
    sections: {
      bendPoints?: { x: number; y: number }[];
      startPoint: { x: number; y: number };
      endPoint: { x: number; y: number };
    }[];
  };

  $: d = (() => {
    const sections = edge.sections;
    if (!sections?.length) {
      return null;
    }

    // Handle bend points that elk gives
    // us separately from drag points
    if (sections[0].bendPoints) {
      const points = sections
        ? [sections[0].startPoint, ...(sections[0].bendPoints ?? []), sections[0].endPoint]
        : [];

      const pathFn = line().curve(curveBundle.beta(1));
      return pathFn(points.map((d) => [d.x, d.y]));
    } else {
      return getBezierPath({
        sourceX: sections[0].startPoint.x,
        sourceY: sections[0].startPoint.y,
        targetX: sections[0].endPoint.x,
        targetY: sections[0].endPoint.y
      });
    }
  })();
</script>

<path v-if="d" fill="transparent" stroke="#485a74" stroke-width="1pt" {d} />
