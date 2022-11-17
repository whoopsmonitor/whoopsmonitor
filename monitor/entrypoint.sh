#!/bin/sh

set -uo pipefail

rm -f ./.env
touch ./.env

API_TOKEN=${APP_TOKEN}
APP_API_URL=${APP_API_URL}

echo "API_TOKEN=$API_TOKEN" >> ./.env
echo "APP_API_URL=$APP_API_URL" >> ./.env

export NODE_OPTIONS=--openssl-legacy-provider

yarn run build

exec yarn run production
