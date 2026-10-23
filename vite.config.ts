import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Проектная страница GitHub Pages: https://nominalnominalovich.github.io/polygon/
export default defineConfig({
  base: '/polygon/',
  plugins: [react()],
});
