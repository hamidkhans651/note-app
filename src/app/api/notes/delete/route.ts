import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { notes } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ message: "Note ID is required" }, { status: 400 });
    }
    
    // Delete the note
    await db
      .delete(notes)
      .where(eq(notes.id, id));
      
    return NextResponse.json({
      message: "Note deleted successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ message: "Failed to delete note" }, { status: 500 });
  }
} 