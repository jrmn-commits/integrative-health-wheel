
#!/usr/bin/env bash
set -euo pipefail
TARGET_SSH="${1:-homelab@100.113.127.65}"
TARGET_DIR="${2:-/var/www/health-wheel}"
echo "Building React app..."
npm install
npm run build
echo "Syncing to $TARGET_SSH:$TARGET_DIR"
rsync -avz --delete dist/ "$TARGET_SSH:$TARGET_DIR/"
echo "Done. Ensure your web server serves $TARGET_DIR (example Nginx config provided in docker/nginx.conf)."
