const pwaConfiguration = {
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

pwaConfiguration.mode = 'production';
pwaConfiguration.srcDir = 'src';
pwaConfiguration.filename = 'sw.ts';
pwaConfiguration.strategies = 'injectManifest';
pwaConfiguration.registerType = 'autoUpdate';

export { pwaConfiguration };
