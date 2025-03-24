import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groupUrls, groups } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    // Join with groups table to get group information
    const urls = await db
      .select({
        id: groupUrls.id,
        url: groupUrls.url,
        title: groupUrls.title,
        description: groupUrls.description,
        createdAt: groupUrls.createdAt,
        pinned: groupUrls.pinned,
        groupId: groupUrls.groupId,
        groupName: groups.name,
      })
      .from(groupUrls)
      .leftJoin(groups, eq(groupUrls.groupId, groups.id))
      .where(and(
        eq(groupUrls.isArchived, false),
        eq(groupUrls.isDeleted, false)
      ));
      
    return NextResponse.json(urls, { status: 200 });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return NextResponse.json({ message: "Failed to fetch URLs" }, { status: 500 });
  }
}
