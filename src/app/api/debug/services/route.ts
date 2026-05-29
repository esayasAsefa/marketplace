import db from "@/db";
import { services, users, profiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get all services with their joins (no filtering)
    const allServices = await db
      .select({
        id: services.id,
        title: services.title,
        categoryId: services.categoryId,
        proId: services.proId,
        proName: users.name,
        verified: profiles.isPro,
      })
      .from(services)
      .leftJoin(users, eq(services.proId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(services.createdAt));

    // Get unique categories
    const uniqueCategories = [...new Set(allServices.map((s) => s.categoryId))];

    return Response.json({
      success: true,
      totalServices: allServices.length,
      uniqueCategories,
      sampleServices: allServices.slice(0, 10),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
