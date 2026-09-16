const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const projectRoot = path.resolve(__dirname, '..');
const files = [
  'assets/cue-ring.png',
  'assets/cue-ring.ico',
  'app.js',
  'index.html',
  'style.css',
  'ring-theme.css',
  'package.json',
  'electron/main.cjs',
  'electron/preload.cjs',
  'electron/library.cjs',
  'electron/windows-input.cjs',
  'electron/windows-input.cs',
  'electron/windows-input.ps1'
];
const manifestPath = path.join(projectRoot, 'build-info.json');
const sourcePackage = require('../package.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const readSource = file => fs.readFileSync(path.join(projectRoot, file));

function writeBuildInfo() {
  const hashes = Object.fromEntries(files.map(file => [file, hash(readSource(file))]));
  const manifest = {
    id: hash(JSON.stringify(hashes)).slice(0, 12),
    version: sourcePackage.version,
    builtAt: new Date().toISOString(),
    files: hashes
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function verifyBuild() {
  const asar = require('@electron/asar');
  const archive = path.join(projectRoot, 'release/win-unpacked/resources/app.asar');
  const manifest = JSON.parse(asar.extractFile(archive, 'build-info.json'));

  for (const file of files) {
    if (hash(readSource(file)) !== manifest.files[file]) {
      throw Error('源码与构建清单不一致：' + file);
    }
    // electron-builder normalizes package.json; compare its runtime fields below.
    if (file !== 'package.json' && hash(asar.extractFile(archive, file)) !== manifest.files[file]) {
      throw Error('包内文件与构建清单不一致：' + file);
    }
  }

  const packedPackage = JSON.parse(asar.extractFile(archive, 'package.json'));
  for (const key of ['name', 'version', 'main', 'dependencies']) {
    if (JSON.stringify(packedPackage[key]) !== JSON.stringify(sourcePackage[key])) {
      throw Error('发布元数据不一致：' + key);
    }
  }
  if (asar.listPackage(archive).some(entry => /regression|receiver|tests[\\/]/.test(entry))) {
    throw Error('发布包混入开发脚本');
  }
  console.log('PASS: packaged files match source, build ' + manifest.id);
}

if (process.argv.includes('--verify')) {
  verifyBuild();
} else {
  writeBuildInfo();
}
