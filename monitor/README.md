# Monitor

Administration panel for monitoring.

## Install the dependencies

```bash
yarn
```

\### Local configuration

Create a `env` file in the root of the [/monitor](/monitor) directory. This file contains environment variables for local development. You can check the example file - [.env.example](/monitor/.env.example)
All environment variables should be taken from docker-compose.yml file as well. New environment variables means you have to update [installer](/installer) package as well.

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
yarn dev
```

### Lint the files

```bash
yarn run lint
```

### Build the app for production

Build is handled in [Dockerfile-monitor](../Dockerfile-monitor) file.

### Generate favicons

```sh
icongenie generate -i public/logo/favicon_1024_1024.png --skip-trim -m spa
```
