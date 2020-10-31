# Local development
There are two different folders:

-  `api` that holds files for API.
-  `worker` that holds files for our process that consumes the queue.

### api
Is written in [SailsJS](https://sailsjs.com) framework.

### worker
Is a simple Node.js file.

## Docker Compose setup
You need [Docker Compose](https://docs.docker.com/compose/) installed on machine.

### Generate `docker-compose-dev.yml` file
Run this command to create a custom version of `docker-compose-dev.yml` file. Switch to the root of this project first.

```bash
docker run --rm -v $(pwd):/output docker.pkg.github.com/whoopsmonitor/whoopsmonitor/generate-docker-compose:latest
```

This will generate a `docker-compose.yml` and `docker-compose-dev.yml` files right in the directory you are in. The first one is for production purpose, the second for the development.

Now you can start all required containers (without monitor - described bellow).

```sh
docker-compose down && docker-compose -f docker-compose-dev.yml up
```

That is what you get:

 - API in Sails.js running on port 1337.
 - MongoDB running on default port 27017.
 - Redis running on default port 6379.
 - Worker listens for changes on the queue provided by the API.

## Monitor
Is written in [QuasarJS](https://quasar.dev) framework. We don't use a dockerized container for development because it takes long time to build an image and run the hot reload feature.

So use traditional development with NPM. First, install Quasar CLI globally (we use YARN).

```bash
yarn global add @quasar/cli
```

In case of some trouble, please [follow official documentation](https://quasar.dev/quasar-cli/installation).

### API token
You need to set a cookie called `API_TOKEN` and value that is represented in `docker-compose-dev.yml` file right under `api` section.
Otherwise your communication with API is not going to work and you end up with 500 error.

Now you can just switch to the monitor directory and run the environment.

```bash
cd ./monitor
quasar dev
```

Web browser should automatically open localhost on port 8080 with hot reload feature. That's all.
