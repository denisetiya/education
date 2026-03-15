import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareNodeSidecar } from './prepare-node-sidecar.mjs';
import { getNodePackageManagerCommand, runCommand } from './shared.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

const main = async () => {
    await prepareNodeSidecar();
    await runCommand(getNodePackageManagerCommand('pnpm'), ['exec', 'vite', '--host', '127.0.0.1', '--port', '1420'], {
        cwd: frontendRoot,
        env: {
            ...process.env,
            VITE_DESKTOP_MODE: 'true'
        }
    });
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
