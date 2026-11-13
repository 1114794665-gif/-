#!/usr/bin/env bash
set -euo pipefail
# Run: bash install.sh /www/wwwroot/evercup /absolute/path/to/node
DEST="${1:-/www/wwwroot/evercup}"
NODE="${2:-$(command -v node || true)}"
SOURCE="$(cd -- "$(dirname -- "$0")" && pwd)"
[[ $EUID -eq 0 ]] || { echo 'Run as root in BT terminal'; exit 1; }
[[ "$DEST" =~ ^/www/wwwroot/[A-Za-z0-9_-]+$ ]] || { echo 'Use /www/wwwroot/simple-name'; exit 1; }
[[ -x "$NODE" ]] || { echo 'Install Node.js 24 LTS first, then pass its absolute path'; exit 1; }
"$NODE" -e 'if(Number(process.versions.node.split(".")[0])<24)process.exit(1)'
[[ ! -e "$DEST" ]] || { echo 'Destination exists. Use another directory; no existing site was changed.'; exit 1; }
[[ ! -e /etc/systemd/system/evercup.service ]] || { echo 'evercup.service exists. Stop and review existing deployment.'; exit 1; }
command -v systemctl >/dev/null
id evercup >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin evercup
mkdir -p "$DEST"
cp -a "$SOURCE/site" "$SOURCE/app.mjs" "$SOURCE/package.json" "$SOURCE/private-data" "$DEST/"
chown -R root:evercup "$DEST"
chmod -R o-rwx "$DEST"
chmod -R g+rX "$DEST"
chown -R evercup:evercup "$DEST/private-data"
chmod 700 "$DEST/private-data"
cat > /etc/systemd/system/evercup.service <<EOF
[Unit]
Description=BOOM Drinkware website
After=network.target
[Service]
Type=simple
User=evercup
Group=evercup
WorkingDirectory=$DEST
ExecStart=$NODE $DEST/app.mjs 18781
Environment=NODE_ENV=production
Environment=ENQ_DIR=$DEST/private-data/enquiries
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DEST/private-data
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now evercup
sleep 2
curl --fail http://127.0.0.1:18781/healthz
printf '\nInstalled. Configure BT Nginx reverse proxy to http://127.0.0.1:18781 ; do NOT expose this port.\n'
