import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { notes, archivedNotes, groupUrls } from "@/drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ids, type = 'note', isBulk = false } = body;
    
    if (!isBulk && !id) {
      return NextResponse.json({ message: "ID is required for single archive" }, { status: 400 });
    }

    if (isBulk && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ message: "Valid IDs array is required for bulk archive" }, { status: 400 });
    }

    if (type === 'url') {
      if (isBulk) {
        // Handle bulk URL archiving
        const urlsToArchive = await db
          .select()
          .from(groupUrls)
          .where(and(
            inArray(groupUrls.id, ids),
            eq(groupUrls.isArchived, false),
            eq(groupUrls.isDeleted, false)
          ));

        if (urlsToArchive.length === 0) {
          return NextResponse.json({ message: "No valid URLs found to archive" }, { status: 404 });
        }

        // Archive each URL
        for (const url of urlsToArchive) {
          await db.insert(archivedNotes).values({
            noteId: url.id,
            title: url.title,
            content: url.url,
            url: url.url,
            description: url.description,
            groupId: url.groupId,
            isUrl: true,
          });

          await db
            .update(groupUrls)
            .set({ isArchived: true })
            .where(eq(groupUrls.id, url.id));
        }

        return NextResponse.json({
          message: `Successfully archived ${urlsToArchive.length} URLs`,
          archivedCount: urlsToArchive.length
        }, { status: 200 });
      } else {
        // Check if the URL exists
        const existingUrl = await db
          .select()
          .from(groupUrls)
          .where(eq(groupUrls.id, id));
        
        if (existingUrl.length === 0) {
          return NextResponse.json({ message: "URL not found" }, { status: 404 });
        }
        
        // Archive the URL
        const archivedUrl = await db
          .insert(archivedNotes)
          .values({
            noteId: existingUrl[0].id,
            title: existingUrl[0].title,
            content: existingUrl[0].url,
            url: existingUrl[0].url,
            description: existingUrl[0].description,
            groupId: existingUrl[0].groupId,
            isUrl: true,
          })
          .returning();

        // Update the original URL
        await db
          .update(groupUrls)
          .set({ isArchived: true })
          .where(eq(groupUrls.id, id));
        
        return NextResponse.json({
          message: "URL archived successfully",
          archivedNote: archivedUrl[0],
        }, { status: 200 });
      }
    } else {
      if (isBulk) {
        // Handle bulk note archiving
        const notesToArchive = await db
          .select()
          .from(notes)
          .where(and(
            inArray(notes.id, ids),
            eq(notes.isArchived, false),
            eq(notes.isDeleted, false)
          ));

        if (notesToArchive.length === 0) {
          return NextResponse.json({ message: "No valid notes found to archive" }, { status: 404 });
        }

        // Archive each note
        for (const note of notesToArchive) {
          await db.insert(archivedNotes).values({
            noteId: note.id,
            title: note.title,
            content: note.content,
            url: note.url,
            description: note.description,
            groupId: note.groupId,
            isUrl: false,
          });

          await db
            .update(notes)
            .set({ isArchived: true })
            .where(eq(notes.id, note.id));
        }

        return NextResponse.json({
          message: `Successfully archived ${notesToArchive.length} notes`,
          archivedCount: notesToArchive.length
        }, { status: 200 });
      } else {
        // Handle single note archiving
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
            isUrl: false,
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
      }
    }
  } catch (error) {
    console.error("Error archiving:", error);
    return NextResponse.json({ message: "Failed to archive" }, { status: 500 });
  }
} 