import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(root, process.argv[2] ?? '..');
const output = path.join(root, 'www');

await Promise.all(['index.html', 'preview.html', 'scene_01/welcome.js', 'viewport-fit.js'].map(
  file => readFile(path.join(source, file))
));
await rm(output, { recursive: true, force: true });
const excluded = new Set([
  '.git', '.github', '.gitignore', 'tests', 'reference_storyboards', 'mobile',
  'index.html', 'about', 'blog', 'download', 'website-content', 'scripts',
  'website.css', 'website.js', 'robots.txt', 'sitemap.xml', 'experiments'
]);
await mkdir(output, { recursive: true });
await Promise.all((await readdir(source)).filter(name => !excluded.has(name)).map(name =>
  cp(path.join(source, name), path.join(output, name), { recursive: true })
));
// Capacitor opens the root document. Route it directly to the game welcome screen.
await writeFile(path.join(output, 'index.html'), `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>My Squishy Lab</title><meta http-equiv="refresh" content="0;url=scene_01/preview.html">
<script>location.replace('scene_01/preview.html');</script></head>
<body><a href="scene_01/preview.html">Open My Squishy Lab</a></body></html>`);
await writeFile(path.join(output, 'native-compat.js'), `
globalThis.SquishyNativeEdition = 'complete';
if (typeof globalThis.structuredClone !== 'function') {
  // Game saves and recipes are plain JSON data.
  globalThis.structuredClone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}
if (typeof Array.prototype.at !== 'function') {
  Object.defineProperty(Array.prototype, 'at', {
    configurable: true,
    writable: true,
    value(index) {
      const offset = Math.trunc(Number(index)) || 0;
      const position = offset < 0 ? this.length + offset : offset;
      return position < 0 || position >= this.length ? undefined : this[position];
    }
  });
}
`);
// Only public, platform-specific RevenueCat SDK keys belong in the app bundle.
const appleKey=process.env.SQUISHY_RC_APPLE_PUBLIC_KEY||'';
const googleKey=process.env.SQUISHY_RC_GOOGLE_PUBLIC_KEY||'';
if(appleKey&&!appleKey.startsWith('appl_'))throw Error('Use the Apple public SDK key, not a secret key.');
if(googleKey&&!googleKey.startsWith('goog_'))throw Error('Use the Google public SDK key, not a secret key.');
await build({entryPoints:[path.join(root,'scripts/store-entry.mjs')],bundle:true,format:'iife',platform:'browser',target:'es2020',outfile:path.join(output,'native-store.js'),define:{__RC_APPLE_KEY__:JSON.stringify(appleKey),__RC_GOOGLE_KEY__:JSON.stringify(googleKey)}});
for (const page of ['preview.html', 'scene_01/preview.html']) {
  const file = path.join(output, page);
  const relative = page.includes('/') ? '../' : './';
  const html = await readFile(file, 'utf8');
  if (!html.includes('<head>')) throw new Error('Missing head in ' + page);
  await writeFile(file, html.replace('<head>', '<head><script src="' + relative + 'native-compat.js"></script><script src="' + relative + 'native-store.js"></script>'));
}
console.log('Bundled My Squishy Lab in www/');
