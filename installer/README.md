# Installer

This package allows you to generate a configuration file (Docker Compose) to run up Whoops Monitor quickly.

## Development

It is easier to use NPM commands.

```bash
npm install
```

### Create

```bash
npm run create
```

### Change version

```bash
npm run change-version
```

### Update

```bash
npm run update
```

## Docker

### Build container

```sh
docker build -f Dockerfile-installer -t whoopsmonitor-installer .
```

### Run container

```sh
docker run --rm -it -v $(pwd):/output -v /var/run/docker.sock:/var/run/docker.sock whoopsmonitor-installer create
docker run --rm -it -v $(pwd):/output -v /var/run/docker.sock:/var/run/docker.sock whoopsmonitor-installer update
docker run --rm -it -v $(pwd):/output -v /var/run/docker.sock:/var/run/docker.sock whoopsmonitor-installer change-version
```
