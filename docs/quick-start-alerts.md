# Quick Start - Alerts

As always, we have to add a Docker image the same way we add for the check. So search in the menu on the left for the `Docker Images` item.

<img src="/docs/img/quick-start/menu-docker-images.png" alt="image" width="294" />

Add a new image, but now select the type of `Alert`. I decided to go with the [alert to Teams](https://github.com/whoopsmonitor/whoopsmonitor-alert-teams) for our test purposes.

When you save the new image, wait for a minute until the little grey circle turns into a green one. Now you're ready to add a new alert.

## New Alert

The setup is similar to the process we used to [create a new check](./quick-start.md).

Search for the `Alerts` menu item and click on the `New Alert` button. The new field you might have noticed is the `Repeat` interval. It is a simple interval in minutes how often the notification will trigger.

-   the first notification sends when the check fails,
-   then we wait for the interval
    -   if the check result is still failing, we send an error message
    -   otherwise, we send an `ok` status.

### Levels of notifications

We have three different levels of the check result the alert receives.

-   `ok` - check result is fine
-   `warning` - be aware of a potential issue
-   `critical` - something is genuinely wrong

The result depends on the check. For example, our [URL Alive](https://github.com/whoopsmonitor/whoopsmonitor-check-url-alive) check returns either `ok` or `critical` output - depends on the URL returning HTTP status 200 (ok).

### Tab: Env Variables

Now you can configure environmental variables that the alert container use. In our Teams alert, we configure a single variable.

<img src="/docs/img/quick-start/new-alert-env-teams.png" alt="image" width="492" />

#### Teams Incoming Webhook

You can obtain a webhook URL in the Teams configuration of the channel (connectors option).
