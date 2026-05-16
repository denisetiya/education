# Changelog

## Unreleased

### Added

- Added GitHub Actions deployment flow for GHCR images, VPS SSH deployment, Prisma migrations, and Docker Compose startup.
- Added production deployment documentation for server prerequisites, GitHub secrets, GitHub variables, and Cloudflare Tunnel setup.
- Added deployment recovery notes for failed first-run SQLite migrations.

### Changed

- Updated Docker Compose production runtime to use image tags, required secret interpolation, Cloudflare Tunnel token env, and a persistent backend data directory.
- Added `VPS_PORT` support for custom SSH ports in the deploy workflow.

### Fixed

- Fixed the backend Docker production install so Prisma CLI is available before `postinstall` runs.
- Pinned Docker builds to the repository pnpm version for deterministic CI installs.
- Fixed backend auth middleware typing for the Express core type exports available in Docker builds.
- Fixed Prisma migration ordering by creating class book, exercise, and exercise attempt tables before later migrations alter them.
- Synchronized Prisma schema indexes and class subject defaults with the SQL migration history.
