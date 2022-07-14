<script lang="ts">
  import type { SystemDetail } from '$lib/shared/yuki/models';
  import { resourceThumb } from '$lib/shared/yuki/thumbs';
  import { uniqBy } from 'lodash-es';


  import { _ } from 'svelte-i18n';




  export let system: SystemDetail;
  // export let hostile: HostileDetail;
 

  $: uniqueMines = uniqBy(system.mines, 'id');
  $: spawnPoints = uniqBy(system.spawn_points ?? [], 'id');
  $: systemResources = uniqBy(system.mines, 'resource').map(x => x.resource);
  // $: hostileSpawn = uniqBy(hostile.hull_type,'id')





  import { session } from '$app/stores';

  $: darkTheme = $session.theme === 'dark';

  import backdrop from '$lib/assets/sys_bg.png';
  import housing from '$lib/assets/icons/misc/housing.png';
  import planets from '$lib/assets/icons/misc/planet.png';
  import sun from '$lib/assets/icons/misc/sun.png'
  import interceptorIcon from '$lib/assets/icons/ship_types/interceptor.png';
  import minerIcon from '$lib/assets/icons/tasks/survey.png';


  

  // let w: number;
  // let h: number;
  // let svgElement: Node;
  // const downloadSvg = () => {
  //   function triggerDownload(imgURI: string) {
  //     var evt = new MouseEvent('click', {
  //       view: window,
  //       bubbles: false,
  //       cancelable: true
  //     });

  //     var a = document.createElement('a');
  //     a.setAttribute('download', `system_map.png`);
  //     a.setAttribute('href', imgURI);
  //     a.setAttribute('target', '_blank');

  //     a.dispatchEvent(evt);
  //   }

  //   var canvas = document.createElement('canvas');
  //   canvas.width = 1000;
  //   canvas.height = 1000;
  //   var ctx = canvas.getContext('2d');
  //   if (!ctx) {
  //     return;
  //   }
  //   if (!svgElement) {
  //     return;
  //   }
  //   // if (unref(settings.isDarkTheme)) {
  //   //   ctx.fillStyle = 'rgb(31, 41, 55)';
  //   // } else {
  //   //   ctx.fillStyle = 'rgb(243, 244, 246)';
  //   // }
  //   ctx?.fillRect(0, 0, canvas.width, canvas.height);
  //   var data = new XMLSerializer().serializeToString(svgElement);
  //   var DOMURL = window.URL || window.webkitURL || window;

  //   var img = new Image();
  //   var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
  //   var url = DOMURL.createObjectURL(svgBlob);

  //   img.onload = function () {
  //     ctx?.drawImage(img, 0, 0);
  //     DOMURL.revokeObjectURL(url);

  //     var imgURI = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');

  //     triggerDownload(imgURI);
  //   };

  //   img.src = url;
  // };
</script>

<!-- <button on:click={() => downloadSvg()}> Download </button> -->

<svg viewBox="0 0 2300 2300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="img1" patternUnits="userSpaceOnUse" width="2048" height="1024">
      <image href={backdrop} x="0" y="0" width="2048" height="1024" />
    </pattern>
  </defs>

  <rect x="10" y="0" width="512" height="272" rx="15" fill="black" fill-opacity="0.8" />
  <g transform="translate(50, 40)">
    <g>
     <image href = {housing}  x="-35" y="-25" 
      /><text class="text-6xl" color={darkTheme ? 'white' : 'black'} fill="currentColor">
        <tspan dx="2rem" dy="0.375em">{$_('system-map-legend.housing-planet')}</tspan></text
      >
    </g>
    <g transform="translate(0, 64)">
      <image href = {planets}  x="-40" y="-35" height = "80" width = "80"
      /><text class="text-6xl" color={darkTheme ? 'white' : 'black'} fill="currentColor">
        <tspan dx="2rem" dy="0.375em">{$_('system-map-legend.planet')}</tspan></text
      >
    </g>
    <g transform="translate(0, 128)">
      <image href = {minerIcon}  x="-30" y="-30" height = "60" width = "60"
      /><text class="text-6xl" color={darkTheme ? 'white' : 'black'} fill="currentColor">
        <tspan dx="2rem" dy="0.375em">{$_('system-map-legend.mine')}</tspan></text
      >
    </g>
    <g transform="translate(0, 192)">
      <image href = {interceptorIcon}  x="-30" y="-30" height = "60" width = "60"
      /><text class="text-6xl" color={darkTheme ? 'white' : 'black'} fill="currentColor" font-size= "8">
        <tspan dx="2rem" dy="0.375em">{$_('system-map-legend.spawn-point')}</tspan></text
      >
    </g>
  </g>

  <!-- In the game, higher Y is up, thus we flip y here -->
  <g transform="translate(1150, 1150) scale(1, -1)">
    <circle cx="0" cy="0" r="1100" fill="url(#img1)" />
    <image href = {sun} width = "150" height = "150" x="-75" y="-75"></image>
    <!-- <circle
      cx="0"
      cy="0"
      r="40"
      color="#ffffff77"
      stroke="currentcolor"
      fill="currentColor"
      stroke-width="5" -->
    <!-- /> -->
    <!-- <g>
      <image href={backdrop} x="-1150" y="-1150" width="2300" height="2300" />
    </g> -->

    {#each uniqueMines as mine (mine.id)}
      {#each systemResources as resource, i}
        <g transform="translate({mine.coords_x + i * 25}, {mine.coords_y}), scale(.4, -.4)">
          <image href={resourceThumb(resource)}/>
        </g>
      {/each}
    {/each}

    {#each spawnPoints as spawnPoint (spawnPoint.id)}
      <g transform="translate({spawnPoint.coords_x}, {spawnPoint.coords_y}), scale(.7, -.7)">
        <image href = {interceptorIcon}/>
      </g>
    {/each}

    {#each system.planets as planet (planet.id)}
      <g transform="translate({planet.coords_x}, {planet.coords_y}), scale(.5, -.5)">
        <image href = {planets}/>
        <text x={20} y={-35} class="text-8xl sm:text-6xl text-white" fill="currentColor">
          <tspan dx="0" dy="0">{$_(`systems_${planet.id}_name`)}</tspan>
        </text>
      </g>
    {/each}

    {#each system.player_container as ct (ct.id)}
      <g transform="translate({ct.coords_x}, {ct.coords_y}), scale(1, -1)">
        <image href = {housing}/>
        <text x={20} y={-35} class="text-8xl sm:text-6xl text-white" fill="currentColor">
          <tspan dx="0" dy="0">{$_(`systems_${ct.id}_name`)}</tspan>
        </text>
      </g>
    {/each}
  </g>
</svg>
