import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: '/anime-hub/', // adjust if needed
    define: {
      __MANGADEX_TOKEN__: JSON.stringify(env.VITE_MANGADEX_TOKEN),
    },
  };
});
