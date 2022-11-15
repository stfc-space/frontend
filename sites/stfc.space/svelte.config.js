import preprocess from 'svelte-preprocess';

// Helper for multiple preprocess
import seqPreprocessor from 'svelte-sequential-preprocessor';

// Import and Windi
import importAssets from 'svelte-preprocess-import-assets';

// Adapters
import cloudflare from '@sveltejs/adapter-cloudflare';
import cloudflareWorkers from '@sveltejs/adapter-cloudflare-workers';
import vercel from '@sveltejs/adapter-vercel';

const isVercel = !!process.env.VERCEL;
const isCloudflare = process.env.CF_PAGES === '1';
const isCloudflareWorkers = process.env.CF_WORKERS === '1';

function getAdapter() {
  if (isVercel) {
    return vercel();
  } else if (isCloudflare) {
    return cloudflare();
  } else if (isCloudflareWorkers) {
    return cloudflareWorkers();
  }
  console.warn('No explicit Target Environment set. falling back to static');
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
      enabled: true,
      handleHttpError: 'warn'
    }
  }
};

export default config;
