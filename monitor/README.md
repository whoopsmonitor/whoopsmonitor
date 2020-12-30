# Monitor

Administration panel for monitoring.

## Install the dependencies

```bash
yarn
```

\### Local configuration

Create a `.quasar.env.json` file in the root of the [/monitor](/monitor) directory. This file contains environmental variables for local development. You can check the example file - [.quasar.env.json.example](/monitor/.quasar.env.json.example)
All environmental variables should be taken from docker-compose.yml file as well. New environmental variables means you have to update [installer](/installer) package as well.

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run dev
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
