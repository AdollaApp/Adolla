# ⚡Adolla

Easy to use web app to read manga and comics.


## 🔥Features

- Track your manga progress easily.
- Organize your manga in lists.
- Advanced reader to fit to your specific needs.
- Get notified about new chapters through Discord or Telegram.


## 🔥Available sources

Adolla sources manga from many places:
- MangaSee
- Mangadex
- Manganelo
- Mangahere
- ReadComicOnline
- ComicExtra
- Guya.moe


## 🍄How to use

> [!INFO]
> Visit the app here: https://example.com


## 🧬 Running locally for development

You need to have `pnpm` and `NodeJS 22` installed to run for development.

Create an `.env` file at `/apps/api/.env` with these contents:
```sh
CONF_USE_PRESETS=docker
```

Then run the compose file at `/.docker` with this command to setup the complimentary services:
```sh
docker compose up -d
```

Then finally, spin up the dev servers:
```sh
pnpm i

cd apps/frontend
pnpm dev

cd apps/api
pnpm dev
```
