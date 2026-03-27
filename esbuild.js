const { build, context } = require('esbuild');

const isWatch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],   // provided by VS Code at runtime — never bundle it
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: !isProd,
  minify: isProd,
  logLevel: 'info',
};

async function main() {
  if (isWatch) {
    const ctx = await context(config);
    await ctx.watch();
    console.log('Watching for changes…');
  } else {
    await build(config);
  }
}

main().catch(() => process.exit(1));
