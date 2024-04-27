# Lemmy Defederation Sync (LDS)

Latest documentation available at: https://nowsci.com/#/lemmy/lds/?id=lemmy-defederation-sync-lds

When launching a new Lemmy instance, administrators may not understand the necessity of defederation with problem instances. Using LDS, you can sync your instance's "blocked instance" list with that of another server(s) whose admins you trust.

## Usage
In docker-compose:
```yml
version: '2.1'

services:

  lds:
    image: nowsci/lds
    container_name: lds
    environment:
      LOCAL_URL: https://lemmy.domain.ext
      LOCAL_USERNAME: user
      LOCAL_PASSWORD: password
      REMOTE_INSTANCES: '[
        "lemmy.world",
        "lemmy.one" ]'
      MINUTES_BETWEEN_RUNS: 1440
    restart: unless-stopped
```

Manually:
```bash
cd src
export LOCAL_URL=https://lemmy.domain.ext
export LOCAL_USERNAME=user
export LOCAL_PASSWORD=password
export REMOTE_INSTANCES='["lemmy.world","lemmy.one"]'
export MINUTES_BETWEEN_RUNS=1440
npm install
npm start
```

## Variables

|Variable|Description|
|-|-|
|LOCAL_URL|The URL of your instance|
|LOCAL_USERNAME|Username of the admin user for your instance|
|LOCAL_PASSWORD|Password of the admin user for your instance|
|REMOTE_INSTANCES|The remote instances you would like to sync your defederation list with (combined)|
|MINUTES_BETWEEN_RUNS|How long to wait between runs|
