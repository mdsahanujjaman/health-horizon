import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
    ],
    define: {
        // sockjs-client uses Node.js `global` — polyfill it for the browser
        global: 'globalThis',
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
        },
    },
});
