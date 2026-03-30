import { createHash } from 'node:crypto';
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
const desktopRoot = path.join(projectRoot, 'desktop');
const desktopBackendRoot = path.join(desktopRoot, 'resources', 'backend');

const syncDesktopDatabase = async () => {
    await runCommand(getNodePackageManagerCommand('pnpm'), ['exec', 'prisma', 'db', 'push', '--skip-generate'], {
        cwd: backendRoot,
        env: process.env
    });

    await runCommand(getNodePackageManagerCommand('pnpm'), ['run', 'seed'], {
        cwd: backendRoot,
        env: process.env
    });
};

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
        rm(path.join(projectRoot, '.desktop-backend'), { recursive: true, force: true }),
        rm(path.join(desktopRoot, 'resources', 'backend'), {
            recursive: true,
            force: true
        })
    ]);
    await mkdir(desktopBackendRoot, { recursive: true });

    await Promise.all([
        cp(path.join(backendRoot, 'dist'), path.join(desktopBackendRoot, 'dist'), { recursive: true }),
        cp(path.join(backendRoot, 'prisma'), path.join(desktopBackendRoot, 'prisma'), { recursive: true }),
        writeFile(
            path.join(desktopBackendRoot, 'package.json'),
            `${JSON.stringify(runtimePackage, null, 2)}\n`,
            'utf-8'
        )
    ]);

    await Promise.all([
        cp(path.join(backendRoot, 'dev.db'), path.join(desktopBackendRoot, 'dev.db')),
        cp(path.join(backendRoot, 'dev.db'), path.join(desktopBackendRoot, 'prisma', 'dev.db'))
    ]);

    const bundledDatabaseBuffer = await readFile(path.join(desktopBackendRoot, 'dev.db'));
    const seedVersion = createHash('sha256').update(bundledDatabaseBuffer).digest('hex');
    await writeFile(
        path.join(desktopBackendRoot, 'seed-manifest.json'),
        `${JSON.stringify(
            {
                seedVersion,
                generatedAt: new Date().toISOString(),
                sourceDatabase: 'dev.db'
            },
            null,
            2
        )}\n`,
        'utf-8'
    );

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
    await syncDesktopDatabase();
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
