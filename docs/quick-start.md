# Quick Start

Once you run all Docker containers, visit <http://localhost:8080/#/>
Or any other URL where you install Whoops Monitor.

## Login

Now you can log in. Use the admin password you can read from the Docker Compose file, `APP_PASSWORD` variable. You might also click on the "Are you a guest?" link, allowing anonymous users to view dashboard data.

<img src="/docs/img/quick-start/app-password-variable.png" alt="image" height="300" />

## Dashboard

Now you're logged in to the dashboard. At this point, there is nothing useful to see. So we have to configure some checks.

## Docker image goes first

However, to do be able to do that, you also need a Docker image first. Then you can use this image to run your checks or alerts. That is the same for checks as well as for alerts.

So search in the menu on the left for the `Docker Images` item.

<img src="/docs/img/quick-start/menu-docker-images.png" alt="image" width="294" />

## Docker images

As we already said, Whoops Monitor is all about Docker images. There are two types of images you should care about:

-   one for checks,
-   and one for alerting.

Click on the `New Image` button and go right to the form.
There are some fields you have to configure. The first one is about the type of Docker image. So select the purpose of your image.

Then fill the path to the Docker image. As you can see, the Docker image must be available in some registry, like Docker Hub, GitLab Registry, or even your private one. You can also enter some credentials in case your registry storage requires it to log in.

### Existing images

We created a different kind of images so you can start pretty smoothly.

-   [checks](https://github.com/whoopsmonitor?q=check-&type=&language=)
-   [alerts](https://github.com/whoopsmonitor?q=alert-&type=&language=)

### Custom images

To create your checks or alerts, follow our tutorials:

-   [custom check](./custom-check.md)
-   [custom alert](./custom-alert.md)

### Local image option

You might have noticed the `local image` option in the form. This option is mostly used for local debugging. So you can even have a local image right on the server Whoops Monitoring is running on.

Let's continue. I chose the check called [URL Alive](https://github.com/whoopsmonitor/whoopsmonitor-check-url-alive) for our test purpose.

You can find all Whoops Monitor packages right in the specific repository you're just browsing.

<img src="/docs/img/quick-start/github-packages.png" alt="image" width="316" />

## Saving Docker Image

When you save the image, wait for a minute (approximately) until the gray circle will turn into green. That means the Docker image is ready to be used.

<div>
  <img src="/docs/img/quick-start/docker-images-list-grey.png" alt="image" width="350" />
  <img src="/docs/img/quick-start/docker-images-list-green.png" alt="image" width="350" />
</div>

## Ready to create a new check?

Once we added our image, we are ready to create our first check. Just go to the `Checks` menu item.
<img src="/docs/img/quick-start/checks-menu.png" alt="image" width="293" />

Next, click on the `New Check` button, and you're right in the form you're about to configure. There are many fields you can configure. Some of them are optional, but most of them required.

### Tab: General

-   `Check Name` - Just enter the name of the check displayed on the dashboard.
-   `Image` - Select the image we created earlier. In our case, the `URL Alive` image.
-   `Cron` - Enter interval (cron notation) how often the check will run. You can use [Crontab Guru](https://crontab.guru/) to help you to build a cron. Little helper bellow the field will show you the cron in the "human-readable" format.

### Tab: Env Variables

This tab is the most important one. Docker containers take environmental variables, so they are easily configurable. Every check and its env vars should be well documented in the README file. So you can read further details in there.

Remembering all the variables is a bit unfriendly. However, there is a small help. A little button called `Reset Variables` will override the field's content with default values parsed right from the image. This only works if the image supports it (our images do that), and the image is healthy (remember the small green circle?).

But just to prevent any misunderstanding, please read the README file as well.

That's how we configured the `URL Alive` check.

<img src="/docs/img/quick-start/tab-env-vars.png" alt="image" width="394" />

## Finally

That's actually all you need to know right now. Save the form. Don't forget to publish the check. Go to the dashboard and wait for the check to run for the first time.

<img src="/docs/img/quick-start/dashboard-first-check.png" alt="image" width="600" />

## Next step

Every check might report its result to the alerting service. Would you like to set up a new alert? Let's [move to the next level](./quick-start-alerts.md).
