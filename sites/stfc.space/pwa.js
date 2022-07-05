import { resolveConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync } from 'fs';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));

process.env.CLAIMS = `${args['CLAIMS'] === 'true'}`;
process.env.RELOAD_SW = `${args['RELOAD_SW'] === 'true'}`;
process.env.SW = `${args['SW'] === 'true'}`;

const webmanifestDestinations = ['./.svelte-kit/build/', './.svelte-kit/output/client/'];

const swDestinations = ['./.svelte-kit/build/'];

const buildPwa = async () => {
  const { pwaConfiguration } = await import('./pwa-configuration.js');
  const config = await resolveConfig(
    {
      plugins: [VitePWA(pwaConfiguration)]
    },
    'build',
    'production'
  );
  // when `vite-plugin-pwa` is presented, use it to regenerate SW after rendering
  const pwaPlugin = config.plugins.find((i) => i.name === 'vite-plugin-pwa')?.api;
  if (pwaPlugin?.generateSW) {
    console.log('Generating PWA...');
    await pwaPlugin.generateSW();
    webmanifestDestinations.forEach((d) => {
      copyFileSync(
        './.svelte-kit/output/client/_app/immutable/manifest.webmanifest',
        `${d}/manifest.webmanifest`
      );
    });
    // don't copy workbox, svelte kit will copy it
    if (pwaConfiguration.strategies === 'injectManifest') {
      const destName = 'sw.js';
      const srcName = pwaConfiguration.registerType === 'autoUpdate' ? 'sw.js' : 'prompt-sw.js';
      const name = `./.svelte-kit/output/client/${srcName}`;
      swDestinations.forEach((d) => {
        copyFileSync(name, `${d}/${destName}`);
      });
    } else {
      swDestinations.forEach((d) => {
        copyFileSync('./.svelte-kit/output/client/sw.js', `${d}/sw.js`);
      });
    }
    console.log('Generation of PWA complete');
  }
};

buildPwa();
