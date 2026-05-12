import fs from 'fs';
import path from 'path';

const targetFolder = 'frontend';
if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);

const items = [
  'src', 'public', 'index.html', 'vite.config.ts', 'vitest.config.ts', 
  'components.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 
  'tailwind.config.ts', 'postcss.config.js', 'eslint.config.js', 
  'package.json', 'package-lock.json', 'bun.lockb'
];

for (const item of items) {
  if (fs.existsSync(item)) {
    try {
      fs.renameSync(item, path.join(targetFolder, item));
    } catch (e) {
      console.error(`Failed to move ${item}:`, e.message);
    }
  }
}
console.log('Successfully moved frontend files to frontend/ directory.');
