import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true,
		proxy: {
			'/api/v0': {
				target: 'http://127.0.0.1:5000',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api\/v0/, '/api/v0')
			}
		}
	}
});
