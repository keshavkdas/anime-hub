import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: '/anime-hub/', // or your custom domain base path
    build: {
      outDir: 'dist',
    },
    define: {
      'import.meta.env.VITE_MANGADEX_SECRET': JSON.stringify(env.VITE_MANGADEX_SECRET),
    },
  };
});
