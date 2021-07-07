# How to create a custom check
The real power of Whoops Monitor stays in the endless possibilities when it comes to checks. You can take advantage of checks that already exist or create one of your own tailored right for your company or your needs.

## Everything is a Docker
So in case, our statement is right, then the only knowledge you need is a Docker. Well, that's all true!

## How it all ends
There is only one rule. Your check must exit with predefined exit codes.
 - `0` - means the output of the check is just fine.
 - `1` - means there might be some warning you should keep eyes on.
 - `2` - also known as a critical event. Check says something is really wrong.

You can also output some other message out, and the response shows up right to the check.

#### Note on Docker registry
Every check *pulls* the Docker image. That means your container has to be uploaded to some registry, either official Docker Hub, GitHub registry, or one of your own.

## Environment variables
Please prefix all your env vars with `WM_` prefix.

### Env vars description
It is always a good idea to put some description to your env variables so they are well documented.
Use `labels` in Docker image file to describe all variables. They might be used in the monitor admin so they can help the others.

```dockerfile
LABEL com.whoopsmonitor.env.WM_URL="URL endpoint to your website."
```

Do not forget to put `com.whoopsmonitor.env.` prefix to the label so they can be parsed by the monitor.

## Labels
Always prefix your labels with `com.whoopsmonitor` prefix so we know this package belongs to Whoops Monitor.

### System labels
You can fill these labels to make the usage more friendly. Monitor will use it.

 - `com.whoopsmonitor.documentation` - Link to the documentation.
 - `com.whoopsmonitor.documentation.env.*` - List of environment variables we can use in the image like connection, credentails and things like that. Example above shows the usage.

### Inspiration
You can always learn from [checks that already exist](https://github.com/whoopsmonitor?q=whoopsmonitor-check-&type=&language=).

## Would you like to contribute?
We would be more than honored to have your piece of check in our project. Please [raise a new issue on GitHub](https://github.com/whoopsmonitor/whoopsmonitor/issues), and let's stay in touch.
