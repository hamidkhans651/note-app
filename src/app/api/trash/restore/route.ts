import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { trash, notes, groupUrls } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    // Get the trash item
    const trashItem = await db
      .select()
      .from(trash)
      .where(eq(trash.id, id));

    if (trashItem.length === 0) {
      return NextResponse.json({ message: "Trash item not found" }, { status: 404 });
    }

    const item = trashItem[0];

    if (item.isUrl) {
      // Restore URL
      await db
        .update(groupUrls)
        .set({ isDeleted: false })
        .where(eq(groupUrls.id, item.noteId));
    } else {
      // Restore note
      await db
        .update(notes)
        .set({ isDeleted: false })
        .where(eq(notes.id, item.noteId));
    }

    // Remove from trash
    await db
      .delete(trash)
      .where(eq(trash.id, id));

    return NextResponse.json({ message: "Restored successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error restoring from trash:", error);
    return NextResponse.json({ message: "Failed to restore from trash" }, { status: 500 });
  }
} 