import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src', '!src/**/*.spec.*'],
  outDir: 'bin',
  platform: 'node',
  treeshake: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: false,
  target: 'node22',
  format: 'esm',
  tsconfig: 'tsconfig.build.json',
  outExtension() {
    return {
      js: '.js',
    };
  },
});
