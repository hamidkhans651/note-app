import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { trash, notes, groupUrls } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ message: "Item ID is required" }, { status: 400 });
    }
    
    // Get the trash item
    const trashItem = await db
      .select()
      .from(trash)
      .where(eq(trash.id, id));
      
    if (trashItem.length === 0) {
      return NextResponse.json({ message: "Item not found in trash" }, { status: 404 });
    }
    
    const item = trashItem[0];
    
    // Restore to appropriate table based on type
    if (item.isUrl) {
      await db
        .insert(groupUrls)
        .values({
          url: item.url!,
          title: item.title,
          description: item.description || "",
          groupId: item.groupId,
        });
    } else {
      await db
        .insert(notes)
        .values({
          title: item.title,
          content: item.content,
          url: item.url,
          description: item.description,
          groupId: item.groupId,
          isUrl: false,
        });
    }
    
    // Delete from trash
    await db
      .delete(trash)
      .where(eq(trash.id, id));
      
    return NextResponse.json({ message: "Item restored successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error restoring item:", error);
    return NextResponse.json({ message: "Failed to restore item" }, { status: 500 });
  }
} 