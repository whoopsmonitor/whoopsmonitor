![GitHub release (latest by date)](https://img.shields.io/github/v/release/whoopsmonitor/whoopsmonitor)
![https://twitter.com/whoopsmonitor](https://img.shields.io/twitter/url/https/twitter.com/cloudposse.svg?style=social&label=Follow%20%40whoopsmonitor)

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

-   [Docker](https://www.docker.com/) to run all required images.
-   [Docker Compose](https://docs.docker.com/compose/) to run all containers at once.

## Installation

The easiest way is to run this project with the `docker-compose.yml` file. We prepared a simple generator due to security reasons (passwords, etc.). Run it with this two commands:

```bash
docker network create -d bridge whoopsmonitor_app-tier

docker run --rm -it -v $(pwd):/output -v /var/run/docker.sock:/var/run/docker.sock --network whoopsmonitor_app-tier ghcr.io/whoopsmonitor/whoopsmonitor/installer:1.0 create
```

It will ask for some simple questions and generate a `docker-compose.yml` file right in the current directory. You also get a file for local development (feel free to ignore that file).

Now you can access the monitor right from URL <http://localhost:8080>.

### Install with Caprover

You can also install Whoops Monitor with [CapRover](https://caprover.com/) on the One Click Apps page.

## Quick Start

Please read our [quick start manual](/docs/quick-start.md).

## Upgrade Guide

Please read our [upgrade guide](/docs/upgrade-guide.md).

## Useful links

-   [How to create a my own alert](./docs/custom-alert.md)
-   [How to create a my own check](./docs/custom-check.md)
-   [Local Development](/docs/development.md)
-   [Docker volumes and loosing data](/docs/volumes.md)

## Ready to contribute?

You can always:

-   raise a [new issue](https://github.com/whoopsmonitor/whoopsmonitor/issues) or
    Consider implementing some change on your own and then creating a [pull request](https://github.com/whoopsmonitor/whoopsmonitor/pulls).

We appreciate any help or opinion.

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

This project is licensed under the **[MIT license](http://opensource.org/licenses/mit-license.php)** - see the [LICENSE.md](/LICENSE.md) file for details.
