import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { trash, groups } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const trashItems = await db
      .select({
        id: trash.id,
        noteId: trash.noteId,
        title: trash.title,
        content: trash.content,
        url: trash.url,
        description: trash.description,
        createdAt: trash.createdAt,
        deletedAt: trash.deletedAt,
        groupId: trash.groupId,
        groupName: groups.name,
        isUrl: trash.isUrl,
      })
      .from(trash)
      .leftJoin(groups, eq(trash.groupId, groups.id))
      .orderBy(trash.deletedAt);

    return NextResponse.json(trashItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching trash items:", error);
    return NextResponse.json({ message: "Failed to fetch trash items" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    // Permanently delete from trash
    await db
      .delete(trash)
      .where(eq(trash.id, id));

    return NextResponse.json({ message: "Permanently deleted from trash" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting from trash:", error);
    return NextResponse.json({ message: "Failed to delete from trash" }, { status: 500 });
  }
} 