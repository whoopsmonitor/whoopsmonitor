#!/bin/sh

set -uo pipefail

rm -f ./.quasar.env.json
touch ./.quasar.env.json

API_TOKEN=${API_TOKEN}
APP_API_URL=${APP_API_URL}

echo '{"production":{"API_TOKEN":"'$API_TOKEN'","APP_API_URL":"'$APP_API_URL'"}}' >> ./.quasar.env.json

npm run build

exec yarn production
