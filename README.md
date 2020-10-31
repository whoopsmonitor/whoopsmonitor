<img src="/docs/img/logo_1024_1024.png" alt="logo" width="150" height="150" align="right"
 />

# Whoops Monitor
I guess you have your own monitoring solution running at your company. Maybe not. However, you can always try Whoops Monitor to achieve some clarity on your systems. It is an excellent tool for helpdesk operators or even for the managers when configured adequately by your IT department.

What Whoops Monitor does is dead simple. It runs any Docker image at regular cron interval and then saves the result. That's it!

So you can even write your own Docker container with some check for your internal process (like last order on the shop) and then run the check every minute to get the result.

Everything displays on the main dashboard where you can see the results of all of your checks.

<div align="middle">
  <img src="/docs/img/login.png" alt="logo" width="256" height="128" />
  <img src="/docs/img/dashboard.png" alt="logo" width="256" height="128" />
  <img src="/docs/img/check-detail.png" alt="logo" width="256" height="128" />
</div>

## Prerequisities

You need
 * GIT (to be able to download this repository),
 * [Docker](https://www.docker.com/) to run all required images.
 * [Docker Compose](https://docs.docker.com/compose/) to run all containers at once.

## Installation
The easiest way is to run this project with `docker-compose.yml` file. We prepared a simple generator due to security reasons (passwords etc.). Run it with this command:

```bash
docker run --rm -it -v $(pwd):/output ghcr.io/whoopsmonitor/whoopsmonitor/generate-docker-compose:latest
```

This will ask for some simple questions and generate a `docker-compose.yml` file right in the directory you are in. It will also generate a file for development. But you can simply ignore that file.

Now you can run the project on background.

```bash
docker-compose -p whoopsmonitor up -d
```

`-p` means project name so you can have have a unified volume names etc.

Now you can access the monitor right from url http://localhost:8080

## Quick Start
Please read our [quick start manual](/docs/quick-start.md).

## Docker volumes
Mongo and Redis containers have both a volume that is mounted locally. You can list all volumes with command:

```bash
docker volume ls
```

### Loosing data
When you delete a volume, you loose data. So in case you consider to run this app on production, you should mount volumes to some other location.

### Change volumes
In case you remove volumes, you also lose the data you saved earlier. So it might be useful to map Mongo volume to some other location on your disk.

#### Mongo
Open `docker-compose` file (development or production) and replace this line:

```yaml
volumes:
  - mongodb_data:/bitnami
```

with content like:

```yaml
volumes:
  - ./my_local_db_folder:/bitnami
```

#### Redis
Open `docker-compose` file (development or production) and replace this line:

```yaml
volumes:
  - redis_data:/bitnami
```

with content like:

```yaml
volumes:
  - ./my_local_redis_folder:/bitnami
```

## Local development
You can read [further details here](/docs/development.md).

Howerver you can always:

- raise a [new issue](https://github.com/whoopsmonitor/whoopsmonitor/issues) or
- consider to implement some change on your own and then create a [pull request](https://github.com/whoopsmonitor/whoopsmonitor/pulls).

We appreciate any help or opinion.

## Create a custom check
If you are interested in creating of your own check, [read details here](./docs/custom-check.md)

## Create a custom alert
If you are interested in creating of your own alert, [read details here](./docs/custom-alert.md)

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

This project is licensed under the **[MIT license](http://opensource.org/licenses/mit-license.php)** - see the [LICENSE.md](/LICENSE.md) file for details.
