import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { notes, trash, groupUrls } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { id, type = 'note' } = await req.json();
    
    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    if (type === 'note') {
      // Get the note
      const note = await db
        .select()
        .from(notes)
        .where(eq(notes.id, id));

      if (note.length === 0) {
        return NextResponse.json({ message: "Note not found" }, { status: 404 });
      }

      // Move to trash
      await db.insert(trash).values({
        noteId: note[0].id,
        title: note[0].title,
        content: note[0].content,
        url: note[0].url || null,
        description: note[0].description || null,
        groupId: note[0].groupId,
        isUrl: note[0].isUrl,
      });

      // Mark as deleted
      await db
        .update(notes)
        .set({ isDeleted: true })
        .where(eq(notes.id, id));

    } else if (type === 'url') {
      // Get the URL
      const url = await db
        .select()
        .from(groupUrls)
        .where(eq(groupUrls.id, id));

      if (url.length === 0) {
        return NextResponse.json({ message: "URL not found" }, { status: 404 });
      }

      // Move to trash
      await db.insert(trash).values({
        noteId: url[0].id,
        title: url[0].title,
        content: url[0].url,
        url: url[0].url,
        description: url[0].description,
        groupId: url[0].groupId,
        isUrl: true,
      });

      // Mark as deleted
      await db
        .update(groupUrls)
        .set({ isDeleted: true })
        .where(eq(groupUrls.id, id));
    }

    return NextResponse.json({ message: "Moved to trash successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error moving to trash:", error);
    return NextResponse.json({ message: "Failed to move to trash" }, { status: 500 });
  }
} 