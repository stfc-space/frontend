import WindiCSS from 'vite-plugin-windicss';
import { sveltekit } from '@sveltejs/kit/vite';

export default {
	plugins: [
		sveltekit(),
		WindiCSS({
			attributify: true,
			scan: {
				dirs: ['src']
			}
		})
	]
};
