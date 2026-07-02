#!/bin/sh
set -e

if [ -z "$APP_KEY" ]; then
    echo "ERROR: la variable APP_KEY no esta configurada. Generala con 'php artisan key:generate --show' y agregala en Railway." >&2
    exit 1
fi

php artisan config:clear
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
