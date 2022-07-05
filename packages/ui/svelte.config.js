import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

import WindiCSS from 'vite-plugin-windicss';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		vite: {
			plugins: [
				WindiCSS({
					attributify: true,
					scan: {
						dirs: ['src']
					}
				})
			]
		}
	}
};

export default config;
