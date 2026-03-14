import { spawn } from 'node:child_process';

export const isWindows = process.platform === 'win32';

export const getNodePackageManagerCommand = (command) =>
    isWindows ? `${command}.cmd` : command;

export const runCommand = (command, args, options = {}) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: isWindows,
            ...options
        });

        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
        });
    });
