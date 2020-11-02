# Docker volumes

Mongo and Redis containers have both a volume that is mounted locally. You can list all volumes with the command:

```bash
docker volume ls
```

## Losing data

When you delete a volume, you lose data. So in case you consider running this app on production, you should mount volumes to some other location.

## Change volumes

In case you remove volumes, you also lose the data you saved earlier. So it might be useful to map Mongo volume to some other location on your disk.

### Mongo

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

### Redis

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
