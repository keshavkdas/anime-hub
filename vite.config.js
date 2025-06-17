import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: 'https://keshavkdas.github.io/anime-hub/', // correct path for GitHub Pages
    build: {
      outDir: 'dist',
    },
    define: {
      'import.meta.env': {
        ...env, // <-- this keeps all env variables, not just one
      },
    },
  };
});
