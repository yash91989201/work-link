# syntax=docker/dockerfile:1

# ============================================
# Dependencies stage
# ============================================
FROM oven/bun:1.3.2-slim AS deps
WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
COPY apps/web/package.json apps/web/
COPY packages/api/package.json packages/api/
COPY packages/auth/package.json packages/auth/
COPY packages/db/package.json packages/db/

RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install

# ============================================
# Builder stage
# ============================================
FROM deps AS builder
WORKDIR /app

COPY tsconfig.base.json tsconfig.json ./
COPY packages/db packages/db
COPY packages/auth packages/auth
COPY packages/api packages/api
COPY apps/web apps/web

ARG VITE_ENV
ENV VITE_ENV=$VITE_ENV

ARG VITE_WEB_URL
ENV VITE_WEB_URL=$VITE_WEB_URL

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

ARG VITE_IMAGE_TRANSFORMATION_URL
ENV VITE_IMAGE_TRANSFORMATION_URL=$VITE_IMAGE_TRANSFORMATION_URL

ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

WORKDIR /app/apps/web
RUN bun run build

# ============================================
# Runtime stage (Nginx server)
# ============================================
FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/apps/web/dist ./

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
