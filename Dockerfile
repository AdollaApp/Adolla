FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g pnpm@9
WORKDIR /app

COPY pnpm-*.yaml ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/frontend/package.json ./apps/frontend/

COPY . ./


## --- frontend ---
FROM base AS frontend
EXPOSE 3000
WORKDIR /app/apps/frontend

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm run build
CMD ["pnpm", "run", "start"]


## --- api ---
FROM base AS api
EXPOSE 8080
WORKDIR /app/apps/api

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm run build
CMD ["pnpm", "run", "start"]
