import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '.', '');
	return {
		plugins: [sveltekit()],
		server: {
			port: 3000,
			host: '0.0.0.0',
			proxy: {
				'/api/chart-img': {
					target: 'https://api.chart-img.com',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api\/chart-img/, ''),
				},
			},
		},
		define: {
			'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
			'process.env.CHART_IMG_API_KEY': JSON.stringify(env.CHART_IMG_API_KEY),
			'process.env.SUPADATA_API_KEY': JSON.stringify(env.SUPADATA_API_KEY),
		}
	};
});
