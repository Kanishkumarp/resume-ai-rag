const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const workspaceRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(workspaceRoot, 'src');
const testFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.isFile() && /\.test\.(ts|tsx)$/.test(entry.name)) {
      testFiles.push(fullPath);
    }
  }
}

walk(srcRoot);

if (testFiles.length === 0) {
  console.log('No test files found.');
  process.exit(0);
}

const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...testFiles], {
  cwd: workspaceRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    TSX_TSCONFIG_PATH: path.join(workspaceRoot, 'tsconfig.json'),
  },
});

process.exit(result.status ?? 1);
