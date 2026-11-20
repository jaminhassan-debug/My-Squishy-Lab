import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile, cp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const platform = process.argv[2];
if (!['android', 'ios'].includes(platform)) throw new Error('Pass android or ios.');
const native = path.join(root, platform);
const run = (bin, args) => execFileSync(bin, args, { cwd: root, stdio: 'inherit' });
const cliDir = path.join(root, 'node_modules/@capacitor/cli');
const cli = JSON.parse(await readFile(path.join(cliDir, 'package.json'), 'utf8')).bin;
const cap = (...args) => run(process.execPath, [path.join(cliDir, typeof cli === 'string' ? cli : cli.cap), ...args]);
if (!existsSync(native)) {
  if (platform === 'ios') cap('add', 'ios', '--packagemanager', 'SPM');
  else cap('add', 'android');
}
cap('sync', platform);

async function edit(file, transform) {
  const current = await readFile(file, 'utf8');
  await writeFile(file, transform(current));
}
function icon(file, size) {
  if (process.platform === 'darwin') run('sips', ['-z', String(size), String(size), 'app-icon.png', '--out', file]);
  else run('convert', ['app-icon.png', '-resize', size + 'x' + size, file]);
}

if (platform === 'ios') {
  const app = path.join(native, 'App/App');
  const plist = path.join(app, 'Info.plist');
  const orientations = ['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight'];
  const plistData = JSON.parse(execFileSync('plutil', ['-convert', 'json', '-o', '-', plist], { encoding: 'utf8' }));
  for (const key of ['UISupportedInterfaceOrientations', 'UISupportedInterfaceOrientations~ipad']) {
    run('plutil', [Object.hasOwn(plistData, key) ? '-replace' : '-insert', key, '-json', JSON.stringify(orientations), plist]);
  }
  const assets = path.join(app, 'Assets.xcassets/AppIcon.appiconset');
  icon(path.join(assets, 'AppIcon.png'), 1024);
  await writeFile(path.join(assets, 'Contents.json'), JSON.stringify({
    images: [{ filename: 'AppIcon.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
    info: { author: 'xcode', version: 1 }
  }, null, 2));
} else {
  const variables = await readFile(path.join(native, 'variables.gradle'), 'utf8');
  if (!/targetSdkVersion\s*=\s*36\b/.test(variables)) throw new Error('Android API 36 is required for this release');
  const main = path.join(native, 'app/src/main');
  await edit(path.join(main, 'AndroidManifest.xml'), xml => {
    if (!xml.includes('android:name=".MainActivity"')) throw new Error('Missing main activity');
    const orientation = 'android:screenOrientation="fullSensor"';
    xml = xml.replace(/android:screenOrientation="[^"]*"/g, orientation);
    if (!xml.includes(orientation)) xml = xml.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            ' + orientation);
    if (!xml.includes('android:appCategory=')) {
      xml = xml.replace('<application', '<application android:appCategory="game"');
    }
    return xml;
  });
  const res = path.join(main, 'res');
  const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [density, size] of Object.entries(sizes)) {
    const folder = path.join(res, 'mipmap-' + density);
    icon(path.join(folder, 'ic_launcher.png'), size);
    await cp(path.join(folder, 'ic_launcher.png'), path.join(folder, 'ic_launcher_round.png'));
    icon(path.join(folder, 'ic_launcher_foreground.png'), size * 2.25);
  }
  for (const entry of await readdir(path.join(res, 'mipmap-anydpi-v26'))) {
    if (!/^ic_launcher(?:_round)?\.xml$/.test(entry)) continue;
    await edit(path.join(res, 'mipmap-anydpi-v26', entry), xml =>
      xml.replace(/android:drawable="@(?:color|drawable)\/ic_launcher_background"/, 'android:drawable="@color/squishy_icon_background"'));
  }
  await writeFile(path.join(res, 'values/squishy_icon.xml'),
    '<resources><color name="squishy_icon_background">#FAF0D5</color></resources>\n');
}
