const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const workspaceRoot = path.resolve(__dirname, '..');
const testRoots = [path.join(workspaceRoot, 'src'), path.join(workspaceRoot, 'backend', 'src')];
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

for (const testRoot of testRoots) {
  if (fs.existsSync(testRoot)) {
    walk(testRoot);
  }
}

if (testFiles.length === 0) {
  console.log('No test files found.');
  process.exit(0);
}

const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...testFiles], {
  cwd: workspaceRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
    USE_SAMPLE_RESUMES: 'true',
    MONGODB_URI: ' ',
    MONGODB_DB_NAME: ' ',
    MONGODB_COLLECTION_NAME: 'resume',
    MONGODB_BM25_INDEX: ' ',
    MONGODB_VECTOR_INDEX: ' ',
    MISTRAL_API_KEY: ' ',
    GROQ_API_KEY: ' ',
    API_ACCESS_TOKEN: ' ',
    TSX_TSCONFIG_PATH: path.join(workspaceRoot, 'tsconfig.app.json'),
  },
});

process.exit(result.status ?? 1);
