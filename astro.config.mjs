import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
    site: 'https://akwebsolutions.nl',
    integrations: [
        sitemap(),
        react(),
        mdx(),
    ],
    vite: {
        plugins: [tailwindcss()],
        build: {
            cssCodeSplit: true,
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                },
            },
        },
    },
    output: 'static',
    build: {
        inlineStylesheets: 'always', // Force inline ALL CSS to eliminate render-blocking
    },
    compressHTML: true,
    prefetch: {
        defaultStrategy: 'hover', // Prefetch on hover for instant navigation
        prefetchAll: false,
    },
    image: {
        service: {
            entrypoint: 'astro/assets/services/sharp', // Use sharp for image optimization
        },
    },
});