import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { notes, groupUrls, groups } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request) {
  try {
    const { id, title, url, description, groupName, type } = await req.json();
    
    if (!id || !title) {
      return NextResponse.json({ message: "ID and title are required" }, { status: 400 });
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

    // Update the note based on type
    if (type === 'url') {
      const updatedUrl = await db
        .update(groupUrls)
        .set({ 
          title,
          url,
          description,
          groupId
        })
        .where(eq(groupUrls.id, id))
        .returning();

      if (updatedUrl.length === 0) {
        return NextResponse.json({ message: "URL not found" }, { status: 404 });
      }

      return NextResponse.json({ 
        message: "URL updated successfully",
        url: updatedUrl[0]
      });
    } else {
      const updatedNote = await db
        .update(notes)
        .set({ 
          title,
          content: url || "",
          description,
          groupId
        })
        .where(eq(notes.id, id))
        .returning();

      if (updatedNote.length === 0) {
        return NextResponse.json({ message: "Note not found" }, { status: 404 });
      }

      return NextResponse.json({ 
        message: "Note updated successfully",
        note: updatedNote[0]
      });
    }
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ message: "Failed to update note" }, { status: 500 });
  }
} 