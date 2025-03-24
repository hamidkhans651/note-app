import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { archivedNotes, groups } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const archivedItems = await db
      .select({
        id: archivedNotes.id,
        title: archivedNotes.title,
        content: archivedNotes.content,
        url: archivedNotes.url,
        description: archivedNotes.description,
        createdAt: archivedNotes.createdAt,
        archivedAt: archivedNotes.archivedAt,
        groupId: archivedNotes.groupId,
        groupName: groups.name,
        isUrl: archivedNotes.isUrl,
      })
      .from(archivedNotes)
      .leftJoin(groups, eq(archivedNotes.groupId, groups.id))
      .orderBy(archivedNotes.archivedAt);
      
    return NextResponse.json(archivedItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching archived notes:", error);
    return NextResponse.json({ message: "Failed to fetch archived notes" }, { status: 500 });
  }
} 