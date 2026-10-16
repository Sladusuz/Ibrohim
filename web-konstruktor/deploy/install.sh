#!/usr/bin/env bash
# Impro IT: serverga bitta buyruq bilan o'rnatish.
# Talab: toza Ubuntu 22.04/24.04 yoki Debian 11/12 server, root (sudo) huquqi, domen serverning IP manziliga yo'naltirilgan.
# Ishlatish:
#   curl -fsSL https://raw.githubusercontent.com/Sladusuz/impro/main/deploy/install.sh | sudo bash -s -- kicksport.uz
# (ixtiyoriy) admin parolini o'zingiz belgilash:  ... -s -- kicksport.uz MeningParolim123
set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then echo "Domenni yozing. Misol: bash install.sh kicksport.uz"; exit 1; fi
if [ "$(id -u)" != "0" ]; then echo "Root huquqi kerak: sudo bash install.sh $DOMAIN"; exit 1; fi

REPO="https://github.com/Sladusuz/impro.git"
APP=/opt/impro
DATA=/var/lib/impro
ENVF=/etc/impro.env
export DEBIAN_FRONTEND=noninteractive

say() { echo; echo "==> $*"; }

say "[1/6] Kerakli paketlar"
apt-get update -y
apt-get install -y curl git ca-certificates gnupg ufw debian-keyring debian-archive-keyring apt-transport-https cron

say "[2/6] Node.js"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v

say "[3/6] Caddy (avtomatik HTTPS)"
if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

say "[4/6] Loyihani yuklash"
if [ -d "$APP/.git" ]; then git -C "$APP" pull --ff-only; else git clone --depth 1 "$REPO" "$APP"; fi
id impro >/dev/null 2>&1 || useradd --system --home-dir "$DATA" --shell /usr/sbin/nologin impro
mkdir -p "$DATA" /var/backups/impro
chown -R impro:impro "$DATA"

if [ ! -f "$ENVF" ]; then
  PW="${2:-$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 14)}"
  cat > "$ENVF" <<ENV
PORT=3000
DATA_DIR=$DATA
TRUST_PROXY=1
ADMIN_PASSWORD=$PW
ENV
  chmod 600 "$ENVF"
  echo "$PW" > /root/impro-admin-parol.txt
  chmod 600 /root/impro-admin-parol.txt
fi

say "[5/6] Xizmatni sozlash va ishga tushirish"
cat > /etc/systemd/system/impro.service <<UNIT
[Unit]
Description=Impro IT platformasi
After=network.target

[Service]
User=impro
Group=impro
WorkingDirectory=$APP
EnvironmentFile=$ENVF
ExecStart=/usr/bin/node $APP/server.js
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$DATA
ProtectHome=true

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable impro >/dev/null 2>&1
systemctl restart impro

say "[6/6] HTTPS, xavfsizlik va zaxira nusxa"
cat > /etc/caddy/Caddyfile <<CADDY
$DOMAIN {
	encode gzip zstd
	reverse_proxy 127.0.0.1:3000
}
www.$DOMAIN {
	redir https://$DOMAIN{uri} permanent
}
CADDY
systemctl enable caddy >/dev/null 2>&1
systemctl restart caddy

ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

chmod +x "$APP/deploy/"*.sh
echo "0 3 * * * root $APP/deploy/backup.sh" > /etc/cron.d/impro-backup

# Domen shu serverga yo'naltirilganini tekshirish
MYIP="$(curl -s -m 8 https://api.ipify.org || true)"
DIP="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
echo
echo "=================================================================="
echo " O'rnatish tugadi."
echo
echo " Sayt:   https://$DOMAIN"
echo " Admin:  https://$DOMAIN/admin"
echo " Admin paroli: $(cat /root/impro-admin-parol.txt 2>/dev/null || echo 'siz belgilagan')"
echo "   (parol shu serverda /root/impro-admin-parol.txt faylida; admin paneldan o'zgartiring)"
if [ -n "$MYIP" ] && [ "$DIP" != "$MYIP" ]; then
  echo
  echo " DIQQAT: $DOMAIN hozircha $MYIP ga yo'naltirilmagan (hozir: ${DIP:-topilmadi})."
  echo " Domen DNS sozlamalarida A yozuvini $MYIP ga qo'ying. HTTPS sertifikat shundan keyin avtomatik olinadi."
fi
echo
echo " Ma'lumotlar:  $DATA   (har kuni 03:00 da zaxira: /var/backups/impro)"
echo " Yangilash:    sudo bash $APP/deploy/update.sh"
echo " Loglar:       journalctl -u impro -f"
echo "=================================================================="
