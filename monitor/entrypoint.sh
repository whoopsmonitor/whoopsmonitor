#!/bin/sh

set -uo pipefail

rm -f ./.quasar.env.json
touch ./.quasar.env.json

API_TOKEN=${API_TOKEN}
APP_API_URL=${APP_API_URL}

echo '{"production":{"API_TOKEN":"'$API_TOKEN'","APP_API_URL":"'$APP_API_URL'"}}' >> ./.quasar.env.json

export NODE_OPTIONS=--openssl-legacy-provider

npm run build

exec yarn production
