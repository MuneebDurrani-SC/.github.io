import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: set to your repo name
const repo = 'solarcalor-dashboard';

export default defineConfig(({ mode }) => {
  const onPages = process.env.GITHUB_ACTIONS === 'true' || mode === 'github';
  return {
    plugins: [react()],
    base: onPages ? `/${repo}/` : '/', // ensures assets load on Pages
    build: { outDir: 'dist' }
  };
});
