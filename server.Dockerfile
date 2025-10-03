FROM oven/bun:1.2.23 AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY packages/transactional/package.json ./packages/transactional/

RUN bun install

COPY apps/server ./apps/server
COPY packages/transactional ./packages/transactional

ARG ENV
ENV ENV=${ENV}

ARG PORT
ENV PORT=${PORT}

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG BETTER_AUTH_SECRET
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

ARG BETTER_AUTH_URL
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}

ARG WEB_URL
ENV WEB_URL=${WEB_URL}

ARG CORS_ORIGIN
ENV CORS_ORIGIN=${CORS_ORIGIN}

ARG SUPABASE_URL
ENV SUPABASE_URL=${SUPABASE_URL}

ARG SUPABASE_PUBLISHABLE_KEY
ENV SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}

ARG SUPABASE_SECRET_KEY
ENV SUPABASE_SECRET_KEY=${SUPABASE_SECRET_KEY}

ARG RESEND_API_KEY
ENV RESEND_API_KEY=${RESEND_API_KEY}

WORKDIR /app/apps/server
RUN bun run build

FROM oven/bun:1.2.23-slim AS production
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json

COPY --from=builder /app/packages/transactional ./packages/transactional

RUN bun install --frozen-lockfile --production

WORKDIR /app/apps/server

EXPOSE ${PORT}

ENTRYPOINT ["bun", "run", "start"]
