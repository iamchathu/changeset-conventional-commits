import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src', '!src/**/*.spec.*'],
  outDir: 'bin',
  platform: 'node',
  treeshake: true,
  splitting: false,
  sourcemap: 'inline',
  clean: true,
  bundle: false,
  target: 'es2022',
  format: 'esm',
  tsconfig: 'tsconfig.build.json',
});
