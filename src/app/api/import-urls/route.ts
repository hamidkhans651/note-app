import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groupUrls } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const textData = await req.text();

    // Extract all potential Facebook group URLs and normalize them
    const urlRegex = /https?:\/\/[^\s/?#]+\/groups\/[^\s?#]+/gi;
    const potentialUrls = textData.match(urlRegex) || [];

    const validUrls = potentialUrls
      .map((url) => {
        try {
          const parsedUrl = new URL(url);
          // Normalize hostname to www.facebook.com
          if (
            parsedUrl.hostname.replace("www.", "") !== "facebook.com" ||
            !parsedUrl.pathname.startsWith("/groups/")
          ) {
            return null;
          }

          // Extract group ID from path
          const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
          const groupId = pathSegments[1]; // path is /groups/<groupId>/...

          if (!groupId) return null;

          // Rebuild URL without query, hash, or trailing slash
          const cleanUrl = `https://www.facebook.com/groups/${groupId}`;
          return cleanUrl;
        } catch (error) {
          return null;
        }
      })
      .filter((url): url is string => url !== null);

    // Remove duplicates
    const uniqueUrls = Array.from(new Set(validUrls));

    // Process each URL
    let insertedCount = 0;
    for (const url of uniqueUrls) {
      // Check if URL exists
      const existing = await db
        .select()
        .from(groupUrls)
        .where(eq(groupUrls.url, url));

      if (existing.length === 0) {
        // Use group ID as title
        const groupId = url.split("/groups/")[1];
        const title = `Group ${groupId}`;

        await db.insert(groupUrls).values({
          url,
          title,
          description: "Community group imported from data",
        });
        insertedCount++;
      }
    }

    return NextResponse.json(
      {
        message: `✅ Successfully imported ${insertedCount} of ${uniqueUrls.length} URLs`,
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