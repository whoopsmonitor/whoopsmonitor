#!/bin/sh

# Create all docker images at once to help local development

set -uo pipefail

VERSION="2.0"

for DOCKERFILE in $(find . -name 'Dockerfile-*' -execdir echo {} ';' | sort); do
  echo "Building docker image with Dockerfile '$DOCKERFILE'"
  NAME=$(echo "$DOCKERFILE" | sed 's/Dockerfile-//g')

  docker build -t "ghcr.io/whoopsmonitor/whoopsmonitor/$NAME:$VERSION" -f "$DOCKERFILE" .

  echo "Done building image with Dockerfile '$DOCKERFILE'"
done

echo ""
echo "Done building images."
