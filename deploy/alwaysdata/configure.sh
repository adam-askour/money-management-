#!/usr/bin/env bash
set -euo pipefail
umask 077

printf 'Database password: '
stty -echo
IFS= read -r database_password
stty echo
printf '\n'

password_base64="$(printf '%s' "$database_password" | base64 | tr -d '\n')"
rate_limit_secret="$(php -r 'echo bin2hex(random_bytes(32));')"

cat > "$HOME/www/backend/.env" <<EOF
APP_ENV=production
APP_DEBUG=false
APP_ORIGIN=https://adam-daily-dirham.alwaysdata.net
APP_ORIGINS=https://adam-daily-dirham.alwaysdata.net
APP_TIMEZONE=Africa/Casablanca
APP_SESSION_NAME=daily_dirham_session
APP_SESSION_LIFETIME_SECONDS=7776000
DB_HOST=mysql-adam-daily-dirham.alwaysdata.net
DB_PORT=3306
DB_SSL_REQUIRED=false
DB_DATABASE=adam-daily-dirham_database
DB_USERNAME=adam-daily-dirham_money-app
DB_PASSWORD_BASE64=$password_base64
SINGLE_USER_ID=1
RATE_LIMIT_REQUESTS=120
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_SECRET=$rate_limit_secret
TRUST_PROXY_HEADERS=false
MANUAL_EDITABLE_DATES=
EOF

unset database_password password_base64 rate_limit_secret
chmod 600 "$HOME/www/backend/.env"
echo 'DATABASE_CONFIG_SAVED'
