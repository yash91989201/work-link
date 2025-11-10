import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import type { db } from "@work-link/db";
import { sql } from "drizzle-orm";

const ELECTRIC_URL = process.env.ELECTRIC_URL ?? "http://localhost:5003";
const ELECTRIC_SECRET = process.env.ELECTRIC_SECRET ?? "";

/**
 * Prepares the Electric SQL proxy URL from a request URL
 * Copies over Electric-specific query params and adds auth if configured
 * @param requestUrl - The incoming request URL
 * @returns The prepared Electric SQL origin URL
 */
export function prepareElectricUrl(requestUrl: string): URL {
  const url = new URL(requestUrl);
  const originUrl = new URL(`${ELECTRIC_URL}/v1/shape`);

  // Copy Electric-specific query params
  url.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      originUrl.searchParams.set(key, value);
    }
  });

  originUrl.searchParams.set("secret", ELECTRIC_SECRET);

  return originUrl;
}

/**
 * Proxies a request to Electric SQL and returns the response
 * @param originUrl - The prepared Electric SQL URL
 * @returns The proxied response
 */
export async function proxyElectricRequest(originUrl: URL): Promise<Response> {
  const response = await fetch(originUrl);
  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.set("vary", "cookie");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Helper function to generate transaction ID for Electric sync
export async function generateTxId(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
): Promise<number> {
  // The ::xid cast strips off the epoch, giving you the raw 32-bit value
  // that matches what PostgreSQL sends in logical replication streams
  // (and then exposed through Electric which we'll match against
  // in the client).
  const result = await tx.execute(
    sql`SELECT pg_current_xact_id()::xid::text as txid`
  );
  const txid = result.rows[0]?.txid;

  if (txid === undefined) {
    throw new Error("Failed to get transaction ID");
  }

  return Number.parseInt(txid as string, 10);
}
