# Upgrade Guide

## `minor` / `patch` update

That is the most straightforward update. Switch to the directory with the `docker-compose.yml` file and run this command. It is the same image you used to install Whoops Monitor in the first place.

```bash
docker pull ghcr.io/whoopsmonitor/whoopsmonitor/installer:1.1

docker run --rm -it -v $(pwd):/output -v /var/run/docker.sock:/var/run/docker.sock --network whoopsmonitor_app-tier ghcr.io/whoopsmonitor/whoopsmonitor/installer:1.1 update
```
