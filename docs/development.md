# Local development
There are two different folders:

-  `api` that holds files for API.
-  `worker` that contains files for our process that consumes the queue.

### api
Is written in [SailsJS](https://sailsjs.com) framework.

### worker
It is a simple Node.js file.

## Docker Compose setup
You need [Docker Compose](https://docs.docker.com/compose/) installed on the machine.

### Generate `docker-compose-dev.yml` file
Run this command to create a custom version of the `docker-compose-dev.yml` file. Switch to the root of this project first.

```bash
docker run --rm -v $(pwd):/output docker.pkg.github.com/whoopsmonitor/whoopsmonitor/installer:latest
```

It will generate a `docker-compose.yml` and `docker-compose-dev.yml` files right in the current directory. The first one is for production purposes, the second for development.

Now you can start all required containers (without a monitor - described below).

```sh
# start development (without UI)
docker-compose down && docker-compose -f docker-compose-dev.yml up --remove-orphans
```

That is what you get:

 - API in Sails.js running on port 1337.
 - MongoDB is running on default port 27017.
 - Redis is running on default port 6379.
 - Worker listens for changes in the queue provided by the API.

## Monitor
The monitor has based on [QuasarJS](https://quasar.dev) framework. We don't use a dockerized container for development because it takes a long time to build an image and run the hot reload feature.

So use traditional development with NPM. First, install Quasar CLI globally (we use YARN).

```bash
yarn global add @quasar/cli
```

In case of some trouble, please [follow official documentation](https://quasar.dev/quasar-cli/installation).

### API token
You need to set a cookie called `API_TOKEN` and value represented in the `docker-compose-dev.yml` file right under the `api` section.
Otherwise, your communication with API will not work, and you end up with 500 errors.

Now you can switch to the monitor directory and run the environment.

```bash
cd ./monitor
yarn
yarn dev
```

The web browser should automatically open the localhost on port 8080 with a hot reload feature. That's all.
