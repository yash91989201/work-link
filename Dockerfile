# Build stage
FROM oven/bun:1.2.23 AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/transactional/package.json ./packages/transactional/
RUN bun install 

COPY apps/web ./apps/web
COPY apps/server ./apps/server
COPY packages/transactional ./packages/transactional

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

# Build the web app
WORKDIR /app/apps/web
RUN bun run build

# Production stage with nginx
FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/apps/web/dist ./

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
