# How to create a custom alert
You can send the result of the check to almost any service you need to. As we said multiple times, Whoops Monitor is all about the Docker. If you know how to build your container, you get along with it just fine.

#### Note on Docker registry
Every alert *pulls* the Docker image. That means your container has to be uploaded to some registry, either official Docker Hub, GitHub registry, or one of your own.

## Environment variables
Please prefix all your env vars with `WM_` prefix.

### Env vars description
It is always a good idea to put some description to your env variables so they are well documented.
Use `labels` in Docker image file to describe all variables. They might be used in the monitor admin so they can help the others.

```dockerfile
LABEL com.whoopsmonitor.env.WM_SMTP_HOST="Enter SMTP host."
```

Do not forget to put `com.whoopsmonitor.env.` prefix to the label so they can be parsed.

## Labels
Always prefix your labels with `com.whoopsmonitor` prefix so we know this package belongs to Whoops Monitor.

### System labels
You can fill these labels to make the usage more friendly. Monitor will use it.

 - `com.whoopsmonitor.documentation` - Link to the documentation.
 - `com.whoopsmonitor.documentation.env.*` - List of environment variables we can use in the image like connection, credentails and things like that. Example above shows the usage.

## Shared variables
Every alert will receive these variables related to the check:

 - `WM_CHECK_NAME`, name of the check you entered in monitor.
 - `WM_CHECK_EXIT_CODE`, ok (0), warning (1) or critical (2).
 - `WM_CHECK_OUTPUT`, output related to the check result.

So you can simply use these variables in your alert.

### Inspiration
You can always learn from [alerts that already exist](https://github.com/whoopsmonitor?q=whoopsmonitor-alert-&type=&language=).

## Would you like to contribute?
We would be more than honored to have your piece of check in our project. Please [raise a new issue on GitHub](https://github.com/whoopsmonitor/whoopsmonitor/issues), and let's stay in touch.
