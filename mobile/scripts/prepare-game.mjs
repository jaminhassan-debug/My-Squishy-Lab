import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(root, process.argv[2] ?? '..');
const output = path.join(root, 'www');

await Promise.all(['index.html', 'preview.html', 'scene_01/welcome.js', 'viewport-fit.js'].map(
  file => readFile(path.join(source, file))
));
await rm(output, { recursive: true, force: true });
const excluded = new Set(['.git', '.github', '.gitignore', 'tests', 'reference_storyboards', 'mobile']);
await mkdir(output, { recursive: true });
await Promise.all((await readdir(source)).filter(name => !excluded.has(name)).map(name =>
  cp(path.join(source, name), path.join(output, name), { recursive: true })
));
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
for (const page of ['preview.html', 'scene_01/preview.html']) {
  const file = path.join(output, page);
  const relative = page.includes('/') ? '../' : './';
  const html = await readFile(file, 'utf8');
  if (!html.includes('<head>')) throw new Error('Missing head in ' + page);
  await writeFile(file, html.replace('<head>', '<head><script src="' + relative + 'native-compat.js"></script>'));
}
console.log('Bundled My Squishy Lab in www/');
