<script context="module">
  let counter = 0;
</script>

<script lang="ts">
  import { session } from '$app/stores';
  import { toggleTheme } from '$lib/shared/utils';

  import { _ } from 'svelte-i18n';

  $: darkTheme = $session.theme === 'dark';

  $: ariaLabel = darkTheme ? $_('theme.to_light') : $_('theme.to_dark');

  let clazz = '';
  export { clazz as class };

  const eltId = 'theme-toggle_' + counter++;
</script>

<button
  class:dark={darkTheme}
  class:light={!darkTheme}
  class="theme-toggle {clazz}"
  id={eltId}
  aria-label={ariaLabel}
  on:click={() => toggleTheme(session, $session.theme)}
  {...$$restProps}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="472.39"
    height="472.39"
    viewBox="0 0 472.39 472.39"
    class="h-6 w-6"
  >
    <title>{ariaLabel}</title>
    <g class="toggle-sun">
      <path
        d="M403.21,167V69.18H305.38L236.2,0,167,69.18H69.18V167L0,236.2l69.18,69.18v97.83H167l69.18,69.18,69.18-69.18h97.83V305.38l69.18-69.18Zm-167,198.17a129,129,0,1,1,129-129A129,129,0,0,1,236.2,365.19Z"
      />
    </g>
    <g class="toggle-circle">
      <circle class="cls-1" cx="236.2" cy="236.2" r="103.78" />
    </g>
  </svg>
</button>

<style>
  :root {
    --clr-foreground: rgb(27, 27, 27);
    --clr-background: rgb(252, 252, 252);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --clr-background: rgb(27, 27, 27);
      --clr-foreground: rgb(252, 252, 252);
    }
  }

  .theme-toggle.light {
    --clr-foreground: rgb(27, 27, 27);
    --clr-background: rgb(252, 252, 252);
  }

  .theme-toggle.dark {
    --clr-background: rgb(27, 27, 27);
    --clr-foreground: rgb(252, 252, 252);
  }

  .theme-toggle {
    cursor: pointer;
    background: 0;
    border: 0;
    opacity: 0.8;
    border-radius: 50%;
    position: relative;
    isolation: isolate;
  }

  .theme-toggle svg {
    fill: var(--clr-foreground);
  }

  .light.theme-toggle::before {
    animation: pulseToLight 650ms ease-out;
  }

  .dark.theme-toggle::before {
    animation: pulseToDark 650ms ease-out;
  }

  .theme-toggle:hover,
  .theme-toggle:focus {
    outline: 0;
    opacity: 1;
  }

  .toggle-circle {
    transition: transform 500ms ease-out;
  }

  .light .toggle-circle {
    transform: translateX(-15%);
  }

  .toggle-sun {
    transform-origin: center center;
    transition: transform 750ms cubic-bezier(0.11, 0.14, 0.29, 1.32);
  }

  .light .toggle-sun {
    transform: rotate(0.5turn);
  }

  @keyframes pulseToLight {
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    10% {
      transform: scale(1);
    }
    75% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scale(1);
    }
  }

  @keyframes pulseToDark {
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    10% {
      transform: scale(1);
    }
    75% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scale(1);
    }
  }
</style>
