# Monitor

Administration panel for monitoring.

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
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
