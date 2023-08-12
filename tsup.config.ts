import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'bin',
  splitting: false,
  sourcemap: 'inline',
  clean: true,
  bundle: false,
  format: 'cjs',
  tsconfig: 'tsconfig.build.json',
});
