import { build } from 'esbuild';

build({
  entryPoints: ['src/module.ts'],
  bundle: true,
  outdir: 'dist',
  target: 'es2020',
  format: 'esm',
  sourcemap: true,
  minify: false
}).catch(() => process.exit(1));
