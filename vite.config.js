import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: replace 'solarcalor-dashboard' below with your REPO name
const repo = 'solarcalor-dashboard';

export default defineConfig(({ mode }) => {
  const isGH = process.env.GITHUB_ACTIONS === 'true' || mode === 'github';
  return {
    plugins: [react()],
    base: isGH ? `/${repo}/` : '/',
    build: {
      outDir: 'dist'
    }
  };
});
