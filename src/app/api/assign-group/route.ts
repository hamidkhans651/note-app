import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groupUrls, groups } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { urlId, groupName } = await req.json();
    
    if (!urlId || !groupName) {
      return NextResponse.json({ message: "URL ID and group name are required" }, { status: 400 });
    }
    
    // Check if the URL exists
    const existingUrl = await db
      .select()
      .from(groupUrls)
      .where(eq(groupUrls.id, urlId));
      
    if (existingUrl.length === 0) {
      return NextResponse.json({ message: "URL not found" }, { status: 404 });
    }
    
    // Check if the group exists, create it if not
    let groupId;
    const existingGroup = await db
      .select()
      .from(groups)
      .where(eq(groups.name, groupName));
      
    if (existingGroup.length > 0) {
      groupId = existingGroup[0].id;
    } else {
      const newGroup = await db
        .insert(groups)
        .values({ name: groupName })
        .returning();
      groupId = newGroup[0].id;
    }
    
    // Update the URL with the group ID
    await db
      .update(groupUrls)
      .set({ groupId })
      .where(eq(groupUrls.id, urlId));
      
    return NextResponse.json({ 
      message: "URL assigned to group successfully",
      groupId
    }, { status: 200 });
  } catch (error) {
    console.error("Error assigning group:", error);
    return NextResponse.json({ message: "Failed to assign group" }, { status: 500 });
  }
} 