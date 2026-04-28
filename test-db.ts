import db from "./src/db";
import { services } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const existingService = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.id, 6))
      .limit(1);
    console.log("Success:", existingService);
  } catch (err: any) {
    console.error("Error Object:", err);
    console.error("Message:", err.message);
    if (err.cause) console.error("Cause:", err.cause);
  }
}

main();
