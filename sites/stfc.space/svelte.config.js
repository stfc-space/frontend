import preprocess from 'svelte-preprocess';

// Helper for multiple preprocess
import seqPreprocessor from 'svelte-sequential-preprocessor';

// Import and Windi
import importAssets from 'svelte-preprocess-import-assets';
import WindiCSS from 'vite-plugin-windicss';

// PWA Setup
import { pwaConfiguration } from './pwa-configuration.js';
import { VitePWA } from 'vite-plugin-pwa';

import jscc from 'rollup-plugin-jscc';

// Broken fucking shit
import { default as loadVersion } from 'vite-plugin-package-version';
import { default as EnvironmentPlugin } from 'vite-plugin-environment';

// Adapters
import cloudflare from '@sveltejs/adapter-cloudflare';
import cloudflareWorkers from '@sveltejs/adapter-cloudflare-workers';
import { AwsServerlessAdapter } from 'adapter-cloudfront';
import vercel from '@sveltejs/adapter-vercel';

import GlobPlugin from 'vite-plugin-glob';

import { execSync } from 'child_process';

const isVercel = !!process.env.VERCEL;
const isAWS = process.env.TARGET_ENVIRONMET === 'aws';
const isCloudflare = process.env.CF_PAGES === '1';
const isCloudflareWorkers = process.env.CF_WORKERS === '1';

function getAdapter() {
  if (isVercel) {
    return vercel();
  } else if (isAWS) {
    return AwsServerlessAdapter({ artifactPath: '.svelte-kit/cloudfront' });
  } else if (isCloudflare) {
    return cloudflare();
  } else if (isCloudflareWorkers) {
    return cloudflareWorkers();
  }
  console.warn('No explicit Target Environment set. falling back to static');
}

let commitHash;
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
  commitHash = 'DEVELOPMENT';
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: seqPreprocessor([preprocess(), importAssets()]),

  kit: {
    adapter: getAdapter(),

    serviceWorker: {
      register: false
    },
    prerender: {
      enabled: false,
      onError: 'continue'
    },
    vite: {
      mode: process.env.MODE,
      build: {
        rollupOptions: {
          external: ['/_app/manifest.webmanifest', '/manifest.webmanifest']
        },
        assetsInlineLimit: 1
      },
      plugins: [
        VitePWA(pwaConfiguration),
        GlobPlugin({
          takeover: true
        }),
        loadVersion.default(),
        jscc({}),
        WindiCSS({
          attributify: true,
          scan: {
            dirs: ['src', 'node_modules/@radion/ui/package'],
            include: ['node_modules/@radion/ui/**/*.svlete']
          }
        }),
        EnvironmentPlugin(
          { 'GIT_BRANCH': 'local', 'JWT_SECRET': 'bG9jYWw=', 'GIT_REV_HASH': commitHash },
          { defineOn: 'import.meta.env' }
        )
      ]
    }
  }
};

export default config;
