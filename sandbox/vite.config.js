import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    outDir: 'dist'  // Ensure this matches "distDir" in vercel.json
  },
  server: {
    port: 5173, // Change this to your desired port number
  },
  define: {
    'process.env': process.env
  }
});
