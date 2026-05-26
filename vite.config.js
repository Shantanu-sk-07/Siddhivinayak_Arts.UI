import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        dedupe: ['react', 'react-dom'],
    },
    server: {
        port: 2929,
        open: true,
        host: true,
    },
});
