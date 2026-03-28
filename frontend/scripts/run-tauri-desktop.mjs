import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCommand } from './shared.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const desktopRoot = path.resolve(frontendRoot, '..', 'desktop');
const tauriCliEntry = require.resolve('@tauri-apps/cli/tauri.js');
const rawArgs = process.argv.slice(2);
const args = rawArgs.length > 1 && rawArgs[1] === '--'
    ? [rawArgs[0], ...rawArgs.slice(2)]
    : rawArgs;

if (args.length === 0) {
    console.error('Usage: node ./scripts/run-tauri-desktop.mjs <tauri-command> [...args]');
    process.exit(1);
}

runCommand(process.execPath, [tauriCliEntry, ...args], {
    cwd: desktopRoot,
    env: process.env,
    shell: false
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
