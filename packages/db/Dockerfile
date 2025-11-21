FROM oven/bun:alpine

# Set the working directory
WORKDIR /app

# Installing only required packages for migration
RUN bun install drizzle-kit@latest drizzle-orm@latest postgres@latest dotenv@latest @t3-oss/env-core@latest zod@latest

# Copy only necessary files for migration
COPY ./src/migrations ./src/migrations
COPY ./src/schema ./src/schema
COPY ./src/env.ts ./src/env.ts
COPY ./drizzle.config.ts .

# Set the entrypoint
ENTRYPOINT ["bunx", "--bun", "drizzle-kit", "migrate", "--config", "drizzle.config.ts"]
