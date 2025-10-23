
# Integrative Health Wheel — Tiny Web App

Self-contained React + Vite + Tailwind app with a Radar “Wheel of Health”, month snapshots, deltas, and CSV export.

## Quick Start (Local)
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Option 2: Deploy from MacBook → Homelab or Cloudflare Pages

### A) Homelab (rsync to your server)
1. Edit SSH target in `deploy_homelab.sh` (default: `homelab@100.113.127.65`).
2. Build & sync:
   ```bash
   ./deploy_homelab.sh homelab@YOUR_IP /var/www/health-wheel
   ```
3. Point Nginx to `/var/www/health-wheel` or use Docker:
   ```bash
   docker compose -f docker/compose.yml build && docker compose -f docker/compose.yml up -d
   ```
   Then browse: `http://<server>:8080`

### B) Cloudflare Pages
1. Create a new GitHub repo and push this project.
2. In Cloudflare Pages: **Create project → Connect to Git**.
3. Framework preset: **Vite**.  
   - Build command: `npm run build`  
   - Build output directory: `dist`
4. (Optional) Custom domain, e.g., `health.jmcinto.xyz`.
5. (Optional) Restrict access with **Cloudflare Zero‑Trust**: add an Access policy for your emails/devices.

## Data Storage
Everything is stored in `localStorage` in the user’s browser. No backend required.

## Stack
- React 18, Vite, TypeScript
- Tailwind (basic configuration)
- Recharts for the radar chart
- Minimal in-house UI components (no shadcn setup required)

## Notes
- If you want server-side auth later, you can still host statically behind Cloudflare Access.
- For a containerized Homelab deploy, use the provided Dockerfile & nginx.conf and bind to 80/443 with your reverse proxy.
# integrative-health-wheel
