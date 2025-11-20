import "dotenv/config";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { getRedisClient } from "@work-link/api/lib/redis";
import { createContext } from "@work-link/api/context";
import { electricRouter } from "@work-link/api/routers/electric/index";
import { appRouter } from "@work-link/api/routers/index";
import { auth } from "@work-link/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "@/env";

// Initialize Redis client (optional - will be null if Redis is not available)
let redis: ReturnType<typeof getRedisClient> | undefined;
try {
  redis = getRedisClient();
  // Try to connect
  redis
    .connect()
    .then(() => {
      console.log("✅ Redis connected successfully");
    })
    .catch((err) => {
      console.warn("⚠️  Redis connection failed, presence features will be disabled:", err.message);
      redis = undefined;
    });
} catch (err) {
  console.warn("⚠️  Redis initialization failed, presence features will be disabled:", err);
  redis = undefined;
}

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/electric", electricRouter);

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c, redis });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => c.text("OK"));

export default {
  fetch: app.fetch,
  port: env.PORT,
  // Electric SQL uses long-polling, so we need a longer timeout
  idleTimeout: 255,
};
