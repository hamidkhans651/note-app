import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { notes, archivedNotes } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ message: "Note ID is required" }, { status: 400 });
    }
    
    // Check if the note exists
    const existingNote = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id));
      
    if (existingNote.length === 0) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }
    
    // Archive the note
    const archivedNote = await db
      .insert(archivedNotes)
      .values({
        noteId: existingNote[0].id,
        title: existingNote[0].title,
        content: existingNote[0].content,
        url: existingNote[0].url,
        description: existingNote[0].description,
        groupId: existingNote[0].groupId,
        isUrl: existingNote[0].isUrl,
      })
      .returning();

    // Update the original note
    await db
      .update(notes)
      .set({ isArchived: true })
      .where(eq(notes.id, id));
      
    return NextResponse.json({
      message: "Note archived successfully",
      archivedNote: archivedNote[0],
    }, { status: 200 });
  } catch (error) {
    console.error("Error archiving note:", error);
    return NextResponse.json({ message: "Failed to archive note" }, { status: 500 });
  }
} 