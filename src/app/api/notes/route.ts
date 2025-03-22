import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { notes, groups } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// Get all notes with group information
export async function GET() {
  try {
    const allNotes = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        url: notes.url,
        description: notes.description,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        pinned: notes.pinned,
        groupId: notes.groupId,
        groupName: groups.name,
        isUrl: notes.isUrl,z
      })
      .from(notes)
      .leftJoin(groups, eq(notes.groupId, groups.id));
      
    return NextResponse.json(allNotes, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ message: "Failed to fetch notes" }, { status: 500 });
  }
}

// Create a new note
export async function POST(req: Request) {
  try {
    const { title, content, url, description, groupName, isUrl } = await req.json();
    
    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }
    
    if (isUrl && !url) {
      return NextResponse.json({ message: "URL is required for URL notes" }, { status: 400 });
    }
    
    // Handle group assignment
    let groupId = null;
    
    if (groupName) {
      // Check if the group exists
      const existingGroup = await db
        .select()
        .from(groups)
        .where(eq(groups.name, groupName));
        
      if (existingGroup.length > 0) {
        groupId = existingGroup[0].id;
      } else {
        // Create the group if it doesn't exist
        const newGroup = await db
          .insert(groups)
          .values({ name: groupName })
          .returning();
        groupId = newGroup[0].id;
      }
    }
    
    // Create the note
    const newNote = await db
      .insert(notes)
      .values({
        title,
        content: content || (isUrl ? "" : ""),
        url: url || null,
        description: description || null,
        groupId,
        isUrl: isUrl || false,
      })
      .returning();
      
    return NextResponse.json({
      message: "Note created successfully",
      note: newNote[0],
      groupId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ message: "Failed to create note" }, { status: 500 });
  }
} 