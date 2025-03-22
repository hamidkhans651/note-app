import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { notes } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request) {
  try {
    const { id, title, content, url, description, groupName } = await req.json();
    
    if (!id) {
      return NextResponse.json({ message: "Note ID is required" }, { status: 400 });
    }
    
    const updatedNote = await db
      .update(notes)
      .set({
        title,
        content,
        url,
        description,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();
      
    return NextResponse.json({
      message: "Note updated successfully",
      note: updatedNote[0],
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ message: "Failed to update note" }, { status: 500 });
  }
} 