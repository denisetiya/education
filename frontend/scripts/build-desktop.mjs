import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareNodeSidecar } from './prepare-node-sidecar.mjs';
import { getNodePackageManagerCommand, runCommand } from './shared.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(frontendRoot, '..');
const backendRoot = path.join(projectRoot, 'backend');
const desktopBackendRoot = path.join(frontendRoot, 'src-tauri', 'resources', 'backend');

const buildDesktopBackendBundle = async () => {
    const backendPackage = JSON.parse(
        await readFile(path.join(backendRoot, 'package.json'), 'utf-8')
    );

    const runtimePackage = {
        name: `${backendPackage.name}-desktop-runtime`,
        version: backendPackage.version,
        private: true,
        type: backendPackage.type,
        main: 'dist/index.js',
        dependencies: {
            ...backendPackage.dependencies,
            ...(backendPackage.devDependencies?.prisma ? { prisma: backendPackage.devDependencies.prisma } : {})
        }
    };

    await Promise.all([
        rm(path.join(frontendRoot, '.desktop-backend'), { recursive: true, force: true }),
        rm(path.join(frontendRoot, 'src-tauri', 'resources', 'backend'), {
            recursive: true,
            force: true
        })
    ]);
    await mkdir(desktopBackendRoot, { recursive: true });

    await Promise.all([
        cp(path.join(backendRoot, 'dist'), path.join(desktopBackendRoot, 'dist'), { recursive: true }),
        cp(path.join(backendRoot, 'prisma'), path.join(desktopBackendRoot, 'prisma'), { recursive: true }),
        cp(path.join(backendRoot, 'prisma', 'dev.db'), path.join(desktopBackendRoot, 'dev.db')),
        writeFile(
            path.join(desktopBackendRoot, 'package.json'),
            `${JSON.stringify(runtimePackage, null, 2)}\n`,
            'utf-8'
        )
    ]);

    await runCommand(getNodePackageManagerCommand('npm'), ['install', '--omit=dev'], {
        cwd: desktopBackendRoot,
        env: {
            ...process.env,
            DATABASE_URL: 'file:./dev.db'
        }
    });
};

const buildFrontendDesktopAssets = async () => {
    await runCommand(getNodePackageManagerCommand('pnpm'), ['run', 'build:web'], {
        cwd: frontendRoot,
        env: {
            ...process.env,
            VITE_DESKTOP_MODE: 'true'
        }
    });
};

const main = async () => {
    await prepareNodeSidecar();
    await runCommand(getNodePackageManagerCommand('pnpm'), ['build'], {
        cwd: backendRoot
    });
    await buildDesktopBackendBundle();
    await buildFrontendDesktopAssets();
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
