const pwaConfiguration = {
  srcDir: './.svelte-kit/build',
  outDir: './.svelte-kit/output/client',
  mode: 'development',
  includeManifestIcons: false,
  scope: '/',
  base: '/',
  manifest: {
    name: 'STFC Database',
    short_name: 'STFC Database',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    description: 'The tool for ALL things Star Trek Fleet Command.',
    theme_color: '#410063',
    background_color: '#151515',
    icons: [
      {
        'src': '/android-36x36.png',
        'sizes': '36x36',
        'type': 'image/png',
        'purpose': 'any'
      },
      {
        'src': '/android-48x48.png',
        'sizes': '48x48',
        'type': 'image/png',
        'purpose': 'any'
      },
      {
        'src': '/android-72x72.png',
        'sizes': '72x72',
        'type': 'image/png',
        'purpose': 'any'
      },
      {
        'src': '/android-96x96.png',
        'sizes': '96x96',
        'type': 'image/png',
        'purpose': 'any'
      },
      {
        'src': '/android-144x144.png',
        'sizes': '144x144',
        'type': 'image/png',
        'purpose': 'any'
      },
      {
        'src': '/android-chrome-192x192.png',
        'sizes': '192x192',
        'type': 'image/png',
        'purpose': 'any'
      },
      {
        'src': '/android-chrome-512x512.png',
        'sizes': '512x512',
        'type': 'image/png',
        'purpose': 'any'
      },
      {
        'src': '/maskable_icon_x192.png',
        'sizes': '192x192',
        'type': 'image/png',
        'purpose': 'maskable'
      },
      {
        'src': '/maskable_icon_x512.png',
        'sizes': '512x512',
        'type': 'image/png',
        'purpose': 'maskable'
      }
    ]
  }
};

// const claims = process.env.CLAIMS === 'true';
// const reload = process.env.RELOAD_SW === 'true';
// const sw = process.env.SW === 'true';

const workboxOrInjectManifestEntry = {
  // vite and SvelteKit are not aligned: pwa plugin will use /\.[a-f0-9]{8}\./ by default: #164 optimize workbox work
  dontCacheBustURLsMatching: /-[a-f0-9]{8}\./,
  globDirectory: './.svelte-kit/output/client',
  globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
  globIgnores: ['**/claims-sw*', '**/prompt-sw*', '**/sw*', '**/*.png'],
  // Before generating the service worker, manifestTransforms entry will allow us to transform the resulting precache manifest. See the manifestTransforms docs for mode details.
  manifestTransforms: [
    async (entries) => {
      // manifest.webmanifest is added always by pwa plugin, so we remove it.
      // EXCLUDE from the sw precache sw and workbox-*
      const manifest = entries
        .filter(({ url }) => {
          return (
            url !== 'manifest.webmanifest' && !url.endsWith('sw.js') && !url.startsWith('workbox-')
          );
        })
        .map((e) => {
          let url = e.url;
          if (url && url.endsWith('.html')) {
            if (url.startsWith('/')) url = url.slice(1);

            e.url = url === 'index.html' ? '/' : `/${url.substring(0, url.lastIndexOf('/'))}`;
            console.log(`${url} => ${e.url}`);
          }

          return e;
        });
      return { manifest };
    }
  ]
};

pwaConfiguration.mode = 'production';
pwaConfiguration.srcDir = 'src';
pwaConfiguration.filename = 'sw.ts';
pwaConfiguration.strategies = 'injectManifest';
pwaConfiguration.injectManifest = workboxOrInjectManifestEntry;
pwaConfiguration.registerType = 'autoUpdate';

export { pwaConfiguration };
