# syntax=docker/dockerfile:1

FROM oven/bun:1.3.1-slim AS base
WORKDIR /app

FROM base AS deps
WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
COPY apps/server/package.json apps/server/
COPY packages/api/package.json packages/api/
COPY packages/auth/package.json packages/auth/
COPY packages/db/package.json packages/db/

# Use cache mount for Bun's cache
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install

FROM deps AS builder
WORKDIR /app

COPY tsconfig.base.json tsconfig.json ./
COPY packages/db/tsconfig.json packages/db/
COPY packages/auth/tsconfig.json packages/auth/
COPY packages/api/tsconfig.json packages/api/
COPY apps/server/tsconfig.json apps/server/

COPY packages/db/src packages/db/src
COPY packages/db/drizzle.config.ts packages/db/
COPY packages/db/tsdown.config.ts packages/db/

COPY packages/auth/src packages/auth/src
COPY packages/auth/tsdown.config.ts packages/auth/

COPY packages/api/src packages/api/src
COPY packages/api/tsdown.config.ts packages/api/

COPY apps/server/src apps/server/src
COPY apps/server/tsdown.config.ts apps/server/

# Build in parallel
RUN bun run --cwd packages/db build & \
  bun run --cwd packages/auth build & \
  bun run --cwd packages/api build & \
  wait && \
  bun run --cwd apps/server build

FROM oven/bun:1.3.1-slim AS runtime
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/package.json /app/

COPY --from=builder /app/packages/db/dist /app/packages/db/dist
COPY --from=builder /app/packages/db/package.json /app/packages/db/

COPY --from=builder /app/packages/auth/dist /app/packages/auth/dist
COPY --from=builder /app/packages/auth/package.json /app/packages/auth/

COPY --from=builder /app/packages/api/dist /app/packages/api/dist
COPY --from=builder /app/packages/api/package.json /app/packages/api/

COPY --from=builder /app/apps/server/dist /app/apps/server/dist
COPY --from=builder /app/apps/server/package.json /app/apps/server/

ARG PORT
ENV PORT=$PORT

EXPOSE $PORT

WORKDIR /app/apps/server

CMD ["bun", "run", "start"]
