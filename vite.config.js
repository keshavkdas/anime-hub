import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  console.log("📦 VITE_MANGADEX_SECRET loaded:", env.VITE_MANGADEX_SECRET); // Optional debug

  return {
    base: '/anime-hub/',
    build: {
      outDir: 'dist',
    },
    define: {
      'import.meta.env.VITE_MANGADEX_SECRET': JSON.stringify(env.VITE_MANGADEX_SECRET),
    },
  };
});
