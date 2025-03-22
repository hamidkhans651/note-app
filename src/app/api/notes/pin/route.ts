import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { notes } from "@/drizzle/schema";
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
    
    // Toggle pin status
    const isPinned = existingNote[0].pinned !== null;
    
    const updatedNote = await db
      .update(notes)
      .set({ 
        pinned: isPinned ? null : new Date(),
      })
      .where(eq(notes.id, id))
      .returning();
      
    return NextResponse.json({
      message: isPinned ? "Note unpinned" : "Note pinned",
      pinned: !isPinned,
      note: updatedNote[0],
    }, { status: 200 });
  } catch (error) {
    console.error("Error pinning note:", error);
    return NextResponse.json({ message: "Failed to pin note" }, { status: 500 });
  }
} 