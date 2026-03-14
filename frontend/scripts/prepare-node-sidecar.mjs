import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

const getRustTargetTriple = () => {
    const output = execFileSync('rustc', ['-Vv'], { encoding: 'utf-8' });
    const match = output.match(/^host:\s(.+)$/m);

    if (!match) {
        throw new Error('Failed to determine Rust host target triple.');
    }

    return match[1].trim();
};

export const prepareNodeSidecar = async () => {
    const targetTriple = getRustTargetTriple();
    const nodeBinaryPath = process.execPath;
    const nodeExtension = process.platform === 'win32' ? '.exe' : '';
    const sidecarDir = path.join(frontendRoot, 'src-tauri', 'binaries');
    const sidecarPath = path.join(sidecarDir, `backend-node-${targetTriple}${nodeExtension}`);

    await mkdir(sidecarDir, { recursive: true });
    await copyFile(nodeBinaryPath, sidecarPath);

    console.log(`Prepared Node.js sidecar: ${sidecarPath}`);
};

if (process.argv[1] === __filename) {
    prepareNodeSidecar().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
