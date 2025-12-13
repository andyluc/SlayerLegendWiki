import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceConfig = path.join(__dirname, '..', 'wiki-config.json');
const destConfig = path.join(__dirname, '..', 'public', 'wiki-config.json');

console.log('👀 Watching wiki-config.json for changes...\n');

// Initial copy
try {
  fs.copyFileSync(sourceConfig, destConfig);
  console.log('✓ Initial config copied');
} catch (err) {
  console.error('Failed to copy config:', err);
  process.exit(1);
}

// Watch for changes
fs.watch(sourceConfig, (eventType) => {
  if (eventType === 'change') {
    try {
      fs.copyFileSync(sourceConfig, destConfig);
      const timestamp = new Date().toLocaleTimeString();
      console.log(`✓ [${timestamp}] Config updated - refresh your browser`);
    } catch (err) {
      console.error('Failed to copy config:', err);
    }
  }
});
