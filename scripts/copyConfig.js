import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Copy wiki-config.json from root to public directory
 * This ensures the source of truth stays in root but the runtime version is accessible
 */

const sourceConfig = path.join(__dirname, '..', 'wiki-config.json');
const destConfig = path.join(__dirname, '..', 'public', 'wiki-config.json');

try {
  console.log('Copying wiki-config.json to public directory...');

  if (!fs.existsSync(sourceConfig)) {
    console.error('❌ Source config not found:', sourceConfig);
    process.exit(1);
  }

  fs.copyFileSync(sourceConfig, destConfig);
  console.log('✓ Wiki config copied successfully!');
  console.log(`  Source: ${sourceConfig}`);
  console.log(`  Dest:   ${destConfig}`);
} catch (err) {
  console.error('Failed to copy wiki config:', err);
  process.exit(1);
}
