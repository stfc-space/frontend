/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute, PrecacheEntry } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BroadcastUpdatePlugin } from 'workbox-broadcast-update';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event: { data?: { type: string } }) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.skipWaiting();
clientsClaim();

// This assumes you're using injectManifest to replace the variable.
const manifest = self.__WB_MANIFEST;

precacheAndRoute(
  manifest.filter((e: PrecacheEntry) => !e.url.endsWith('html') && e.url !== 'manifest.webmanifest')
);

cleanupOutdatedCaches();

function navigationRoute() {
  const networkFirst = new NetworkFirst({
    cacheName: 'navigation',
    fetchOptions: { credentials: 'same-origin' }
  });
  return new NavigationRoute(
    (options) => {
      return networkFirst.handle(options);
    },
    {
      denylist: [
        /\.(?:png|jpg|jpeg|svg|webp|js|js.map|ico)$/,
        /\/(?:assets\/).*$/,
        /\/(?:auth\/).*$/,
        /\/(?:api\/auth\/).*$/,
        /\/(?:mods\/community-patch\/).*$/
      ]
    }
  );
}

registerRoute(navigationRoute());

registerRoute(
  /\.(?:png|jpg|jpeg|svg|webp)$/,
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 2592e3,
        maxEntries: 1000,
        purgeOnQuotaError: true
      })
    ]
  }),
  'GET'
);

registerRoute(
  /\/api\/(?!auth).*$/,
  new NetworkOnly({
    fetchOptions: { credentials: 'same-origin' }
  }),
  'GET'
);

registerRoute(
  /^https:\/\/(?:.*\.)?api.stfc.dev\/v1\/version.*$/,
  new NetworkFirst({
    cacheName: 'api-version',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 604800
      })
    ]
  }),
  'GET'
);

registerRoute(
  /^https:\/\/(?:.*\.)?api.stfc.dev\/v1\/events.*$/,
  new StaleWhileRevalidate({
    cacheName: 'events',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 300,
        maxEntries: 10,
        purgeOnQuotaError: true
      }),
      new BroadcastUpdatePlugin()
    ]
  }),
  'GET'
);

registerRoute(
  /^https:\/\/(?:.*\.)?api.stfc.dev\/v1\/.*$/,
  new CacheFirst({
    cacheName: 'api',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 604800,
        maxEntries: 500,
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        headers: {
          'x-is-cachable': 'true'
        }
      })
    ]
  }),
  'GET'
);
