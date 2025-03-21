import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groupUrls } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const textData = await req.text();

    // Extract all Facebook group URLs
    const urlRegex = /https:\/\/www\.facebook\.com\/groups\/[^\s?]+/g;
    const extractedUrls = textData.match(urlRegex) || [];

    // Remove duplicates and clean URLs
    const uniqueUrls = Array.from(new Set(extractedUrls)).map((url) =>
      url.split("?")[0]
    ); // Remove query parameters

    // Process each URL
    let insertedCount = 0; // Track successfully inserted URLs
    for (const url of uniqueUrls) {
      // Check if URL exists
      const existing = await db
        .select()
        .from(groupUrls)
        .where(eq(groupUrls.url, url));

      if (existing.length === 0) {
        // Extract group ID for title
        const groupIdMatch = url.match(/groups\/(\d+|\w+)/);
        const title = groupIdMatch ? `Group ${groupIdMatch[1]}` : "Facebook Group";

        await db.insert(groupUrls).values({
          url,
          title,
          description: "Community group imported from data",
        });
        insertedCount++; // Increment count
      }
    }

    // app/api/import-urls/route.ts
    return NextResponse.json(
      {
        message: `✅ Successfully imported ${insertedCount} of ${uniqueUrls.length} URLs` as string
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        message:
          "❌ Error importing URLs: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}