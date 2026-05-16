# Deployment

Konfigurasi deploy memakai GitHub Actions, GHCR, Docker Compose, dan Cloudflare Tunnel.

## Server

Pastikan server sudah punya:

- Docker Engine
- Docker Compose v2 (`docker compose version`)
- User SSH yang bisa menjalankan Docker

Workflow akan membuat folder deploy default di `/opt/geoeducation`, menyalin `docker-compose.yml`, membuat `.env`, menarik image dari GHCR, menjalankan migrasi Prisma, lalu menyalakan container. Kalau `VPS_USER` bukan `root`, pastikan folder itu bisa ditulis oleh user tersebut atau ubah `VPS_DEPLOY_PATH`.

## GitHub Secrets

Tambahkan secrets berikut di repository:

- `VPS_HOST`: IP atau hostname server
- `VPS_USER`: user SSH server
- `VPS_SSH_KEY`: private key SSH, direkomendasikan
- `VPS_PASSWORD`: alternatif jika tidak memakai SSH key
- `VPS_PORT`: port SSH custom server, default `22`
- `VPS_SSH_PORT`: optional fallback kalau sudah terlanjur memakai nama secret ini
- `JWT_SECRET`: secret production untuk backend
- `CLOUDFLARE_TUNNEL_TOKEN`: token dari Cloudflare Zero Trust Tunnel
- `GHCR_TOKEN`: optional kalau package GHCR private, gunakan PAT dengan `read:packages`
- `GHCR_USERNAME`: optional, default ke actor GitHub Actions

## GitHub Variables

Tambahkan repository variables ini jika nilai default perlu diganti:

- `FRONTEND_URL`: default `https://geoeducation.denisetiya.site`
- `VPS_DEPLOY_PATH`: default `/opt/geoeducation`

## Cloudflare Tunnel

Di Cloudflare Zero Trust, buat tunnel dan public hostname untuk domain aplikasi. Arahkan service target ke:

```text
http://frontend:80
```

Container `cloudflared` membaca `CLOUDFLARE_TUNNEL_TOKEN` dari `.env` yang dibuat workflow saat deploy.

## Deploy

Push ke branch `main` akan menjalankan build dan deploy otomatis. Deploy juga bisa dijalankan manual dari tab GitHub Actions lewat workflow `Build and Deploy`.
