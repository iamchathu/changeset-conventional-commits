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
  target: 'node16',
  format: 'cjs',
  tsconfig: 'tsconfig.build.json',
});
