import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            bundleTypes: true,
            tsconfigPath: './tsconfig.json',
        }),
    ],
    build: {
        target: 'es2020',
        minify: false,
        sourcemap: true,
        emptyOutDir: true,
        lib: {
            entry: resolve(import.meta.dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'index',
        },
    },
});
