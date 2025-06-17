import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/anime-hub/',
    define: {
      __MANGADEX_TOKEN__: JSON.stringify(env.VITE_MANGADEX_SECRET)
    },
    build: {
      outDir: 'dist'
    }
  };
});
