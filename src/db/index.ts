import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import "dotenv/config";

// Handle missing DATABASE_URL gracefully for testing scenarios
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Return a placeholder URL that won't be used until tests set it
    return "postgresql://placeholder@localhost/placeholder";
  }
  return url;
};

// Wrap fetch with retry logic to handle transient connection failures
const fetchWithRetry: typeof fetch = async (input, init) => {
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(input, init);
      if (!res.ok) {
        console.error(`[fetchWithRetry attempt ${attempt}] Neon responded with status ${res.status}:`, await res.clone().text());
      }
      return res;
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      // Brief backoff before retrying
      await new Promise((r) => setTimeout(r, 200 * attempt));
    }
  }
  // Unreachable, but TypeScript needs it
  throw new Error("fetchWithRetry: exhausted retries");
};

// Set the custom fetch function globally for the Neon driver
neonConfig.fetchFunction = fetchWithRetry;

const sql = neon(getDatabaseUrl());
const db = drizzle(sql, { schema });

// Export the raw sql client in case callers need to run raw queries (e.g. adjust sequences after seeding)
export { sql };

export default db;

