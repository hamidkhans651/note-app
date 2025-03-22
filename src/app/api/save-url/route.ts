import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { groupUrls, urlToGroups, groups } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validate URL format
const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

// URL Schema validation
const urlSchema = z.string().refine(isValidUrl, {
  message: "Invalid URL format",
});

export async function POST(req: Request) {
  try {
    const { url, title, description, groupName } = await req.json();
    urlSchema.parse(url); // Validate URL format

    // Check if the URL already exists in the database
    const existingUrl = await db
      .select()
      .from(groupUrls)
      .where(eq(groupUrls.url, url));

    if (existingUrl.length > 0) {
      // If the URL already exists, return a conflict response
      return NextResponse.json({ message: "URL already exists" }, { status: 409 });
    }

    // Start a transaction to handle group assignment
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

    // Save the URL with group ID if provided
    const savedUrl = await db
      .insert(groupUrls)
      .values({ 
        url, 
        title, 
        description,
        groupId 
      })
      .returning();

    return NextResponse.json({ 
      message: "✅ URL saved successfully!",
      id: savedUrl[0].id,
      groupId
    }, { status: 201 });
  } catch (error) {
    console.error("Error saving URL:", error);
    return NextResponse.json({ message: "Invalid URL format or server error" }, { status: 400 });
  }
}
