# Changelog

## [2.0.0] - 2022-xx-xx

### Added

-   Implements sockets for the server and client.
-   Adding new Redis container for sockets (+ installer).

### Changed

-   Update Docker images to the latest version with dependencies as well.
-   Docker images of Redis upgrade (6 -> 7).

## [v1.1.1] - (2022-09-26)

### Changed

-   (monitor) UI layout in the forms in checks and alerts improved.

### Fixed

-   (api) Demo data installer is using image that does not exists.

## [v1.1.0] - 2022-09-24

### Added

-   (monitor) Change form in Docker Images.
-   (monitor) New "Tools" options to clean Redis queues if necessary.
-   (installer) New version 1.1

### Changed

-   Update Docker image dependencies.

### Removed

-   Removed `APP_QUEUE_NAME_CLEANUP_CHECK_STATUS` variable (not used) from Docker Compose file.
