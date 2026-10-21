const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isRoot = fs.existsSync('client');
const clientDir = isRoot ? path.resolve('client') : path.resolve('.');
console.log('Building client in:', clientDir);

execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

const clientDist = path.join(clientDir, 'dist');
const rootDist = path.resolve('dist');

if (clientDist !== rootDist) {
  try {
    fs.cpSync(clientDist, rootDist, { recursive: true });
  } catch (err) {
    console.error('Failed to copy dist to root:', err);
  }
}

console.log('Build completed successfully! Published directory is ready.');
