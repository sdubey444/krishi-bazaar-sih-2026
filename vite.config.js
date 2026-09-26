import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Allow v0/Vercel Sandbox preview hosts, which use dynamically
    // generated subdomains like "sb-<id>.vercel.run". Using the
    // ".vercel.run" suffix (rather than hardcoding one hostname) keeps
    // this working as the preview hostname changes between sessions,
    // without opening the dev server up to arbitrary hosts.
    allowedHosts: ['.vercel.run']
  }
});
