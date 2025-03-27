import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
		  '/api/v0': {
			target: 'http://localhost:5000',
			changeOrigin: true,
			secure: false,
			rewrite: (path) => path.replace(/^\/api\/v0/, '/api/v0')
		  }
		}
	  }
});
