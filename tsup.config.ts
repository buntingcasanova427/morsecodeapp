import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  minify: false, // Keep readable for open source
  outDir: 'dist',
});
