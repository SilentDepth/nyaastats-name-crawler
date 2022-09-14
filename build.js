require('esbuild').buildSync({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  target: ['node16'],
  minify: true,
  outfile: 'dist/name-crawler.js',
})
