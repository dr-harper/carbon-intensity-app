import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/carbon-intensity-app/', // Ensure this matches your repo name!
});