#!/usr/bin/env bash
set -euo pipefail
DEST="${1:-/www/wwwroot/evercup}"
[[ "$DEST" =~ ^/www/wwwroot/[A-Za-z0-9_-]+$ ]] || exit 1
install -d -m 700 /www/backup/evercup
umask 077
tar -czf "/www/backup/evercup/evercup-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$DEST" private-data app.mjs package.json site
echo 'Backup saved under /www/backup/evercup'
